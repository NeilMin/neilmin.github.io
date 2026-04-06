+++
date = '2026-04-05T12:28:16-07:00'
title = 'Why PostgreSQL Kept Saying “No space left on device” with 20TB Still Free'
translationKey = 'linux-disk-bug-triage'
+++

A little while ago, we ran into a customer issue that turned out to be way more interesting than it looked at first glance. The customer was trying to generate a backup using `pg_dump`, and the job kept failing halfway through with this error:

```text
pg_dump: error: could not write to output file: No space left on device
```

When I first saw it, I honestly felt pretty relaxed. This kind of error looks like a standard problem. If the disk is full, you make the disk bigger and move on.

## The Bizarre Beginning: A Black Hole That Wouldn't Fill

### The most obvious thing to try: add more disk

The customer's database was already a few terabytes in size, so we did the straightforward thing and resized the target disk to 10 TB. In a situation like this, the first thing you usually check is:

```bash
df -h
```

At that point I was genuinely thinking, "Alright, this should be an easy win." We reran `pg_dump`, and somehow it failed again.

At first we still did not think too much of it. Maybe 10 TB was somehow still not enough? So we kept going and expanded the disk again, this time to well over 20 TB, and ran the job one more time.

Same error. Same failure.

That was the moment it stopped making sense. `df -h` clearly showed plenty of free space, yet the system kept insisting: `No space left on device`.

At that point I was pretty sure this error was not saying what it appeared to be saying.

## Following the Clues: 200 Million Hidden Large Objects

If this was not a simple hardware-capacity problem, then the next step was to look at the data itself. We started inspecting the contents of the database. At first, nothing jumped out: no badly bloated TOAST data, no unusually highly compressed data, nothing obviously suspicious.

Then we noticed something that was definitely unusual: this customer had an enormous number of Large Objects stored in the database.

### Concept Break: What are PostgreSQL Large Objects?

In PostgreSQL, a Large Object, or LO, is a mechanism for storing large chunks of data such as images, audio files, or documents. It exposes a file-like API with operations such as `open`, `read`, `write`, and `seek`.

When you run `pg_dump` using Directory Format (`-Fd`), it generates files for table schemas and data. It also generates a separate dump file for every Large Object in the database. Those files are typically named after the LO's OID, something like:

```text
blob_12345.dat
```

Under normal circumstances, Large Objects are usually used to store data that is huge in size but not huge in count. This customer was doing almost the exact opposite: they had stored more than 200 million very small Large Objects.

And that was where things started to get interesting. `pg_dump` clearly was not optimized for the "massive quantity of tiny LOs" case. It just kept following its normal logic and created one file per object.

## Local Reproduction: The 14 Million File Barrier

Once we suspected the sheer number of LOs was the issue, we started reproducing the environment locally.

We were able to reproduce the same error surprisingly quickly, and the reproduction was very consistent. As we monitored the backup process, one pattern kept showing up: the failure always happened when the output directory reached roughly 14 million files.

My first instinct at that point was: maybe we are running out of inodes.

That would have been a very normal Linux explanation. Every file needs an inode, and with a huge number of tiny files, it is absolutely possible to run out of inodes long before you run out of disk blocks. So we checked:

```bash
df -i
```

And that was not it either. We still had plenty of inodes left.

So then we went through the usual list of suspects: container limits, process limits such as `ulimit -a`, and other system-level resource constraints. We kept checking and checking, and nothing looked wrong.

The only thing that stayed stubbornly consistent was that 14-million-file threshold. Every time we hit it, the job died as if it had smashed into an invisible wall.

## The Truth Revealed: EXT4 HTree and Hash Collisions

With that "14 million file barrier" in mind, I dug through a lot of material online and also asked people who know Linux filesystems far better than I do. Eventually the root cause became clear: this was coming from EXT4's directory indexing behavior.

### Deep Dive: EXT4 HTree Limitations and Hash Collisions

In Linux, a directory is fundamentally a file that stores filenames and pointers to their inodes. To make lookup efficient when a directory contains huge numbers of entries, EXT4 uses a hash-based tree index called HTree, which is conceptually similar to a B-Tree in databases.

The catch is that the traditional EXT4 HTree has a limited depth, usually two levels. If you keep dumping millions upon millions of files into one single directory, the hash space for those filenames starts getting crowded and severe hash collisions can occur. Once a hash bucket is full and the HTree has reached its depth limit and cannot split further, the filesystem refuses to create more files and returns `ENOSPC` back to the OS, which surfaces as `No space left on device`.

That explains perfectly why the crash always happened at around 14 million files. `pg_dump` generates files sequentially, and the filenames are derived from LO IDs, so the naming pattern is deterministic. In other words, every run walks into the exact same collision path and hits the exact same wall.

Honestly, that was the satisfying part of the whole investigation. Up until then it felt like wandering around in the dark, touching random things and getting nowhere. Once this clicked, all the weird symptoms suddenly lined up.

## The Fix: How to Get Around It

Once we understood the root cause, the solution space became much clearer. There are really three levels where you can address this.

### 1. Backup strategy: split the dump

If Directory Format is choking because it is trying to put every LO into one folder, then one practical fix is to separate table data from Large Objects:

- Dump regular table data using Directory Format (`-Fd`) while excluding blobs.
- Dump Large Objects separately into a single large file, such as plain SQL or custom format, so you avoid generating hundreds of millions of tiny files.

In practice, that means using options such as `--no-blobs` for the table dump and exporting blobs separately.

### 2. Filesystem level: enable `large_dir`

Modern EXT4 is actually aware of this edge case and provides a feature called `large_dir`. Once enabled, it supports a 3-level HTree and allows directories to exceed 2 GB in size. That greatly reduces the probability of hash collisions and, in practice, almost eliminates this per-directory bottleneck.

You can enable it like this:

```bash
# Unmount the disk first
umount /dev/sdX

# Enable the large_dir feature
tune2fs -O large_dir /dev/sdX

# Check the filesystem and remount
e2fsck -f /dev/sdX
mount /dev/sdX /backup_dir
```

### 3. Architecture level: directory sharding

More broadly, if your system genuinely needs to store tens of millions of physical files, putting all of them into one folder is simply not a good design. Even if you enable `large_dir`, basic operations such as `ls` can still become painfully slow.

The standard industry practice here is directory sharding based on filename hashes or IDs.

For example, if a file is named:

```text
1234567.dat
```

Instead of placing it directly in one giant folder, you split it into subdirectories:

- Use the first two digits `12` as the first-level directory.
- Use the next two digits `34` as the second-level directory.

The final path becomes:

```text
/backup_dir/12/34/1234567.dat
```

That way, millions of files get distributed across thousands of subdirectories, and the number of files per directory stays low enough that filesystem bottlenecks never build up in the first place.

## Final Thoughts

Looking back, this was one of those debugging sessions that starts out feeling almost too easy. You think you already know the answer. Then the obvious fix does nothing, and suddenly you are forced to question every assumption you made along the way.

At first, we really thought the answer was just, "make the disk bigger." Then we went from 10 TB to more than 20 TB and the problem still sat there, completely unmoved. After that we started suspecting inodes, containers, process limits, and every other system-level resource we could think of. None of them fit.

And then the actual problem turned out to be hiding in EXT4 directory indexing and hash collisions, which is not exactly the first place your mind goes when you see a disk-space error.

That is probably the part I find most worth writing down. Not just that we fixed the issue, but that this kind of problem forces you to revisit system behaviors you normally take for granted. `No space left on device` sounds incredibly direct, but what it really means can be much more subtle than it looks.

So if you ever run into one of those situations where there is clearly still free space and yet the system refuses to write another byte, it might be worth resisting the urge to trust the error message too literally. Sometimes the real problem is hiding a layer or two deeper.
