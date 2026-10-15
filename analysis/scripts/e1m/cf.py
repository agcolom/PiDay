import sys, time; sys.set_int_max_str_digits(0)
N = 1_000_000
t = time.time()
# continued fraction of e: [2; 1,2,1, 1,4,1, 1,6,1, ...], convergents h/k by product of 2x2 matrices
def terms(n):
    out = [2]; j = 1
    while len(out) < n: out += [1, 2*j, 1]; j += 1
    return out[:n]
def prod(ts, lo, hi):
    if hi - lo == 1: return (ts[lo], 1, 1, 0)
    m = (lo + hi) // 2
    a, b, c, d = prod(ts, lo, m); e, f, g, h = prod(ts, m, hi)
    return (a*e + b*g, a*f + b*h, c*e + d*g, c*f + d*h)
n = 2
while True:
    h, _, k, _ = prod(terms(n), 0, n)
    if k.bit_length() * 0.30103 * 2 > N + 40: break
    n = int(n * 1.5)
s = str((10**(N+20) * h) // k)[:N+1]
open('cf.txt','w').write(s)
print(f"continued fraction {time.time()-t:.1f}s with {n} terms")
