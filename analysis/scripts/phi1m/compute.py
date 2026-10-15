import sys, time; sys.set_int_max_str_digits(0)
from math import isqrt
N = 1_000_000
G = 20
t = time.time()
scale = 10**(N + G)
a = str((scale + isqrt(5 * scale * scale)) // 2)[:N+1]          # method 1: (1 + sqrt 5) / 2
t1 = time.time() - t; t = time.time()
def fib(n):                                                     # fast doubling: returns F(n), F(n+1)
    if n == 0: return 0, 1
    f, g = fib(n // 2)
    c = f * (2 * g - f); d = f * f + g * g
    return (d, c + d) if n % 2 else (c, d)
n = 2_400_000                                                   # F(n) has ~500,000 digits, so F(n+1)/F(n) is exact to ~1,000,000
f, g = fib(n)
assert len(str(f)) * 2 > N + 2 * G
b = str((scale * g) // f)[:N+1]                                 # method 2: Fibonacci ratio F(n+1)/F(n)
t2 = time.time() - t
open('sqrt5.txt', 'w').write(a)
print(f"sqrt5 {t1:.1f}s, fibonacci {t2:.1f}s, agree: {a == b}, digits {len(a)}")
print("published 1.61803398874989484820458683436563811772030917980576 ->",
      a[:51] == "161803398874989484820458683436563811772030917980576")
