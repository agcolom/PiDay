import numpy as np, sys
from multiprocessing import Pool
SHAPES = [(3,4),(4,3),(2,6),(6,2),(2,7),(7,2),(3,5),(5,3),(4,4),(2,8),(8,2),(3,6),(6,3),(2,9),(9,2)]

def count(args):
    W, path = args
    s = open(path).read()
    a = np.frombuffer(s.encode(), dtype=np.uint8).astype(np.int64) - 48
    rows = len(a) // W; g = a[:rows*W].reshape(rows, W); out = {}
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if C < 1 or R < 2: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w): code = code*10 + g[r:r+R, c:c+C]
        f = np.sort(code.ravel())
        out[(h, w)] = len(np.unique(f[1:][f[1:] == f[:-1]]))
    return out

if __name__ == "__main__":
    path = sys.argv[1]
    with Pool(12) as p: res = p.map(count, [(W, path) for W in range(2, 2001)])
    by_size = {}
    for r in res:
        for (h, w), v in r.items(): by_size[h*w] = by_size.get(h*w, 0) + v
    print(path, "repeated blocks by size (widths 2-2000):", dict(sorted(by_size.items())), flush=True)
