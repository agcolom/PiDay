"""Patterns in the Leibniz number itself (4 x the first 500,000 terms), tested like pi, sqrt2, e and phi:
repeated blocks at every width from 2 to 2,000 (as analysis/scripts/phi1m/scan.py), and runs of the same digit.

Run from the project folder:  python3 analysis/scripts/leibniz/scan.py
The other tests (lines, 3D blocks, folds, counting runs, digit frequencies, every distance) include this number
in their own scripts.
"""
import json, re
import numpy as np
from multiprocessing import Pool

s = open("analysis/digits/leibniz_500k_1M.txt").read()
N = len(s)
a = np.frombuffer(s.encode(), dtype=np.uint8) - 48
SHAPES = [(3,4),(4,3),(2,6),(6,2),(3,5),(5,3),(2,7),(7,2),(4,4),(2,8),(8,2),(3,6),(6,3),(2,9),(9,2)]

def scan(W):
    rows = N // W
    g = a[:rows*W].reshape(rows, W).astype(np.int64)
    out = []
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if R < 2 or C < 1: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w):
                code = code*10 + g[r:r+R, c:c+C]
        flat = np.sort(code.ravel())
        dup = np.unique(flat[1:][flat[1:] == flat[:-1]])
        for v in dup:
            pos = np.nonzero(code.ravel() == v)[0]
            out.append((h, w, [(int(p//C)*W + int(p%C)) for p in pos]))
    return W, out, rows

if __name__ == "__main__":
    with Pool(12) as pool:
        res = pool.map(scan, range(2, 2001))
    tally, expected, examples = {}, {}, {}
    for W, out, rows in res:
        for h, w in SHAPES:
            R, C = rows-h+1, W-w+1
            if R < 2 or C < 1: continue
            expected[(h,w)] = expected.get((h,w), 0) + R*C*(R*C-1)/2 * 10.0**-(h*w)
        for h, w, pos in out:
            tally[(h,w)] = tally.get((h,w), 0) + 1
            examples.setdefault((h,w), []).append((W, pos))
    print(f"{'shape':>6} {'squares':>7} {'found':>6} {'chance':>8}")
    by_size = {}
    for h, w in sorted(SHAPES, key=lambda x: (x[0]*x[1], x)):
        print(f"{h}x{w:<4} {h*w:>7} {tally.get((h,w),0):>6} {expected[(h,w)]:>8.2f}")
        f, e = by_size.get(h*w, (0, 0.0)); by_size[h*w] = (f + tally.get((h,w), 0), e + expected[(h,w)])
    for size, (f, e) in sorted(by_size.items()): print(f"{size} squares: {f} found, {e:.2f} expected")
    big = {f"{k[0]}x{k[1]}": v for k, v in examples.items() if k[0]*k[1] >= 14}
    for k, v in big.items(): print(k, v)

    runs = [(m.start(), m.group()) for m in re.finditer(r"(\d)\1{5,}", s)]
    longest = max(len(r) for _, r in runs) if runs else 0
    print("runs of six or more:", len(runs), "| seven or more:", sum(len(r) >= 7 for _, r in runs),
          "| first:", runs[:1], "| longest:", [x for x in runs if len(x[1]) == longest])
    print("all runs of six or more:", runs)
    json.dump({"by_shape": {f"{h}x{w}": {"found": tally.get((h,w), 0), "expected": expected[(h,w)]} for h, w in SHAPES},
               "by_size": {k: {"found": f, "expected": e} for k, (f, e) in by_size.items()},
               "repeats_14plus": big, "runs_6plus": runs},
              open("analysis/results/leibniz/patterns.json", "w"), indent=1)
