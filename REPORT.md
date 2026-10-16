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
random digits would produce. Later tests (section 9) added lines in 2D to 4D, folding, counting runs,
digit frequencies, and pairs of digits at every distance up to 100,000 places apart.

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

Finally, we looked at the Leibniz series 1 − 1/3 + 1/5 − … stopped early. Four times its first 500,000
terms matches π except at evenly spaced clusters of digits given by the Euler numbers, a pattern that
dissolves after about 70 digits and reaches further the more terms are used. Tested in its own right,
the same number's first million digits are consistent with random digits (section 9.12).

A colleague suggested a second way of approaching π, the way Archimedes did: the areas of regular polygons
inside a circle of radius 1, doubling the number of sides from the hexagon. Unlike the stopped Leibniz
sums, these areas are irrational (except the 12-gon, exactly 3), so their digits never repeat; π's digits
grow in from the left, about 0.6 digits per doubling. Archimedes' 96-gon, tested in its own right, gave
one striking count (twice the expected number of repeated 14-square blocks, about 1 in 8,000), which was
not reproduced in its next million digits; like the others, it is consistent with random digits (section
9.13).

Finally, Liouville's constant (a 1 at every factorial decimal place, 0 elsewhere), the first number proven
to be transcendental, was added to see whether being transcendental, like π and e, has anything to do with
looking random. It fails every test, as do 1/9801 (a fraction) and Champernowne's constant (also
transcendental). On our tests, what separated the numbers was not their type but whether their digits are
written down by a simple rule (section 9.14).

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
- In the 3D cube, **Show digits** picks any range (e.g. 3 to 3), and a **digit chart** counts each
  digit in the cube, with the chi-squared verdict (section 9.8).
- **Green frames** mark counting runs of five or more digits along the digits, such as 34567 or 98765
  (section 9.7); the 3D cube can show them as green lines. On both pages a **Counting** menu chooses
  whether counting stops at 9 and 0 or rolls over (89012), as in section 9.10.
- A **sphere** page shows the digits on a rotatable ball (section 9.11).
- A **Leibniz series** view shows the number 4 × (first 500,000 terms) like the other numbers, and it is
  also available in the 3D cube and the sphere (section 9.12). Six more views show the series stopped
  after 4 to 24 terms, 144 to a row, where the repeating cycle of each fraction shows as repeated rows;
  these six can also be chosen in the 3D cube and the sphere.
- A **Polygon ladder** view stacks the areas of Archimedes' polygons (6, 12, 24, … sides), one per row,
  with π as the bottom row; five more views show single polygons (6, 12, 96, 6,144 and 6,291,456 sides),
  and the same five are in the 3D cube and the sphere (section 9.13).
- A **Liouville's constant** view shows its first 5,160 digits, 120 to a row, with frames switched off
  (almost every row would be one gold run of 0s); the number is also in the 3D cube and the sphere
  (section 9.14).
- A **polygons** page (`polygons.html`) draws the polygons inside and outside the circle, from 6 to
  6,291,456 sides, with a close-up of the gap and the two areas next to π. The outside area n tan(π/n)
  uses the same halving, with tan(x/2) = sin x / (1 + cos x). Above 1,536 sides the whole-circle picture
  is drawn with 1,536 corners, since the difference is far below a pixel; the close-up uses the exact
  corners for every number of sides, with gap heights computed as 2 sin²(x/2) rather than 1 − cos x, so
  they stay accurate when tiny.
- When folded, a **Pairs** menu chooses whether to highlight same-digit pairs (purple), complementary
  pairs that add up to 9 (teal), or both.
- An **About** button opens a plain-English explanation of the current view, written for readers
  without a mathematical background. Its figures are taken from FINDINGS.md.
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
splitting**: the sum over terms *a* to *b* is written as a fraction T/Q (with an auxiliary product P), the
range is cut in half, each half is summed recursively, and the two halves are combined with a few
multiplications. All the work becomes multiplying large whole numbers, which is fast, with a single
division at the end:

  π ≈ 426880 × √10005 × Q / T

The sum stops after finitely many terms, so this is an approximation; the guard digits (section 2.1)
keep its error far below the last digit we keep. (426880 √10005 is 640320^(3/2) / 12, rewritten so that only √10005 needs computing.)

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

- **Method 1:** the integer square root ⌊√(2 × 10^(2(N+g)))⌋, which is √2 × 10^(N+g) truncated,
  computed with Python's built-in `math.isqrt`.
- **Method 2:** Python's `decimal` module, `Decimal(2).sqrt()`, at N + 30 digits. It uses a separate
  library (libmpdec) with its own arithmetic.

Both agree on 2,000,000 decimals.

### 2.5 e

- **Method 1, the factorial series:** e = Σ_{k≥0} 1/k! = 1 + 1/1! + 1/2! + … . We add terms until
  k! > 10^(N+g), which takes 205,028 terms for a million digits. Binary splitting again turns the sum into
  one fraction P/Q, where the base case is 1/(a+1) and two halves combine as
  P = P₁Q₂ + P₂, Q = Q₁Q₂. Then e × 10^(N+g) ≈ ⌊10^(N+g) (Q + P) / Q⌋, an approximation because the series is cut off;
  the guard digits keep the error out of the digits we keep.
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

### 2.7 The patterned numbers

- **1/9801:** method 1 is long division, ⌊10^N / 9801⌋ with leading zeros restored. Method 2 writes out
  the two-digit numbers 00, 01, …, 97, 99 (98 is skipped), which is 198 digits, and repeats them. The
  two agree on all million decimals.
- **Champernowne's constant:** method 1 writes 1, 2, 3, … one after another. Method 2 is a formula that
  goes straight to decimal place k: subtract the 9 one-digit, 180 two-digit, 2,700 three-digit … places
  until k falls inside a block of d-digit numbers, then work out which number and which of its digits.
  The two agree at all 1,000,000 places. (The first check covered 20,013 places, the block
  boundaries plus 20,000 random places; the full check was added after review.)
- **Liouville's constant** (added later, section 9.14): method 1 puts a 1 at each factorial place up to a
  million (1, 2, 6, 24, 120, 720, 5,040, 40,320, 362,880) and 0 everywhere else. Method 2 adds up
  10^(N − k!) for each of those k as one exact whole number and writes it out with its leading zeros. The two
  agree on all million decimals.

### 2.8 In the browser

`pi.js` computes the digits each time a view is shown, using the same formulas: Chudnovsky for π,
integer square roots for √2 and φ, the factorial series for e, long division for 1/9801, and writing
out the numbers for Champernowne, and placing the 1s at the factorials for Liouville's constant. We checked every view's digits against the verified million-digit
files. Computing and drawing a view takes from about 0.1 s (π at 147 columns, 20,727 squares) to about
1 s (e at 309 columns, 338,355 squares) in the test browser. Of that, computing φ's 792,170 digits
takes about 0.34 s; most of the rest is creating the squares.

---

## 3. Verification

Each number's digits were computed by **at least two independently written methods**, then compared
at every one of the million decimal places. Most pairs also use different mathematics: a series against
an iteration for π, a square root against Fibonacci numbers for φ, a series against a continued fraction
for e. The two √2 methods both compute a square root, but with separate implementations (Python's
built-in `math.isqrt`, and the libmpdec library behind Python's `decimal` module). The Newton's method
in section 2.3 is our own and is used in the browser.

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
1,997 widths where a 3×4 block fits (4 to 2,000) that's about 976; calculated width by width, it's 975.82. Adding
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
| φ: 10 repeats of 14 squares | 19.4 | 1.5% (10 or fewer) |
| φ: 6 repeats of 15 squares | 1.95 | 1.5% (6 or more) |
| φ: one 4×4 repeat | 0.097 for 4×4 blocks | 9.3% (at least one 4×4 repeat) |
| φ: one 16-square repeat of any shape | 0.29 for 4×4, 2×8 and 8×2 together | 25% (at least one) |
| e and φ each having a run of eight | 8.6% each | 4% (2 or more out of 4 numbers) |
| π: first run of six at decimal place 762 | about 111,000 on average | 0.68% |

### 7.2 Many comparisons

Across the four random-looking numbers, the repeat and run tests gave about 30 counts: five block
sizes and several run statistics for each number, plus individual blocks. Three of them were each about
1-in-70 (1.5%): √2's and φ's 10 repeats of 14 squares, and φ's 6 repeats of 15 squares.

As an illustration, if those 30 counts were independent, at least one 1.5% result would turn up about
36% of the time (1 − 0.985³⁰), but three or more only about 1% of the time. So among these 30 counts
alone, three such results are more than chance usually gives. Two things temper this:

- The later tests (lines, folds, counting runs and digit frequencies, section 9) added well over a
  hundred more counts. Among 200 independent counts, three or more 1.5% results would turn up more
  often than not (about 58%). This is only a rough guide, because those tests were added later and
  their counts are not all of the same kind.
- More decisively, none of the three was reproduced in fresh digits (section 7.3).

The real counts are related and the probabilities are Poisson approximations, so all these figures are
only a guide. The general point stands: when many things are examined, an occasional unusual result is
expected, so a single 1.5% result is **not** evidence of a pattern on its own.

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

## 9. Beyond the flat mosaic: lines, 3D blocks, folding, counting runs, every distance, the Leibniz series, Archimedes' polygons and Liouville's constant

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

### 9.5 Folding at every width and height, and complementary digits

To ask whether particular widths or heights are special, the fold was repeated at every width W from 2 to
2,000 (left onto right, ⌊N / W⌋ full rows) and every height H from 2 to 2,000 (top onto bottom, ⌊N / H⌋
columns), with N = 1,000,000. Besides matching pairs, each grid counts **complementary** pairs, two digits
adding up to 9. For random digits each of the n pairs in a grid is complementary with probability exactly
1/10, independently, so the count is binomial and is scored as z = (count − n/10) / √(0.09 n).

With 1,999 grids per fold, the most extreme z is expected to be large even for random digits, and
neighbouring grids share most of their digits, so the textbook correction for many tests is only a rough
guide. Instead the whole search was run on 20 strings of random digits, and each number's most extreme
grid was compared with theirs. Results are in FINDINGS.md, section 7.4.

### 9.6 The 3D cube page

`cube.html` draws a cube of side n (10 to 60) from a chosen starting decimal place, using the same
layout as the analysis (column i mod n, row ⌊i/n⌋ mod n, layer ⌊i/n²⌋). Each digit is a small square at
its position, turned with two angles (around the vertical axis, then tilted), shown in perspective, and
drawn furthest first so nearer squares cover further ones. Squares are drawn at half their spacing so the
inside of the cube stays visible. The gold lines use the same definition and chance formula as section
9.2, and are cut into one piece per step so each piece is drawn at its own depth. The page's line
finder gave exactly the same lines as the Python code on eight test cubes. It uses no outside libraries.
When the lines would need more than 20,000 pieces (only the structured numbers in large cubes, such as
Liouville's constant or the 12-gon, almost all 0s), every line is still counted but only 1 line in every k
is drawn, spread through the cube, and the page says so; drawing them all froze the page. Random digits
stay far below the limit (about 7,000 pieces in a cube of side 60 with lines of 4 or more).

### 9.7 Counting runs

A counting run is a maximal stretch along a line (along the digits, or in a direction of a 2D, 3D or 4D
box) where each digit is one more than the last (rising) or one less (falling), with no wrapping from 9
to 0. The search reuses the line machinery of section 9.2, with "the next cell equals this one" replaced
by "the next cell equals this one plus (or minus) one per step". The padding value is −100 so it can never
continue a count.

**Chance.** A rising run of length L or more starts at a cell when its digit d is at most 10 − L (so the
count fits below 9; probability (11 − L)/10), each of the next L − 1 cells is one more than the last
(probability 10^−(L−1)), and the cell before is outside the box or is not d − 1 (probability 1 if d = 0,
otherwise 9/10). Summing over cells:

  expected rising runs ≥ L = 10^−(L−1) × 0.1 × Σ over directions [ (boundary starts) × (11 − L)
  + (interior starts) × (1 + 0.9 × (10 − L)) ]

and the same again for falling runs. With 200 random strings the averages matched the formula at every
length, in 1D and 2D (e.g. 0.760 found against 0.740 predicted for 7+ along the digits). The browser's
line finder gave exactly the same counts as the Python code on six test cubes. Results: FINDINGS.md,
section 7.5.

### 9.8 Does every digit appear equally often?

For n digits with counts c₀ … c₉, each digit is expected n/10 times, and the chi-squared statistic is
χ² = Σ (cᵢ − n/10)² / (n/10). For random digits it follows a chi-squared distribution with 9 degrees of
freedom (ten counts, less one because they must add up to n). The p value, the chance that random digits
are at least this uneven, is the regularized upper incomplete gamma function Q(4.5, χ²/2), computed by its
series or continued fraction. The code reproduces the textbook values (χ² = 16.92 gives p = 0.05, 21.67
gives p = 0.01), and the browser's version gives the same values as the Python version.

A very *large* p (close to 1) is also informative: it means the counts are more even than random digits
usually are, which is how a perfectly regular number like 1/9801 shows up. The test was run on stretches
of 1,000 to 1,000,000 decimals and on each of 100 separate blocks of 10,000; for blocks, about 5 in 100
are expected below 0.05 by chance. Results: FINDINGS.md, section 7.6.

### 9.9 Every distance at once

Every layout used here (rows, columns, cube layers, 4D boxes, diagonals and the sphere) places
neighbouring digits a fixed number of places apart. So the strongest single check of all of them is to
take each gap d from 1 to D = 100,000 (fixed before looking) and count, over the first N = 1,000,000
decimals, the pairs (k, k + d) whose digits are related in one of four ways: the same; adding up to 9;
the second one more than the first, modulo 10 (so 9 is followed by 0); the second one less, modulo 10.

**Chance.** For random digits each relation holds with probability exactly 1/10 for every pair. The
n = N − d pairs at a gap overlap, but any two of them are independent (knowing whether digits k and k + d
match says nothing about whether k + d and k + 2d match), so the count has mean n/10 and variance exactly
0.09 n, and counts at different gaps are uncorrelated. Each gap's z = (count − n/10) / √(0.09 n) is close
to a standard normal value. Across 100,000 gaps, a |z| of at least 4 is expected about 6.3 times per
relation, and the largest |z| is usually between about 4.2 and 5. The chance that random digits give
a |z| at least as large as the observed maximum somewhere among the M tests is 1 − (1 − p)^M, where p is
the two-sided normal tail. We also report the average z² over all gaps, which should be close to 1.
Twenty random strings run through the same test serve as a control, so none of this rests on the normal
approximation alone.

**Computation.** For each digit v, an indicator sequence marks where v occurs. The number of pairs
(k, k + d) with digit v at k and digit w at k + d, for every d at once, is the cross-correlation of two
indicator sequences, computed with fast Fourier transforms (sequences padded to 2²¹ to avoid wrap-around)
and rounded to whole numbers. Each relation is a sum over v of the pairs (v, w(v)), with w(v) = v, 9 − v,
v + 1 or v − 1 (mod 10). The whole test takes about ten seconds for all 26 strings. 936 gaps, chosen both
systematically and at random, were recounted directly and all agreed. Results: FINDINGS.md, section 7.7.

### 9.10 Counting runs with rollover

The same as section 9.7, but the comparison is made modulo 10, so 9 is followed by 0 going up and 0 by
9 going down. Because no digit is now too close to 9 (or 0) to start a long run, the chance formula
simplifies: a run of L or more starts at a cell with probability 10^−(L−1), times 9/10 if the cell before
is inside the box (that cell must not continue the count), so

  expected runs ≥ L = 2 × 10^−(L−1) × Σ over directions [ (boundary starts) + 0.9 × (interior starts) ]

counting rising and falling runs together. With 200 random strings the averages matched at every length,
in 1D and 2D.

Runs can now be longer than ten digits, and in the structured numbers they are (up to 99). The first
version of the code shifted the box with `np.roll`, which wraps round from one side to the other; that was
safe for runs of at most ten digits inside a 12-cell padding, but not for longer ones. An assertion caught
this on the first full run. The shifts are now made by slicing, filling with "outside the box", so a run of
any length is measured correctly. The new code was checked against a cell-by-cell count on 40 small 1D to
4D boxes of biased digits (built to contain many long runs), with and without rollover, and gives exactly
the same results as before for every number and layout without rollover. In the browser, the cube's
rollover lines matched the Python counts on five test cubes, and the mosaic's green frames matched a
direct search. Results: FINDINGS.md, section 7.8.

### 9.11 The sphere page

`sphere.html` places n dots (10, 50, 100, or 1,000 to 20,000) on a ball of radius 1 along a Fibonacci spiral: dot i is at
height y = 1 − 2(i + ½)/n and angle i × 137.5° (the golden angle, π(3 − √5) radians), at radius √(1 − y²)
from the axis. Dot i holds the digit at decimal place start + i. The drawing uses the same projection and
furthest-first painting as the cube (section 9.6), with dots on the far half drawn paler. With 100 dots or
fewer, each dot is labelled with its decimal place and the spiral between consecutive dots is drawn (the same
formula with i taken between whole numbers), to show how the layout works.

On such a spiral, a dot's nearest neighbours are dots a Fibonacci number of steps away (a known property of
these spirals, which we confirmed numerically): with 2,000 dots, the four nearest dots in the middle band are
34 and 55 places before and after, and with 20,000 they are mostly 89, 144 and 233 places away. So any pattern the eye finds on the sphere is a relation between digits at a few fixed gaps, all of which section
9.9 tests. The page is a way of looking at the digits, not a separate test. The spiral arms that the eye
picks out are a property of the layout and appear for any digits.

### 9.12 The Leibniz series stopped early

For T terms, the partial sum 4 × Σ_{k<T} (−1)^k / (2k+1) was computed in two independent ways:

- **Adding the terms**, each as ⌊10^(D+g) / (2k+1)⌋ with g = 20 guard digits (each floor loses less than
  one unit, so at most T units in all, far below the guard digits).
- **π minus the Euler-number formula** of Borwein, Borwein and Dilcher, π − 4S = Σ 2 E₂ₘ / N^(2m+1) with
  N = 2T, using the verified digits of π and exact fractions. The Euler numbers come from the recurrence
  Σₖ C(2n, 2k) E₂ₖ = 0. The formula is asymptotic: its terms shrink until m ≈ πN/4 and then grow, so the
  code checks that every term it uses is smaller than the one before. For the N used here it is exact to
  far more than the D = 1,000 decimals compared.

Both agree on all 1,000 decimals for 50,000, 500,000 and 5,000,000 terms.

**Longer series.** For 5 to 5 × 10²⁹ terms (N = 10 to 10³⁰), the digits come from adding the terms up to
5,000,000 terms (checked against the formula from 5,000 terms up) and from the formula alone beyond that.
Where the pattern dissolves is measured as the last stretch of five decimals in a row that all match π.
For unrelated digits such a stretch occurs about once in 100,000 places, so the number of decimals
compared is doubled from 400 until it is at least four times the measured end (up to 6,400); even so, a
chance stretch can occasionally extend the measured end. As checks, the end was also measured with
stretches of six (similar; stretches of four are too often produced by chance), and compared with the
theoretical point where the clusters merge: cluster m ends at decimal place k(2m+1), with N = 10^k, and is
about as wide as 2|E₂ₘ|, so they merge at the first m where 2|E₂ₘ| has at least 2k digits. Since
log₁₀ |E₂ₘ| ≈ 2m log₁₀(4m/(πe)), that m is about k / log₁₀(4m/(πe)) and the merge point grows roughly
like k² / log k.

**The 500,000-term number on its own.** Its first million decimals were computed by adding the terms
(12 processes, 20 guard digits) and, independently, by binary splitting into one exact fraction P/Q
(Q, the product of the odd numbers below 10⁶, has about 3 million digits) followed by a single exact
division; the two agree on every digit. Decimal places 1,000,001–2,000,000 were computed the same two
ways for follow-up checks. The digits then went through every test in this report, using the same scripts as the other numbers
(which reproduced every earlier result exactly when rerun with it included). Anything that looked
unusual was re-checked in the second million (`second_million.py`, `lines_followup.py`), and the close pair
of runs was compared with 20,000 random strings (`close_runs.py`). Results: FINDINGS.md, section 7.10.2. The browser computes
the number by binary splitting, cutting P and Q down to the needed precision before dividing (about half
a second), and its digits matched the verified digits for every length tested up to 216,001. The estimate of π from the Euler numbers
uses |E₂ₘ| ≈ 2 (2m)! (2/π)^(2m+1), whose relative error is about 3^−(2m), so the ratio of neighbours gives
π² ≈ 4 (2m+1)(2m+2) |E₂ₘ / E₂ₘ₊₂|. The corrected sums add the formula's terms while they keep shrinking.
The best accuracy is then about (π N / 2) log₁₀ e decimals, since the smallest term is about e^(−πN/2).

**Cycles for short series.** For 1 to 30 terms, the stopped sum was formed as an exact fraction a/b. With
b = 2^i 5^j c and c coprime to 10, the decimals repeat after max(i, j) digits with a cycle equal to the order
of 10 modulo c, found by factoring φ(c) and dividing out prime factors while 10 to the reduced power is
still 1 modulo c. Independently, long division of a by b recorded the decimal place at which each
remainder first appeared; the first remainder to recur gives the start and length of the cycle. The two
agree for 1 to 29 terms (cycles up to 16,576,560 digits). The mosaic views use 144 columns because 144
divides every cycle length from 10 terms on, so the cycle is a whole number of rows; the browser computes
the digits from the exact fraction, and the rows inside the two cyan frames were checked to match digit for
digit.

The lower bound on the repeating cycle uses the fact that a fraction a/b in lowest terms, with b = 2^i 5^j c
and c coprime to 10, repeats with a cycle equal to the order of 10 modulo c. That is a multiple of the order
of 10 modulo each prime p dividing c. Every prime p with 333,333 < p < 1,000,000 is the denominator of
exactly one term (3p is too big to be another), so p divides b. The orders were found by factoring p − 1
with a sieve. Results: FINDINGS.md, section 7.10.

### 9.13 Archimedes' polygons

The area of a regular n-gon inscribed in a circle of radius 1 is A(n) = (n/2) sin(2π/n). Following
Archimedes, n starts at 6 and doubles (6, 12, 24, …, 6 × 2^k). The area of the 2n-gon, n sin(π/n), equals
half the perimeter of the n-gon, so these are also Archimedes' perimeter estimates, one doubling later
(Archimedes himself used perimeters, inside and outside the circle). No π is needed: everything comes from
square roots of whole numbers, computed two independent ways.

- **Halving:** from cos 60° = 1/2 and sin 60° = √3/2, cos(x/2) = √((1 + cos x)/2) and
  sin(x/2) = sin x / (2 cos(x/2)), in scaled whole numbers with `math.isqrt`. Because sin(2π/n) is tiny and is
  then multiplied by n, the guard digits are 20 plus the number of digits of n.
- **Nested roots:** 2 sin(2π/n) = √(2 − 2 cos(4π/n)), with 2 cos(x/2) = √(2 + 2 cos x) unwound from
  2 cos 60° = 1; for example A(96) = 24 √(2 − √(2 + √(2 + √3))). The subtraction cancels about 2 log₁₀ n
  digits, so the guard digits are 20 plus twice the number of digits of n. For the 96-gon's million digits
  this method uses Python's `decimal` module (libmpdec) rather than `math.isqrt`, a separate square-root
  implementation.
- **Check with π:** (n/2) sin(2π/n) from the sine series, using the verified digits of π, for the first 200
  digits of every polygon up to 6 × 2²⁰ sides and the first 10,000 digits of the 96-gon.

Both methods agree on the first 200 digits of all 81 polygons from 6 to 6 × 2⁸⁰ sides, and on the 96-gon's
first two million decimals. Rounding errors leave a computed value a few units *below* the truth, which would
turn the 12-gon's exact 3 into 2.999…; a small nudge (10^(g/2) units, with g guard digits) is added before
the guard digits are cut off. It can only change the last digit kept if the true digits just beyond it are
g/2 nines in a row (about 1 chance in 10^(g/2)). The `decimal` method for the 96-gon has no nudge, so its
agreement rules this out there; for the ladder, the 12 digits after digit 200 of every row were checked
and none is a run of nines. The browser uses the halving method with the
same guard rule and nudge; its digits match the verified ones for the 96-gon (first 100,000), all 100 digits
of the 80 ladder rows, and the 12-gon (30,000 zeros after the 3).

**Which areas are fractions.** A(n) is rational exactly when sin(2π/n) is. By Niven's theorem the only
rational values of the sine at rational multiples of π are 0, ±1/2 and ±1, so among polygons only the square
(area 2) and the 12-gon (area 3) have rational areas. Every polygon in the doubling sequence except the
12-gon therefore has an irrational area, whose decimals never repeat in a cycle.

**How fast the areas approach π.** sin x = x − x³/6 + … gives π − A(n) ≈ 2π³/(3n²), so each doubling divides
the gap by about 4 and adds about log₁₀ 4 ≈ 0.6 shared decimals. Because the areas increase towards π,
the shared decimals never decrease from one polygon to the next.

**The 96-gon on its own.** Its first million decimals went through every test in this report with the same
scripts as the other numbers (every earlier result was reproduced exactly when they were rerun with it
included), plus repeated blocks at every width (`analysis/scripts/polygons/scan.py`). Its decimal places
1,000,001–2,000,000 were computed the same two ways (`second_million.py`), and the four counts that
looked unusual in the first million (14-square repeats, counting runs of 5+ with and without rollover,
3D lines of 6+) were recounted there with the same functions (`second_million.py`, `followup.py`). None
was reproduced. Results: FINDINGS.md, section 7.11.

### 9.14 Liouville's constant

Liouville's constant, the sum of 10^−(k!) for k = 1, 2, 3, …, was the first number proven transcendental
(Liouville, 1851). It was added as a fourth structured number, to see whether being transcendental has
anything to do with looking random. Its digits are described in section 2.7; in the first million
decimals there are nine 1s and 999,991 0s. The next 1 is at decimal place 10! = 3,628,800, so decimal places
1,000,001–2,000,000 are all 0, and there is nothing new to re-check there.

It went through every test in this report with the same scripts as the other numbers (every earlier
result was reproduced exactly with it included), plus repeated blocks at every width
(`analysis/scripts/liouville/liouville.py`). The 3D block script lists the positions of every large
repeat; for Liouville, as for Champernowne and 1/9801, it no longer does, because the all-zero block repeats
at almost every position (the list came to 10 GB). Its counts are unchanged. Results: FINDINGS.md, section 7.12.

### 9.15 Reading the results

The approach to unusual results is the one in section 7: Poisson probabilities as approximations,
allowance for the number of counts examined, and recounting in fresh digits when something stands out.
Results are in FINDINGS.md, section 7. In brief, about 1 count in 10 fell outside the middle 90% of
chance (as expected); the most extreme, φ's six 4D lines of 8 or more (0.9%), was not reproduced in
φ's next 923,521 digits (2 found, 1.73 expected). One random control string produced a 1-in-1,500
result, a reminder that truly random digits look striking sometimes too. The every-distance test and the
rollover runs (sections 9.9 and 9.10) gave the same picture: nothing in π, √2, e or φ outside the range of
the random strings, and both structured numbers far outside it.

## 10. What surprised us

The overall result was expected: mathematicians expect π, √2, e and φ to behave like random digits, and
on our tests they did. What surprised us was in the details.

1. **Champernowne's constant.** It is proven that every digit and every block of digits appears equally
   often in it in the long run, which nobody has managed to prove for π. Yet it failed every one of our
   tests, with about 19,700 times as many repeated 12-square blocks as random digits and about 10 billion
   times as many 18-square blocks (FINDINGS.md, sections 4.1 and 6). "Every digit equally often" and "looks random" are
   known to be different properties, but the size of the gap, and how visible it is in the mosaic, were
   unexpected. It is the most instructive result of the project.

2. **1/9801 often shows its pattern through absence.** A repeating number might be expected to produce
   *more* of everything. Instead 1/9801 has no lines of one digit at all in the 1,000 × 1,000 layout,
   fewer matches than chance on the diagonal folds (about 5% instead of 10%), and no complementary pairs
   at all when folded at 99, 297, 495 or any other odd multiple of 99 columns (FINDINGS.md, sections 7.1, 7.3 and 7.4).
   A pattern can show up as something that never happens.

3. **A random control nearly looked like a discovery.** One of the strings of genuinely random digits
   produced four lines of eight identical digits in the 2D layout, a result random digits give only about
   1 time in 1,500. Our first assumption was a bug; a square-by-square recount and 100 further random
   strings confirmed it was real (FINDINGS.md, section 7.1). Truly random digits sometimes look more "patterned" than π,
   which is why every striking result had to be compared with chance.

4. **How convincing the false alarms looked.** √2's and φ's low counts of 14-square repeats (10 each
   against about 19), φ's six 15-square repeats (against about 2) and φ's six 4D lines of eight (against
   about 1.7) each looked significant on their own. None came back in the next million digits: 18, 16, 0
   and 2 (FINDINGS.md, sections 4.3 and 7.1).
   Without the re-check, at least one would have been reported as a discovery.

5. **The Feynman point holds up.** π's famous six 9s by the 762nd decimal place passed every check:
   random digits put a run of six that early only about 1 time in 150 (FINDINGS.md, section 5). It is a coincidence
   rather than a pattern, but a genuinely rare one, and its fame is deserved.

6. **Errors in our own first version.** An external review caught a boundary error in the chance
   formula, wrong arithmetic about how often unusual results appear when many things are tested, a
   probability that described the wrong event (26% instead of 9.3% for φ's 4×4 repeat), and wording that
   claimed more than the data showed. None changed the conclusions, but each had been stated with more
   confidence than it deserved (see the revision notes). It is a strong argument for independent
   checking.

7. **The biggest false alarm came from Archimedes.** The 96-gon's area gave 38 repeated 14-square blocks
   in its first million decimals, about twice the 19.4 expected and more than any of 24 random strings:
   a 1-in-8,000 result. Its next million gave 15 (section 9.13).

8. **Being transcendental doesn't make digits look random.** Liouville's constant is transcendental, like
   π and e, yet its first million decimals are nine 1s and 999,991 0s, and it fails every test; so does
   Champernowne's constant, also transcendental. Being algebraic or transcendental made no difference on
   our tests (FINDINGS.md, sections 7.12 and 7.13).

**The lesson:** the patterns people see in π are real visual effects, but not real structure. To tell the
difference, ask how often random digits would produce the same thing, and then check again with fresh
digits.

---

## 11. Limitations

- **Base 10 only.** Normality in base 10 carries over to bases 100, 1,000 and other powers of 10,
  but it does not imply normality in bases such as 2 or 7. Our tests say nothing either way about
  how the digits behave in those bases.
- **Exact matches only.** Squares of nearby digits (say 8 and 9) look almost the same, so the eye finds
  many near-matches that this test ignores. A test for "similar" blocks would need its own definition
  of similarity and its own chance estimate.
- **Rectangles only, widths 2 to 2,000, block sizes 12 to 18 squares**, for repeated blocks. Other
  shapes, such as L-shapes, and other widths weren't searched for repeats. Relations between *pairs* of
  digits were tested at every gap up to 100,000 places (section 9.9), but only for four relations
  (same, adding up to 9, and one more or one less).
- **A million digits** (two million for √2 and φ's follow-up checks). That is tiny compared with the
  trillions of digits of π that have been computed and studied by others.
- **The chance estimates and probabilities are approximate** (sections 5 and 7). The random-digit
  simulation was run only for the 14-square count, with 24 strings.
- **Nothing here proves anything about π.** Whether π, √2, e or φ are normal is an open problem in
  mathematics. These tests can only show that the digits we looked at are consistent with randomness.

---

## 12. Reproducing the results

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
- The every-distance test (`analysis/scripts/distances/`), the Leibniz, polygon and Liouville scripts (`analysis/scripts/leibniz/`, `analysis/scripts/polygons/`, `analysis/scripts/liouville/`), the counting-run scripts
  (`analysis/scripts/counting/`) and the digit-frequency script also run from the project folder as they
  are.
- The mosaic needs no installation: open `index.html` in a browser (or `cube.html` for the 3D cube, or
  `sphere.html` for the sphere). To change the default view, edit
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

Further corrections made on 15 October 2026 after a second review:

- **Unusual counts (§7.1, §7.2):** φ's 10 repeats of 14 squares (1.5%) was in the tables but missing from
  the discussion, which spoke of two unusual counts. There are three, and three 1.5% results among 30
  counts is itself unusual (about 1%); §7.2 now says so and explains why the fresh-digit checks matter more.
- **Notation (§2.2, §2.5):** the finite sums are now written as approximations, and the Chudnovsky partial
  sum is T/Q, with P an auxiliary product.
- **Small facts:** a 3×4 block fits at 1,997 widths, not 1,996 (the figure 975.82 was already right); the
  Python √2 uses `math.isqrt`, not our own Newton's method; base-10 normality "does not imply" normality
  in other bases, rather than implying the opposite.
- **Scripts:** `patterned/make.py` now checks the Champernowne formula at all 1,000,000 places, as the
  report describes, and `sqrt2b/run.py` has the multiprocessing guard it needs on macOS and Windows.
