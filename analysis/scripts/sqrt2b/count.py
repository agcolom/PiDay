import sys, numpy as np; sys.set_int_max_str_digits(0)
from math import isqrt
from multiprocessing import Pool

SHAPES = [(2,7),(7,2)]
def count(args):
    W, d = args
    rows = len(d)//W; g = d[:rows*W].reshape(rows, W); n = 0
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if C < 1: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w): code = code*10 + g[r:r+R, c:c+C]
        f = np.sort(code.ravel()); n += len(np.unique(f[1:][f[1:] == f[:-1]]))
    return n

if __name__ == "__main__":
    second = open('second.txt').read()
    fresh = str(isqrt(2 * 10**(2*(2_000_000+20))))[1_000_001:2_000_001]
    print("saved second million matches a fresh calculation:", second == fresh, flush=True)
    d = np.frombuffer(second.encode(), dtype=np.uint8).astype(np.int64) - 48
    first = np.frombuffer(open('/tmp/sqrt2/isqrt.txt').read()[1:].encode(), dtype=np.uint8).astype(np.int64) - 48
    with Pool(12) as p:
        print("14-square repeats, sqrt2 decimals 1..1,000,000 (recount):", sum(p.map(count, [(W, first) for W in range(2, 2001)])), flush=True)
        print("14-square repeats, sqrt2 decimals 1,000,001..2,000,000:", sum(p.map(count, [(W, d) for W in range(2, 2001)])), flush=True)
