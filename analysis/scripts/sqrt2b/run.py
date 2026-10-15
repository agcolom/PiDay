import sys, numpy as np; sys.set_int_max_str_digits(0)
from math import isqrt
from decimal import Decimal, getcontext
from multiprocessing import Pool
N = 2_000_000
a = str(isqrt(2 * 10**(2*(N+20))))[:N+1]
getcontext().prec = N + 30
b = str(Decimal(2).sqrt()).replace('.', '')[:N+1]
assert a == b, "methods disagree"
first = open('/tmp/sqrt2/isqrt.txt').read()
assert a[:len(first)] == first
second = a[1_000_001:2_000_001]          # decimal places 1,000,001 .. 2,000,000
open('second.txt', 'w').write(second)
print("second million verified two ways, length", len(second))

d = np.frombuffer(second.encode(), dtype=np.uint8).astype(np.int64) - 48
SHAPES = [(2,7),(7,2)]
def count(W):
    rows = len(d)//W; g = d[:rows*W].reshape(rows, W); n = 0
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if C < 1: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w): code = code*10 + g[r:r+R, c:c+C]
        f = np.sort(code.ravel()); n += len(np.unique(f[1:][f[1:] == f[:-1]]))
    return n
with Pool(12) as p: total = sum(p.map(count, range(2, 2001)))
print("14-square repeats in the second million of sqrt2:", total)
