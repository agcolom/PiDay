# Pi Mosaic

A mosaic of the digits of π (and six other numbers, plus two ways of approaching π: the Leibniz series
stopped early, and the areas of Archimedes' polygons): one
square per digit, darker for higher digits.
It started as a Pi Day CodePen in 2024 and grew into a check of whether the digits contain repeating
patterns.

**See it online:** [the mosaic](https://agcolom.github.io/PiDay/),
[the 3D cube](https://agcolom.github.io/PiDay/cube.html),
[the sphere](https://agcolom.github.io/PiDay/sphere.html) and
[Archimedes' polygons](https://agcolom.github.io/PiDay/polygons.html).

**Or locally:** open `index.html` in a browser. Use the menu in the top-right corner to switch between
π, √2, e, the golden ratio, 1/9801, Champernowne's constant, Liouville's constant, the Leibniz series and Archimedes' polygons
(the *Polygon ladder* view stacks the polygons' areas, one per row, with π underneath). Cyan frames mark repeated blocks;
gold frames mark runs of six or more of the same digit; green frames mark digits counting up or down
(such as 34567; the Counting menu lets 9 roll over to 0, as in 89012). The Fold menu folds the mosaic
onto itself and shows where the two halves have the same digit, or digits that add up to 9. The "3D cube"
link opens `cube.html`, a cube of digits you can rotate, with gold lines through every straight line of
one digit, and a chart of how often each digit appears. The "Sphere" link opens `sphere.html`, the
digits wound onto a ball along a golden-angle spiral. The "Polygons" link opens `polygons.html`, which
draws Archimedes' polygons inside and outside a circle (6 to 6,291,456 sides), with a stretched close-up of
the shrinking gap and the areas, the part that matches π in bold. On every page, the
**About** button explains in plain English what's on screen.

## Files

| File or folder | What it is |
|---|---|
| `index.html`, `pi.js`, `piStyle.css` | The flat mosaic. |
| `cube.html`, `cube.js` | The rotatable 3D cube. |
| `sphere.html`, `sphere.js` | The digits on a rotatable sphere. |
| `polygons.html`, `polygons.js` | Archimedes' polygons drawn inside and outside a circle, with their areas. |
| `digits.js` | The formulas all four pages use to compute the digits in the browser. |
| `about.js` | The plain-English "About" panel on every page (its text is in `pi.js`, `cube.js`, `sphere.js` and `polygons.js`). |
| `REPORT.md` | How everything was calculated, checked and interpreted. |
| `FINDINGS.md` | All the result tables, plus every repeated block found. |
| `analysis/digits/` | The first million decimals of each number, each verified by two or more independent methods. |
| `analysis/results/` | Results of every test, as JSON (including every repeated block of 14 or more squares). |
| `analysis/scripts/` | The Python scripts used (Python 3 and `numpy`). |

## Short version of the findings

On the tests we ran, the first million digits of π, √2, e and φ are consistent with random digits.
1/9801, Champernowne's constant and Liouville's constant (0.110001000…, a 1 at every factorial place),
whose digits are structured by construction, show tens to billions of times more repeats than random digits
would. Liouville's and Champernowne's constants are transcendental, like π and e: on our tests, being
algebraic or transcendental made no difference to how random the digits look; what mattered was whether
they are written down by a simple rule (FINDINGS.md, section 7.13). The Leibniz series stopped after 500,000 terms
matches π except at evenly spaced digits given by the Euler numbers, a pattern that fades within about
70 digits (and reaches further the more terms are used); taken on its own, its digits are also consistent
with random digits. Stopped after only a few terms, the series is a fraction whose digits visibly repeat; the
cycle grows from 6 digits (4 terms) to 55,440 (16 terms) to 480,720,240 (30 terms), pushed further away as
the sum gets closer to π. These stopped sums can be viewed in the mosaic, the cube and the sphere. The areas of
Archimedes' polygons inside a circle (6, 12, 24, … sides) approach π differently: they are irrational
(except the 12-gon, exactly 3), so they never repeat, and π's digits grow in from the left, about 0.6 digits
each time the sides double. Archimedes' 96-gon gave twice the expected number of one kind of repeated block
in its first million digits (about a 1-in-8,000 result), but not in its next million; it too is consistent
with random digits. See `REPORT.md` for details and limitations.
