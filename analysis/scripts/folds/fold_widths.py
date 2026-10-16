"""Folding at every width and every height: how often do the two layers have the same digit, and how
often are they complementary (add up to 9: 0-9, 1-8, 2-7, 3-6, 4-5)?

Run from the project folder:  python3 analysis/scripts/folds/fold_widths.py

- Left onto right: for every width W from 2 to 2,000, the first N // W full rows of W digits
  (N = 1,000,000 digits from decimal place 0); column c meets column W - 1 - c.
- Top onto bottom: for every height H from 2 to 2,000, a grid of H rows of N // H digits;
  row r meets row H - 1 - r.
Squares that meet themselves (the middle column or row when W or H is odd) are left out.
For random digits each pair is "same" with probability 1/10 and "complementary" with probability 1/10,
independently, so each count is binomial and z = (count - n/10) / sqrt(0.09 n).
"""
import json, sys
import numpy as np
from multiprocessing import Pool

N = 1_000_000
SIZES = range(2, 2001)
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M", "leibniz": "leibniz_500k_1M"}
RANDOM_STRINGS = 20

def scan(args):
    name, a = args
    out = {"left-right": [], "top-bottom": []}
    for W in SIZES:                                         # fold left onto right at width W
        R = N // W
        A = a[:R * W].reshape(R, W)
        left, right = A[:, :W // 2], A[:, ::-1][:, :W // 2]
        n = left.size
        out["left-right"].append((W, R, n, int((left == right).sum()), int((left + right == 9).sum())))
    for H in SIZES:                                         # fold top onto bottom at height H
        W = N // H
        A = a[:H * W].reshape(H, W)
        top, bottom = A[:H // 2], A[::-1][:H // 2]
        n = top.size
        out["top-bottom"].append((H, W, n, int((top == bottom).sum()), int((top + bottom == 9).sum())))
    return name, out

def z(count, n): return (count - 0.1 * n) / np.sqrt(0.09 * n)

if __name__ == "__main__":
    jobs = [(name, (np.frombuffer(open(f"analysis/digits/{f}.txt").read()[:N].encode(), dtype=np.uint8) - 48).astype(np.int16))
            for name, f in NUMBERS.items()]
    rng = np.random.default_rng(5005)
    jobs += [(f"random {i}", rng.integers(0, 10, N).astype(np.int16)) for i in range(1, RANDOM_STRINGS + 1)]
    with Pool(12) as p:
        res = dict(p.map(scan, jobs))

    summary = {}
    for name, out in res.items():
        s = {}
        for fold, rows in out.items():
            for col, rel in ((3, "same"), (4, "complementary")):
                zs = np.array([z(r[col], r[2]) for r in rows])
                rate = sum(r[col] for r in rows) / sum(r[2] for r in rows)
                i = int(np.argmax(np.abs(zs)))
                s[f"{fold} {rel}"] = {"overall_rate": rate, "max_abs_z": float(abs(zs[i])), "at": rows[i][:2],
                                      "rate_there": rows[i][col] / rows[i][2], "beyond_4": int((np.abs(zs) > 4).sum()),
                                      "beyond_3": int((np.abs(zs) > 3).sum())}
        summary[name] = s
    keys = list(next(iter(summary.values())).keys())
    rnd = [summary[f"random {i}"] for i in range(1, RANDOM_STRINGS + 1)]
    print("Random strings, most extreme grid in each search (|z|): ")
    for k in keys:
        mx = sorted(r[k]["max_abs_z"] for r in rnd)
        print(f"  {k:28} median {np.median(mx):.2f}, highest of {RANDOM_STRINGS}: {mx[-1]:.2f} | grids beyond |z|=3: average {np.mean([r[k]['beyond_3'] for r in rnd]):.1f}")
    for name in list(NUMBERS):
        print(f"\n{name}")
        for k in keys:
            v = summary[name][k]
            what = "width" if k.startswith("left") else "height"
            print(f"  {k:28} overall {v['overall_rate']:.4%} | most extreme: {what} {v['at'][0]} ({v['rate_there']:.3%}, |z| {v['max_abs_z']:.2f}) | grids beyond |z|=3: {v['beyond_3']}, beyond 4: {v['beyond_4']}")
    json.dump({"per_grid": {n: res[n] for n in NUMBERS}, "summary": summary}, open("analysis/results/folds/fold_widths.json", "w"))
