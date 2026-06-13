+++
date = '2026-06-13T00:00:00-07:00'
title = 'Sorting Algorithms for Coding Interviews: A Python Reference from Bubble Sort to Timsort'
description = 'A reference I put together while reviewing sorting algorithms for coding interviews: Python implementations of 11 sorts, their time and space complexity, stability, and when to use each — plus quicksort partition variants and the non-comparison sorts that are easy to forget. Skim it to self-check what you still remember.'
keywords = ['sorting algorithms', 'quicksort', 'merge sort', 'heap sort', 'counting sort', 'radix sort', 'Timsort', 'Python', 'coding interview', 'time complexity']
slug = 'sorting-algorithms-interview-reference'
translationKey = 'sorting-algorithms-interview-reference'
tags = ['Algorithms', 'Sorting', 'Interview', 'Python']
+++

I've been prepping for coding interviews lately, and I went back through the sorting algorithms from scratch. The process gave me a bit of a scare: a lot of this I genuinely *used to* know — how quicksort's partition actually works, why it degrades — and now I had to pause to remember it. By the time I got to the non-comparison sorts — counting, radix, bucket — I realized that whole area had become more or less a blank.

So I decided to write this review down. Partly as a reference for other people getting ready for interviews, and partly as a record for my future self: next time I need to interview, I can come back here, skim through, and quickly figure out "this one I still know, this one I forgot, let me focus there."

How to use this post:

- First look at the **cheat sheet** below — one glance tells you which algorithms you've forgotten;
- For anything you want to dig into, use the table of contents (TOC) on the right to jump straight there;
- Every algorithm follows the same template: **one-line idea → Python implementation → complexity → stability and in-place → interview notes**, so they're easy to compare.

All the code is in Python, because it reads closest to pseudocode and makes the logic easiest to see.

## One-page cheat sheet

Conclusions first. The table below covers all 11 sorts in this post. When an interviewer asks about complexity or stability, this is the table that should flash into your head.

| Algorithm | Best | Average | Worst | Space | Stable | In-place |
|-----------|------|---------|-------|-------|:------:|:--------:|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ | ✅ |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| Shell | O(n log n) | ≈O(n^1.3) | O(n²) | O(1) | ❌ | ✅ |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | ❌ |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ | ✅ |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | ✅ |
| Counting | O(n+k) | O(n+k) | O(n+k) | O(n+k) | ✅ | ❌ |
| Radix | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k) | ✅ | ❌ |
| Bucket | O(n+k) | O(n+k) | O(n²) | O(n+k) | ✅* | ❌ |
| Timsort | O(n) | O(n log n) | O(n log n) | O(n) | ✅ | ❌ |

A few notes so the table doesn't mislead you:

- **Shell sort**'s complexity depends on the *gap sequence*; its best case changes with the sequence you pick, so the numbers here are just typical orders of magnitude.
- **Quick sort**'s listed space is the average recursion-stack depth O(log n); the worst case degrades to O(n). It partitions in place, but the recursion itself uses the stack.
- **Bucket sort**'s stability has an asterisk: it's only stable if the per-bucket sort (e.g. insertion sort) is stable.
- **k** is the range of values, **d** is the number of digits — the complexity of the non-comparison sorts is always tied to properties of the data itself, which I'll get into below.

## Before we start: a few unavoidable concepts

Before going through the algorithms one by one, there are four concepts that nearly every sorting interview question relies on. Getting them straight first means I won't have to keep re-explaining them.

### Comparison vs. non-comparison sorts

A **comparison sort** decides order using only one operation: "which of these two elements is bigger?" Bubble, insertion, merge, quick, and heap are all comparison sorts. What they share: their theoretical lower bound is O(n log n) — nothing can beat it (the reason is below).

A **non-comparison sort** doesn't compare; instead it uses the element values themselves to *compute* where each one belongs. Counting, radix, and bucket are all like this. Because they sidestep comparison, they can hit linear time O(n) — but the price is extra requirements on the data (e.g. it must be integers in a bounded range).

### Stability

If two elements have equal sort keys, and their **relative order** is preserved after sorting, the sort is **stable**.

A concrete example. Say you have a batch of orders already sorted by time, and now you want to re-sort by amount:

```text
Before (sorted by time):  ($100, 9:00)  ($50, 9:01)  ($100, 9:02)
Stable sort (by amount):  ($50, 9:01)  ($100, 9:00)  ($100, 9:02)   ← the two $100s keep their time order
Unstable sort:            ($50, 9:01)  ($100, 9:02)  ($100, 9:00)   ← the two $100s got scrambled
```

Why do interviewers love this? Because **multi-key sorting** depends on it: sort by the secondary key first, then use a stable sort on the primary key, and the secondary order is preserved. Knowing which sorts are stable (bubble, insertion, merge, counting, radix, Timsort) and which aren't (selection, shell, quick, heap) is almost guaranteed to come up.

### In-place sorting

If a sort needs only O(1) or O(log n) extra space, it's **in-place**. Merge sort allocates an extra O(n) array, so it isn't in-place; quick and heap only shuffle the original array, so they are. When an interviewer presses "what if memory is tight?", this is usually what they're asking about.

### Why complexity splits into best / average / worst

The same algorithm can behave wildly differently on different inputs. Quicksort is the classic case: O(n log n) on random input, but if the input is already sorted *and* you keep picking the worst pivot, it degrades to O(n²). When you state complexity in an interview, it's best to say which case you mean — that's exactly where you show how deeply you understand it.

> **Why can't comparison sorts beat O(n log n)?**
> Any comparison sort can be drawn as a *decision tree*: each internal node is one comparison, each leaf is one possible final arrangement. There are n! possible arrangements of n elements, so the tree must have at least n! leaves. A binary tree of height h has at most 2ʰ leaves, so 2ʰ ≥ n!, i.e. h ≥ log₂(n!). By Stirling's approximation, log₂(n!) ≈ n log n. The tree's height *is* the number of comparisons in the worst case, so the lower bound is Ω(n log n). This also explains why going faster means dropping "comparison" entirely — which is what the non-comparison sorts do.

OK, concepts done. Let's go through them one by one.

## Comparison-based sorts

### Bubble Sort

**One-line idea**: compare adjacent elements pairwise, swap if out of order; each pass "bubbles" the current largest element to the end.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        # each pass bubbles the largest of the unsorted region to the right end
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:          # a whole pass with no swaps means it's sorted; quit early
            break
    return arr
```

- **Complexity**: worst and average are both O(n²); with the `swapped` early-exit, it's O(n) on already-sorted input. Space O(1).
- **Stability / in-place**: stable (only swaps on a strict greater-than), in-place.
- **Interview notes**: basically never used in practice, but it's the textbook example of "stable + early-exit reaches O(n)". Watch out for that `swapped` optimization — it's a common gotcha.
- **LeetCode**: [912. Sort an Array](https://leetcode.com/problems/sort-an-array/) — there's no problem dedicated to bubble sort, but this generic sorting problem is a fine sandbox to practice the implementation (pure O(n²) will time out on large inputs, so it's practice only).

### Selection Sort

**One-line idea**: each pass picks the smallest element from the unsorted region and places it at the end of the sorted region.

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        # find the index of the minimum in the unsorted region [i+1, n)
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

- **Complexity**: O(n²) no matter what the input looks like — it never speeds up on sorted data. Space O(1).
- **Stability / in-place**: **unstable**, in-place. For example `[5a, 5b, 2]`: the first pass swaps `2` with `5a`, and the two 5s flip relative order.
- **Interview notes**: its one redeeming trait is the **minimum number of swaps** (at most n−1), which matters when writes are expensive. It's also the counterexample to "best case can save you" — it never does — and is often compared against insertion sort.
- **LeetCode**: [912. Sort an Array](https://leetcode.com/problems/sort-an-array/) — practice the implementation on this generic problem; selection sort is a good way to feel "few swaps, but no fewer comparisons."

### Insertion Sort

**One-line idea**: like sorting a hand of cards — go left to right, inserting each new card into its correct spot among the already-sorted cards on the left.

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # shift everything bigger than key one slot right to make room
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
```

- **Complexity**: worst and average O(n²); close to O(n) on **nearly-sorted** input. Space O(1).
- **Stability / in-place**: stable (the `while` condition uses `>`, not `>=`), in-place.
- **Interview notes**: don't underestimate it. **On small or nearly-sorted data, insertion sort beats quicksort**, which is exactly why production-grade sorts like Timsort and Introsort fall back to it on small chunks. Of the three basic sorts, it's the most practically useful.
- **LeetCode**: [147. Insertion Sort List](https://leetcode.com/problems/insertion-sort-list/) — a problem built for insertion sort: insert in place on a linked list.

### Shell Sort

**One-line idea**: an upgraded insertion sort. First do insertion sort on elements spaced by a large "gap", then shrink the gap step by step; the last pass uses gap 1 (plain insertion sort), but by then the array is "mostly sorted", so it flies.

```python
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        # insertion sort on each subsequence with stride gap
        for i in range(gap, n):
            key = arr[i]
            j = i - gap
            while j >= 0 and arr[j] > key:
                arr[j + gap] = arr[j]
                j -= gap
            arr[j + gap] = key
        gap //= 2
    return arr
```

- **Complexity**: depends on the gap sequence. The `n//2` halving sequence above is O(n²) in the worst case; better sequences (Knuth's `3k+1`, Sedgewick's) reach O(n^1.5) or better. Space O(1).
- **Stability / in-place**: **unstable** (gapped swaps scramble the relative order of equal elements), in-place.
- **Interview notes**: it's the poster child for "making data roughly sorted first lets insertion sort go faster." Rarely asked directly, but worth knowing as the bridge — it pushes a simple O(n²) sort toward O(n log n).
- **LeetCode**: [912. Sort an Array](https://leetcode.com/problems/sort-an-array/) — use it to practice shell sort and experiment with how different gap sequences affect runtime.

### Merge Sort

**One-line idea**: divide and conquer. Split the array in half until you can't split further, then merge two **already-sorted** small arrays into one larger sorted array.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0
    # two pointers, take the smaller of the two each time; <= keeps it stable
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])   # whatever's left just gets appended
    result.extend(right[j:])
    return result
```

- **Complexity**: best, average, and worst are **all O(n log n)** — rock solid, never degrades. Space O(n) (the merge needs an extra array).
- **Stability / in-place**: stable, **not in-place**.
- **Interview notes**: bulletproof complexity and naturally stable — the first choice when you need "stable + guaranteed O(n log n) worst case."
- **LeetCode**: [148. Sort List](https://leetcode.com/problems/sort-list/) — the optimal solution for sorting a linked list is merge sort; for the array version use [912. Sort an Array](https://leetcode.com/problems/sort-an-array/).

Two high-frequency extensions:

> **Concept break: linked-list sorting and external sorting**
>
> **Linked-list sorting**: merge sort is especially friendly to linked lists — merging only rewires pointers, no extra array needed, so it can achieve O(1) extra space (not counting the recursion stack). This is why the standard answer to "sort a linked list in O(n log n)" is merge sort, not quicksort.
>
> **External sorting**: when the data is too big to fit in memory (the classic interview question: "how do you sort a 10 GB file with 1 GB of memory?"), the answer is **external merge sort** — split the big file into chunks small enough to fit in memory, read each in, sort it, write it back to disk, then use a *k-way merge* to combine those sorted files into the final result. Merge's essence — "combining multiple sorted sequences" — is taken to the extreme here.

### Quick Sort

This is the section I most needed to pick back up — the partition details got fuzzy after five years untouched. Let's take it slow.

**One-line idea**: divide and conquer. Pick a pivot, **partition** the array into "less than the pivot" and "greater than the pivot", put the pivot in its final place, then recurse on both sides.

#### 1. Lomuto partition (the easiest to memorize)

```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)    # recurse left half
        quick_sort(arr, p + 1, high)   # recurse right half
    return arr


def partition(arr, low, high):
    pivot = arr[high]            # Lomuto: always take the rightmost element as pivot
    i = low - 1                  # i is the right boundary of the "less than pivot" region
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]   # put the pivot in place
    return i + 1
```

Lomuto's advantage is that it advances a single pointer `i`, so the logic is intuitive and easy to remember. For hand-writing quicksort in an interview, this version is the default.

#### 2. Why it degrades, and how to fix it

Always taking the rightmost element as pivot has a fatal flaw: **when the input is already sorted (or reverse-sorted), every partition splits the array into sizes 0 and n−1**, the recursion depth becomes n, complexity degrades to O(n²), and it can blow the stack.

The fix is to **stop letting the input "predict" the pivot** — pick one at random, or take the median of the first, middle, and last elements (median-of-three):

```python
import random

def partition(arr, low, high):
    rand = random.randint(low, high)
    arr[rand], arr[high] = arr[high], arr[rand]   # random pivot, swap it to the right, reuse the logic above
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

Two added lines plug the most common pitfall — degrading on sorted input. When the interviewer presses "what about quicksort's worst case", this is the standard answer.

#### 3. Three-way quicksort: handling lots of duplicates

If the array has **many duplicate values** (say, all 0s and 1s), plain quicksort still does a lot of pointless recursion. Three-way quicksort (based on the "Dutch national flag problem") splits the array into `< pivot`, `== pivot`, and `> pivot`, and skips the whole equal-to-pivot segment:

```python
def quick_sort_3way(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low >= high:
        return arr
    pivot = arr[low]
    lt, i, gt = low, low, high   # [low,lt)<pivot  [lt,i)==pivot  (gt,high]>pivot
    while i <= gt:
        if arr[i] < pivot:
            arr[lt], arr[i] = arr[i], arr[lt]
            lt += 1
            i += 1
        elif arr[i] > pivot:
            arr[gt], arr[i] = arr[i], arr[gt]
            gt -= 1               # the swapped-in element isn't checked yet, so i stays
        else:
            i += 1
    quick_sort_3way(arr, low, lt - 1)
    quick_sort_3way(arr, gt + 1, high)
    return arr
```

- **Complexity**: average O(n log n), worst O(n²) (almost never seen once you use a random pivot). Space O(log n), for the recursion stack.
- **Stability / in-place**: **unstable** (the long-distance swaps in partitioning scramble equal elements), **in-place**.
- **Interview notes**: default to Lomuto when hand-writing; bring up random / median-of-three when asked about the worst case; bring up three-way quicksort when asked about lots of duplicates.
- **LeetCode**: [912. Sort an Array](https://leetcode.com/problems/sort-an-array/) — remember to use a random pivot on submission, or sorted / heavily-duplicated data will time out or overflow the recursion stack.

One more high-frequency extension:

> **Concept break: Quickselect**
>
> "Find the k-th largest / smallest element" is an interview regular. If you only need the k-th one, there's no need to fully sort: use quicksort's partition, and after each partition look at where the pivot landed — then **recurse into only the side that contains k**. Average O(n), faster than sorting first and then indexing (O(n log n)).
>
> ```python
> def quickselect(arr, k):
>     """return the k-th smallest element, k counting from 1"""
>     low, high, target = 0, len(arr) - 1, k - 1
>     while low <= high:
>         p = partition(arr, low, high)
>         if p == target:
>             return arr[p]
>         elif p < target:
>             low = p + 1        # target is on the right
>         else:
>             high = p - 1       # target is on the left
> ```
>
> **Practice**: [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — solve it with quickselect at average O(n), a nice contrast to the heap solution.

### Heap Sort

**One-line idea**: first build the array into a **max-heap** (every parent ≥ its children), so the root is the maximum; swap the root to the end, shrink the heap by one, sift the new root down, and repeat until sorted.

```python
def heap_sort(arr):
    n = len(arr)
    # 1. build the heap: starting from the last non-leaf node, sift each one down
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n)
    # 2. repeatedly swap the root (max) to the end, then fix the remaining heap
    for end in range(n - 1, 0, -1):
        arr[0], arr[end] = arr[end], arr[0]
        sift_down(arr, 0, end)
    return arr


def sift_down(arr, root, size):
    while True:
        largest = root
        left, right = 2 * root + 1, 2 * root + 2
        if left < size and arr[left] > arr[largest]:
            largest = left
        if right < size and arr[right] > arr[largest]:
            largest = right
        if largest == root:      # the parent is already the largest; stop sinking
            break
        arr[root], arr[largest] = arr[largest], arr[root]
        root = largest
```

- **Complexity**: best, average, and worst are **all O(n log n)**. Building the heap is O(n) (not O(n log n) — a commonly-tested counterintuitive point), then n sift-downs of O(log n) each. Space O(1).
- **Stability / in-place**: **unstable**, **in-place**.
- **Interview notes**: it's the **only** sort that both guarantees worst-case O(n log n) *and* uses only O(1) space — pick it when memory is extremely tight and you can't afford to degrade. Note that it's the same machinery as a **priority queue / heap**: `heapq`, Top-K problems, the heap inside Dijkstra — all variants of this `sift_down`. Maintaining a size-k min-heap to find the Top-K is a chained follow-up in this area.
- **LeetCode**: [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — the classic heap problem (maintain a size-k min-heap); it can also be solved with quickselect, a nice way to contrast the two approaches.

## Non-comparison-based sorts

Every algorithm so far relies on "comparison", which is why they're stuck at the O(n log n) line. The next three sidestep comparison, using **the element values themselves** as indices to place items — which lets them hit linear time. The price is requirements on the data. This is also the area where my own memory was blankest, so I'll go into a bit more detail.

### Counting Sort

**One-line idea**: count how many times each value occurs, then use a *prefix sum* to compute each value's position in the result and drop it straight in. Good for **integers with a small value range k**.

```python
def counting_sort(arr):
    if not arr:
        return arr
    lo, hi = min(arr), max(arr)
    k = hi - lo + 1
    count = [0] * k
    for x in arr:                # 1. count
        count[x - lo] += 1
    for i in range(1, k):        # 2. prefix sum: count[i] becomes "number of elements <= i"
        count[i] += count[i - 1]
    result = [0] * len(arr)
    for x in reversed(arr):      # 3. fill back-to-front to stay stable
        count[x - lo] -= 1
        result[count[x - lo]] = x
    return result
```

- **Complexity**: O(n + k), where n is the element count and k is the value range. Space O(n + k).
- **Stability / in-place**: stable (the key is iterating **back-to-front** in step 3), not in-place.
- **Interview notes**: when k is far smaller than n (e.g. sorting a hundred thousand scores in 0–100), it crushes any O(n log n) sort. But once k is large (e.g. sorting arbitrary 32-bit integers), the space blows up — that's exactly its limit, and the problem radix sort exists to solve.
- **LeetCode**: [75. Sort Colors](https://leetcode.com/problems/sort-colors/) — only three values (0, 1, 2), so counting sort (or three-way quicksort) handles it in one pass.

### Radix Sort

**One-line idea**: sort digit by digit. Starting from the least significant digit (ones place), run one **stable** counting sort per digit, all the way up to the most significant digit. Because each pass is stable, the whole thing is sorted once you finish the highest digit.

```python
def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1                           # current digit: 1=ones, 10=tens, 100=hundreds...
    while max_val // exp > 0:
        arr = counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr


def counting_sort_by_digit(arr, exp):
    count = [0] * 10                  # base 10, each digit is only 0-9
    for x in arr:
        count[(x // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    result = [0] * len(arr)
    for x in reversed(arr):           # back-to-front to keep this digit's sort stable (key to radix sort's correctness)
        digit = (x // exp) % 10
        count[digit] -= 1
        result[count[digit]] = x
    return result
```

- **Complexity**: O(d·(n + k)), where d is the number of digits in the largest value and k is the base (here, base 10, so k=10). Space O(n + k).
- **Stability / in-place**: stable, not in-place.
- **Interview notes**: it solves counting sort's "space blows up when the range is large" problem — by breaking a big integer into a few small digits. The version above only handles non-negative integers; to support negatives, shift everything to be non-negative first, or handle positives and negatives separately. Common interview questions: **why must you go from low digit to high digit? Why must each digit's sort be stable?** (Because sorting a higher digit relies on stability to preserve the order already established by the lower digits.)
- **LeetCode**: [164. Maximum Gap](https://leetcode.com/problems/maximum-gap/) — it demands linear time and space, and the standard solution is exactly radix sort or bucket sort.

### Bucket Sort

**One-line idea**: distribute the data evenly into a number of "buckets" by value, sort each bucket internally, then concatenate the buckets in order. Good for **uniformly distributed** data.

```python
def bucket_sort(arr):
    if not arr:
        return arr
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for x in arr:                     # assume elements are uniformly distributed in [0, 1)
        buckets[int(n * x)].append(x)
    result = []
    for bucket in buckets:
        insertion_sort(bucket)        # stable sort within buckets keeps the whole thing stable
        result.extend(bucket)
    return result
```

- **Complexity**: average O(n + k) when the data is uniformly distributed; the worst case (all elements crammed into one bucket) degrades to O(n²). Space O(n + k).
- **Stability / in-place**: depends on the per-bucket sort — stable if you use insertion sort; not in-place.
- **Interview notes**: its performance rides entirely on "is the data uniformly distributed", which is the biggest difference from counting and radix. Counting and radix are insensitive to the shape of the data; bucket sort is sensitive to it. Classic use case: sorting a batch of floats uniformly distributed in [0, 1).
- **LeetCode**: [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) — bucketing by frequency is the slickest solution to this one.

## What gets used in the real world: Timsort

Everything above is a "textbook algorithm". But every time you call `sorted()`, what Python actually runs underneath is **Timsort** — a hybrid carefully tuned for real-world data. It's worth a section of its own, because being able to bring it up in an interview is often a plus.

**Core idea**: real data is rarely fully random — it's often *partially sorted already*. Timsort seizes on this:

1. First scan the array for naturally-sorted contiguous segments, called **runs**;
2. Pad runs that are too short up to a minimum length (`minrun`, usually 32–64) using **insertion sort** — as noted earlier, insertion sort is fastest on small arrays;
3. Then **merge** these runs pairwise following a set of rules, with a "galloping" mode to speed up the merges.

So Timsort = **the skeleton of merge sort + the small-chunk optimization of insertion sort + special-casing for already-sorted data**.

- **Complexity**: worst O(n log n), but down to O(n) on nearly-sorted data. Space O(n).
- **Stability**: stable. This is why Python's `sorted()` and `list.sort()` are guaranteed stable.
- **Trivia**: Java's object sort (`Arrays.sort(Object[])`) also uses a Timsort variant; while C++'s `std::sort` uses a different hybrid, **Introsort** (quicksort as the base, switching to heap sort when recursion gets too deep to avoid degrading, and insertion sort on small chunks). "Quick + heap + insertion" rolled into one — the same spirit as Timsort: **there's no silver bullet; production-grade sorts are all hybrids**.
- **LeetCode**: [56. Merge Intervals](https://leetcode.com/problems/merge-intervals/) — sort first, then sweep and merge; in Python that `sorted()` call is running Timsort, so it's a good way to feel the speedup from "real data is partially sorted".

## How to actually choose / how to answer in interviews

Here's everything above boiled down to a "which one should I use" checklist:

- **No special requirements, just want speed** → quicksort (random pivot). The default for most situations.
- **Need stable, and the worst case must stay O(n log n)** → merge sort.
- **Memory is extremely tight (need O(1) space) and can't degrade** → heap sort.
- **Very small data (a few dozen) or nearly sorted** → insertion sort.
- **Sorting a linked list** → merge sort.
- **Integers with a small value range** → counting sort.
- **Integers but a huge range (e.g. fixed-length integers / strings)** → radix sort.
- **Data uniformly distributed over an interval** → bucket sort.
- **Only need the k-th largest / the median, not a full sort** → quickselect.
- **Data too big to fit in memory** → external merge sort.

A few common chained follow-ups — have the answers ready:

- **"Which sorts are stable?"** → bubble, insertion, merge, counting, radix, bucket (when the per-bucket sort is stable), Timsort.
- **"Quicksort's worst case and how to avoid it?"** → sorted input + a bad pivot degrades to O(n²); use a random pivot or median-of-three.
- **"Can you beat O(n log n)?"** → comparison sorts can't (the decision-tree lower bound); but if the data is integers in a bounded range, non-comparison sorts get you to O(n).
- **"Is there a sort that's O(n log n), stable, *and* in-place?"** → not in typical implementations; merge is stable but not in-place, heap is in-place but not stable, quick is in-place but not stable. A great prompt for testing whether you understand the trade-offs.

## A few common mistakes

Pitfalls I stepped in (or nearly did) while reviewing:

- **Selection sort doesn't speed up on sorted input** — it has no early-exit, so it's always O(n²). Don't confuse it with bubble / insertion.
- **Building a heap is O(n), not O(n log n)**. Intuitively it looks like n elements at O(log n) each, but a careful count (most nodes are near the bottom) gives O(n). A common counterintuitive question.
- **Counting / radix sort fill the result back-to-front** — that step is the source of stability; do it the other way and it's unstable, and an unstable radix sort is simply wrong.
- **Quicksort's space isn't O(1)** — it partitions in place, but the recursion stack is O(log n) on average and O(n) at worst.
- **Bucket sort's worst case is O(n²)** — don't only remember the O(n) average; it degrades when the distribution is skewed.
- **Stable ≠ in-place** — these are two independent dimensions, often asked together in interviews. Don't conflate them.

## Wrapping up

The framework for this topic is actually pretty clear:

- **Comparison sorts** are stuck at O(n log n); among them quicksort is fastest but degrades, merge is stable but space-hungry, heap is in-place but unstable — **there's no all-rounder, it's all trade-offs**;
- **Non-comparison sorts** trade requirements on the data for linear time, but they make demands on that data;
- **Production-grade sorts (Timsort, Introsort) are all hybrids**, stitching together the strengths of several algorithms.

If, like me, you're picking this back up after a few years, I'd suggest running through that cheat sheet at the top: skip anything you can implement from memory and explain the complexity and stability of, and go back to the relevant section for whatever you stumble on. Next time you're prepping for interviews, just come back and skim it again.

Good luck with your interviews.
