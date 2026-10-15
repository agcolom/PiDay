import sys, numpy as np; sys.set_int_max_str_digits(0)
from math import isqrt
from multiprocessing import Pool

def fib(n):
    if n == 0: return 0, 1
    f, g = fib(n // 2)
    c = f * (2 * g - f); d = f * f + g * g
    return (d, c + d) if n % 2 else (c, d)

SHAPES = [(2,7),(7,2),(3,5),(5,3),(4,4),(2,8),(8,2)]
def count(args):
    W, d = args
    rows = len(d)//W; g = d[:rows*W].reshape(rows, W); out = {}
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if C < 1 or R < 2: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w): code = code*10 + g[r:r+R, c:c+C]
        f = np.sort(code.ravel()); out[h*w] = out.get(h*w, 0) + len(np.unique(f[1:][f[1:] == f[:-1]]))
    return out

if __name__ == "__main__":
    N, G = 2_000_000, 20
    scale = 10**(N + G)
    a = str((scale + isqrt(5 * scale * scale)) // 2)[:N+1]
    f, g = fib(4_800_000)
    assert len(str(f)) * 2 > N + 2 * G
    b = str((scale * g) // f)[:N+1]
    print("2 million digits agree both ways:", a == b, "| first million unchanged:", a[:1_000_001] == open('/tmp/phi1m/sqrt5.txt').read(), flush=True)
    W = 336
    for p in (138138, 902802):
        print(f"4x4 at decimal place {p}: sqrt5 {[a[p+r*W:p+r*W+4] for r in range(4)]} fibonacci {[b[p+r*W:p+r*W+4] for r in range(4)]}", flush=True)
    d = np.frombuffer(a[1_000_001:2_000_001].encode(), dtype=np.uint8).astype(np.int64) - 48
    with Pool(12) as p:
        res = p.map(count, [(W, d) for W in range(2, 2001)])
    tot = {}
    for r in res:
        for k, v in r.items(): tot[k] = tot.get(k, 0) + v
    print("second million (decimals 1,000,001-2,000,000) repeats by size:", dict(sorted(tot.items())), flush=True)
