# Pi Mosaic: findings

What we found while turning the digits of π (and six other numbers) into mosaics, and
checking whether any patterns in them are real. Started 14 October 2026.

**Short version:** on the tests we ran and the digits we examined, π, √2, e and the golden ratio φ
are all consistent with random digits. Each has a few eye-catching coincidences, but no more than
random digits would produce. √2 and φ had the most unusual counts; we checked their next million
digits too, and those counts were not reproduced there. The two numbers whose decimal digits are
structured by construction, 1/9801 and Champernowne's constant, show far more repeats than random
digits would: from about 400 times as many to billions of times as many, depending on block size.
None of this proves the digits of π (or the others) are random.

---

## 1. How the mosaic works

- Each digit is one square. Its shade of purple is `digit / 9`: 0 is white, 9 is full purple.
- Square 0 is the whole-number part (the "3" of 3.14159…), so **square number = decimal place**.
  All positions in this file use that convention.
- The squares fill rows left to right. The number of columns ("width") decides which digits end
  up stacked above each other, so it decides which 2D shapes you see.
- **Cyan frames** mark both copies of a repeated block. **Gold frames** mark runs of six or more
  of the same digit.
- The menu in the top-right corner switches between views. The choice is kept in the address,
  e.g. `index.html#e-309`.

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
| φ: only 10 repeats of 14 squares | about 19.4 expected | second million of φ: **16** | not reproduced |

We compared about 30 counts across these numbers, so a couple of 1-in-70 results are not
surprising. None of the unusual counts was reproduced in fresh digits, which is consistent with
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

## 7. Still to do

- Ideas not yet tried: 22/7 (π's school approximation, repeats every 6 digits), Liouville's constant
  (almost all zeros), Euler–Mascheroni γ (not even known to be irrational), ∛2.

---

## 8. Files

- `index.html`, `pi.js`, `piStyle.css`: the mosaic. `pi.js` computes every number's digits in the
  browser and contains the view settings.
- `analysis/digits/`: the verified first million decimals of each number (square 0 = whole-number
  part), plus √2's second million (decimal places 1,000,001–2,000,000).
- `analysis/results/*_repeats_14plus.json`: every repeat of 14 or more squares found at widths
  2–2,000. Format: `{"3x5": [[columns, [decimal place of copy 1, decimal place of copy 2]], …]}`.
- `analysis/scripts/`: the Python scripts used. They were run from `/tmp/<folder>/`, so file paths
  inside them point there and need adjusting to rerun.

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
