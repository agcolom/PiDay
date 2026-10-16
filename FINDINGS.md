# Pi Mosaic: findings

What we found while turning the digits of π (and five other numbers) into mosaics, and
checking whether any patterns in them are real. Started 14 October 2026.

**Short version:** on the tests we ran and the digits we examined, π, √2, e and the golden ratio φ
are all consistent with random digits. Each has a few eye-catching coincidences, but no more than
random digits would produce. √2 and φ had the most unusual counts; we checked their next million
digits too, and those counts were not reproduced there. The two numbers whose decimal digits are
structured by construction, 1/9801 and Champernowne's constant, show far more repeats than random
digits would: from about 400 times as many to billions of times as many, depending on block size.
Two ways of approaching π were looked at too (sections 7.10 and 7.11). The Leibniz series stopped early is
a fraction, so its digits repeat, with a cycle pushed further away the more terms are added; the areas of
Archimedes' polygons are irrational (except the 12-gon, exactly 3), so they never repeat, and π's digits
grow in from the left, about 0.6 digits per doubling of the sides. Taken on their own, the 500,000-term
Leibniz number and the 96-gon's area are consistent with random digits too.
None of this proves the digits of π (or the others) are random.

---

## 1. How the mosaic works

- Each digit is one square. Its shade of purple is `digit / 9`: 0 is white, 9 is full purple.
- Square 0 is the whole-number part (the "3" of 3.14159…), so **square number = decimal place**.
  All positions in this file use that convention.
- The squares fill rows left to right. The number of columns ("width") decides which digits end
  up stacked above each other, so it decides which 2D shapes you see.
- **Cyan frames** mark both copies of a repeated block. **Gold frames** mark runs of six or more
  of the same digit. **Green frames** mark five or more digits counting up or down by one.
- The menu in the top-right corner switches between views, and a second menu folds the mosaic onto
  itself (section 7.3). The choices are kept in the address, e.g. `index.html#e-309/fold-left-right`.

| View | Number | Columns × rows | Squares | What's framed |
|---|---|---|---|---|
| `pi-147` (default) | π | 147 × 141 | 20,727 | 3×4 repeat, Feynman point |
| `pi-157` | π | 157 × 1,150 | 180,550 | 3×5 repeat, Feynman point |
| `sqrt2-395` | √2 | 395 × 256 | 101,120 | 2×7 repeat, two runs of six |
| `e-309` | e | 309 × 1,095, from decimal place 87,756 | 338,355 | 3×5 repeat, eight 9s and other runs |
| `phi-370` | φ | 370 × 136, from decimal place 741,850 | 50,320 | 3×5 repeat, eight 5s |
| `oneOver9801-198` | 1/9801 | 198 × 100 | 19,800 | nothing (every row repeats) |
| `champernowne-300` | Champernowne | 300 × 200 | 60,000 | runs of six or more |

---

## 2. The original "pattern" was a copy-paste error

The repeat spotted in the original 2024 mosaic was not in π. The hand-pasted digit string in
`pi.js` contained a block of **933 digits pasted twice**: decimal places 968–1,900 appeared again
starting at 1,901. Removing the copy left digits that matched π exactly. The digits are now
computed by the page itself (Chudnovsky formula), so no hand-copied digits remain.

---

## 3. How accurate the digits are

Every number was computed to **1,000,000 decimal places by at least two independently written
methods**, and every digit agreed. This is strong evidence the digits are right, though not a formal
proof (that would need explicit error bounds). The digits the page computes in the browser were checked against these.

| Number | Method 1 | Method 2 | Method 3 | Check against published value |
|---|---|---|---|---|
| π | Chudnovsky series | Gauss–Legendre iteration | | ends `…5779458151` at the millionth decimal |
| √2 | integer square root | `decimal` module square root | | starts 1.41421356237309504880… |
| √2, second million | integer square root | `decimal` module square root | | |
| e | Σ 1/k! (binary splitting) | continued fraction [2; 1,2,1, 1,4,1, …] | `decimal` module `exp(1)` | starts 2.71828182845904523536… |
| φ (2 million) | (1 + √5) / 2 | ratio of Fibonacci numbers F(n+1)/F(n) | | starts 1.61803398874989484820… |
| 1/9801 | long division | writing out 00 01 … 97 99 and repeating | | |
| Champernowne | writing out 1 2 3 … | formula for the digit at any place (all 1,000,000 places checked) | | |
| Leibniz, 500,000 terms (2 million) | adding the terms one by one | one exact fraction (binary splitting), one division | π minus the Euler-number formula (first 1,000) | starts 3.14159065358979324046… (Borwein et al.) |
| Area of the 96-gon (2 million) | halving the angle from the hexagon (whole-number square roots) | nested square roots, 24 √(2 − √(2 + √(2 + √3))) (`decimal` module) | 48 sin(π/48) from the sine series, with π's digits (first 10,000) | |

---

## 4. Repeating blocks

**Test:** lay the first million decimals out at every width from 2 to 2,000 columns, and count the
rectangles of digits (e.g. 3×4) that appear twice or more with every digit identical.
**"Chance"** is the number random digits would give: for each shape, about
(number of positions)² / 2 × 10^−(squares).

### 4.1 Summary

Counts are of **different** blocks that appear twice or more.

| Repeated blocks | π | √2 | e | φ | Champernowne | 1/9801 | Chance |
|---|---|---|---|---|---|---|---|
| 12 squares (2×6, 3×4, 4×3, 6×2) | 3,962 | 3,865 | 4,017 | 3,896 | 77,079,507 | 1,575,085 | about 3,904 |
| 14 squares (2×7, 7×2) | 18 | 10 | 19 | 10 | 21,737,509 | 785,345 | about 19.4 |
| 15 squares (3×5, 5×3) | 2 | 1 | 3 | 6 | 38,951,763 | 789,971 | about 1.95 |
| 16 squares (4×4, 2×8, 8×2) | 0 | 0 | 0 | 1 | 73,378,431 | 1,180,475 | about 0.29 |
| 18 squares (3×6, 6×3, 2×9, 9×2) | 0 | 0 | 0 | 0 | 40,359,021 | 1,575,487 | about 0.004 |

Compared with the chance column, Champernowne has about 19,700 times as many repeated 12-square
blocks and about 10 billion times as many 18-square blocks; 1/9801 has about 400 times and about
400 million times as many.

1/9801's counts are lower than Champernowne's even though it is the more regular number. At any
width its digits only have 198 different starting points, so there are only about 198 different
blocks of each shape, and essentially every one of them repeats thousands of times. Section 4.5
measures this directly.

### 4.2 By shape

Chance figures count only widths where the shape fits (see the revision note at the end).

| Shape | π | √2 | e | φ | Chance |
|---|---|---|---|---|---|
| 2×6 | 1,014 | 926 | 1,012 | 915 | 967.36 |
| 3×4 | 981 | 989 | 1,009 | 985 | 975.82 |
| 4×3 | 998 | 985 | 994 | 1,008 | 979.52 |
| 6×2 | 969 | 965 | 1,002 | 988 | 981.75 |
| 2×7 | 9 | 3 | 5 | 4 | 9.62 |
| 7×2 | 9 | 7 | 14 | 6 | 9.80 |
| 3×5 | 2 | 0 | 3 | 3 | 0.97 |
| 5×3 | 0 | 1 | 0 | 3 | 0.98 |
| 4×4 | 0 | 0 | 0 | 1 | 0.097 |
| 2×8, 8×2 | 0 | 0 | 0 | 0 | 0.096 and 0.098 |

### 4.3 Results that looked unusual, and the follow-up checks

| Result | First million | Follow-up | Outcome |
|---|---|---|---|
| √2: only 10 repeats of 14 squares | about 19.4 expected (1.5% chance of 10 or fewer); lower than all 24 random million-digit strings tested (they gave 12–28, average 18.6) | second million of √2: **18** | not reproduced |
| φ: 6 repeats of 15 squares | about 1.95 expected (1.5% chance of 6 or more) | second million of φ: **0** | not reproduced |
| φ: 4×4 repeat | 0.097 expected for 4×4 blocks (9.3% chance of at least one); 0.29 for any 16-square shape (25%) | second million of φ: **0** 16-square repeats | not reproduced |
| φ: only 10 repeats of 14 squares | about 19.4 expected (1.5% chance of 10 or fewer) | second million of φ: **16** | not reproduced |

Three counts were each about 1-in-70 (1.5%): √2's and φ's 10 repeats of 14 squares, and φ's 6 repeats
of 15 squares. Among the roughly 30 counts in this section, one such result would be unremarkable, but
three is more than usual (about 1 time in 100 if the counts were independent). The later tests
(sections 7.1 to 7.6) added well over a hundred more counts, which makes a few 1.5% results expected
overall (REPORT.md, section 7.2). None of the unusual counts was reproduced in fresh digits, which is consistent with
chance variation, though it doesn't prove it. π and e had no counts unusual enough to need this
check. The probabilities are Poisson approximations (see REPORT.md, section 7).

### 4.4 The repeats shown in the mosaic

| Number | Columns | Block | Digits | Decimal places | Notes |
|---|---|---|---|---|---|
| π | 147 | 3×4 | `7068 / 1461 / 2311` | 13,310 and 18,740 | the first one we found. Also lines up at 148 columns (shifted by one digit). No third copy at any width 4–5,000 |
| π | 157 | 3×5 | `26857 / 98272 / 74389` | 117,089 and 179,171 | joint biggest in π. No third copy at any width 5–5,000 |
| π | 1,357 | 3×5 | `05305 / 72212 / 15653` | 179,302 and 386,162 | the other biggest in π. No third copy at any width 5–5,000 |
| √2 | 395 | 2×7 | `0800980 / 8857184` | 72,436 and 100,380 | chosen because it fits on one screen |
| √2 | 1,850 | 5×3 | `532 / 642 / 586 / 682 / 310` | 262,103 and 436,989 | biggest in √2, too wide to show |
| e | 309 | 3×5 | `26706 / 42937 / 38235` | 89,404 and 423,780 | |
| φ | 336 | 4×4 | `5288 / 3469 / 0072 / 4599` | 138,138 and 902,802 | biggest repeat in any number. Copies too far apart to show |
| φ | 370 | 3×5 | `44792 / 81931 / 88069` | 743,904 and 789,917 | |

The full list of every repeat of 14 or more squares is in the appendix.

### 4.5 How much of the mosaic is made of repeats

Counting different blocks undersells 1/9801, so here is a second measure: of all the places a 3×4
block can sit, what share hold a block that also appears somewhere else?

| Number | Columns | 3×4 block positions | Different blocks | Share of positions that are a repeat | Most copies of one block |
|---|---|---|---|---|---|
| π | 198 | 984,360 | 984,359 | 0.0002% | 2 |
| π | 300 | 989,307 | 989,307 | 0% | 1 |
| √2 | 198 / 300 | 984,360 / 989,307 | all different | 0% | 1 |
| e | 198 | 984,360 | 984,360 | 0% | 1 |
| e | 300 | 989,307 | 989,305 | 0.0004% | 2 |
| φ | 198 | 984,360 | 984,359 | 0.0002% | 2 |
| φ | 300 | 989,307 | 989,307 | 0% | 1 |
| Champernowne | 198 | 984,360 | 524,548 | 51% | 100 |
| Champernowne | 300 | 989,307 | 136,730 | 95% | 99 |
| 1/9801 | 198 | 984,360 | 196 | 100% | 5,048 |
| 1/9801 | 300 | 989,307 | 199 | 100% | 5,047 |

(The one 1/9801 block that doesn't repeat is the one containing the "0" before the decimal point.)
Random digits would give about 0.5 matching pairs of 3×4 blocks at a single width (about 1 position out of nearly a million), i.e. close to 0%.

---

## 5. Runs of the same digit ("Feynman points")

**Chance** for a million random digits: a run of L or more starts at a given place with
probability 0.9 × 10^−(L−1), so on average there are
**9 runs of six or more, 0.9 of seven or more, and 0.09 of eight or more**.
An average of 0.09 means about 1 million-digit stretch in 12 contains a run of eight.
The first run of six turns up, on average, around decimal place 111,000.

| | π | √2 | e | φ | Champernowne | 1/9801 | Chance |
|---|---|---|---|---|---|---|---|
| First run of six | `999999` at 762 | `444444` at 32,413 | `000000` at 89,296 | `555555` at 99,788 | `1111111` at 3,334 | none | about 111,000 on average |
| Chance of a first run that early | 0.7% (about 1 in 150) | 25% | 55% | 59% | | | |
| Runs of six or more | 13 | 12 | 8 | 7 | 17 | 0 | about 9 |
| Runs of seven or more | 1 | 2 | 2 | 1 | 17 | 0 | about 0.9 |
| Longest run | `3333333` at 710,100 | `0000000` at 158,809; `7777777` at 969,836 | `99999999` at 384,340 | `55555555` at 771,950 | eleven 1s at 555,556 (111111 then 111112) | 4 (the leading "0." joins the first zeros) | 8 or more: about 1 stretch in 12 |

**π's Feynman point** (six 9s at decimal place 762) is the most unusual single thing in this file:
random digits put a run of six that early only about 1 time in 150. Every other run is ordinary.
e and φ both having a run of eight is mildly lucky (two out of four numbers: about 4%).

All runs of six or more, by decimal place:

- **π:** 762 `999999` (Feynman point), 710,100 `3333333`, and 11 more runs of six
- **√2:** 32,413 `444444`, 93,648 `888888`, 109,812 `000000`, 158,809 `0000000`, 969,836 `7777777`, and others
- **e:** 89,296 `000000`, 210,482 `5555555`, 384,340 `99999999`, 416,816 `000000`, 451,957 `000000`, 545,731 `888888`, 601,113 `000000`, 850,320 `333333`
- **φ:** 99,788 `555555`, 358,264 `888888`, 364,998 `222222`, 771,950 `55555555`, 906,220 `777777`, 930,663 `222222`, 987,564 `888888`
- **Champernowne, first 60,000:** 3,334 `1111111`, 7,778 `2222222`, 12,222 `3333333`, 16,666 `4444444`, 21,110 `5555555`, 25,554 `6666666`, 29,998 `7777777`, 34,442 `8888888`, 44,445 `111111111`

Also worth knowing: e = 2.7**1828****1828**459045…, so "1828" appears twice right at the start. A
well-known coincidence, but only 4 digits long.

---

## 6. The numbers with structured digits

- **1/9801** = 0.00 01 02 … 96 97 99 00 01 …, the same 198 digits forever (98 is skipped). At 198
  columns every row is identical, giving vertical stripes that darken left to right. Row 1 differs
  only in its first square, the "0" before the decimal point.
- **Champernowne's constant** = 0.123456789101112…, the counting numbers written one after another.
  It is *proven* that every digit and every block of digits appears equally often in the long run,
  which is not proven for π. But it has about 19,700 times as many repeated 12-square blocks as
  random digits, and billions of times as many 18-square ones, because consecutive numbers share
  most of their digits. (Like π and e, it is transcendental.) At 300 columns (which divides by 2, 3, 4, 5 and 6) the
  numbers line up into stripes, with a visible change where they grow from 3 to 4 to 5 digits.

**What this shows:** "every digit equally often" is weaker than "looks random". Long-run
frequencies don't guarantee that the first million digits look random, and the repeat test can tell
the difference. π, √2, e and φ give counts consistent with chance; the two structured numbers give
far more repeats than chance.

---

## 7. Beyond the flat mosaic: lines, 3D blocks, folding, counting runs, every distance, the Leibniz series and Archimedes' polygons

All choices below (layouts, directions, lengths, shapes, folds) were fixed before any results were
seen. Two strings of random digits were run alongside as controls. Methods: REPORT.md, section 9.

### 7.1 Straight lines of one digit (any direction, no wrapping)

Lines of L or more squares in a straight line, all the same digit. Directions: 4 in 2D, 13 in 3D,
40 in 4D. The 2D and 3D layouts use decimal places 0–999,999; the 4D one uses 0–923,520.

| Layout | Length | π | √2 | e | φ | Champernowne | 1/9801 | Random 1 | Random 2 | Chance |
|---|---|---|---|---|---|---|---|---|---|---|
| 2D 1,000 × 1,000 | 5+ | 351 | 353 | 367 | 379 | 21,885 | 0 | 346 | 360 | 357.9 |
| | 6+ | 47 | 43 | 46 | 24 | 2,961 | 0 | 32 | 31 | 35.7 |
| | 7+ | 4 | 3 | 5 | 1 | 2,923 | 0 | 7 | 4 | 3.57 |
| | 8+ | 0 | 0 | 1 | 1 | 2,899 | 0 | 4 | 0 | 0.36 |
| 3D 100 × 100 × 100 | 5+ | 1,096 | 1,089 | 1,038 | 1,132 | 140,081 | 73,846 | 1,055 | 1,107 | 1,077.9 |
| | 6+ | 109 | 125 | 114 | 99 | 38,796 | 71,640 | 90 | 97 | 105.5 |
| | 7+ | 12 | 12 | 13 | 10 | 24,912 | 69,466 | 7 | 13 | 10.3 |
| | 8+ | 1 | 3 | 2 | 1 | 21,646 | 67,320 | 1 | 3 | 1.01 |
| 4D 31 × 31 × 31 × 31 | 5+ | 2,247 | 2,407 | 2,392 | 2,280 | 201,014 | 47,986 | 2,237 | 2,292 | 2,331.2 |
| | 6+ | 209 | 215 | 218 | 184 | 160,192 | 42,464 | 218 | 221 | 211.6 |
| | 7+ | 21 | 14 | 24 | 23 | 130,099 | 37,231 | 19 | 22 | 19.2 |
| | 8+ | 1 | 1 | 3 | 6 | 113,739 | 32,292 | 2 | 1 | 1.73 |

- **Longest lines:** 7 or 8 for π, √2, e and φ in every layout. For Champernowne, 488 squares in 2D
  (a column through numbers that share their leading digits), 100 in 3D and 31 in 4D (the full width
  of the box). For 1/9801, 100 in 3D.
- **The chance column was checked** against 100 further random strings in 2D. Their averages were
  356.4, 35.3, 3.38 and 0.26, against 357.9, 35.7, 3.57 and 0.36.
- **Random string 1's four lines of 8+ in 2D** are real (checked square by square). That's about a
  1-in-1,500 result; none of the 100 check strings had more than two. Truly random digits produce
  striking results too.
- **Unusual counts for the four constants** (less than 5% chance in one direction): π 2D 6+ (47,
  4.0%), φ 2D 6+ (24, 2.5% low), √2 3D 6+ (125, 3.5%), π 4D 5+ (2,247, 4.1% low), φ 4D 6+ (184, 2.9%
  low), φ 4D 8+ (6, 0.9%). That's 6 of 48 counts, against about 5 expected by chance.
- **Follow-up:** φ's 4D count in fresh digits (decimal places 1,000,001–1,923,521) was 2,274 / 206 /
  19 / **2** for 5+ / 6+ / 7+ / 8+. Not reproduced.
- **1/9801 has no lines at all in 2D** at 1,000 columns, but tens of thousands in 3D: whether its
  198-digit cycle lines up depends on the box, not just on the number having structure.

By **van der Waerden's theorem**, any colouring of the whole numbers with finitely many colours
contains arbitrarily long evenly spaced runs of one colour. So lines of one digit must exist in every
number if enough directions are allowed; only their *number* compared with chance is informative.

### 7.2 Repeated 3D blocks

Digits fill W × W layers stacked into a box, for every W from 10 to 150 (141 layouts). Counts are of
different blocks that appear twice or more, all orientations of each shape included.

| Block | π | √2 | e | φ | Champernowne | 1/9801 | Random 1 | Random 2 | Chance |
|---|---|---|---|---|---|---|---|---|---|
| 2×2×3 (12 cubes) | 180 | 198 | 192 | 162 | 9,892,652 | 82,853 | 195 | 175 | 185.3 |
| 2×2×4 (16 cubes) | 0 | 0 | 0 | 0 | 5,955,665 | 82,903 | 0 | 0 | 0.018 |
| 2×3×3 (18 cubes) | 0 | 0 | 0 | 0 | 3,220,478 | 83,215 | 0 | 0 | 0.0002 |

The furthest from chance among the four constants is φ's 162 (4.5% chance of 162 or fewer).

### 7.3 Folding

The 1,000 × 1,000 layout folded four ways. A square "matches" when it has the same digit as the square
it lands on (squares on a diagonal fold line, which land on themselves, are left out). For random
digits every pair matches with probability exactly 1/10, independently.

| Fold | Measure | π | √2 | e | φ | Champernowne | 1/9801 | Random 1 | Random 2 | Chance |
|---|---|---|---|---|---|---|---|---|---|---|
| Left onto right | match | 10.01% | 10.00% | 10.07% | 9.99% | 10.79% | 10.00% | 10.03% | 9.95% | 10% |
| | all-matching 2×2 | 50 | 61 | 47 | 49 | 3,313 | 0 | 54 | 59 | 49.9 |
| | runs of 5+ matches | 6 | 3 | 6 | 10 | 2,059 | 0 | 14 | 7 | 8.9 |
| Top onto bottom | match | 9.99% | 9.98% | 10.06% | 10.04% | 9.87% | 9.98% | 10.03% | 10.02% | 10% |
| | all-matching 2×2 | 56 | 40 | 48 | 54 | 67 | 0 | 65 | 44 | 49.9 |
| | runs of 5+ matches | 4 | 15 | 8 | 10 | 41 | 2,005 | 11 | 7 | 8.9 |
| Main diagonal | match | 10.01% | 9.96% | 9.98% | 9.95% | 12.60% | 4.96% | 10.01% | 9.98% | 10% |
| | all-matching 2×2 | 53 | 59 | 44 | 50 | 410 | 0 | 49 | 42 | 49.8 |
| | runs of 5+ matches | 2 | 11 | 8 | 8 | 6 | 0 | 4 | 5 | 8.9 |
| Other diagonal | match | 10.00% | 10.04% | 10.02% | 9.98% | 10.08% | 5.97% | 10.04% | 9.94% | 10% |
| | all-matching 2×2 | 59 | 50 | 41 | 50 | 172 | 0 | 53 | 51 | 49.8 |
| | runs of 5+ matches | 8 | 7 | 11 | 7 | 5 | 0 | 11 | 11 | 8.9 |

- The chance figures were checked against 100 random strings (averages 49.4–50.4 for 2×2 groups and
  8.8–9.2 for runs).
- Unusual counts for the four constants: √2 left onto right, 3 runs (2.2% low); √2 top onto bottom,
  15 runs (4.0% high); π main diagonal, 2 runs (0.7% low; 2 of 400 random fold maps were this low).
  That's 3 of the 32 scored counts (2×2 groups and runs), against about 3 expected.
- 1/9801 shows its structure as a *shortage*: no all-matching groups at all, and only about 5% matching
  along the diagonals.

### 7.4 Folding at every width and height: same and complementary digits

Two digits are **complementary** when they add up to 9 (0–9, 1–8, 2–7, 3–6, 4–5); on the mosaic their
shades add up to full purple. For random digits a pair is complementary exactly 1 time in 10, the same
as for matching. Every grid below uses the first million decimal places:

- **Left onto right** at every width W from 2 to 2,000 (⌊1,000,000 / W⌋ full rows): 1,999 grids.
- **Top onto bottom** at every height H from 2 to 2,000 (⌊1,000,000 / H⌋ columns): 1,999 grids.

Each grid's share of complementary (and of matching) pairs is scored by how many standard deviations
it is from 10%. Because 1,999 grids give many chances for one to look extreme, the same search was run
on 20 strings of random digits to see how extreme the most extreme grid normally is.

| | Complementary, all grids | Most extreme complementary grid (standard deviations) | Most extreme matching grid |
|---|---|---|---|
| π | 9.999% (left–right), 10.001% (top–bottom) | width 1,838: 3.83; height 447: 3.54 | width 422: 3.48; height 73: 3.67 |
| √2 | 9.997%, 10.000% | width 483: 3.57; height 1,139: 3.71 | width 1,150: 3.75; height 378: 2.95 |
| e | 9.998%, 9.997% | width 1,870: 3.57; height 883: 3.50 | width 914: 4.07; height 1,214: 3.13 |
| φ | 9.998%, 10.002% | width 1,677: 3.35; height 1,523: 3.46 | width 1,258: 3.64; height 1,475: 3.57 |
| 20 random strings | | typical 3.5–3.6, highest 4.90 | typical 3.5–3.8, highest 4.69 |

- **No width or height stands out** for π, √2, e or φ. Every most-extreme grid is within the range of the
  random searches (e.g. e's 4.07 at width 914 was reached by 5 of the 20 random searches). The number of
  grids beyond 3 standard deviations (0–12 per search) is also in the random range (0–11), the closest
  call being φ's same-digit count folded top onto bottom (12).
- **1/9801 has no complementary pairs at all** when folded left onto right at exactly 10 widths: 99, 297,
  495, 693, 891, 1,089, 1,287, 1,485, 1,683 and 1,881, the odd multiples of 99 (half its 198-digit cycle).
  Folded top onto bottom at 202 rows (4,950 = 25 × 198 columns) every pair is the same digit.
- **Champernowne's constant** is off 10% at almost every width and height: same-digit pairs average
  17.9% left onto right, complementary pairs 11.5% top onto bottom.

In the mosaic, the **Pairs** menu shows same-digit pairs (purple), complementary pairs (teal) or both
when folded, and the menu shows both rates. Script: `analysis/scripts/folds/fold_widths.py`; results:
`analysis/results/folds/fold_widths.json`.

### 7.5 Counting runs: digits that count up or down

A **counting run** is a stretch of digits where each is exactly one more (123456) or one less (987654)
than the one before, with no wrapping from 9 to 0. Runs were counted along the digits (1D) and as straight
lines in the same 2D, 3D and 4D boxes as section 7.1, rising and falling, using the first million decimals.
All choices were fixed before the results were seen.

| Layout | Length | π | √2 | e | φ | Champernowne | 1/9801 | Chance | 20 random strings (average) |
|---|---|---|---|---|---|---|---|---|---|
| Along the digits | 5+ | 108 | 91 | 126 | 111 | 103 | 0 | 110.0 | 111.1 |
| | 6+ | 10 | 7 | 11 | 13 | 5 | 0 | 9.2 | 9.1 |
| | 7+ | 1 | 0 | 0 | 1 | 1 | 0 | 0.74 | 1.05 |
| | 8+ | 1 | 0 | 0 | 0 | 1 | 0 | 0.056 | 0 |
| 2D 1,000 × 1,000 | 5+ | 437 | 429 | 488 | 423 | 262 | 0 | 437.4 | 441.1 |
| | 6+ | 40 | 35 | 42 | 36 | 9 | 0 | 36.5 | 36.2 |
| | 7+ | 3 | 4 | 2 | 2 | 1 | 0 | 2.93 | 4.00 |
| 3D 100 × 100 × 100 | 5+ | 1,325 | 1,298 | 1,283 | 1,304 | 736 | 51,178 | 1,316.9 | 1,313.5 |
| | 6+ | 112 | 115 | 115 | 117 | 16 | 49,208 | 107.8 | 108.6 |
| | 7+ | 7 | 11 | 5 | 12 | 1 | 47,272 | 8.48 | 9.45 |
| 4D 31⁴ | 5+ | 2,820 | 2,804 | 2,909 | 2,900 | 21,796 | 67,538 | 2,844.0 | 2,855.6 |
| | 6+ | 213 | 214 | 225 | 213 | 5,344 | 53,229 | 215.8 | 222.0 |
| | 7+ | 9 | 13 | 16 | 14 | 3,809 | 36,995 | 15.7 | 16.0 |
| | 8+ | 0 | 0 | 3 | 2 | 2,673 | 32,065 | 1.07 | 1.15 |

- **Chance** for a run of L or more: the first digit must leave room to count (a rising run of 7 starts at
  0 to 3), each later digit must be one more (or less) than the last, and the digit before must not
  continue the count. The formula (REPORT.md, section 9.7) matched the averages of 200 further random
  strings at every length.
- **π, √2, e and φ are consistent with chance.** Of 80 counts, 4 had less than a 5% chance in one
  direction (about 8 expected): √2 along the digits 5+ (91, low), e in 2D 4+ (5,281) and 5+ (488, high),
  and π in 4D 7+ (9, low). e's 2D excess was **not reproduced** in its decimal places 1,000,001–2,000,000
  (5,061 and 455, against 5,098 and 437 expected).
- **π's longest counting run along the digits** is `23456789`, eight digits, starting at decimal place
  995,998. A run of 8 or more turns up in about 1 in 18 stretches of a million random digits.
- **1/9801 has no counting runs at all along its digits or in 2D**: along its digits (00 01 02 …) no
  count lasts more than two digits. Yet it has tens of thousands in 3D and 4D. **Champernowne's
  constant** is close to chance along its digits, has *fewer* than chance in 2D and 3D, and far more in 4D.

In the mosaic, **green frames** mark counting runs of 5 or more along the digits; in the 3D cube, the
**Lines of** menu adds green lines through counting digits. Section 7.8 repeats this with rollover (9 then 0). Scripts: `analysis/scripts/counting/`;
results: `analysis/results/counting/counting_runs.json`.

### 7.6 Does every digit appear equally often?

For each number, each digit's share of the decimals, checked with the **chi-squared test**: it adds up how
far the ten counts are from a tenth each, and p is how often random digits would be at least that uneven
(9 degrees of freedom). p below 0.05 means "more uneven than 95% of random strings".

| Stretch of decimals | π | √2 | e | φ | Champernowne | 1/9801 |
|---|---|---|---|---|---|---|
| First 1,000 | p 0.86 | p 0.50 | p 0.85 | p 0.35 | p < 0.001 | p 1.00 |
| First 10,000 | p 0.41 | p 0.70 | p 0.47 | p 0.12 | p < 0.001 | p 0.81 |
| First 100,000 | p 0.91 | p 0.85 | p 0.039 | p 1.00 | p < 0.001 | p < 0.001 |
| First 1,000,000 | p 0.79 | p 0.054 | p 0.39 | p 0.82 | p < 0.001 | p < 0.001 |
| Each digit, first million | 9.95–10.04% | 9.89–10.04% | 9.94–10.05% | 9.95–10.03% | 8.35–17.98% | 9.60–10.10% |
| 100 blocks of 10,000: how many below p 0.05 | 4 | 3 | 2 | 3 | 100 | 0 |

- For 20 random strings, between 1 and 7 of the 100 blocks were below 0.05 (about 5 expected), and their
  million-digit p values ranged from 0.07 to 0.94.
- **π, √2, e and φ: every digit appears about equally often.** The two borderline results were not
  repeated: e's first 100,000 (p 0.039) evened out by the first million (p 0.39), and √2's first million
  (p 0.054) was followed by an ordinary second million (p 0.17).
- **Champernowne's constant: far too many 1s** (18% of the first million), because the numbers 100,000 to
  185,185 that fill much of it all start with 1.
- **1/9801: too even.** Over a million digits 8 and 9 are slightly rare (9.6%) because its cycle skips 98,
  but every block of 10,000 digits is *more* even than random digits practically ever are: the least even
  block still has p 0.81 (for random digits, all 100 blocks that even would happen about once in 10⁷²). Random digits always wobble; a perfectly regular cycle doesn't.

In the 3D cube, the **digit chart** (bottom left) counts each digit in the current cube and runs the same
test, and **Show digits** picks any range, e.g. 3 to 3 for only the 3s. Script:
`analysis/scripts/frequencies/digit_counts.py`; results: `analysis/results/frequencies/digit_counts.json`.

### 7.7 Every distance at once

Every arrangement we tried, whether rows, columns, cube layers, diagonals, folds or a sphere, ends up
comparing digits a fixed number of places apart. So this test skips the shapes and looks at **every gap from 1 to
100,000 places** directly (chosen in advance), in the first million decimals. For each gap it measures
how often the two digits are:

- **the same** (7 … 7)
- **add up to 9** (2 … 7)
- **one more**, with 9 followed by 0 (4 … 5, 9 … 0)
- **one less**, with 0 followed by 9 (5 … 4, 0 … 9)

For random digits each happens exactly 1 time in 10 at every gap. A gap's **z** says how far its count is
from a tenth, in standard deviations. With 400,000 gap-and-relation pairs per number, a few z values beyond
±4 are expected by chance (about 6.3 per relation, 25.3 in all).

| | π | √2 | e | φ | 20 random strings |
|---|---|---|---|---|---|
| Biggest difference (z) | +4.66, "add up to 9" at gap 20,502 | −4.64, "one more" at gap 38,557 | +4.82, "same" at gap 79,307 | +4.96, "same" at gap 75,916 | 4.45 to 5.61 |
| Share at that gap | 10.14% | 9.86% | 10.15% | 10.16% | |
| Chance of a difference that big somewhere among 400,000 | 72% | 74% | 44% | 24% | 1% to 97% |
| Gaps with z beyond ±4 (about 25 expected) | 28 | 31 | 19 | 25 | 13 to 33 |
| Average z², per relation (1 expected) | 0.992–1.007 | 0.990–1.008 | 0.998–1.002 | 0.998–1.003 | 0.989–1.009 |

- **π, √2, e and φ: nothing stands out at any distance.** Their biggest differences, their number of z
  values beyond ±4, and the spread of all 100,000 z values are all within the range of the random
  strings. Four of the 20 random strings had a bigger single difference (up to z = 5.61) than any of
  the four constants.
- **1/9801 and Champernowne's constant stand out at tens of thousands of gaps.** 1/9801 repeats every 198
  digits, so at gaps 198, 396, 594 … every pair is the same digit and none add up to 9. At gap 22 its
  two-digit numbers are 11 apart (say 34 and 45), so 89% of pairs count up by one. In
  Champernowne's constant, digits 60 places apart are the same 69% of the time: in the long stretch of
  six-digit numbers, a number and the one 10 later (60 digits on) share five of their six digits. At gap
  55,555 (11,111 five-digit numbers apart), 44% count up by one.

Because the dots on the sphere page and every grid we used compare digits at fixed gaps, this one test
covers all of them. Counts for all gaps come from fast Fourier transforms, and 936 gaps were recounted
directly to check them. Script: `analysis/scripts/distances/distances.py`; results:
`analysis/results/distances/distances.json`.

### 7.8 Counting runs with rollover

The same counting runs as section 7.5, but with **rollover**: 9 is followed by 0 going up (7890123) and
0 by 9 going down (2109876). Every digit can now start a run of any length, so for random digits a run
of L or more starts at a place with chance 10^−(L−1), times 9/10 if there's a digit before it (which must
not continue the count). The formula matched the averages of 200 further random strings at every length,
in 1D and 2D (e.g. 1.80 predicted and 1.86 ± 0.09 found for 7+ along the digits).

| Layout | Length | π | √2 | e | φ | Champernowne | 1/9801 | Chance | 20 random strings (average) |
|---|---|---|---|---|---|---|---|---|---|
| Along the digits | 5+ | 183 | 160 | 190 | 176 | 191 | 0 | 180.0 | 182.0 |
| | 6+ | 24 | 17 | 21 | 25 | 13 | 0 | 18.0 | 16.9 |
| | 7+ | 3 | 0 | 2 | 2 | 1 | 0 | 1.80 | 2.05 |
| | 8+ | 1 | 0 | 0 | 0 | 1 | 0 | 0.18 | 0.10 |
| 2D 1,000 × 1,000 | 5+ | 716 | 723 | 756 | 679 | 463 | 0 | 715.8 | 721.5 |
| | 6+ | 73 | 67 | 79 | 77 | 24 | 0 | 71.5 | 70.6 |
| | 7+ | 7 | 7 | 9 | 6 | 1 | 0 | 7.14 | 7.95 |
| | 8+ | 0 | 0 | 0 | 1 | 1 | 0 | 0.71 | 0.80 |
| 3D 100 × 100 × 100 | 5+ | 2,182 | 2,134 | 2,106 | 2,151 | 1,274 | 13,724 | 2,155.8 | 2,157.4 |
| | 6+ | 217 | 214 | 223 | 235 | 63 | 13,437 | 211.0 | 213.1 |
| | 7+ | 22 | 22 | 16 | 29 | 2 | 13,154 | 20.6 | 21.9 |
| | 8+ | 2 | 2 | 0 | 4 | 1 | 12,873 | 2.02 | 2.25 |
| 4D 31⁴ | 5+ | 4,614 | 4,621 | 4,700 | 4,707 | 31,804 | 48,185 | 4,662.4 | 4,696.1 |
| | 6+ | 418 | 437 | 433 | 406 | 6,018 | 42,817 | 423.2 | 433.6 |
| | 7+ | 27 | 30 | 41 | 32 | 4,958 | 24,917 | 38.3 | 39.2 |
| | 8+ | 1 | 2 | 6 | 4 | 4,181 | 23,557 | 3.46 | 3.20 |

- **π, √2, e and φ are consistent with chance.** Of 80 counts (lengths 4 to 8), 3 had less than a 5%
  chance in one direction (about 8 expected): π in 3D 4+ (21,688 against 22,022; one of the 20 random
  strings was lower still), π in 4D 7+ (27, low) and φ in 3D 7+ (29, high).
- **The longest rollover run** in the four constants is φ's `890123456`, nine digits along a diagonal of
  the 3D box, starting at decimal place 330,816. Random digits would give a run of 9 or more somewhere in
  the box about 18% of the time. Along the digits, the longest is still π's `23456789` (section 7.5).
- **The structured numbers still stand out.** Champernowne's constant looks as it did without rollover:
  close to chance along its digits (191 against 180 for 5+), fewer runs than chance in 2D and 3D (463
  against 716; 1,274 against 2,156) and far more in 4D. 1/9801 still has none along its digits or in 2D.
  In 3D it has *fewer* runs with rollover than without (13,724 against 51,178 for 5+), because runs such as
  0123456789 0123456789 now join into single long ones: its longest is 99 digits.

In the mosaic and the 3D cube, a **Counting** menu switches the green frames and lines between "stops at 9
and 0" and "rolls over". Script: `analysis/scripts/counting/rollover_runs.py` (it uses `counting_runs.py`
with `rollover=True`); results: `analysis/results/counting/rollover_runs.json`.

### 7.9 The 3D cube and sphere pages

`cube.html` (linked from the mosaic's menu) shows the digits as a cube you can rotate (drag) and zoom
(scroll). You choose the number, the cube's side (10 to 60), the decimal place to start from, which
digits to show, and the minimum length of gold lines. Gold lines mark every straight line of one digit
in the 13 directions, and the page shows how many there are next to the number random digits would give
(the same formula as section 7.1). Hovering over a cube shows its decimal place and digit. Its line
counts were checked against the Python analysis for eight cubes (all six numbers, sides 20 to 60,
starting points up to decimal place 400,000) and were identical.

When you look along the grid itself, dots that are simply neighbours line up into rows. These are an
effect of the viewing angle, not of the digits; only the gold lines are real lines of one digit.

`sphere.html` winds the digits onto a ball instead, along a **Fibonacci spiral**: the first digit at the
top, each later one a little lower and turned 137.5° (the golden angle) further round, which spreads the
dots evenly. You choose the number, how many dots (1,000 to 20,000), where to start and which digits to
show. On this ball, a dot's nearest neighbours are always a Fibonacci number of places away along the
digits: mostly 34 and 55 places before and after it with 2,000 dots, and 89, 144 and 233 with 20,000.
Hovering over a dot shows its digit and these distances. Section 7.7 tests every such distance, so the
sphere is a way of looking rather than a new test. Its visible spiral arms come from the layout and appear
for any digits.

### 7.10 The Leibniz series stopped early

The Leibniz series 1 − 1/3 + 1/5 − 1/7 + … adds up to exactly π/4, so on its own it gives nothing new: four
times it is π. The interesting numbers are the **partial sums**, stopped after a fixed number of terms T.
Section 7.10.1 compares them with π; section 7.10.2 tests one of them, 4 × the first 500,000 terms, in its
own right, like the other numbers; section 7.10.3 follows the repeating cycle that every stopped sum has.

#### 7.10.1 Compared with π

Borwein, Borwein and Dilcher (1989) showed that, with N = 2T,

  π − 4 × (first T terms) = 2/N − 2/N³ + 10/N⁵ − 122/N⁷ + 2770/N⁹ − … = Σ 2 E₂ₘ / N^(2m+1),

where 1, −1, 5, −61, 1385, … are the **Euler numbers**. When N is a power of 10, each term of this
shortfall is a whole number shifted a fixed distance further along, so the partial sum matches π
except in small clusters of digits spaced 2 × log₁₀ N apart:

```
4 × (first 500,000 terms) = 3.14159 0 65358979324 04 626433832 6 9502884197 291 …
π                         = 3.14159 2 65358979323 84 626433832 7 9502884197 169 …
```

| Terms | Spacing of the clusters | First decimal that differs | Last 5 decimals in a row matching π end at | Decimals 200–1,000 that differ |
|---|---|---|---|---|
| 50,000 | 10 | 5 | 49 | 91.5% |
| 500,000 | 12 | 6 | 71 | 90.4% |
| 5,000,000 | 14 | 7 | 96 | 88.9% |

- **The pattern dissolves.** The Euler numbers grow quickly (50521, 2702765, 199360981, …). Once one is
  longer than the spacing, neighbouring clusters merge, and after that the sum no longer tracks π: about
  9 decimals in 10 differ, as for any two unrelated strings of digits.
- **Closer approximations push the pattern much further.** Each tenfold increase in terms gives one more
  correct decimal, but widens the spacing of the clusters by 2, so more clusters fit before they merge:

  | Terms | Correct decimals | Pattern ends at (last 5 matching) | (last 6 matching) | Clusters merge (theory) |
  |---|---|---|---|---|
  | 5,000 | 3 | 25 | 25 | 60 |
  | 500,000 | 5 | 71 | 60 | 114 |
  | 5 × 10⁷ | 7 | 125 | 111 | 184 |
  | 5 × 10⁹ | 9 | 176 | 176 | 250 |
  | 5 × 10¹⁴ | 14 | 410 | 382 | 495 |
  | 5 × 10¹⁹ | 19 | 705 | 667 | 820 |
  | 5 × 10²⁴ | 24 | 1,031 | 1,031 | 1,175 |
  | 5 × 10²⁹ | 29 | 1,474 | 1,417 | 1,650 |

  The pattern reaches about 14 times further than the correct decimals at 500,000 terms, and about 50 times
  further at 5 × 10²⁹; its gain per tenfold step grows from about 20 decimals to about 100. In theory the
  clusters merge at the first Euler number whose double has as many digits as the spacing, which puts the
  reach at roughly (digits of N)² / log(digits of N). The measured end is always a little before that,
  because the matching gaps between clusters shrink below 5 digits just before they close; the two
  measures converge as the series gets longer. Beyond 5,000,000 terms the digits come from the
  Euler-number formula (adding 5 × 10²⁹ terms is impossible); up to there, both methods agree. All 30
  lengths from 5 to 5 × 10²⁹ terms are in `analysis/results/leibniz/lengths.json`.
- **The pattern needs a "round" number of terms, not just a fraction.** Every partial sum is a fraction,
  but the clean clusters appear only when N is a power of 10. Decimals 1 to 60 that differ from π:
  500,000 terms 10, 499,999 terms 17, 250,000 terms 23, 400,000 terms 40, 600,000 terms 51.
- **The digits of a partial sum do repeat, but never visibly.** As a fraction, 4 × (first 500,000 terms)
  must eventually repeat. But each of the 49,833 primes between 333,333 and 1,000,000 appears in exactly one
  term's denominator, so the length of the repeating cycle is a multiple of a number with 57,332 digits.
- **The way the pattern dissolves holds the limit.** The Euler numbers grow at a rate set by π:
  √(4 (2m+1)(2m+2) |E₂ₘ / E₂ₘ₊₂|) gives π to 4 decimals for m = 4, 8 for m = 9, 47 for m = 50 and 763
  for m = 800. And the shortfall can be added back: 4 × (first 50 terms) has 1 correct decimal, but adding
  79 terms of the formula gives 68; for 500 terms, 1 becomes 682. Both match the theoretical limit of about
  π N / 2 × log₁₀ e correct decimals, where the formula's terms stop shrinking. So the "wrong" digits carry
  almost all the information needed to recover π.

Each partial sum was computed two ways that agree on all 1,000 decimals: adding the terms directly, and
π minus the Euler-number formula. Scripts: `analysis/scripts/leibniz/leibniz.py` and `lengths.py`;
results: `analysis/results/leibniz/`.

#### 7.10.2 The 500,000-term number in its own right

Here the number 4 × (first 500,000 terms) = 3.14159065358979324046… is treated like π, √2, e and φ: its
first million decimals (computed two independent ways, which agree on every digit) went through every
test in this file, with the same scripts. Its decimal places 1,000,001–2,000,000 (also computed two ways)
were used to re-check anything unusual.

| Test | Leibniz number, first million | Chance (or random strings) | Chance of a result this extreme |
|---|---|---|---|
| Repeated blocks, widths 2–2,000 | 12 squares 3,989; 14: 25; 15: 4; 16: 1; 18: 0 | 3,904; 19.4; 1.95; 0.29; 0.004 | 12: within 1.4 sd; 14: 13%; 15: 13%; 16: 25% |
| Runs of six or more | 8; none of seven | about 9; 0.9 | ordinary |
| First run of six | `999999` at decimal place 136,524 | about 111,000 on average | 71% by then |
| Digit frequencies | p 0.20; 5 of 100 blocks below 5% | about 5 | one block p 0.0001 (see below) |
| Every distance 1–100,000 | biggest z 4.65; 25 beyond ±4 | 25.3 beyond ±4 | 73% for the biggest anywhere |
| Counting runs, 1D–4D (20 counts) | 1 below 5%: 133 of 5+ along the digits (110 expected) | 20 random strings: 86–137 | about 2 such counts expected |
| Counting runs with rollover (20 counts) | 1 below 5%: 51 of 7+ in 4D (38.3 expected) | | about 2 expected |
| Lines of one digit, 2D | 5+ 376; 8+ 1; longest 9 | 357.9; 0.36; 9+: 0.036 | longest 9: 3.5% |
| Lines of one digit, 3D | 5+ 1,129; 8+ 3 | 1,077.9; 1.01 | 8+: 8% |
| Lines of one digit, 4D | 7+ 29; 8+ 6 | 19.2; 1.73 | 7+: 2.2%; 8+: 0.9% |
| Repeated 3D blocks | 2×2×2: 196; 3×3×3: 0 | 185.3; 0.018 | ordinary |
| Folding (four ways) | match 9.97–10.08% | 10% | ordinary |
| Folding at every width and height | most extreme \|z\| 3.45–3.88 | random strings' highest: 4.28–4.90 | ordinary |

**Re-checked in decimal places 1,000,001–2,000,000:**

| Looked unusual in the first million | Second million |
|---|---|
| 6 lines of 8+ in 4D (1.73 expected, 0.9%) and 29 of 7+ (19.2) | 3 and 18: not reproduced |
| A line of 9 in 2D (3.5%) | longest 8: not reproduced |
| "Add up to 9" pairs over all gaps: average z² 1.0105, 2.4 standard deviations high | 1.0021: not reproduced |
| One block of 10,000 decimals (490,001–500,000) with p 0.0001: too few 8s (885 instead of about 1,000) | no block below 1%; whole million p 0.32 |
| Two runs of six starting 9 places apart | closest pair 2,098 places apart |

- **The Leibniz number is consistent with random digits on every test.** Taken on its own, nothing in its
  digits shows the Euler-number pattern of section 7.10.1, which only appears when it is compared with π.
  Beyond its first 70 or so digits it is π minus an error with no visible structure, so this is what
  should be expected.
- **Its rarest single feature is a close pair of runs:** `999999` at decimal place 136,524 and `666666` at
  136,533, so `999999081666666`. Two runs of six starting within 9 places happened in 3 of 20,000 strings of a
  million random digits (about 1 in 7,000); π's closest pair is 710 places apart. It was found by looking
  through the list of runs, not tested for in advance, and with so many things one could notice, a rare
  one-off is to be expected; it is the Leibniz number's equivalent of π's Feynman point.
- **The fresh digits produced their own one-off:** ten 4s in a straight line through the 4D box, starting at
  decimal place 1,640,652 and 930 places apart (random digits give a line of 10 or more in this box about
  1.4% of the time). It turned up while re-checking the 4D count of lines of 8, whose excess itself was
  not repeated.
- **Fresh digits are the deciding test.** About 100 counts were examined for this number, and four
  results were near or beyond the 1% level (the 4D lines of 8, the "add up to 9" average, the uneven block
  and the close runs), slightly more than the one or two expected by chance. But none of the ones that could
  be re-checked came back in the next million digits, which is what chance, and not structure, would
  produce.

The mosaic view "Leibniz series (500,000 terms), 60 columns" shows decimal places 136,500 to 221,639, with
the close pair of runs (gold) and a 7×2 block that repeats 52,668 places later (cyan). The number is also
in the 3D cube and the sphere. Scripts: `analysis/scripts/leibniz/` (`digits_1m.py`, `scan.py`,
`close_runs.py`, `second_million.py`, `lines_followup.py`) and the shared test scripts, which now include
it; results: `analysis/results/leibniz/` and the shared results files.

#### 7.10.3 The repeating cycle, pushed away as the series grows

Every stopped sum is a fraction, and the decimals of a fraction always end up repeating in a cycle. For a
short series the cycle is short and easy to see; each new term can bring a new prime into the denominator,
and the cycle jumps in length:

| Terms | 4 × sum | Cycle length (digits) | Rows of 144 |
|---|---|---|---|
| 2 | 2.666… (8/3) | 1 | |
| 4 | 2.8952380 952380 … (304/105) | 6 | |
| 9 | 3.2523659… | 48 | |
| 10 | 3.0418396… | 144 | 1 |
| 12 | 3.0584027… | 1,584 | 11 |
| 15 | 3.2081856… | 11,088 | 77 |
| 16 | 3.0791533… | 55,440 | 385 |
| 24 | 3.0999440… | 1,275,120 | 8,855 |
| 27 | 3.1786170… | 16,576,560 | 115,115 |
| 30 | 3.1082685… | 480,720,240 | 3,338,335 |
| 500,000 | 3.14159065… | at least 10^57,331 | |

The cycle starts after the first decimal (after the second from 13 terms on). The more terms, the closer
the sum gets to π, and the further away the repetition is pushed; π itself is irrational and never
repeats, so in the limit the cycle is pushed away forever. The cycle length stays the same for several
terms in a row when the new term's denominator brings no new prime power (17 to 23 terms all repeat every
55,440 digits).

Cycle lengths were found two independent ways: from the denominator (the order of 10 modulo its part
coprime to 10) and by long division, stopping when a remainder repeats. They agree for every length from 1
to 29 terms; for 30 terms only the first was used. The mosaic has six views, 144 squares wide, for 4, 10,
12, 15, 16 and 24 terms: with 4 and 10 terms every row is the same (stripes), with 12, 15 and 16 terms the
rows repeat every 11, 77 and 385 rows (cyan frames on the first two copies), and with 24 terms the cycle
is longer than the view. The same six stopped sums can also be chosen in the 3D cube and the sphere; with 4
terms, for example, a cube of side 30 holds 4,860 gold lines of five or more (about 24 for random digits),
because its 6-digit cycle lines up in every direction, and its digit chart shows only the six digits of
the cycle (0, 2, 3, 5, 8, 9). Script: `analysis/scripts/leibniz/cycles.py`; results:
`analysis/results/leibniz/cycles.json`.

### 7.11 Archimedes' polygons

A colleague suggested looking at π the way Archimedes did: through the areas of regular polygons drawn
inside a circle of radius 1. A polygon with n sides has area (n/2) sin(2π/n), always a little less than the
circle's area, π. Starting from the hexagon and doubling the number of sides, as Archimedes did, every area
comes from square roots of whole numbers, with no π needed. (Archimedes used the perimeters, but the
numbers are the same, one doubling apart: the area of the 2n-gon equals half the perimeter of the n-gon.)
The areas were computed two independent ways (REPORT.md, section 9.13).

| Row | Sides | Area | Decimals shared with π |
|---|---|---|---|
| 1 | 6 | 2.5980762113… (3√3/2) | 0 |
| 2 | 12 | 3 exactly | 0 |
| 3 | 24 | 3.1058285412… | 1 |
| 5 | 96 (Archimedes) | 3.1393502030… | 1 |
| 6 | 192 | 3.1410319508… | 3 |
| 11 | 6,144 | 3.1415921059… | 6 |
| 21 | 6,291,456 | 3.1415926535892… | 12 |
| 31 | about 6.4 × 10⁹ | | 17 |
| 41 | about 6.6 × 10¹² | | 23 |
| 61 | about 6.9 × 10¹⁸ | | 35 |
| 80 | about 3.6 × 10²⁴ | | 47 |

Each doubling cuts the gap to π by about 4, so the areas gain about 0.6 decimals of π per doubling: a much
steadier approach than the Leibniz series, whose gap shrinks only in proportion to the number of terms.

**No repeating pattern to push away.** The Leibniz series stopped early is always a fraction, so its
digits repeat (section 7.10.3). The polygons are different: only the square (area 2) and the 12-gon (area
3) have whole-number areas, and no polygon has any other fraction as its area (Niven's theorem: the only
fractions that the sine of a fraction of π can equal are 0, ½ and 1, and their negatives). Every other area in the sequence is
irrational, so its digits never repeat in a cycle. The digits do not dissolve a pattern as they approach
π; instead, π's digits grow in from the left, about 0.6 digits per doubling, and beyond them each
polygon's digits are new.

**The 96-gon in its own right.** Archimedes' polygon, area 3.13935020304686720713…, was treated like π,
√2, e, φ and the Leibniz number: its first million decimals (computed two independent ways, which agree
on every digit) went through every test in this file with the same scripts, and its decimal places
1,000,001–2,000,000 (also computed two ways) were used to re-check anything unusual.

| Test | 96-gon, first million | Chance (or random strings) | Chance of a result this extreme |
|---|---|---|---|
| Repeated blocks, widths 2–2,000 | 12 squares 3,999; 14: **38**; 15: 1; 16: 0; 18: 0 | 3,904; 19.4; 1.95; 0.29; 0.004 | 12: within 1.5 sd; 14: **0.012%** (about 1 in 8,000); 24 random strings gave 12–28 |
| Runs of six or more | 12; one of seven (`8888888` at decimal place 334,693) | about 9; 0.9 | 20% for 12 or more |
| Digit frequencies | p 0.37; 5 of 100 blocks below 5% | about 5 | ordinary |
| Every distance 1–100,000 | biggest z 4.67; 28 beyond ±4 | 25.3 beyond ±4 | ordinary |
| Counting runs, 1D–4D (20 counts) | 1 below 5%: **80** of 5+ along the digits (110 expected, 0.17%) | 20 random strings: 86–137 | about 2 such counts expected |
| Counting runs with rollover (20 counts) | 1 below 5%: 151 of 5+ along the digits (180 expected, 1.5%) | | about 2 expected |
| Lines of one digit, 2D | 5+ 370; 7+ 7; longest 7 | 357.9; 3.57 | 7+: 7% |
| Lines of one digit, 3D | 6+ **133**; 8+ 1 | 105.5; 1.01 | 6+: 0.55% |
| Lines of one digit, 4D | 6+ 190; 8+ 0 | 211.6; 1.73 | 6+: 7% (few); 8+: 18% |
| Repeated 3D blocks | 2×2×2: 181; 3×3×3: 0 | 185.3; 0.018 | ordinary |
| Folding (four ways) | match 9.92–10.05% | 10% | ordinary |
| Folding at every width and height | most extreme \|z\| 3.39–3.99 | random strings' highest: 4.28–4.90 | ordinary |

**Re-checked in decimal places 1,000,001–2,000,000:**

| Looked unusual in the first million | Second million |
|---|---|
| 38 repeated blocks of 14 squares (19.4 expected, 0.012%) | **15**: not reproduced |
| 80 counting runs of 5+ along the digits (110 expected, 0.17%) | 130: not reproduced |
| 151 counting runs of 5+ with rollover (180 expected, 1.5%; the same digits as the line above) | 200: not reproduced |
| 133 lines of 6+ in the 3D cube (105.5 expected, 0.55%) | 98: not reproduced |

- **The 96-gon is consistent with random digits.** Its most unusual count was 38 repeated 14-square
  blocks in the first million, about twice the 19.4 expected and above all 24 random strings. Three of the
  38 are the same coincidence counted at two neighbouring widths (1,358 and 1,359, 1,452 and 1,453, 1,464 and
  1,465), which happens when the two copies match over 15 digits (7 on one row and 8 on the next); random
  digits produce these too, and every number is counted the same way. In the next million digits the count was 15, an ordinary number, and the other three unusual
  counts also went back to ordinary.
- **More unusual counts than usual, but none that lasts.** About 100 counts were examined for this number,
  and four were below 2% (one of them, the rollover count, uses the same digits as another), slightly more
  than the one or two chance would give. As with √2, φ and the Leibniz number, fresh digits are the
  deciding test, and none of them came back.

The mosaic view "Polygon with 96 sides" shows its first 28,800 digits, 144 to a row.

The mosaic has a *Polygon ladder* view: one row per polygon from 6 to 6 × 2⁷⁹ sides, 100 digits each,
with π as the bottom row. The settled digits form a staircase of vertical stripes on the left, and the
12-gon's row is blank (all zeros). There are also views of single polygons (6, 12, 96, 6,144 and 6,291,456
sides, 144 to a row), and the same five can be chosen in the cube and the sphere. A separate page,
`polygons.html`, draws the polygons themselves inside the circle, with Archimedes' outside polygon (area
n tan(180°/n), just over π) and a close-up of the gap, stretched upward when it gets too thin to see. Scripts:
`analysis/scripts/polygons/`; results: `analysis/results/polygons/`.

### 7.12 Summary

Digit frequencies, lines in 2D, 3D and 4D, counting runs with and without rollover, digits at every
distance up to 100,000 places, repeated 3D blocks and folding all give the same answer as the flat mosaic:
π, √2, e, φ, the Leibniz number (500,000 terms) and the area of Archimedes' 96-gon are consistent with random digits on these tests, while Champernowne's constant and
1/9801 stand out by factors of hundreds to millions (or, for 1/9801, by having far *fewer* matches
than chance in some arrangements).

---

## 8. What surprised us

The overall result was expected: mathematicians expect π, √2, e and φ to behave like random digits, and
on our tests they did. What surprised us was in the details.

1. **Champernowne's constant.** It is proven that every digit and every block of digits appears equally
   often in it in the long run, which nobody has managed to prove for π. Yet it failed every one of our
   tests, with about 19,700 times as many repeated 12-square blocks as random digits and about 10 billion
   times as many 18-square blocks (sections 4.1 and 6). "Every digit equally often" and "looks random" are
   known to be different properties, but the size of the gap, and how visible it is in the mosaic, were
   unexpected. It is the most instructive result of the project.

2. **1/9801 often shows its pattern through absence.** A repeating number might be expected to produce
   *more* of everything. Instead 1/9801 has no lines of one digit at all in the 1,000 × 1,000 layout,
   fewer matches than chance on the diagonal folds (about 5% instead of 10%), and no complementary pairs
   at all when folded at 99, 297, 495 or any other odd multiple of 99 columns (sections 7.1, 7.3 and 7.4).
   A pattern can show up as something that never happens.

3. **A random control nearly looked like a discovery.** One of the strings of genuinely random digits
   produced four lines of eight identical digits in the 2D layout, a result random digits give only about
   1 time in 1,500. Our first assumption was a bug; a square-by-square recount and 100 further random
   strings confirmed it was real (section 7.1). Truly random digits sometimes look more "patterned" than π,
   which is why every striking result had to be compared with chance.

4. **How convincing the false alarms looked.** √2's and φ's low counts of 14-square repeats (10 each
   against about 19), φ's six 15-square repeats (against about 2) and φ's six 4D lines of eight (against
   about 1.7) each looked significant on their own. None came back in the next million digits: 18, 16, 0
   and 2 (sections 4.3 and 7.1).
   Without the re-check, at least one would have been reported as a discovery.

5. **The Feynman point holds up.** π's famous six 9s by the 762nd decimal place passed every check:
   random digits put a run of six that early only about 1 time in 150 (section 5). It is a coincidence
   rather than a pattern, but a genuinely rare one, and its fame is deserved.

6. **Errors in our own first version.** An external review caught a boundary error in the chance
   formula, wrong arithmetic about how often unusual results appear when many things are tested, a
   probability that described the wrong event (26% instead of 9.3% for φ's 4×4 repeat), and wording that
   claimed more than the data showed. None changed the conclusions, but each had been stated with more
   confidence than it deserved (see the revision notes). It is a strong argument for independent
   checking.

7. **The Leibniz series' mistakes are where π hides.** Stopped after 500,000 terms, the series gets π
   wrong at the 6th decimal, but the wrong digits are the Euler numbers in neat columns, and they hold
   enough information to rebuild π far beyond the sum's own accuracy (section 7.10.1). Yet taken on its
   own, the same number's digits pass every test for randomness (section 7.10.2): the pattern is only in
   how it differs from π.

8. **The biggest false alarm came from Archimedes.** The 96-gon's area gave 38 repeated 14-square blocks
   in its first million decimals, about twice the 19.4 expected and more than any of 24 random strings:
   a 1-in-8,000 result. Its next million gave 15 (section 7.11). And among all the polygons, one has a
   perfectly plain area: the 12-gon's is exactly 3, so every digit after the 3 is 0.

**The lesson:** the patterns people see in π are real visual effects, but not real structure. To tell the
difference, ask how often random digits would produce the same thing, and then check again with fresh
digits.

---

## 9. Still to do

- Ideas not yet tried: 22/7 (π's school approximation, repeats every 6 digits), Liouville's constant
  (almost all zeros), Euler–Mascheroni γ (not even known to be irrational), ∛2.

---

## 10. Files

- `index.html`, `pi.js`, `piStyle.css`: the flat mosaic and its view settings.
- `cube.html`, `cube.js`: the rotatable 3D cube (section 7.9).
- `sphere.html`, `sphere.js`: the digits on a rotatable sphere (section 7.9).
- `polygons.html`, `polygons.js`: Archimedes' polygons drawn, with their areas (section 7.11).
- `digits.js`: the formulas all four pages use to compute every number's digits in the browser.
- `about.js`: the plain-English "About" panel on all four pages; its text is written in `pi.js` (one
  paragraph per view, plus the folds), `cube.js`, `sphere.js` and `polygons.js` (built from the current settings).
- `analysis/digits/`: the verified first million decimals of each number (square 0 = whole-number
  part), plus the second million (decimal places 1,000,001–2,000,000) of √2, of the Leibniz number and of
  the 96-gon's area.
- `analysis/results/*_repeats_14plus.json`: every repeat of 14 or more squares found at widths
  2–2,000. Format: `{"3x5": [[columns, [decimal place of copy 1, decimal place of copy 2]], …]}`.
- `analysis/scripts/`: the Python scripts used. Those in `analysis/scripts/3d/` run from the project
  folder as they are; the older ones were run from `/tmp/<folder>/`, so their file paths need adjusting.
- `analysis/results/3d/`: results of the line, 3D block and fold tests (JSON).
- `analysis/scripts/folds/`, `analysis/results/folds/`: folding at every width and height, same and
  complementary digits (section 7.4).
- `analysis/scripts/counting/`, `analysis/results/counting/`: counting runs in 1D to 4D, without
  rollover (section 7.5) and with it (section 7.8).
- `analysis/scripts/distances/`, `analysis/results/distances/`: digits at every distance from 1 to
  100,000 places (section 7.7).
- `analysis/scripts/leibniz/`, `analysis/results/leibniz/`: the Leibniz series stopped early (section 7.10).
- `analysis/scripts/polygons/`, `analysis/results/polygons/`: Archimedes' polygons (section 7.11).
- `analysis/scripts/frequencies/`, `analysis/results/frequencies/`: how often each digit appears (section 7.6).

---

## Appendix: every repeat of 14 or more squares (widths 2–2,000, first million decimals)

Each row was re-checked against `analysis/digits/` when this table was generated.
Adjacent widths (e.g. π at 342 and 343) can catch the same pair of places when the rows happen to
match for one extra digit.

| Number | Columns | Block | Squares | Digits (top row to bottom row) | Decimal places of the two copies | Gap |
|---|---|---|---|---|---|---|
| π | 157 | 3×5 | 15 | `26857 / 98272 / 74389` | 117,089, 179,171 | 62,082 |
| π | 1,357 | 3×5 | 15 | `05305 / 72212 / 15653` | 179,302, 386,162 | 206,860 |
| π | 129 | 7×2 | 14 | `11 / 26 / 22 / 56 / 32 / 33 / 99` | 229,706, 322,490 | 92,784 |
| π | 342 | 2×7 | 14 | `9274983 / 2653755` | 101,050, 731,169 | 630,119 |
| π | 343 | 2×7 | 14 | `9274983 / 6537550` | 101,050, 731,169 | 630,119 |
| π | 384 | 2×7 | 14 | `1642605 / 6449463` | 707,053, 992,148 | 285,095 |
| π | 560 | 2×7 | 14 | `1394703 / 6452293` | 43,179, 778,526 | 735,347 |
| π | 771 | 2×7 | 14 | `2466493 / 1014512` | 124,339, 441,943 | 317,604 |
| π | 846 | 7×2 | 14 | `88 / 65 / 43 / 04 / 45 / 76 / 24` | 437,055, 655,848 | 218,793 |
| π | 870 | 2×7 | 14 | `3221903 / 3595097` | 27,274, 989,273 | 961,999 |
| π | 924 | 2×7 | 14 | `6233427 / 8721171` | 74,106, 91,208 | 17,102 |
| π | 925 | 2×7 | 14 | `6233427 / 7211714` | 74,106, 91,208 | 17,102 |
| π | 1,148 | 7×2 | 14 | `29 / 84 / 62 / 67 / 97 / 68 / 52` | 300,197, 540,079 | 239,882 |
| π | 1,170 | 7×2 | 14 | `90 / 68 / 87 / 07 / 16 / 86 / 88` | 341,637, 376,577 | 34,940 |
| π | 1,476 | 7×2 | 14 | `30 / 26 / 97 / 36 / 90 / 92 / 19` | 184,515, 660,336 | 475,821 |
| π | 1,505 | 7×2 | 14 | `25 / 83 / 49 / 23 / 52 / 65 / 47` | 776,189, 960,935 | 184,746 |
| π | 1,555 | 7×2 | 14 | `25 / 70 / 95 / 59 / 84 / 57 / 00` | 672,445, 859,515 | 187,070 |
| π | 1,576 | 7×2 | 14 | `65 / 66 / 08 / 28 / 89 / 50 / 12` | 456,717, 842,159 | 385,442 |
| π | 1,681 | 2×7 | 14 | `3654527 / 8018520` | 77,018, 234,224 | 157,206 |
| π | 1,779 | 7×2 | 14 | `53 / 09 / 02 / 02 / 58 / 07 / 94` | 810, 958,655 | 957,845 |
| √2 | 1,850 | 5×3 | 15 | `532 / 642 / 586 / 682 / 310` | 262,103, 436,989 | 174,886 |
| √2 | 183 | 7×2 | 14 | `34 / 54 / 23 / 20 / 67 / 55 / 19` | 535,994, 676,788 | 140,794 |
| √2 | 284 | 2×7 | 14 | `2619444 / 3312057` | 514,002, 820,429 | 306,427 |
| √2 | 335 | 7×2 | 14 | `72 / 23 / 49 / 54 / 97 / 67 / 77` | 173,498, 625,740 | 452,242 |
| √2 | 351 | 7×2 | 14 | `44 / 32 / 14 / 11 / 25 / 51 / 96` | 169,594, 660,424 | 490,830 |
| √2 | 395 | 2×7 | 14 | `0800980 / 8857184` | 72,436, 100,380 | 27,944 |
| √2 | 940 | 7×2 | 14 | `84 / 69 / 39 / 15 / 88 / 50 / 00` | 94,935, 654,940 | 560,005 |
| √2 | 1,640 | 7×2 | 14 | `36 / 27 / 15 / 06 / 83 / 11 / 57` | 27,258, 812,017 | 784,759 |
| √2 | 1,649 | 2×7 | 14 | `9155778 / 2660023` | 475,034, 515,726 | 40,692 |
| √2 | 1,953 | 7×2 | 14 | `59 / 85 / 94 / 35 / 07 / 43 / 01` | 813,332, 945,951 | 132,619 |
| √2 | 1,988 | 7×2 | 14 | `84 / 74 / 71 / 76 / 73 / 53 / 01` | 381,183, 795,882 | 414,699 |
| e | 309 | 3×5 | 15 | `26706 / 42937 / 38235` | 89,404, 423,780 | 334,376 |
| e | 1,439 | 3×5 | 15 | `95121 / 72302 / 39974` | 134,048, 559,581 | 425,533 |
| e | 1,660 | 3×5 | 15 | `39024 / 31515 / 76216` | 662,408, 816,464 | 154,056 |
| e | 100 | 7×2 | 14 | `12 / 37 / 36 / 90 / 67 / 69 / 68` | 351,876, 886,680 | 534,804 |
| e | 429 | 2×7 | 14 | `1188155 / 2798049` | 68,539, 886,983 | 818,444 |
| e | 437 | 2×7 | 14 | `6347995 / 1396055` | 125,226, 277,743 | 152,517 |
| e | 503 | 7×2 | 14 | `44 / 06 / 83 / 51 / 28 / 90 / 63` | 687,913, 926,252 | 238,339 |
| e | 637 | 7×2 | 14 | `98 / 15 / 46 / 68 / 59 / 76 / 14` | 909,372, 931,194 | 21,822 |
| e | 700 | 7×2 | 14 | `58 / 70 / 11 / 87 / 34 / 72 / 91` | 544,798, 675,443 | 130,645 |
| e | 738 | 7×2 | 14 | `22 / 19 / 35 / 68 / 60 / 15 / 21` | 7,236, 397,993 | 390,757 |
| e | 935 | 2×7 | 14 | `8165317 / 4810654` | 452,618, 608,276 | 155,658 |
| e | 936 | 2×7 | 14 | `2816531 / 4810654` | 452,617, 608,275 | 155,658 |
| e | 955 | 7×2 | 14 | `42 / 74 / 99 / 36 / 17 / 07 / 98` | 626,167, 979,504 | 353,337 |
| e | 998 | 7×2 | 14 | `43 / 66 / 10 / 12 / 17 / 22 / 37` | 412,814, 984,190 | 571,376 |
| e | 1,038 | 7×2 | 14 | `16 / 30 / 85 / 19 / 04 / 45 / 18` | 252,195, 981,124 | 728,929 |
| e | 1,305 | 7×2 | 14 | `23 / 55 / 56 / 51 / 27 / 89 / 41` | 627,810, 628,637 | 827 |
| e | 1,439 | 7×2 | 14 | `56 / 72 / 99 / 81 / 96 / 01 / 14` | 675,351, 697,527 | 22,176 |
| e | 1,486 | 7×2 | 14 | `28 / 83 / 35 / 57 / 58 / 65 / 15` | 834,157, 835,555 | 1,398 |
| e | 1,617 | 2×7 | 14 | `7178311 / 4851608` | 468,305, 968,551 | 500,246 |
| e | 1,799 | 7×2 | 14 | `85 / 29 / 20 / 18 / 49 / 30 / 53` | 146,458, 729,502 | 583,044 |
| e | 1,934 | 7×2 | 14 | `11 / 88 / 35 / 33 / 26 / 64 / 54` | 1,464, 827,038 | 825,574 |
| e | 1,952 | 7×2 | 14 | `75 / 81 / 44 / 49 / 34 / 53 / 99` | 89,416, 135,018 | 45,602 |
| φ | 336 | 4×4 | 16 | `5288 / 3469 / 0072 / 4599` | 138,138, 902,802 | 764,664 |
| φ | 26 | 3×5 | 15 | `29220 / 67849 / 82196` | 261,391, 607,769 | 346,378 |
| φ | 370 | 3×5 | 15 | `44792 / 81931 / 88069` | 743,904, 789,917 | 46,013 |
| φ | 912 | 5×3 | 15 | `290 / 609 / 369 / 922 / 510` | 421,002, 427,701 | 6,699 |
| φ | 1,048 | 3×5 | 15 | `24905 / 78616 / 52126` | 319,059, 995,420 | 676,361 |
| φ | 1,154 | 5×3 | 15 | `104 / 866 / 390 / 283 / 621` | 11,711, 35,409 | 23,698 |
| φ | 1,838 | 5×3 | 15 | `613 / 245 / 212 / 268 / 197` | 109,483, 335,300 | 225,817 |
| φ | 79 | 7×2 | 14 | `45 / 88 / 44 / 36 / 19 / 00 / 51` | 630,478, 759,420 | 128,942 |
| φ | 213 | 2×7 | 14 | `6119514 / 1787878` | 289,275, 777,200 | 487,925 |
| φ | 322 | 7×2 | 14 | `91 / 21 / 69 / 05 / 41 / 08 / 97` | 538,872, 543,835 | 4,963 |
| φ | 433 | 2×7 | 14 | `8397201 / 6612836` | 219,268, 283,089 | 63,821 |
| φ | 538 | 7×2 | 14 | `05 / 91 / 46 / 90 / 86 / 06 / 06` | 388,550, 913,652 | 525,102 |
| φ | 541 | 2×7 | 14 | `0257669 / 6764036` | 719,497, 856,101 | 136,604 |
| φ | 713 | 7×2 | 14 | `27 / 72 / 08 / 33 / 40 / 51 / 93` | 220,894, 343,176 | 122,282 |
| φ | 1,251 | 2×7 | 14 | `2048840 / 5423514` | 533,946, 727,683 | 193,737 |
| φ | 1,614 | 7×2 | 14 | `63 / 83 / 17 / 92 / 77 / 12 / 75` | 658,659, 841,627 | 182,968 |
| φ | 1,931 | 7×2 | 14 | `00 / 72 / 91 / 49 / 78 / 86 / 38` | 154,059, 718,397 | 564,338 |

---

## Revision note (15 October 2026)

After an external review: the chance figures in sections 4.1–4.3 now skip widths too narrow for a
block to fit (the first version included them, adding a small amount, e.g. 3,906 instead of 3,904
for 12 squares; observed counts were never affected). φ's 4×4 probability now uses the 4×4
expectation (9.3%) rather than the all-16-square one. Verdicts read "not reproduced" instead of
"chance", wording about randomness and the structured numbers is less absolute, section 4.5's chance
figure is 0.5 pairs, and the Champernowne check now covers all 1,000,000 places. Details in
REPORT.md, "Revision notes".

After a second review: section 4.3 now gives φ's 10 repeats of 14 squares its probability (1.5%) and
discusses all three 1.5% results, noting that three among about 30 counts is itself unusual (about 1%)
and that none was reproduced in fresh digits. The header now says five other numbers, not six.
