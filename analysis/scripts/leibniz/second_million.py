"""Fresh digits for the Leibniz number: decimal places 1,000,001 to 2,000,000 of 4 x (first 500,000 terms),
computed two ways, then the three results that looked mildly unusual in the first million are measured again.

Run from the project folder:  python3 analysis/scripts/leibniz/second_million.py

First million: "add up to 9" pairs averaged z^2 = 1.0105 over gaps 1-100,000 (about 2.4 standard deviations
high); one block of 10,000 digits had chi-squared p = 0.0001; and two runs of six started only 9 places apart.
"""
import json, sys
import numpy as np
from multiprocessing import Pool
sys.set_int_max_str_digits(0)
sys.path.insert(0, "analysis/scripts/leibniz"); sys.path.insert(0, "analysis/scripts/distances")
sys.path.insert(0, "analysis/scripts/frequencies")
from digits_1m import split, TERMS
from distances import counts_by_gap, summary
from digit_counts import chi_squared, digit_counts
from close_runs import run_starts

N2, G = 2_000_000, 20

def share(args):
    first, last = args
    one, s = 10 ** (N2 + G), 0
    for k in range(first, last):
        s += one // (2 * k + 1) if k % 2 == 0 else -(one // (2 * k + 1))
    return s

if __name__ == "__main__":
    edges = [TERMS * i // 12 for i in range(13)]
    with Pool(12) as pool:
        method1 = str(4 * sum(pool.map(share, list(zip(edges, edges[1:])))))[:N2 + 1]
    P, Q = split(0, TERMS)
    method2 = str(4 * P * 10 ** N2 // Q)
    assert method1 == method2, "methods disagree"
    assert method2[:1_000_001] == open("analysis/digits/leibniz_500k_1M.txt").read()
    second = method2[1_000_001:]
    open("analysis/digits/leibniz_500k_second_1M.txt", "w").write(second)
    print("decimal places 1,000,001-2,000,000 agree both ways; first million unchanged")

    d = np.frombuffer(second.encode(), dtype=np.uint8).astype(np.int64) - 48
    gaps = summary(counts_by_gap(d))
    blocks = [chi_squared(digit_counts(second[i * 10000:(i + 1) * 10000]))[1] for i in range(100)]
    starts = run_starts(d)
    out = {"mean_z2": {r: v["mean_z2"] for r, v in gaps.items()},
           "max_abs_z": {r: v["max_abs_z"] for r, v in gaps.items()},
           "blocks_below_5pct": sum(p < 0.05 for p in blocks), "blocks_below_1pct": sum(p < 0.01 for p in blocks),
           "smallest_block_p": min(blocks), "whole_million_p": chi_squared(digit_counts(second))[1],
           "runs_6plus": len(starts), "closest_runs": int(np.diff(starts).min()) if len(starts) > 1 else None}
    for k, v in out.items(): print(f"  {k}: {v}")
    json.dump(out, open("analysis/results/leibniz/second_million.json", "w"), indent=1)
