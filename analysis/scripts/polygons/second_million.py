"""Second million decimals of the 96-gon's area: compute two ways, check, and recount 14-square repeats.

Run from the project folder:  python3 analysis/scripts/polygons/second_million.py

The first million decimals had 38 repeated blocks of 14 squares (2x7 and 7x2) at widths 2 to 2,000, about
twice the 19.4 random digits give (analysis/scripts/polygons/scan.py). As with sqrt2 and phi, the count is
repeated in fresh digits: decimal places 1,000,001 to 2,000,000. Writes
analysis/digits/polygon96_second_1M.txt and analysis/results/polygons/second_million.json.
"""
import json
import sys
from decimal import Decimal, getcontext
from multiprocessing import Pool

import numpy as np

sys.path.insert(0, "analysis/scripts/polygons")
from polygons import halving

SHAPES = [(2, 7), (7, 2)]


def count(args):
    """Repeated 2x7 and 7x2 blocks at width W, counted as in sqrt2b/run.py and the main scans."""
    W, d = args
    rows = len(d) // W
    g = d[: rows * W].reshape(rows, W)
    n = 0
    for h, w in SHAPES:
        R, C = rows - h + 1, W - w + 1
        if C < 1:
            continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w):
                code = code * 10 + g[r : r + R, c : c + C]
        f = np.sort(code.ravel())
        n += len(np.unique(f[1:][f[1:] == f[:-1]]))
    return n


def expected(N):
    total = 0.0
    for W in range(2, 2001):
        rows = N // W
        for h, w in SHAPES:
            R, C = rows - h + 1, W - w + 1
            if R >= 2 and C >= 1:
                total += R * C * (R * C - 1) / 2 * 10.0 ** -(h * w)
    return total


if __name__ == "__main__":  # needed on macOS, where each worker process re-imports this file
    sys.set_int_max_str_digits(0)
    N = 2_000_001  # the 3 and two million decimals
    a = str(halving(N, 4)[96])
    getcontext().prec = N + 30
    two = Decimal(2)
    b = str(24 * (two - (two + (two + Decimal(3).sqrt()).sqrt()).sqrt()).sqrt()).replace(".", "")[:N]
    assert a == b, "methods disagree"
    first = open("analysis/digits/polygon96_1M.txt").read()
    assert a[: len(first)] == first
    second = a[1_000_001:2_000_001]  # decimal places 1,000,001 .. 2,000,000
    open("analysis/digits/polygon96_second_1M.txt", "w").write(second)
    print("second million verified two ways, length", len(second), flush=True)

    results = {}
    for name, text in [("first million (whole number and decimals, as scan.py)", first), ("second million", second)]:
        d = np.frombuffer(text.encode(), dtype=np.uint8).astype(np.int64) - 48
        with Pool(12) as p:
            total = sum(p.map(count, [(W, d) for W in range(2, 2001)]))
        results[name] = {"found": total, "expected": expected(len(text))}
        print(f"14-square repeats, {name}: {total} (random digits: {expected(len(text)):.2f})", flush=True)
    json.dump(results, open("analysis/results/polygons/second_million.json", "w"), indent=1)
