# Do the digits of π contain patterns? A mosaic and a statistical check

*Report on the Pi Mosaic project, 14–15 October 2026.
Results tables and the full list of repeats are in [FINDINGS.md](FINDINGS.md); this report explains
how every number in that file was produced.*

---

## Summary

A mosaic built from π's digits, one coloured square per digit, seemed to show a repeated patch of
squares. That patch turned out to be a copy-paste error in the hand-typed digits. With correct
digits, we asked a more general question: **do the digits of π, laid out at any width, contain
repeated blocks or long runs more often than random digits would?**

We computed the first million decimal places of π, √2, e and the golden ratio φ, each by two or three
independent methods that agree on every digit. We then searched every width from 2 to 2,000 columns
for repeated rectangular blocks, counted runs of identical digits, and compared every count with what
random digits would produce.

**On these tests and in the digits examined, all four numbers are consistent with random digits.**
Each has a few striking coincidences, such as a 4×4 block that appears twice in φ and eight 9s in a
row in e, but no more of them than chance would produce. √2 and φ had the most unusual counts, so we
checked their next million digits as well, and those counts were not reproduced there. The one rare
event is π's famous Feynman point: six 9s starting at decimal place 762. Random digits would put a run
of six that early only about 1 time in 150. None of this shows that the digits *are* random, or that
no other test could find structure in them.

As a control, we ran the same tests on two numbers whose decimal digits have obvious structure by the
way they're built: 1/9801 and Champernowne's constant. Both show far more repeats than random digits
would: from about 400 times as many (1/9801, 12-square blocks) to billions of times as many
(Champernowne, 18-square blocks). So the tests can detect structure in the digits when it exists.

---

## 1. The mosaic

### 1.1 From digits to squares

Each digit becomes one square. Its colour is purple (`rgb(128, 0, 128)`) with opacity `digit / 9`,
so 0 is white, 9 is full purple, and 1 to 8 are evenly spaced shades in between. Squares fill
rows left to right, then wrap to the next row.

Square 0 holds the whole-number part (the "3" of 3.14159…). So **square number *k* is decimal
place *k***, and every position in this report uses that convention.

### 1.2 Why the width matters

The number of columns, *W*, decides which digits sit on top of each other. Decimal place *k* sits in
row ⌊*k* / *W*⌋ and column *k* mod *W*, so the digit directly below it is decimal place *k* + *W*.
A 2D shape in the mosaic is therefore a set of short stretches of digits spaced exactly *W* apart.
Change the width and different digits line up, so different shapes appear.

### 1.3 Frames, views and the menu

- **Cyan frames** mark both copies of a repeated block (section 4). **Gold frames** mark runs of six
  or more of the same digit (section 6). A run that crosses the end of a row is split into two frames.
- Frames are drawn with inset `box-shadow`, inside each square, so they don't move the grid. They
  are 2px wide on squares of 7px or more, and 1px on smaller squares so the colours stay visible.
- Each **view** sets a number, a width, a number of rows, a square size, and optionally a first row,
  so a view can start partway into the number. The digits before the first row are still computed,
  because frame positions are given as true decimal places, but they aren't drawn.
- A menu switches between views without reloading the page, and a second menu folds the mosaic onto
  itself (section 9.4). The choices are stored in the address (e.g. `index.html#e-309/fold-left-right`),
  so refreshing, bookmarking and the back button all work.

---

## 2. Computing the digits

### 2.1 The general approach: whole-number arithmetic

Computers' ordinary numbers hold only about 16 significant digits. To get hundreds of thousands of
digits we use whole numbers of unlimited size (`BigInt` in the browser, `int` in Python) and
**scale** everything by a power of ten. To get *N* digits of a number *x*, we compute the whole number
⌊*x* × 10^(*N*+*g*)⌋ and keep its first *N* + 1 digits.

The extra *g* **guard digits** (10 in the browser, 20 in Python) absorb the small rounding errors from
divisions along the way, so they never reach the digits we keep. One rare case could still go wrong:
a long run of 9s or 0s right at the cut-off point. Section 3 explains how the cross-checks guard
against it.

### 2.2 π

**Chudnovsky formula** (used in the browser and as Python method 1):

  1/π = 12 Σ_{k≥0} (−1)^k (6k)! (13591409 + 545140134 k) / [ (3k)! (k!)³ 640320^(3k + 3/2) ]

Each term adds about 14.18 correct digits, so a million digits needs about 70,500 terms. Adding the
terms one at a time would mean dividing a huge number on every step. Instead we use **binary
splitting**: the sum over terms *a* to *b* is written as a fraction P/Q (with an auxiliary T), the
range is cut in half, each half is summed recursively, and the two halves are combined with a few
multiplications. All the work becomes multiplying large whole numbers, which is fast, with a single
division at the end:

  π = 426880 × √10005 × Q / T

(426880 √10005 is 640320^(3/2) / 12, rewritten so that only √10005 needs computing.)

**Gauss–Legendre iteration** (Python method 2, a completely different algorithm): start with
a = 1, b = 1/√2, t = 1/4, p = 1 and repeat

  a′ = (a + b)/2, b′ = √(a b), t′ = t − p (a − a′)², p′ = 2p

Then π ≈ (a + b)² / (4t). The number of correct digits roughly doubles on each round. We ran 25
rounds using Python's `decimal` module at 1,000,050 significant digits.

**Result:** both methods agree on all 1,000,000 decimals. The last ten, `5779458151`, match the
published ending of π's first million decimals.

### 2.3 Whole-number square roots

√2, φ and the Chudnovsky formula all need square roots. ⌊√n⌋ for a huge whole number n is found with
**Newton's method**: starting from any x ≥ √n, repeat x ← ⌊(x + ⌊n / x⌋) / 2⌋ until x stops
decreasing. The last value is exactly ⌊√n⌋.

Newton's method doubles the number of correct digits on each step. So the browser version first takes
the square root of only the leading half of n's bits, recursively, which gives a starting value that's
already correct to half the digits. Newton then needs only one or two full-size steps. This made the
browser's φ calculation 4 times faster (1.4 s down to 0.34 s for 792,170 digits). We checked it against
⌊√n⌋ for every n below 200,000 and for thousands of edge cases near powers of 2 and 10 and near perfect
squares.

### 2.4 √2

- **Method 1:** the integer square root ⌊√(2 × 10^(2(N+g)))⌋, which is √2 × 10^(N+g) truncated.
- **Method 2:** Python's `decimal` module, `Decimal(2).sqrt()`, at N + 30 digits. It uses a separate
  library (libmpdec) with its own arithmetic.

Both agree on 2,000,000 decimals.

### 2.5 e

- **Method 1, the factorial series:** e = Σ_{k≥0} 1/k! = 1 + 1/1! + 1/2! + … . We add terms until
  k! > 10^(N+g), which takes 205,028 terms for a million digits. Binary splitting again turns the sum into
  one fraction P/Q, where the base case is 1/(a+1) and two halves combine as
  P = P₁Q₂ + P₂, Q = Q₁Q₂. Then e × 10^(N+g) = ⌊10^(N+g) (Q + P) / Q⌋.
- **Method 2, the continued fraction:** e = [2; 1, 2, 1, 1, 4, 1, 1, 6, 1, …], meaning
  2 + 1/(1 + 1/(2 + 1/(1 + …))), with the pattern 1, 2k, 1 repeating. Its approximations h/k come from
  multiplying 2×2 matrices (again by halving the list). The error is below 1/k², so we used terms until
  k had more than half a million digits (311,073 terms).
- **Method 3:** Python's `decimal` module, `Decimal(1).exp()`. This is slow at this size but finished
  in the background.

All three agree on all 1,000,000 decimals.

### 2.6 The golden ratio φ

- **Method 1:** φ = (1 + √5)/2, computed as ⌊(10^(N+g) + ⌊√(5 × 10^(2(N+g)))⌋) / 2⌋.
- **Method 2, Fibonacci numbers:** the ratio of consecutive Fibonacci numbers F(n+1)/F(n) approaches
  φ, with an error of about 1/F(n)². We computed F(2,400,000) and F(2,400,001), each about 501,570
  digits long, with the "fast doubling" formulas F(2k) = F(k)(2F(k+1) − F(k)) and
  F(2k+1) = F(k)² + F(k+1)². That gives about 1,003,000 correct digits. For the second million we
  used F(4,800,000).

Both agree on 2,000,000 decimals.

### 2.7 The two patterned numbers

- **1/9801:** method 1 is long division, ⌊10^N / 9801⌋ with leading zeros restored. Method 2 writes out
  the two-digit numbers 00, 01, …, 97, 99 (98 is skipped), which is 198 digits, and repeats them. The
  two agree on all million decimals.
- **Champernowne's constant:** method 1 writes 1, 2, 3, … one after another. Method 2 is a formula that
  goes straight to decimal place k: subtract the 9 one-digit, 180 two-digit, 2,700 three-digit … places
  until k falls inside a block of d-digit numbers, then work out which number and which of its digits.
  The two agree at all 1,000,000 places. (The first check covered 20,013 places, the block
  boundaries plus 20,000 random places; the full check was added after review.)

### 2.8 In the browser

`pi.js` computes the digits each time a view is shown, using the same formulas: Chudnovsky for π,
integer square roots for √2 and φ, the factorial series for e, long division for 1/9801, and writing
out the numbers for Champernowne. We checked every view's digits against the verified million-digit
files. Computing and drawing a view takes from about 0.1 s (π at 147 columns, 20,727 squares) to about
1 s (e at 309 columns, 338,355 squares) in the test browser. Of that, computing φ's 792,170 digits
takes about 0.34 s; most of the rest is creating the squares.

---

## 3. Verification

Each number's digits were computed by **at least two independently written methods**, then compared
at every one of the million decimal places. Most pairs also use different mathematics: a series against
an iteration for π, a square root against Fibonacci numbers for φ, a series against a continued fraction
for e. The two √2 methods both compute a square root, but with separate implementations (our own
Newton's method, and the libmpdec library behind Python's `decimal` module).

Agreement between independent methods is strong evidence that both are right, because a bug would have
to produce exactly the same wrong digits in both. It also makes the guard-digit risk from section 2.1
very unlikely to go unnoticed, because the methods carry different small errors. It is not a rigorous
guarantee: two calculations could in principle share a rounding problem. A proof of correctness would
need explicit error bounds for each step.

Wherever a published value was available, we also checked the start or end against it. Every repeated
block quoted in this report and in FINDINGS.md was re-read from the saved digit files and checked
copy against copy.

---

## 4. Searching for repeated blocks

### 4.1 What counts as a repeat

At a given width *W*, an **h × w block** is h rows and w columns of squares, starting at some decimal
place *p*. Its digits are the w-digit stretches starting at p, p + W, p + 2W, …, p + (h−1)W. A block
**repeats** if exactly the same digits, in the same arrangement, appear at another starting place at
the same width.

Only the full rows of the first million decimals are used, so there are ⌊1,000,001 / W⌋ rows.
We tested 15 shapes, every rectangle of 12 to 18 squares with both sides at least 2:
2×6, 6×2, 3×4, 4×3 (12 squares); 2×7, 7×2 (14); 3×5, 5×3 (15); 4×4, 2×8, 8×2 (16); and
3×6, 6×3, 2×9, 9×2 (18).

### 4.2 How the search works

Comparing every block with every other block directly would take about 10¹² comparisons per shape per
width. Instead:

1. **Turn each block into one number.** Read its digits row by row as a single number. For example,
   the 3×4 block with rows `7068`, `1461`, `2311` becomes 706814612311. Every block of a given shape
   has the same number of digits, so two blocks are identical exactly when their numbers are equal.
   Blocks of up to 18 digits fit in a standard 64-bit integer.
2. **Compute all of them at once.** With the digits arranged as a grid, the codes for every position
   are built by shifting the whole grid and accumulating code × 10 + digit, one cell of the shape at a
   time, using array operations (`numpy`).
3. **Sort and look for neighbours.** After sorting the codes, identical blocks end up next to each
   other, so the repeats are the values equal to their neighbour. This takes about a million log a
   million steps per shape per width, rather than 10¹².
4. **Count** the number of different blocks that appear twice or more, add them up over all widths
   from 2 to 2,000, and record the decimal places of each copy for anything of 14 squares or more.

The full search over 1,999 widths and 15 shapes takes about 4 minutes on 12 processor cores.

### 4.3 Things to keep in mind when reading the counts

- The counts are of **different blocks** that repeat, not of copies. A block seen three times counts
  once. For random-looking digits this makes no practical difference, because triple matches are
  vanishingly rare. For 1/9801 it matters a lot (section 8.1).
- **Neighbouring widths can catch the same coincidence.** If two stretches of digits match for one
  digit longer than needed, the same pair of places can form a block at width W and W + 1. Examples are
  π's 3×4 block at 147 and 148 columns, and a 2×7 block at 342 and 343. These are counted at both widths.
- A block of all one digit, inside a long run, can match an overlapping copy of itself shifted by one.
  This is rare, and it happens to random digits too.

### 4.4 Follow-up searches for a specific block

To check whether a particular block appears a third time at any width, we found every occurrence of
its top row in the million digits. For each one and every width W from 4 (or 5) to 5,000, we then
checked whether the next rows sit exactly W places later. None of the blocks we tested appeared a
third time.

---

## 5. How many repeats would random digits give?

### 5.1 The estimate

Take one shape with A squares, at one width where the shape fits (at least w columns and h rows),
with M possible positions. There are about M² / 2 pairs
of positions. For random digits, two blocks at non-overlapping positions match with probability
10^−A, since every one of the A digits must agree and each has a 1-in-10 chance. So the **expected
number of repeated blocks** at that width is about

  M² / 2 × 10^−A,

where M = (rows − h + 1) × (W − w + 1) is close to a million at most widths. Widths narrower than the
block are skipped, because the block can't fit there at all.

**Example, 3×4 blocks (A = 12):** about 5 × 10¹¹ pairs × 10⁻¹² ≈ 0.5 repeats per width. Over the
1,996 widths where a 3×4 block fits that's about 976; calculated width by width, it's 975.82. Adding
the four 12-square shapes gives about 3,904. Each extra square divides the expected number by 10, which
is why the expected count drops from thousands (12 squares) to about 19 (14), 2 (15), 0.3 (16) and
0.004 (18).

### 5.2 Checking the estimate with random digits

An expected count doesn't need the comparisons to be independent: it's just the sum of each pair's
match probability. But the comparisons *are* related. Overlapping positions share digits, and the same
digits are reused at every width. That affects how much the counts vary, and so the probabilities in
section 7, which use the Poisson distribution and should be read as approximations.

To check both the estimate and the spread, we generated **24 strings of a million random digits** and
ran the full 14-square search on each, the same widths and the same shapes. They gave between 12 and 28
repeats, an average of 18.6 and a spread (standard deviation) of 3.8. The estimate of 19.4 is close,
and the spread is about what the Poisson distribution predicts (√19.4 ≈ 4.4). Twenty-four strings are
enough for this check, but they say little about how often very rare outcomes occur.

---

## 6. Runs of the same digit

A **run** is a maximal stretch of one repeated digit. A run of L or more starts at a given place when
that digit differs from the previous one (probability 9/10) and the next L − 1 digits all equal it
(probability 10^−(L−1)). So in N random digits:

| | Formula | For N = 1,000,000 |
|---|---|---|
| Expected runs of L or more | N × 0.9 × 10^−(L−1) | L = 6: 9; L = 7: 0.9; L = 8: 0.09 |
| Chance of at least one run of 8 or more | 1 − e^(−0.09) | 8.6% (about 1 in 12) |
| Chance the first run of six comes by place x | 1 − (1 − 0.9 × 10⁻⁵)^x | x = 762: 0.68%; average position about 111,000 |

The gold frames in the mosaic mark every run of six or more. The "first run of six" is the equivalent
of π's Feynman point for the other numbers.

---

## 7. Deciding whether a result is unusual

### 7.1 Single results

For a count with expected value λ, we used the Poisson distribution, the standard model for counts of
rare events. It gives the approximate probability of a count at least as extreme as the one observed:

| Observation | Expected | Probability of a result this extreme |
|---|---|---|
| √2: 10 repeats of 14 squares | 19.4 | 1.5% (10 or fewer). Also below all 24 random strings |
| φ: 6 repeats of 15 squares | 1.95 | 1.5% (6 or more) |
| φ: one 4×4 repeat | 0.097 for 4×4 blocks | 9.3% (at least one 4×4 repeat) |
| φ: one 16-square repeat of any shape | 0.29 for 4×4, 2×8 and 8×2 together | 25% (at least one) |
| e and φ each having a run of eight | 8.6% each | 4% (2 or more out of 4 numbers) |
| π: first run of six at decimal place 762 | about 111,000 on average | 0.68% |

### 7.2 Many comparisons

Across the four random-looking numbers we looked at about 30 counts: five block sizes and several run
statistics for each number, plus individual blocks. As an illustration, if those 30 counts were
independent, a particular 1-in-50 result would turn up at least once about 45% of the time
(1 − 0.98³⁰), and a 1-in-70 result about 35% of the time. Our two most unusual counts were each about
1-in-70 (1.5%), and the chance of at least one result that extreme among 30 independent counts is about
36%. The real counts are related, so these figures are only a guide. But the point stands: when many
things are examined, an occasional unusual result is expected, so a single 1.5% result is **not**
evidence of a pattern on its own.

### 7.3 Testing again with fresh digits

A stronger check is to repeat the measurement on **digits that haven't been looked at yet**. A real
tendency would be expected to show up again, though not necessarily in every sample; a chance result
usually won't, though chance results can also recur. We computed and verified decimal places 1,000,001
to 2,000,000 of √2 and φ, the two numbers with the most unusual counts, and recounted:

| | First million | Second million | Expected |
|---|---|---|---|
| √2, 14-square repeats | 10 | 18 | 19.4 |
| φ, 14-square repeats | 10 | 16 | 19.4 |
| φ, 15-square repeats | 6 | 0 | 1.95 |
| φ, 16-square repeats | 1 | 0 | 0.29 |

None of the unusual counts was reproduced in the second million. That is consistent with chance
variation, though it doesn't prove it. π and e had no counts unusual enough to need this check.

π's Feynman point can't be re-tested this way, because it's about one specific place in π. It stays a
genuine rare coincidence (about 1 in 150), and it is the reason it's famous.

---

## 8. Results

Full tables are in FINDINGS.md, sections 4 to 6. In brief:

| Repeated blocks, widths 2–2,000, first million decimals | π | √2 | e | φ | Chance |
|---|---|---|---|---|---|
| 12 squares | 3,962 | 3,865 | 4,017 | 3,896 | about 3,904 |
| 14 squares | 18 | 10 | 19 | 10 | about 19.4 |
| 15 squares | 2 | 1 | 3 | 6 | about 1.95 |
| 16 squares | 0 | 0 | 0 | 1 | about 0.29 |
| 18 squares | 0 | 0 | 0 | 0 | about 0.004 |

| Runs, first million decimals | π | √2 | e | φ | Chance |
|---|---|---|---|---|---|
| First run of six | 762 | 32,413 | 89,296 | 99,788 | about 111,000 on average |
| Runs of six or more | 13 | 12 | 8 | 7 | about 9 |
| Runs of seven or more | 1 | 2 | 2 | 1 | about 0.9 |
| Longest | 7 | 7 | 8 | 8 | 8+ in about 1 in 12 |

### 8.1 The control numbers

| | Champernowne | 1/9801 | π, √2, e, φ |
|---|---|---|---|
| Different 12-square blocks that repeat | 77,079,507 | 1,575,085 | about 3,900 |
| Different 18-square blocks that repeat | 40,359,021 | 1,575,487 | 0 |
| Times the random expectation (12 squares) | about 19,700 | about 400 | about 1 |
| Times the random expectation (18 squares) | about 10 billion | about 400 million | 0 |
| Share of 3×4 block positions that are a repeat (300 columns) | 95% | 100% | about 0% |
| Most copies of one 3×4 block (300 columns) | 99 | 5,047 | 1 or 2 |

1/9801's digits repeat every 198 places, so at any width there are only about 198 different blocks of
each shape. That's why its count of *different* repeated blocks is lower than Champernowne's even
though it is the more regular number. The share of positions that are repeats shows the true picture.

Champernowne's constant is a useful lesson. Like π and e, it is transcendental. It has been proven that every digit and every block of
digits appears equally often in it in the long run. That property is called being **normal**, and it is
*not* proven for π, √2, e or φ. Yet Champernowne's constant is obviously not random-looking, because
consecutive numbers share most of their digits. These facts don't conflict: frequencies in the long run say nothing about how the first million
digits look. So "every digit equally often" is weaker than "looks random", and the repeat test can
tell the difference.

---

## 9. Beyond the flat mosaic: lines, 3D blocks and folding

### 9.1 One idea behind all three

Any arrangement of the digits, whether flat, folded, a cube or a hypercube, only decides which decimal
places count as neighbours. If digits fill a box with sides n₁ × n₂ × … (last side filled first, like
the mosaic's rows), a step along each side is a fixed jump in decimal places: 1, n_last, n_last ×
n_second-last, and so on. A straight line in any direction is therefore a set of evenly spaced decimal
places k, k + d, k + 2d, … (an arithmetic progression). A box in d dimensions has (3^d − 1)/2 line
directions: 4 in 2D, 13 in 3D, 40 in 4D.

To avoid choosing whatever happens to look good, all layouts, directions, lengths, block shapes and
folds were fixed before any results were seen, and two strings of random digits were run alongside.

### 9.2 Straight lines of one digit

A line of length L is L cells in one direction, inside the box (no wrapping round an edge), all the
same digit, and maximal: the cells just before and after it are outside the box or a different digit.
The count works on the whole box at once. Pad the box with a border of −1, compare it with a copy
shifted one step along the direction, and keep the cells that start a run (the cell one step back is
different or outside). Then repeatedly test whether the run continues one more step. This gives the
length of every maximal run in that direction.

**Chance.** A maximal run of length L or more starts at cell c when cells c, …, c + (L−1)v are inside
the box and all equal (probability 10^−(L−1)), and the cell before is outside the box (probability 1)
or a different digit (probability 9/10). Summing over all cells and directions:

  expected runs ≥ L = 10^−(L−1) × Σ over directions [ (cells where the run fits) − 0.1 × (cells where
  the run fits and the cell before is inside) ]

with "where the run fits" = Π (nᵢ − (L−1)|vᵢ|) and "and the cell before is inside" = Π (nᵢ − L|vᵢ|).
On 100 random strings in the 2D layout the averages matched the formula (356.4 found against 357.9
predicted for 5+; 0.26 against 0.36 for 8+). We also re-counted one result square by square with a
simple loop and got the same lines.

**Van der Waerden's theorem** (1927) says that colouring the whole numbers with finitely many colours
always produces arbitrarily long evenly spaced runs of one colour. With 10 digits as colours, lines of
one digit of any given length must exist in every number once enough directions and spacings are
allowed. Finding a striking line therefore proves nothing; only the count compared with chance means
anything.

### 9.3 Repeated 3D blocks

Digits fill W × W layers stacked into a box with ⌊N / W²⌋ full layers. A d × h × w block starting at
decimal place p covers p + i·W² + j·W + k for i < d, j < h, k < w. Each block is encoded as one number
and the codes are sorted, exactly as in 2D (section 4.2), for every W from 10 to 150 and every
orientation of 2×2×3, 2×2×4 and 2×3×3. The chance figure uses the same pair formula as in 2D, with
M = (layers − d + 1)(W − h + 1)(W − w + 1), counting only boxes where the block fits.

### 9.4 Folding

Folding lays the 1,000 × 1,000 layout onto itself: left half onto right (column c meets 999 − c), top
onto bottom (row r meets 999 − r), or along either diagonal ((r, c) meets (c, r), or (999 − c, 999 − r)).
A square matches when it has the same digit as its partner. Squares on a diagonal fold line meet
themselves and are left out. For random digits each pair matches with probability exactly 1/10,
independently of the others, so:

- the match rate should be 10%;
- an all-matching 2×2 group has probability 10⁻⁴, so the expected number is 10⁻⁴ × (number of 2×2
  positions);
- a maximal run of 5 or more matches along a row or column starting at a given place has probability
  0.1⁵ × (1 or 0.9), giving about 8.9 per fold.

These figures matched the averages from 100 random strings. In the mosaic, the fold menu shows one half
of the current view, with matching squares solid and the rest pale, plus the match rate. Diagonal
folds need a square grid, so they are only in the analysis, not in the mosaic.

### 9.5 Reading the results

The approach to unusual results is the one in section 7: Poisson probabilities as approximations,
allowance for the number of counts examined, and recounting in fresh digits when something stands out.
Results are in FINDINGS.md, section 7. In brief, about 1 count in 10 fell outside the middle 90% of
chance (as expected); the most extreme, φ's six 4D lines of 8 or more (0.9%), was not reproduced in
φ's next 923,521 digits (2 found, 1.73 expected). One random control string produced a 1-in-1,500
result, a reminder that truly random digits look striking sometimes too.

## 10. Limitations

- **Base 10 only.** Normality in base 10 carries over to bases 100, 1,000 and other powers of 10,
  but not to other bases such as 2 or 7. Looking random in base 10 says nothing about other bases.
- **Exact matches only.** Squares of nearby digits (say 8 and 9) look almost the same, so the eye finds
  many near-matches that this test ignores. A test for "similar" blocks would need its own definition
  of similarity and its own chance estimate.
- **Rectangles only, widths 2 to 2,000, block sizes 12 to 18 squares.** Other shapes, such as
  diagonals or L-shapes, and other widths weren't searched.
- **A million digits** (two million for √2 and φ's follow-up checks). That is tiny compared with the
  trillions of digits of π that have been computed and studied by others.
- **The chance estimates and probabilities are approximate** (sections 5 and 7). The random-digit
  simulation was run only for the 14-square count, with 24 strings.
- **Nothing here proves anything about π.** Whether π, √2, e or φ are normal is an open problem in
  mathematics. These tests can only show that the digits we looked at are consistent with randomness.

---

## 11. Reproducing the results

- The verified digits are in `analysis/digits/`. Square 0 is the whole-number part.
- The line, 3D block and fold scripts are in `analysis/scripts/3d/` and run from the project folder
  as they are, e.g. `python3 analysis/scripts/3d/alignments.py`.
- The other Python scripts are in `analysis/scripts/`, grouped by the folder they were run from (`/tmp/pi1m`,
  `/tmp/sqrt2`, and so on). Their file paths point to those folders, so they need adjusting to run
  elsewhere. They need Python 3 and `numpy`. Scripts that use several cores must keep their
  `if __name__ == "__main__":` guard, because on macOS each worker process re-runs the script without it.
- The saved scan scripts include the narrow-width fix described in the revision notes below.
- Every repeat of 14 or more squares is listed in `analysis/results/*.json` and in the FINDINGS.md
  appendix.
- The mosaic needs no installation: open `index.html` in a browser. To change the default view, edit
  `defaultView` at the top of `pi.js`. To add a view, add an entry to `views` with a `label`.

---

## Glossary

- **Binary splitting:** adding up a long series by repeatedly splitting it in half and combining the
  halves as fractions, so most of the work is multiplying large whole numbers.
- **Guard digits:** extra digits computed beyond those needed, to absorb rounding errors.
- **Normal number:** a number in which every digit, and every block of k digits, appears with the same
  long-run frequency (1 in 10, 1 in 100, …). Proven for Champernowne's constant, unproven for π.
- **Poisson distribution:** the probability model for how many times a rare event happens, when it has
  many independent chances to happen.
- **Run:** a stretch of the same digit repeated, e.g. `999999`.
- **Feynman point:** the run of six 9s starting at π's 762nd decimal place, named after physicist
  Richard Feynman, who reportedly joked about reciting π up to that point and then saying "nine nine
  nine nine nine nine and so on".

---

## Revision notes

Corrections made on 15 October 2026 after an external review of the first version:

- **Chance figures (§5, §8):** the first version included widths too narrow for a block to fit. At
  those widths the position count is negative, and squaring it added a small positive amount. With
  those widths skipped, the 12-square expectation changes from 3,906 to 3,904.45 and the 14-square one
  from 19.45 to 19.42. No conclusion changes. The observed counts were never affected, because the
  search itself always skipped those widths.
- **φ's 4×4 repeat (§7.1):** the first version quoted 26% using the expectation for all three
  16-square shapes. For a 4×4 block specifically the expectation is 0.097 and the probability 9.3%. Both
  are now shown, each labelled with the event it describes.
- **Multiple comparisons (§7.2):** a 1-in-50 result among 30 independent counts appears about 45% of the
  time, which is *less* than half; a 1-in-70 result appears about 35% of the time, which is *lower*.
  The first version said "more likely than not" and "higher still".
- **Follow-up checks (§7.3, summary):** "so they were chance" is now "not reproduced, consistent with
  chance", and the summary says these checks covered √2 and φ.
- **Verification (§3):** agreement between methods is described as strong evidence rather than a
  guarantee. The √2 methods are described accurately. The Champernowne formula check was extended from
  20,013 places to all 1,000,000, with no mismatches.
- **Wording (summary, §8.1, §9):** "behave like random digits" is now "consistent with random digits on
  these tests"; "numbers whose digits follow a rule" is now "numbers whose digits have obvious structure
  by construction", since every number here can be computed by a rule; "fail by a factor of millions" is
  replaced by the actual ratios; and the base-10 limitation now notes that normality does carry over to
  powers of 10.
