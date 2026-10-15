import sys, time, math; sys.set_int_max_str_digits(0)
from decimal import Decimal, getcontext
N = 1_000_000
# method 1: e = sum of 1/k!, added up exactly with binary splitting on integers
t = time.time()
n = 1
lg = 0.0
while lg < N + 30: n += 1; lg += math.log10(n)
def split(a, b):
    if b - a == 1: return 1, b
    m = (a + b) // 2
    P1, Q1 = split(a, m); P2, Q2 = split(m, b)
    return P1 * Q2 + P2, Q1 * Q2
P, Q = split(0, n)
a = str((10**(N+20) * (Q + P)) // Q)[:N+1]
t1 = time.time() - t; t = time.time()
# method 2: decimal module's exp(1) (libmpdec, a different algorithm and arithmetic)
getcontext().prec = N + 30
b = str(Decimal(1).exp()).replace('.', '')[:N+1]
t2 = time.time() - t
open('series.txt','w').write(a); open('decimal.txt','w').write(b)
print(f"series {t1:.1f}s, decimal {t2:.1f}s, agree: {a == b}, digits: {len(a)}")
print("published 2.71828182845904523536028747135266249775724709369995 ->",
      a[:51] == "271828182845904523536028747135266249775724709369995")
