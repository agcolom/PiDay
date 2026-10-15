import numpy as np, sys
from multiprocessing import Pool
SHAPES = [(2,7),(7,2)]
def count(seed):
    rng = np.random.default_rng(seed)
    a = rng.integers(0, 10, 1_000_001, dtype=np.int64)
    n = 0
    for W in range(2, 2001):
        rows = len(a)//W; g = a[:rows*W].reshape(rows, W)
        for h, w in SHAPES:
            R, C = rows-h+1, W-w+1
            if C < 1: continue
            code = np.zeros((R, C), dtype=np.int64)
            for r in range(h):
                for c in range(w): code = code*10 + g[r:r+R, c:c+C]
            f = np.sort(code.ravel()); n += len(np.unique(f[1:][f[1:] == f[:-1]]))
    return n
if __name__ == "__main__":
    with Pool(12) as p: res = p.map(count, range(24))
    print("14-square repeats in 24 random million-digit strings:", sorted(res))
    print("mean", np.mean(res), "| runs with 10 or fewer:", sum(r <= 10 for r in res), "of 24")
