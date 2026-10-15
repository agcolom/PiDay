"""Check the expected-count formula in alignments.py against many strings of random digits (2D 1000x1000)."""
import sys, numpy as np
from multiprocessing import Pool
sys.path.insert(0, "analysis/scripts/3d")
from alignments import runs, expected, LENGTHS

def one(seed):
    rng = np.random.default_rng(10_000 + seed)
    d = "".join(map(str, rng.integers(0, 10, 1_000_000)))
    per_dir = runs(d, (1000, 1000))
    allruns = {}
    for c in per_dir.values():
        for k, m in c.items(): allruns[k] = allruns.get(k, 0) + m
    return [sum(m for k, m in allruns.items() if k >= L) for L in LENGTHS]

if __name__ == "__main__":
    with Pool(12) as p: res = np.array(p.map(one, range(100)))
    for i, L in enumerate(LENGTHS):
        col = res[:, i]
        print(f"{L}+: formula {expected((1000, 1000), L):8.2f} | 100 random strings: mean {col.mean():8.2f}, "
              f"min {col.min()}, max {col.max()} | strings with 4 or more: {(col >= 4).sum()}")
