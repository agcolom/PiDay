"""Liouville's constant: 0.110001000000000000000001000..., a 1 at decimal places 1!, 2!, 3!, 4!, ... and 0 elsewhere.

Run from the project folder:  python3 analysis/scripts/liouville/liouville.py

It is the sum of 10^-(k!) for k = 1, 2, 3, ... Liouville built it in 1851 as the first number proven to be
transcendental: fractions get close to it far faster than they can get close to any algebraic number.

The digits are written down two independent ways:
  method 1 (places): a 1 at each factorial up to a million (1, 2, 6, 24, 120, 720, 5,040, 40,320, 362,880),
            0 everywhere else;
  method 2 (sum): the exact whole number 10^N x (sum of 10^-(k!) for k! <= N), written out and padded with
            leading zeros.
In the first million decimals there are only nine 1s; the next one is at decimal place 10! = 3,628,800, so
decimal places 1,000,001 to 2,000,000 are all 0 and there is nothing new to re-check there.

Also runs the repeated-block test (every width from 2 to 2,000, as analysis/scripts/polygons/scan.py) and lists
the runs of the same digit. Writes analysis/digits/liouville_1M.txt and analysis/results/liouville/patterns.json.
The other tests include this number in their own scripts.
"""
import json, os, re, sys
from math import factorial
import numpy as np
from multiprocessing import Pool

sys.set_int_max_str_digits(0)
N = 1_000_000
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
PATH = os.path.join(ROOT, "analysis", "digits", "liouville_1M.txt")
SHAPES = [(3,4),(4,3),(2,6),(6,2),(3,5),(5,3),(2,7),(7,2),(4,4),(2,8),(8,2),(3,6),(6,3),(2,9),(9,2)]

places = [factorial(k) for k in range(1, 20) if factorial(k) <= N]

def method1():
    d = ["0"] * (N + 1)  # index 0 is the whole-number part, so index k = decimal place k
    for p in places: d[p] = "1"
    return "".join(d)

def method2():
    total, k = 0, 1
    while factorial(k) <= N:
        total += 10 ** (N - factorial(k)); k += 1
    return "0" + str(total).zfill(N)

def scan(W):
    s = open(PATH).read(); a = np.frombuffer(s.encode(), dtype=np.uint8) - 48
    rows = len(s) // W
    g = a[:rows*W].reshape(rows, W).astype(np.int64)
    out = {}
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if R < 2 or C < 1: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w): code = code*10 + g[r:r+R, c:c+C]
        flat = np.sort(code.ravel())
        dup = np.unique(flat[1:][flat[1:] == flat[:-1]])
        out[(h, w)] = (len(dup), int((dup == 0).sum()))  # different repeated blocks, and whether all-zero is one
    return W, out

if __name__ == "__main__":
    s1, s2 = method1(), method2()
    assert s1 == s2 and len(s1) == N + 1, "the two methods disagree"
    print("methods agree on all", N, "decimals; 1s at", places, "| starts 0.", s1[1:30])
    open(PATH, "w").write(s1)

    with Pool(12) as pool: res = pool.map(scan, range(2, 2001))
    by_size = {}
    for W, out in res:
        for (h, w), (n, zero) in out.items():
            f, z = by_size.get(h*w, (0, 0)); by_size[h*w] = (f + n, z + zero)
    for size, (f, z) in sorted(by_size.items()):
        print(f"{size} squares: {f:,} different repeated blocks ({z:,} of them all zeros, one per width and shape)")

    runs = [(m.start(), len(m.group())) for m in re.finditer(r"(\d)\1{5,}", s1)]
    print("runs of six or more:", len(runs), "| longest:", max(r[1] for r in runs), "starting at", max(runs, key=lambda r: r[1])[0])
    json.dump({"ones_at": places, "methods_agree": True,
               "repeated_blocks_by_size": {k: {"different_blocks": f, "all_zero": z} for k, (f, z) in sorted(by_size.items())},
               "runs_6plus": runs},
              open(os.path.join(ROOT, "analysis", "results", "liouville", "patterns.json"), "w"), indent=1)
