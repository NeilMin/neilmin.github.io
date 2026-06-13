+++
date = '2026-06-13T07:00:00-07:00'
title = 'How RocksDB Works: A Minimal LSM-Tree Primer'
description = "While prepping for interviews I read a great write-up on how RocksDB works, and it finally made the LSM-tree click for me. This is my condensed version: what RocksDB is, how data gets written and read, what compaction is busy doing in the background, and the unavoidable trade-off between the three amplification factors. Not exhaustive — just enough that I can recall the shape of it next time."
keywords = ['RocksDB', 'LSM-Tree', 'MemTable', 'SST files', 'WAL', 'compaction', 'write amplification', 'key-value store', 'LevelDB', 'storage engine']
slug = 'how-rocksdb-works'
translationKey = 'how-rocksdb-works'
tags = ['Databases', 'RocksDB', 'LSM-Tree', 'Interview']
+++

While prepping for interviews, I read Artem Krylysov's [How RocksDB Works](https://artem.krylysov.com/blog/2023/04/19/how-rocksdb-works/), and it instantly cleared up the fuzzy mess in my head around "what even *is* an LSM-tree." The original is wonderfully detailed — I'd strongly recommend just reading it.

This is my condensed take. I'm not trying to drag all of the original's depth over here (that would just be copying it); I want a lightweight record for myself: next time I'm interviewing, or just want to remember "roughly how does RocksDB turn," I can skim this and get it back. And if you're passing by and want a general picture of it, this should be enough. To dig deeper, go read the original.

## What RocksDB is

In one line: **an embeddable, persistent key-value store**.

- **Embeddable**: it isn't a standalone server like MySQL — it's a library you compile directly into your program, which cuts out inter-process communication overhead.
- **Persistent**: data lives on disk; nothing is lost on a crash.
- Forked from Google's **LevelDB** in 2012, written in C++, optimized specifically for **SSDs** and **write-heavy** workloads. Meta, Microsoft, Netflix, and Uber all use it.
- It is **not distributed** — replication and sharding are your job at a higher layer.

The operations it exposes are humble: `put(key, value)` to write, `get(key)` to read, `delete(key)` to remove, `merge(key, value)` to combine, and `iterator.seek()` for range scans.

## The core idea: the LSM-tree

Everything in RocksDB is built on the **LSM-tree (Log-Structured Merge-Tree)**.

The core tension it tackles: **disks hate random writes and love sequential ones**. The LSM-tree's trick is to buffer writes in memory, keep them sorted, then flush them to disk sequentially all at once. In other words, it **batches a flood of random writes into sequential writes** — and that's the fundamental reason it writes so fast.

Structurally, data is split across many levels: the top level lives in memory, and below it sit level after level on disk, numbered L0, L1, L2… The deeper you go, the older and larger the data (each level is typically ~10× the one above it).

```text
memory   ┌──────────────────────────────┐
         │  MemTable (writable, sorted)  │  ← new data lands here first
         └──────────────────────────────┘
- - - - - - - - - - - - - - - - - - - - - -  flush
disk     L0   [SST] [SST] [SST]      ← newest; key ranges may overlap across files
         L1   [SST][SST][SST][SST]   ← no overlap within a level, and bigger
         L2   [SST][SST] ......      ← older and larger the deeper you go (~×10)
         ...
```

This structure dates back to 1996 and was designed for write-intensive workloads. Besides RocksDB, Bigtable, HBase, Cassandra, and MongoDB's WiredTiger engine are all LSM-tree based.

## Writing: how data gets in

A single write lands in **two** places at once:

```text
put(key, value)
      │
      ├──► WAL       (appended sequentially to disk, for crash safety)
      │
      └──► MemTable  (kept sorted in memory)
                  │  fills up at ~64MB
                  ▼
            turns read-only; a background thread flushes it to one SST file → L0
```

**MemTable**: the in-memory write buffer where every insert, update, and delete goes first. It's kept **sorted by key** internally (the default implementation is a **skip list**), which is what makes the later flush and range queries efficient. One detail: a delete doesn't actually erase anything — it writes a **tombstone** record meaning "this key is deleted." The real cleanup is left to compaction later.

**WAL (Write-Ahead Log)**: the MemTable is in memory, so a power loss would wipe it. So every write also **appends** a record to a WAL file on disk — key, value, operation type, and a checksum. After a crash, RocksDB replays the WAL to reconstruct the MemTable. Note the WAL is **appended in write order, not sorted** — it's optimizing purely for speed.

**Flush**: once a MemTable fills up, it turns read-only and a fresh one takes over; a background thread then flushes the read-only MemTable into a single **SST file** on L0. Once that's done, the corresponding WAL can be discarded. Because the MemTable was already sorted, this flush is one **sequential write** — which is the whole point of the LSM-tree.

## What an SST file looks like

An **SST (Static Sorted Table)** is the file that actually holds data on disk, and it's never modified once written. Inside is a pile of **sorted key-value pairs**, laid out in a carefully designed block format (blocks default to 4KB and can be compressed with Snappy, LZ4, ZSTD, etc.).

An SST is roughly split into a few sections:

- **Data blocks**: the sorted key-value pairs. Since adjacent keys are similar, only the differences need to be stored (delta encoding) to save space.
- **Index**: records, for each data block, "last key → offset in the file," so a lookup can **binary-search** straight to the right block instead of scanning the whole file.
- **Bloom filter (optional)**: a probabilistic structure that very quickly answers "this key is **definitely not** in this file." It may give a false "yes," but never a false "no" — perfect for skipping, on a read, a whole batch of files you don't need to touch.

## Reading: how data gets found

To read a key, you search **newest to oldest**, level by level — newer values sit higher, older ones lower, so the first hit is the latest value:

1. Check the active MemTable;
2. Then the read-only MemTables not yet flushed;
3. Then each SST file in L0 (L0 files can overlap in key range, so you have to check them one by one, newest to oldest);
4. From L1 down, each level has non-overlapping key ranges, so you only need to **locate and check one file per level**.

And within a **single SST file**, it's again three steps: first ask the **Bloom filter** whether the key is present — if not, skip the file entirely; if so, use the **index** to binary-search to the right data block; finally read that block and find the key inside it.

So the cost of a read comes down to how many levels and files you have to wade through — which leads straight into the next section.

## Compaction: the background cleanup that never stops

As noted, a delete just writes a tombstone, and an update just writes a new value on top of the old one. Over time, the disk fills up with **stale old versions and tombstones**: they waste space *and* force reads to wade through more files.

**Compaction** is the background job that cleans this up: it takes some SST files from one level, merges them with the overlapping files in the next level, **throws away the shadowed old values and deleted keys**, and writes fresh, clean SSTs into the lower level. Since every file is already sorted, the merge uses a **k-way merge** — a scaled-up version of the "merge" step in merge sort. It all runs on background threads, so it doesn't block foreground reads and writes.

RocksDB defaults to **leveled compaction**:

- **L0** is special: its files **may overlap** in key range (since they're flushed straight from MemTables); compaction triggers once the L0 file count hits a threshold (4 by default).
- **L1 and below**: within each level, all files have **non-overlapping** key ranges and are globally ordered; when a level's total size exceeds its target, the excess is merged down into the next level — sometimes cascading down several levels in a chain.

## It's all trade-offs: the three amplifications

The key to understanding RocksDB tuning (really, all LSM engines) is three **amplification** factors:

- **Space amplification**: disk space actually used ÷ size of the logical data. The more stale versions and tombstones pile up, the higher it gets.
- **Read amplification**: how many I/O operations a single logical read actually performs. The more levels and files to wade through, the higher it gets.
- **Write amplification**: how many times a single logical write is actually written. The same piece of data gets rewritten to lower levels over and over during compaction, so this can get large.

These three are a game of whack-a-mole: **the more aggressively you compact, the smaller your space and read amplification, but the larger your write amplification** — and vice versa. The right balance depends entirely on your workload, and the knobs are many and interdependent. Even the RocksDB authors admit it's hard to pin down the exact effect of each parameter, and recommend **benchmarking a lot while keeping an eye on those three amplification factors**.

> **An aside: the merge operation**
>
> Besides put and delete, RocksDB has `merge`. When you need to apply lots of *incremental* updates to a value (say, repeatedly appending to a counter or a list), the traditional approach is read-modify-write: read it out, change it, write it back — clunky. `merge` lets you write just the *increment* and hands off the combining to a merge function you define, computing the final value only at read or compaction time. The **upside** is lower write amplification, plus it's thread-safe; the **cost** is that reads get more expensive — until the increments are consolidated, every read has to recompute them.

## The bits worth remembering

If I keep just one mental map, it's this:

- **RocksDB** = an embeddable, persistent KV store, descended from LevelDB, built on the **LSM-tree**;
- **Writes**: into the in-memory **MemTable** (sorted) + a sequential **WAL** (crash safety) → once full, flushed to an **SST** file on L0 → **compaction** slowly tidies things downward in the background;
- **Reads**: search newest to oldest, level by level, using a **Bloom filter** + **index** to skip and locate so you read as few stray files as possible;
- **The essence**: it trades "write amplification" for the high throughput of "turning random writes into sequential ones" — and **between space, read, and write amplification, it's always a trade-off; there's no free lunch**.

Hold onto those few lines and the overall shape of RocksDB stands up. The details — skip lists, delta encoding, the various compaction strategies, how to tune the knobs — you can dig back into the original [How RocksDB Works](https://artem.krylysov.com/blog/2023/04/19/how-rocksdb-works/) whenever you need them.
