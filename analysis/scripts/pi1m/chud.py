# Method 1: Chudnovsky series with binary splitting, plain Python integers
import sys, time; sys.set_int_max_str_digits(0)
N = 1_000_000 + 50
t0 = time.time()
C3_24 = 640320**3 // 24
def bs(a, b):
    if b - a == 1:
        if a == 0: P = Q = 1
        else:
            P = (6*a-5)*(2*a-1)*(6*a-1); Q = a*a*a*C3_24
        T = P * (13591409 + 545140134*a)
        if a & 1: T = -T
        return P, Q, T
    m = (a + b) // 2
    P1, Q1, T1 = bs(a, m); P2, Q2, T2 = bs(m, b)
    return P1*P2, Q1*Q2, T1*Q2 + P1*T2
terms = N // 14 + 2
P, Q, T = bs(0, terms)
one = 10**N
from math import isqrt
sqrtC = isqrt(10005 * one * one)
pi = (Q * 426880 * sqrtC) // T
open('chud.txt','w').write(str(pi)[:1_000_001])
print('chudnovsky done', round(time.time()-t0,1), 's')
