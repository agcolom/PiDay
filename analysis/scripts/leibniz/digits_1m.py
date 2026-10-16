"""The first million decimals of 4 x (1 - 1/3 + 1/5 - ... - 1/999,999), the Leibniz series stopped after
500,000 terms, computed two independent ways.

Run from the project folder:  python3 analysis/scripts/leibniz/digits_1m.py

Method 1 adds the terms one by one, each rounded down at 1,000,000 + 20 digits (12 processes, each adding a
share of the terms; at most 500,000 units of the last place are lost, far below the 20 guard digits).
Method 2 combines all 500,000 terms into one exact fraction P/Q by binary splitting (halves combined as
P1/Q1 + P2/Q2 = (P1 Q2 + P2 Q1) / (Q1 Q2)), then does a single exact division, so it has no rounding at all.
Saved as analysis/digits/leibniz_500k_1M.txt, index 0 = the whole-number part (3), like the other numbers.
"""
import sys
from multiprocessing import Pool
sys.set_int_max_str_digits(0)

TERMS, N, G = 500_000, 1_000_000, 20

def share(args):
    first, last = args
    one, s = 10 ** (N + G), 0
    for k in range(first, last):
        s += one // (2 * k + 1) if k % 2 == 0 else -(one // (2 * k + 1))
    return s

def split(a, b):
    """sum of (-1)^k / (2k+1) for a <= k < b, as an exact fraction (P, Q)."""
    if b - a == 1:
        return (1 if a % 2 == 0 else -1), 2 * a + 1
    m = (a + b) // 2
    p1, q1 = split(a, m); p2, q2 = split(m, b)
    return p1 * q2 + p2 * q1, q1 * q2

if __name__ == "__main__":
    edges = [TERMS * i // 12 for i in range(13)]
    with Pool(12) as pool:
        method1 = str(4 * sum(pool.map(share, list(zip(edges, edges[1:])))))[:N + 1]
    P, Q = split(0, TERMS)
    method2 = str(4 * P * 10 ** N // Q)
    assert len(method2) == N + 1
    print("both methods agree on all", N, "decimals:", method1 == method2)
    assert method1 == method2
    pi = open("analysis/digits/pi_1M.txt").read()
    print("starts", method2[:30], "| differs from pi at", sum(a != b for a, b in zip(method2, pi)), "of", N + 1, "places")
    open("analysis/digits/leibniz_500k_1M.txt", "w").write(method2)
