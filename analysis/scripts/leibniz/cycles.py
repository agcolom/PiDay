"""The repeating cycle of the Leibniz series stopped after T terms: 4 x (1 - 1/3 + 1/5 - ... +- 1/(2T-1)).

Run from the project folder:  python3 analysis/scripts/leibniz/cycles.py

Every stopped sum is a fraction a/b, so its decimals eventually repeat. Two independent ways of finding
where the cycle starts and how long it is:
  1. theory: with b = 2^i 5^j c (c coprime to 10), the cycle starts after max(i, j) decimals and its
     length is the order of 10 modulo c (the smallest d with 10^d = 1 mod c);
  2. long division: divide a by b digit by digit, remembering the decimal place at which each remainder
     first appeared; the first remainder to come back marks the start and length of the cycle
     (used up to 30 million decimals).
Then, with 144 decimals to a row (as in the mosaic views), every cycle from 10 terms on is a whole number of
rows, so the pattern of rows repeats every (cycle length / 144) rows.
"""
import json
from fractions import Fraction

def factor(n):
    f, p = {}, 2
    while p * p <= n:
        while n % p == 0: f[p] = f.get(p, 0) + 1; n //= p
        p += 1
    if n > 1: f[n] = f.get(n, 0) + 1
    return f

def order_of_10(m):
    if m == 1: return 1
    phi = 1
    for p, e in factor(m).items(): phi *= (p - 1) * p ** (e - 1)
    d = phi
    for q in factor(phi):
        while d % q == 0 and pow(10, d // q, m) == 1: d //= q
    return d

def by_theory(x):
    b, i, j = x.denominator, 0, 0
    while b % 2 == 0: b //= 2; i += 1
    while b % 5 == 0: b //= 5; j += 1
    return max(i, j), order_of_10(b)

def by_long_division(x, limit=30_000_000):
    a, b = x.numerator % x.denominator, x.denominator
    seen, place = {}, 0
    while place <= limit:
        if a == 0: return place, 1          # the decimals end: a cycle of 0s
        if a in seen: return seen[a], place - seen[a]
        seen[a] = place
        a = a * 10 % b; place += 1
    return None

if __name__ == "__main__":
    rows, s = [], Fraction(0)
    for T in range(1, 31):
        s += Fraction((-1) ** (T - 1), 2 * T - 1)
        x = 4 * s
        start, length = by_theory(x)
        check = by_long_division(x) if length <= 30_000_000 else None
        if check is not None: assert check == (start, length), (T, check, (start, length))
        rows.append({"terms": T, "fraction": f"{x.numerator}/{x.denominator}", "cycle_starts_after": start,
                     "cycle_length": length, "checked_by_long_division": check is not None,
                     "rows_at_144": length / 144})
        print(f"{T:3} terms  {float(x):.6f}  cycle starts after decimal {start}, length {length:,}"
              + ("  (long division agrees)" if check else "") + (f"  = {length // 144:,} rows of 144" if length % 144 == 0 else ""))
    json.dump(rows, open("analysis/results/leibniz/cycles.json", "w"), indent=1)
