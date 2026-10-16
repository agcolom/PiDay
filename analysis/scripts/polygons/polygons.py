"""Archimedes' polygons: the areas of regular polygons inscribed in a circle of radius 1.

Run from the project folder:  python3 analysis/scripts/polygons/polygons.py

A regular polygon with n sides inside a circle of radius 1 is n thin triangles, each with two sides of
length 1 meeting at the angle 2 pi / n, so its area is A(n) = (n/2) sin(2 pi / n). As n grows, A(n) creeps
up to the area of the circle, pi. Like Archimedes, we start from the hexagon and keep doubling the number of
sides: 6, 12, 24, 48, 96, ... (Archimedes used the perimeters, not the areas, but the two are the same
numbers one step apart: the area of the 2n-gon, n sin(pi/n), is half the perimeter of the n-gon.)

Doubling only needs square roots, so every area is computed exactly from whole numbers, with no pi:
  method 1 (halving): from cos and sin of the angle, cos(x/2) = sqrt((1 + cos x)/2) and
            sin(x/2) = sin x / (2 cos(x/2));
  method 2 (nested roots): 2 sin(2 pi/n) written out as nested square roots, e.g. for the 96-gon
            A(96) = 24 sqrt(2 - sqrt(2 + sqrt(2 + sqrt(3)))) (for the 96-gon's million digits, with Python's
            decimal module rather than whole-number square roots);
  method 3 (a check that does use pi): A(n) = (n/2) sin(2 pi/n) from the sine series, with pi's digits from
            analysis/digits/pi_1M.txt, for the first 10,000 decimals.

Writes analysis/digits/polygon96_1M.txt (the 96-gon's 3 and its first million decimals, by methods 1 and 2) and
analysis/results/polygons/polygons.json (the ladder of areas and how many decimals each shares with pi).

Which areas are fractions? A(n) is a fraction only when sin(2 pi/n) is, and by Niven's theorem the only
rational values of sin at rational multiples of pi are 0, 1/2 and 1: the square (area 2) and the 12-gon
(area exactly 3). Every other polygon's area is irrational, so its decimals never settle into a repeating cycle.
"""
import json
from decimal import Decimal, getcontext
import sys
import os
from math import isqrt

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
DIGITS = os.path.join(ROOT, "analysis", "digits")
RESULTS = os.path.join(ROOT, "analysis", "results", "polygons")


def halving(digits, doublings):
    """Areas of the 6, 12, 24, ... gons (up to 6 x 2^doublings) as whole numbers scaled by 10^(digits-1)."""
    guard = 20 + len(str(6 * 2 ** doublings))  # sin(2 pi/n) is tiny and gets multiplied by n
    S = 10 ** (digits - 1 + guard)
    nudge = 10 ** (guard // 2)  # rounding errors are a few units low; this stops 3 coming out as 2.999...
    c, s, n = S // 2, isqrt(3 * S * S) // 2, 6  # cos and sin of 60 degrees, the hexagon's angle 2 pi/6
    areas = {}
    for _ in range(doublings + 1):
        areas[n] = (n * s // 2 + nudge) // 10 ** guard
        c_half = isqrt(S * (S + c) // 2)
        s, c, n = s * S // (2 * c_half), c_half, 2 * n
    return areas


def nested(digits, sides):
    """One area by nested square roots: 2 sin(2 pi/n) = sqrt(2 - 2 cos(4 pi/n)), unwinding 2 cos(x/2) = sqrt(2 + 2 cos x)."""
    guard = 20 + 2 * len(str(sides))  # 2 - 2 cos(4 pi/n) cancels about 2 log10(n) digits
    k = (sides // 6).bit_length() - 1
    assert sides == 6 * 2 ** k
    S = 10 ** (digits - 1 + guard)
    if k == 0:
        two_cos = -S  # 2 cos(120 degrees)
    else:
        two_cos = S  # 2 cos(60 degrees)
        for _ in range(k - 1):
            two_cos = isqrt(S * (2 * S + two_cos))  # 2 cos(30), 2 cos(15), ...
    two_sin = isqrt(S * (2 * S - two_cos))
    return (sides * two_sin // 4 + 10 ** (guard // 2)) // 10 ** guard


def by_sine_series(digits, sides, pi_text, guard=20):
    """A(n) = (n/2) sin(2 pi/n) from the sine series, using pi's digits."""
    S = 10 ** (digits - 1 + guard)
    pi = int(pi_text[: digits + guard])  # pi scaled by S (pi_text starts "31415...")
    x = 2 * pi // sides
    term, total, k = x, x, 1
    while term:
        term = -term * x // S * x // S // ((2 * k) * (2 * k + 1))
        total += term
        k += 1
    return (sides * total // 2 + 10 ** (guard // 2)) // 10 ** guard


def shared_decimals(a, b):
    same = 0
    while same < min(len(a), len(b)) and a[same] == b[same]:
        same += 1
    return max(same - 1, 0)  # leave out the whole-number part


if __name__ == "__main__":
    sys.set_int_max_str_digits(0)
    os.makedirs(RESULTS, exist_ok=True)
    pi_text = open(os.path.join(DIGITS, "pi_1M.txt")).read().strip()

    # The ladder: 6-gon to 6 x 2^80-gon, 200 digits each, checked by the nested roots and the sine series
    ladder = halving(200, 80)
    rows = []
    for n, area in ladder.items():
        text = str(area).zfill(200)
        assert text == str(nested(200, n)).zfill(200), n
        if n <= 6 * 2 ** 20:
            assert text == str(by_sine_series(200, n, pi_text)).zfill(200), n
        rows.append({"sides": n, "area": text[0] + "." + text[1:41], "decimals_shared_with_pi": shared_decimals(text, pi_text)})
    for row in rows[:12] + rows[-3:]:
        print(f"{row['sides']:>28,}  {row['area'][:24]}  shares {row['decimals_shared_with_pi']} decimals with pi")

    # The 96-gon, Archimedes' polygon, to a million digits
    million = 1_000_001  # the 3 and a million decimals, like the other numbers' files
    a96 = str(halving(million, 4)[96])
    # Method 2 here uses Python's decimal module (a separate square-root implementation, libmpdec)
    getcontext().prec = million + 30
    two = Decimal(2)
    b96 = 24 * (two - (two + (two + Decimal(3).sqrt()).sqrt()).sqrt()).sqrt()
    assert a96 == str(b96).replace(".", "")[:million], "methods 1 and 2 disagree"
    assert a96[:10_000] == str(by_sine_series(10_000, 96, pi_text)), "sine series disagrees"
    assert len(a96) == million
    with open(os.path.join(DIGITS, "polygon96_1M.txt"), "w") as f:
        f.write(a96)
    print("96-gon: 3 and 1,000,000 decimals agree by halving and by nested roots; first 10,000 also by the sine series")
    print("96-gon area:", a96[0] + "." + a96[1:31] + "...")

    # The 12-gon is exactly 3 (and the square exactly 2): check that nothing is left over after the 3
    twelve = str(halving(10_000, 1)[12])
    print("12-gon area to 10,000 digits:", twelve[:12] + "...", "all zeros after the 3:", set(twelve[1:]) == {"0"})

    json.dump({"ladder": rows, "polygon96_first_50": a96[:50], "polygon12_exactly_3": set(twelve[1:]) == {"0"}},
              open(os.path.join(RESULTS, "polygons.json"), "w"), indent=1)
