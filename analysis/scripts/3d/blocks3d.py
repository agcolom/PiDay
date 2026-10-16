"""Repeated 3D blocks. Digits fill W x W layers, stacked into a box (decimal place k -> layer k // W^2,
row (k // W) % W, column k % W). For each W from 10 to 150 and each block shape, count the different
blocks that appear twice or more, and compare with the number random digits would give.

Run from the project folder:  python3 analysis/scripts/3d/blocks3d.py
"""
import itertools, json, sys
import numpy as np
from multiprocessing import Pool

WIDTHS = range(10, 151)
BASE_SHAPES = [(2, 2, 3), (2, 2, 4), (2, 3, 3)]                       # depth x height x width, all orientations used
SHAPES = sorted({p for s in BASE_SHAPES for p in itertools.permutations(s)})
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M", "leibniz": "leibniz_500k_1M",
           "polygon96": "polygon96_1M"}

def scan(args):
    name, digits, W = args
    a = np.frombuffer(digits.encode(), dtype=np.uint8).astype(np.int64) - 48
    D = len(a) // (W * W)
    g = a[:D * W * W].reshape(D, W, W)
    out = {}
    for d, h, w in SHAPES:
        P, R, C = D - d + 1, W - h + 1, W - w + 1
        if P < 1 or R < 1 or C < 1: continue
        code = np.zeros((P, R, C), dtype=np.int64)
        for i, j, k in itertools.product(range(d), range(h), range(w)):
            code = code * 10 + g[i:i + P, j:j + R, k:k + C]
        flat = code.ravel()
        f = np.sort(flat)
        dup = np.unique(f[1:][f[1:] == f[:-1]])
        M = flat.size
        rec = {"repeats": int(len(dup)), "expected": M * (M - 1) / 2 * 10.0 ** -(d * h * w)}
        if d * h * w >= 16 and 0 < len(dup) <= 50:                         # record where the big ones are
            places = []
            for v in dup:
                idx = np.nonzero(flat == v)[0]
                places.append([int((q // (R * C)) * W * W + ((q // C) % R) * W + q % C) for q in idx])
            rec["places"] = places
        out[(d, h, w)] = rec
    return name, W, out

if __name__ == "__main__":
    rng = np.random.default_rng(3003)
    sources = {n: open(f"analysis/digits/{f}.txt").read() for n, f in NUMBERS.items()}
    for i in (1, 2):
        sources[f"random {i}"] = "".join(map(str, rng.integers(0, 10, 1_000_001)))
    jobs = [(n, s, W) for n, s in sources.items() for W in WIDTHS]
    with Pool(12) as p:
        res = p.map(scan, jobs)
    summary, big = {}, {}
    for name, W, out in res:
        for shape, rec in out.items():
            cells = int(np.prod(shape))
            s = summary.setdefault(name, {}).setdefault(cells, [0, 0.0])
            s[0] += rec["repeats"]; s[1] += rec["expected"]
            if "places" in rec:
                big.setdefault(name, []).extend({"W": W, "shape": list(shape), "places": pl} for pl in rec["places"])
    print(f"{'number':13} | " + " | ".join(f"{c} cubes: found (chance)" for c in (12, 16, 18)))
    for name, s in summary.items():
        print(f"{name:13} | " + " | ".join(f"{s[c][0]:>12,} ({s[c][1]:.3f})" for c in (12, 16, 18)))
    json.dump({"summary": summary, "big_repeats": {k: v for k, v in big.items() if k not in ("champernowne", "1/9801")}},
              open("analysis/results/3d/blocks3d.json", "w"), indent=1)
    for name, lst in big.items():
        if name in ("champernowne", "1/9801"): continue
        for r in lst: print(name, r)
