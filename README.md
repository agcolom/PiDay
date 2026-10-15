# Pi Mosaic

A mosaic of the digits of π (and five other numbers): one square per digit, darker for higher digits.
It started as a Pi Day CodePen in 2024 and grew into a check of whether the digits contain repeating
patterns.

**To see it:** open `index.html` in a browser. Use the menu in the top-right corner to switch between
π, √2, e, the golden ratio, 1/9801 and Champernowne's constant. Cyan frames mark repeated blocks;
gold frames mark runs of six or more of the same digit. The second menu folds the mosaic onto itself
and shows where the two halves have the same digit. The "3D cube" link opens `cube.html`, a cube of
digits you can rotate, with gold lines through every straight line of one digit.

## Files

| File or folder | What it is |
|---|---|
| `index.html`, `pi.js`, `piStyle.css` | The flat mosaic. |
| `cube.html`, `cube.js` | The rotatable 3D cube. |
| `digits.js` | The formulas both pages use to compute the digits in the browser. |
| `REPORT.md` | How everything was calculated, checked and interpreted. |
| `FINDINGS.md` | All the result tables, plus every repeated block found. |
| `analysis/digits/` | The first million decimals of each number, each verified by two or more independent methods. |
| `analysis/results/` | Every repeated block of 14 or more squares, as JSON. |
| `analysis/scripts/` | The Python scripts used (Python 3 and `numpy`). |

## Short version of the findings

On the tests we ran, the first million digits of π, √2, e and φ are consistent with random digits.
1/9801 and Champernowne's constant, whose digits are structured by construction, show hundreds to
billions of times more repeats than random digits would. See `REPORT.md` for details and limitations.
