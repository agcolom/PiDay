import sys, time; sys.set_int_max_str_digits(0)
from math import isqrt
from decimal import Decimal, getcontext
N = 1_000_000
t = time.time()
a = str(isqrt(2 * 10**(2*(N+20))))[:N+1]                  # method 1: integer square root (Newton on integers)
t1 = time.time() - t; t = time.time()
getcontext().prec = N + 30
b = str(Decimal(2).sqrt()).replace('.', '')[:N+1]           # method 2: decimal module (libmpdec)
t2 = time.time() - t
open('isqrt.txt','w').write(a); open('decimal.txt','w').write(b)
print(f"isqrt {t1:.1f}s, decimal {t2:.1f}s, agree: {a == b}, digits: {len(a)}")
print("starts:", a[:52])
print("published 1.41421356237309504880168872420969807856967187537694 ->",
      a[:51] == "141421356237309504880168872420969807856967187537694")
