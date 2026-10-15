"""Check counting_runs.py's chance formula against 200 strings of random digits (1D and 2D)."""
import sys, numpy as np
from multiprocessing import Pool
sys.path.insert(0, "analysis/scripts/counting")
from counting_runs import counting_runs, expected, LENGTHS

def one(seed):
    d = "".join(map(str, np.random.default_rng(70_000 + seed).integers(0, 10, 1_000_000)))
    out = []
    for shape in ((1_000_000,), (1000, 1000)):
        counts, _ = counting_runs(d, shape, record_from=99)
        out.append([sum(m for k, m in counts.items() if k >= L) for L in LENGTHS])
    return out

if __name__ == "__main__":
    with Pool(12) as p: res = np.array(p.map(one, range(200)))     # 200 strings x 2 layouts x lengths
    for j, (name, shape) in enumerate((("1D", (1_000_000,)), ("2D", (1000, 1000)))):
        m = res[:, j, :].mean(axis=0); se = res[:, j, :].std(axis=0, ddof=1) / np.sqrt(len(res))
        print(name, "  ".join(f"{L}+: formula {expected(shape, L):9.3f}, random mean {m[i]:9.3f} ± {se[i]:.3f}" for i, L in enumerate(LENGTHS)))
