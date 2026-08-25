+++
date = '2026-06-13T00:00:00-07:00'
title = '排序算法面试复盘：一份从冒泡到 Timsort 的 Python 参考'
description = '为准备 coding 面试重新复习排序算法时整理的一份参考：11 种排序的 Python 实现、时间与空间复杂度、稳定性和适用场景，外加快排的多种 partition 写法和容易被忽略的非比较排序。可以照着自检——哪些我会，哪些忘了。'
keywords = ['排序算法', '快速排序', '归并排序', '堆排序', '计数排序', '基数排序', 'Timsort', 'Python', '算法面试', '时间复杂度']
slug = 'sorting-algorithms-interview-reference'
translationKey = 'sorting-algorithms-interview-reference'
tags = ['Algorithms', 'Sorting', 'Interview', 'Python']

[cover]
image = 'cover.jpg'
relative = true
alt = '木桌上灰蓝、奶油与沙色的木质线轴'
+++

最近在准备 coding 面试，把排序算法又从头捋了一遍。捋的过程里我有点被自己吓到：很多东西五年前我是真的记得的，比如快排的 partition 到底怎么写、为什么会退化，现在却要愣一下才能想起来。等翻到非比较排序那一块——计数排序、基数排序、桶排序——我发现那已经基本是一片空白了。

于是干脆把这一遍复习写下来，一方面给后来准备面试的人当个 reference，另一方面也是给未来的自己留个存档：等下次再要面试，我可以回到这里，照着扫一遍，很快就知道「这个我还会、这个我忘了，重点看一下」。

这篇文章的用法很简单：

- 先看下面那张**速查表**，扫一眼就能自检哪些算法你已经忘了；
- 想细看哪个，用右侧的目录（TOC）直接跳过去；
- 每个算法都按同一个模板写：**一句话思路 → Python 实现 → 复杂度 → 稳定性和是否原地 → 面试要点**，方便对照。

代码全部用 Python 写，因为它最接近伪代码、最容易看清逻辑。

## 一页速查表

先把结论摆出来。下面这张表覆盖了本文的全部 11 种排序，面试里被问到复杂度、稳定性的时候，脑子里应该能立刻浮现出这张表。

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定 | 原地 |
|------|------|------|------|------|:----:|:----:|
| 冒泡 Bubble | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| 选择 Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ | ✅ |
| 插入 Insertion | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| 希尔 Shell | O(n log n) | ≈O(n^1.3) | O(n²) | O(1) | ❌ | ✅ |
| 归并 Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | ❌ |
| 快排 Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ | ✅ |
| 堆排 Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | ✅ |
| 计数 Counting | O(n+k) | O(n+k) | O(n+k) | O(n+k) | ✅ | ❌ |
| 基数 Radix | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k) | ✅ | ❌ |
| 桶 Bucket | O(n+k) | O(n+k) | O(n²) | O(n+k) | ✅* | ❌ |
| Timsort | O(n) | O(n log n) | O(n log n) | O(n) | ✅ | ❌ |

几点说明，免得这张表骗到你：

- **希尔排序**的复杂度取决于「增量序列」，最好情况随用的序列不同而变，所以这里的数字只是常见量级。
- **快排**标的空间是平均情况下的递归栈深度 O(log n)，最坏会退化到 O(n)；它是原地分区，但递归本身要占栈。
- **桶排序**的稳定性打了星号：桶内用稳定排序（比如插入排序）它才稳定。
- **k** 是数据的取值范围，**d** 是数字的位数——非比较排序的复杂度都和数据本身的特征绑在一起，这点后面会细说。

## 写在前面：几个绕不开的概念

在逐个看算法之前，有四个概念几乎每道排序面试题都会用到。把它们先讲清楚，后面就不用反复解释了。

### 比较排序 vs 非比较排序

**比较排序**只通过「两个元素谁大谁小」这一种操作来决定顺序——冒泡、插入、归并、快排、堆排都是。它们的共同点是：理论下界就是 O(n log n)，谁也快不过（原因见下面）。

**非比较排序**不靠比较，而是利用元素本身的值去「算」出它该放的位置——计数、基数、桶都是。正因为绕开了比较，它们能做到线性时间 O(n)，但代价是对数据有额外要求（比如必须是范围有限的整数）。

### 稳定性（stability）

如果两个元素的排序键相等，排完序后它们的**相对先后顺序**不变，这个排序就是**稳定的**。

举个具体例子。有一批订单，已经按下单时间排好了，现在要再按金额排序：

```text
排序前（已按时间）： (100元, 9:00)  (50元, 9:01)  (100元, 9:02)
稳定排序后（按金额）：(50元, 9:01)  (100元, 9:00)  (100元, 9:02)   ← 两个 100 元仍保持时间先后
不稳定排序后：       (50元, 9:01)  (100元, 9:02)  (100元, 9:00)   ← 两个 100 元的顺序被打乱
```

为什么面试爱问？因为**多关键字排序**依赖它：先按次要键排，再用一个稳定排序按主要键排，次要键的顺序就被保留下来了。记住哪些稳定（冒泡、插入、归并、计数、基数、Timsort）、哪些不稳定（选择、希尔、快排、堆排）几乎是必考点。

### 原地排序（in-place）

只用 O(1) 或 O(log n) 的额外空间就能完成排序，叫**原地**。归并排序要额外开一个 O(n) 的数组，所以不是原地；快排、堆排只在原数组上倒腾，是原地的。当面试官追问「内存很紧张怎么办」，问的往往就是这个。

### 复杂度为什么分最好/平均/最坏

同一个算法，面对不同输入表现可能天差地别。最典型的是快排：输入随机时是 O(n log n)，但输入已经有序、又恰好每次都挑到最差的 pivot 时，会退化成 O(n²)。面试里报复杂度，最好顺带说清是哪种情况——这恰恰是体现你理解深度的地方。

> **为什么比较排序快不过 O(n log n)？**
> 任何比较排序都可以画成一棵「决策树」：每个内部节点是一次比较，每个叶子是一种可能的最终排列。n 个元素共有 n! 种排列，所以树至少要有 n! 个叶子。一棵高度为 h 的二叉树最多有 2ʰ 个叶子，于是 2ʰ ≥ n!，即 h ≥ log₂(n!)。由斯特林公式，log₂(n!) ≈ n log n。树的高度就是最坏情况下的比较次数，所以下界是 Ω(n log n)。这也解释了为什么想更快，就只能绕开「比较」这件事——也就是非比较排序。

好，概念铺垫完了，开始逐个看。

## 比较类排序

### 冒泡排序 Bubble Sort

**一句话思路**：相邻两个元素两两比较，逆序就交换，每一轮都把当前最大的「冒泡」到末尾。

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        # 每一轮把未排序区间里最大的元素冒泡到右端
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:          # 一整轮都没交换，说明已经有序，提前收工
            break
    return arr
```

- **复杂度**：最坏、平均都是 O(n²)；加了 `swapped` 提前退出后，对已经有序的输入是 O(n)。空间 O(1)。
- **稳定性 / 原地**：稳定（只在严格大于时才交换），原地。
- **面试要点**：实战里基本不用，但它是「稳定 + 提前退出能到 O(n)」的经典例子。注意那个 `swapped` 优化，常被拿来考。
- **LeetCode 例题**：[912. 排序数组](https://leetcode.cn/problems/sort-an-array/) —— LeetCode 没有专门考冒泡的题，这道通用排序题可以拿来练手实现（纯 O(n²) 在大数据下会超时，仅作练习）。

### 选择排序 Selection Sort

**一句话思路**：每一轮从未排序区间里挑出最小的，放到已排序区间的末尾。

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        # 在未排序区间 [i+1, n) 里找最小值的下标
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

- **复杂度**：无论输入长什么样都是 O(n²)——它不会因为数据有序而变快。空间 O(1)。
- **稳定性 / 原地**：**不稳定**，原地。比如 `[5a, 5b, 2]`，第一轮把 `2` 和 `5a` 交换，两个 5 的相对顺序就反了。
- **面试要点**：唯一的亮点是**交换次数最少**（最多 n−1 次），在「写操作很贵」的场景下有意义。另外它是「最好情况也救不回来」的反例，常和插入排序对比着考。
- **LeetCode 例题**：[912. 排序数组](https://leetcode.cn/problems/sort-an-array/) —— 同样用这道通用题练手实现，体会它「交换少、但比较一点不少」的特点。

### 插入排序 Insertion Sort

**一句话思路**：像理扑克牌——从左到右，把每张新牌插到左边已经排好的牌中正确的位置。

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # 把比 key 大的元素整体右移一位，给 key 腾出位置
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
```

- **复杂度**：最坏、平均 O(n²)；对**几乎有序**的输入接近 O(n)。空间 O(1)。
- **稳定性 / 原地**：稳定（`while` 条件用 `>` 不是 `>=`），原地。
- **面试要点**：别小看它。**数据量小或几乎有序时，插入排序比快排还快**，所以它正是 Timsort、Introsort 这些工业级排序在「小块」上回退使用的算法。基础三件套里，它是最有实用价值的一个。
- **LeetCode 例题**：[147. 对链表进行插入排序](https://leetcode.cn/problems/insertion-sort-list/) —— 专门为插入排序准备的题：在链表上原地插入。

### 希尔排序 Shell Sort

**一句话思路**：插入排序的升级版。先按一个较大的「间隔」分组做插入排序，再逐步缩小间隔，最后一轮间隔为 1（就是普通插入排序），但此时数组已经「大致有序」，所以很快。

```python
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        # 对每个间隔为 gap 的子序列做插入排序
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

- **复杂度**：取决于增量序列。上面这种 `n//2` 折半序列最坏是 O(n²)；换更好的序列（如 Knuth 的 `3k+1`、Sedgewick 序列）能到 O(n^1.5) 甚至更好。空间 O(1)。
- **稳定性 / 原地**：**不稳定**（跨间隔交换会打乱相等元素的相对位置），原地。
- **面试要点**：它是「为什么让数据先变得大致有序，能让插入排序提速」这个思想的代表。面试不常直接考，但作为承上启下的一环值得知道——它把简单的 O(n²) 排序往 O(n log n) 的方向推了一把。
- **LeetCode 例题**：[912. 排序数组](https://leetcode.cn/problems/sort-an-array/) —— 拿它练手实现希尔排序，可以试试不同增量序列对耗时的影响。

### 归并排序 Merge Sort

**一句话思路**：分治。把数组对半切到不能再切，再把两个**已排序**的小数组合并成一个大的有序数组。

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
    # 双指针，每次取两边较小的那个；用 <= 保证稳定
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])   # 剩下的直接接上
    result.extend(right[j:])
    return result
```

- **复杂度**：最好、平均、最坏**全是 O(n log n)**——非常稳定，不会因为输入退化。空间 O(n)（合并时要额外数组）。
- **稳定性 / 原地**：稳定，**不是原地**。
- **面试要点**：复杂度稳如磐石、天然稳定，是「需要稳定 + 最坏也要 O(n log n)」时的首选。
- **LeetCode 例题**：[148. 排序链表](https://leetcode.cn/problems/sort-list/) —— 排序链表的最优解就是归并；想练数组版可用 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)。

下面是两个高频延伸：

> **概念补充：链表排序和外部排序**
>
> **链表排序**：归并排序对链表特别友好——合并链表只要改指针，不需要额外数组，能做到 O(1) 额外空间（不算递归栈）。这也是为什么「O(n log n) 排序一个链表」的标准答案是归并而不是快排。
>
> **外部排序（external sort）**：当数据大到内存装不下（经典面试题：「1G 内存怎么排 10G 文件？」），答案就是**外部归并排序**——把大文件切成内存能装下的小块，逐块读进来排好序写回磁盘，再用「多路归并」把这些有序小文件合并成最终结果。归并的精髓「合并多个有序序列」在这里被用到了极致。

### 快速排序 Quick Sort

这是我自己复习时最该重点捡起来的一节，partition 的细节五年没碰就模糊了。慢慢来。

**一句话思路**：分治。选一个基准值（pivot），通过一次**分区**（partition）把数组拆成「比 pivot 小的」和「比 pivot 大的」两部分，pivot 归位后，再对两边递归。

#### 1. Lomuto 分区（最好背的版本）

```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)    # 递归左半
        quick_sort(arr, p + 1, high)   # 递归右半
    return arr


def partition(arr, low, high):
    pivot = arr[high]            # Lomuto：固定取最右元素作 pivot
    i = low - 1                  # i 是「小于 pivot 区」的右边界
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]   # pivot 归位
    return i + 1
```

Lomuto 的好处是只用一个指针 `i` 推进，逻辑直观、最好记。面试里手写快排，默认写这个版本就行。

#### 2. 为什么会退化，以及怎么救

固定取最右元素当 pivot 有个致命问题：**输入已经有序（或逆序）时，每次分区都把数组切成 0 和 n−1 两块**，递归深度变成 n，复杂度退化到 O(n²)，还可能爆栈。

救法是**别让 pivot 的选择被输入「预测」**——随机选一个，或者取「头、中、尾」三个数的中位数（median-of-three）：

```python
import random

def partition(arr, low, high):
    rand = random.randint(low, high)
    arr[rand], arr[high] = arr[high], arr[rand]   # 随机选 pivot，再换到最右，复用上面的逻辑
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

只加两行，就把「有序输入退化」这个最常见的坑堵上了。面试官追问「快排最坏情况怎么办」，这就是标准答案。

#### 3. 三路快排：对付大量重复元素

如果数组里有**大量重复值**（比如全是 0 和 1），普通快排还是会做很多无谓的递归。三路快排（基于「荷兰国旗问题」）把数组分成 `< pivot`、`== pivot`、`> pivot` 三段，等于 pivot 的那一整段直接跳过：

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
            gt -= 1               # 换过来的元素还没检查，i 不动
        else:
            i += 1
    quick_sort_3way(arr, low, lt - 1)
    quick_sort_3way(arr, gt + 1, high)
    return arr
```

- **复杂度**：平均 O(n log n)，最坏 O(n²)（用随机 pivot 后几乎遇不到）。空间 O(log n)，是递归栈的开销。
- **稳定性 / 原地**：**不稳定**（分区里的远距离交换会打乱相等元素），**原地**。
- **面试要点**：手写默认 Lomuto；被追问最坏情况就讲随机/三数取中；被追问大量重复就讲三路快排。
- **LeetCode 例题**：[912. 排序数组](https://leetcode.cn/problems/sort-an-array/) —— 提交时记得用随机 pivot，否则遇到有序或大量重复的数据会超时、甚至递归栈溢出。

再加一个高频延伸——

> **概念补充：Quickselect（快速选择）**
>
> 「求第 k 大/小的元素」是面试常客。如果只是要第 k 个，没必要全排序：用快排的 partition，每次分区后看 pivot 落在哪，**只递归 k 所在的那一边**。平均 O(n)，比先排序再取（O(n log n)）更快。
>
> ```python
> def quickselect(arr, k):
>     """返回第 k 小的元素，k 从 1 开始计数"""
>     low, high, target = 0, len(arr) - 1, k - 1
>     while low <= high:
>         p = partition(arr, low, high)
>         if p == target:
>             return arr[p]
>         elif p < target:
>             low = p + 1        # 目标在右边
>         else:
>             high = p - 1       # 目标在左边
> ```
>
> **练手**：[215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) —— 用快速选择平均 O(n) 解，正好和堆的解法对照。

### 堆排序 Heap Sort

**一句话思路**：先把数组建成一个**最大堆**（每个父节点都 ≥ 子节点），堆顶就是最大值；把堆顶换到末尾，堆缩小 1，再调整堆顶下沉，重复直到排完。

```python
def heap_sort(arr):
    n = len(arr)
    # 1. 建堆：从最后一个非叶子节点开始，逐个向下调整
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n)
    # 2. 反复把堆顶（最大值）换到末尾，再修复剩下的堆
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
        if largest == root:      # 父节点已经最大，下沉结束
            break
        arr[root], arr[largest] = arr[largest], arr[root]
        root = largest
```

- **复杂度**：最好、平均、最坏**全是 O(n log n)**。建堆是 O(n)（不是 O(n log n)，这是个常考的反直觉点），之后 n 次下沉每次 O(log n)。空间 O(1)。
- **稳定性 / 原地**：**不稳定**，**原地**。
- **面试要点**：它是**唯一**既保证最坏 O(n log n)、又只用 O(1) 空间的排序——「内存极紧又不能退化」时选它。注意它和**优先队列 / 堆**（heap）是同一套机制：`heapq`、Top-K 问题、Dijkstra 里的堆，全是这个 `sift_down` 的变体。用最小堆维护一个大小为 k 的堆求 Top-K，是堆这块的连环考点。
- **LeetCode 例题**：[215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) —— 堆的经典题（维护一个大小为 k 的最小堆）；它也能用快速选择解，正好对照两种思路。

## 非比较类排序

前面所有算法都靠「比较」，所以卡在 O(n log n) 这条线上。接下来三个绕开了比较，用**元素的值本身**当索引去定位，从而做到线性时间——代价是对数据有要求。这一块也是我复习时空白最大的地方，写得细一点。

### 计数排序 Counting Sort

**一句话思路**：统计每个值出现了几次，再用「前缀和」算出每个值在结果里该放的位置，直接放进去。适合**取值范围 k 不大的整数**。

```python
def counting_sort(arr):
    if not arr:
        return arr
    lo, hi = min(arr), max(arr)
    k = hi - lo + 1
    count = [0] * k
    for x in arr:                # 1. 计数
        count[x - lo] += 1
    for i in range(1, k):        # 2. 前缀和：count[i] 变成「值 ≤ i 的元素个数」
        count[i] += count[i - 1]
    result = [0] * len(arr)
    for x in reversed(arr):      # 3. 从后往前填，保证稳定
        count[x - lo] -= 1
        result[count[x - lo]] = x
    return result
```

- **复杂度**：O(n + k)，n 是元素个数，k 是取值范围。空间 O(n + k)。
- **稳定性 / 原地**：稳定（关键就在第 3 步**从后往前**遍历），不是原地。
- **面试要点**：当 k 远小于 n（比如给十万个 0–100 的分数排序）时，它吊打任何 O(n log n) 排序。但 k 一旦很大（比如要排任意 32 位整数），空间就爆了——这正是它的适用边界，也是基数排序要解决的问题。
- **LeetCode 例题**：[75. 颜色分类](https://leetcode.cn/problems/sort-colors/) —— 只有 0、1、2 三种值，计数排序（或三路快排）一趟搞定。

### 基数排序 Radix Sort

**一句话思路**：按位排序。从最低位（个位）开始，对每一位用一次**稳定的**计数排序，一直排到最高位。因为每一轮都稳定，排完最高位时整体就有序了。

```python
def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1                           # 当前处理的位：1=个位, 10=十位, 100=百位…
    while max_val // exp > 0:
        arr = counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr


def counting_sort_by_digit(arr, exp):
    count = [0] * 10                  # 十进制，每位只有 0–9
    for x in arr:
        count[(x // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    result = [0] * len(arr)
    for x in reversed(arr):           # 从后往前，保持这一位排序的稳定性（基数排序正确性的关键）
        digit = (x // exp) % 10
        count[digit] -= 1
        result[count[digit]] = x
    return result
```

- **复杂度**：O(d·(n + k))，d 是最大数字的位数，k 是基数（这里十进制 k=10）。空间 O(n + k)。
- **稳定性 / 原地**：稳定，不是原地。
- **面试要点**：它解决了计数排序「取值范围一大空间就爆」的问题——把一个大整数拆成几位小数字来排。上面的版本只处理非负整数；要支持负数，可以先整体平移成非负，或对正负分别处理。面试常考的点：**为什么必须从低位排到高位？为什么每一位的排序必须稳定？**（因为高位排序时要靠稳定性保留低位已经排好的顺序。）
- **LeetCode 例题**：[164. 最大间距](https://leetcode.cn/problems/maximum-gap/) —— 要求线性时间和空间，标准解法正是基数排序或桶排序。

### 桶排序 Bucket Sort

**一句话思路**：把数据按值域均匀分到若干个「桶」里，每个桶内部各自排序，最后按桶的顺序拼起来。适合**均匀分布**的数据。

```python
def bucket_sort(arr):
    if not arr:
        return arr
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for x in arr:                     # 假设元素均匀分布在 [0, 1)
        buckets[int(n * x)].append(x)
    result = []
    for bucket in buckets:
        insertion_sort(bucket)        # 桶内用稳定排序，整体才稳定
        result.extend(bucket)
    return result
```

- **复杂度**：数据均匀分布时平均 O(n + k)；最坏情况（所有元素挤进同一个桶）退化到 O(n²)。空间 O(n + k)。
- **稳定性 / 原地**：取决于桶内排序——用插入排序就稳定；不是原地。
- **面试要点**：它的性能完全押在「数据分布是否均匀」上，这是它和计数/基数最大的区别。计数和基数对数据形态不敏感，桶排序敏感。经典适用场景：把一批均匀分布在 [0, 1) 的浮点数排序。
- **LeetCode 例题**：[347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/) —— 按出现频次分桶，是这道题最漂亮的解法。

## 现实世界里用的是什么：Timsort

前面这些都是「教科书算法」。但你每天 `sorted()` 一下，Python 背后跑的其实是 **Timsort**——一个为真实世界数据精心调校过的混合算法。值得单独说，因为面试里能讲出这个，往往是加分项。

**核心思想**：真实数据很少是完全随机的，往往**局部已经有序**。Timsort 抓住这一点：

1. 先扫描数组，找出已经天然有序的连续片段，叫 **run**；
2. 太短的 run 用**插入排序**补齐到一个最小长度（`minrun`，通常 32–64）——前面说过，小数组上插入排序最快；
3. 再用**归并排序**的方式，按一套规则把这些 run 两两合并，合并时还有「galloping（飞奔）」模式来加速。

所以 Timsort = **归并排序的骨架 + 插入排序的小块优化 + 对已有序数据的特判**。

- **复杂度**：最坏 O(n log n)，但对几乎有序的数据能到 O(n)。空间 O(n)。
- **稳定性**：稳定。这也是为什么 Python 的 `sorted()` 和 `list.sort()` 保证稳定。
- **冷知识**：Java 给对象排序（`Arrays.sort(Object[])`）用的也是 Timsort 的变体；而 C++ 的 `std::sort` 用的是另一个混合算法 **Introsort**（快排打底，递归太深时切换堆排避免退化，小块用插入排序）。「快排 + 堆排 + 插入排序」三合一，思路和 Timsort 异曲同工：**没有银弹，工业级排序都是混合的**。
- **LeetCode 例题**：[56. 合并区间](https://leetcode.cn/problems/merge-intervals/) —— 先排序再扫描合并；在 Python 里那句 `sorted()` 跑的就是 Timsort，正好体会「真实数据局部有序」带来的加速。

## 面试里到底怎么选 / 怎么答

把上面的东西浓缩成一张「该用哪个」的决策清单：

- **没有特殊要求，就要快** → 快排（随机 pivot）。这是大多数场景的默认选择。
- **要稳定，且最坏也得 O(n log n)** → 归并排序。
- **内存极紧（要 O(1) 空间）又不能退化** → 堆排序。
- **数据量很小（几十个）或几乎已经有序** → 插入排序。
- **排链表** → 归并排序。
- **整数且取值范围不大** → 计数排序。
- **整数但范围很大（如定长整数 / 字符串）** → 基数排序。
- **数据均匀分布在一个区间** → 桶排序。
- **只要第 k 大 / 中位数，不用全排序** → Quickselect。
- **数据大到内存装不下** → 外部归并排序。

几个常见的连环追问，提前想好答案：

- **「哪些排序是稳定的？」** → 冒泡、插入、归并、计数、基数、桶（桶内稳定时）、Timsort。
- **「快排最坏情况和怎么避免？」** → 有序输入 + 坏 pivot 退化成 O(n²)；用随机 pivot 或三数取中。
- **「能不能比 O(n log n) 更快？」** → 比较排序不能（决策树下界）；但如果数据是范围有限的整数，可以用非比较排序到 O(n)。
- **「O(n log n) 又稳定又原地的排序存在吗？」** → 一般实现里不存在；归并稳定但不原地，堆排原地但不稳定，快排原地但不稳定。这是个很好的「理解权衡」的考点。

## 几个常见易错点

复习时我自己踩过或者差点踩的坑，列在这里：

- **选择排序对有序输入也不会变快**——它没有「提前退出」，永远 O(n²)。别和冒泡/插入搞混。
- **建堆是 O(n) 不是 O(n log n)**。直觉上是 n 个元素各 O(log n)，但仔细算（大部分节点离底很近）是 O(n)。这是个高频反直觉考点。
- **计数 / 基数排序「从后往前」填结果**——这一步是稳定性的来源，反过来写就不稳定了，而基数排序一旦不稳定就直接错了。
- **快排的空间不是 O(1)**——虽然原地分区，但递归栈平均 O(log n)、最坏 O(n)。
- **桶排序的最坏是 O(n²)**——别只记平均 O(n)，分布不均时会退化。
- **稳定 ≠ 原地**，这是两个独立的维度，面试里经常被一起问，别混为一谈。

## 小结

排序这块知识，框架其实很清楚：

- **比较排序**卡在 O(n log n)，里面快排最快但会退化、归并稳定但费空间、堆排原地但不稳定——**没有全能选手，全是权衡**；
- **非比较排序**靠数据特征换来线性时间，但对数据有要求；
- **工业级排序（Timsort、Introsort）都是混合的**，把几种算法的长处缝在一起。

如果你和我一样是隔了几年重新捡起来，建议照着最上面那张速查表过一遍：能默写出实现、说清复杂度和稳定性的就跳过，卡壳的就回到对应章节细看。等下次再准备面试，回到这里再扫一遍就好。

祝面试顺利。
