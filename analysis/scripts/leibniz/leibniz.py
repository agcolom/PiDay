"""Stopping the Leibniz series early: 4 x (1 - 1/3 + 1/5 - ... ) with a fixed number of terms.

Run from the project folder:  python3 analysis/scripts/leibniz/leibniz.py

The full series adds up to exactly pi/4. Stopped after T terms (N = 2T), Borwein, Borwein and Dilcher
(1989) showed that
    pi - 4 x (sum of the first T terms) = 2/N - 2/N^3 + 10/N^5 - 122/N^7 + ... = sum over m of 2 E_2m / N^(2m+1)
where E_0, E_2, E_4, ... = 1, -1, 5, -61, 1385, ... are the Euler numbers. When N is a power of 10 each term
is a whole number shifted a fixed number of places, so the sum differs from pi only in small, evenly spaced
clusters of digits, until the Euler numbers grow too long and the clusters merge.

1. The digits for 50,000, 500,000 and 5,000,000 terms (N = 10^5, 10^6, 10^7), to 1,000 decimals, two ways:
   method 1 adds the terms one by one (whole-number arithmetic with 20 guard digits);
   method 2 is pi minus the Euler-number formula above, using the verified digits of pi.
   The formula is an asymptotic series: its terms shrink until m is about pi N / 4, so it is exact to far
   more than 1,000 decimals for these N (about 68,000 for N = 10^5).
2. Where the pattern dissolves: the last stretch of 5 decimals in a row that all match pi (by chance this
   happens about once in 100,000 places, so once the sum stops tracking pi it is very unlikely).
3. Round and non-round numbers of terms: how many of the first 60 decimals differ from pi.
4. The limit hidden in the Euler numbers: sqrt(4 (2m+1)(2m+2) |E_2m / E_2m+2|) tends to pi, and adding
   the formula's terms to the sum (stopping at the smallest one) turns a few correct decimals into many.
5. How long the repeating cycle is: the sum is a fraction, so its decimals repeat eventually. Every prime p
   between 333,333 and 1,000,000 divides exactly one term's denominator (3p is beyond 999,999), so it divides
   the denominator of the sum, and the cycle length is a multiple of the order of 10 modulo p.
"""
import json, math, sys
from fractions import Fraction
sys.set_int_max_str_digits(0)

PI = open("analysis/digits/pi_1M.txt").read()
D, G = 1000, 20

def euler_numbers(count):
    """E_0, E_2, ..., from sum over k of C(2n, 2k) E_2k = 0."""
    E = [1]
    for n in range(1, count):
        E.append(-sum(math.comb(2 * n, 2 * k) * E[k] for k in range(n)))
    return E

def by_adding(terms, digits=D):
    one, s = 10 ** (digits + G), 0
    for k in range(terms):
        s += one // (2 * k + 1) if k % 2 == 0 else -(one // (2 * k + 1))
    return str(4 * s)[:digits + 1]          # 20 guard digits; the floors lose less than `terms` units

def by_formula(terms, E, digits=D):
    N, scale = 2 * terms, 10 ** (digits + G)
    error, last = Fraction(0), None
    for m, e in enumerate(E):
        term = Fraction(2 * e, N ** (2 * m + 1))
        assert last is None or abs(term) < abs(last), "the formula has stopped converging"
        error += term; last = term
        if abs(term) * scale < 1: break
    else:
        raise ValueError("need more Euler numbers")
    return str(int(PI[:digits + G + 1]) - int(error * scale))[:digits + 1]

def matches(x):
    return [a == b for a, b in zip(x, PI)]

def last_stretch(same, length=5):
    """Last decimal place ending a stretch of `length` decimals in a row that all match pi."""
    end = 0
    for i in range(length, len(same)):
        if all(same[i - length + 1:i + 1]): end = i
    return end

def correct_decimals(x):
    for i, (a, b) in enumerate(zip(x, PI)):
        if a != b: return i - 1
    return len(x) - 1

def order_of_10(p, spf):
    d, n = p - 1, p - 1
    while n > 1:
        q = spf[n]
        while n % q == 0: n //= q
        while d % q == 0 and pow(10, d // q, p) == 1: d //= q
    return d

if __name__ == "__main__":
    E = euler_numbers(900)
    results = {"sums": {}, "round_and_not": {}}

    print("1-2. Digits of 4 x the first T terms, and where the pattern dissolves")
    for terms in (50_000, 500_000, 5_000_000):
        a, b = by_adding(terms), by_formula(terms, E)
        assert a == b, f"methods disagree for {terms} terms"
        same = matches(a)
        differ = [i for i, s in enumerate(same) if not s]
        results["sums"][terms] = {"digits": a, "differ_from_pi": differ, "last_5_matching_end": last_stretch(same),
                                  "share_differing_after_200": sum(not s for s in same[200:]) / len(same[200:])}
        r = results["sums"][terms]
        print(f"  {terms:>9,} terms: both methods agree on {D:,} decimals; first difference at decimal place {differ[0]}; "
              f"last 5 matching decimals end at place {r['last_5_matching_end']}; "
              f"{100 * r['share_differing_after_200']:.1f}% of decimals 200-{D:,} differ (90% for unrelated digits)")
        print("      " + a[:73]); print("      " + PI[:73]); print("      " + "".join(" " if s else "^" for s in same[:73]))

    print("3. Round and non-round numbers of terms: decimals 1-60 that differ from pi")
    for terms in (500_000, 499_999, 400_000, 250_000, 600_000):
        x = by_adding(terms, 80)
        n = sum(not s for s in matches(x)[1:61])
        results["round_and_not"][terms] = n
        print(f"  {terms:>9,} terms: {n}")

    print("4a. pi from neighbouring Euler numbers")
    results["pi_from_euler"] = {}
    for m in (4, 9, 50, 200, 800):
        r = Fraction(4 * (2 * m + 1) * (2 * m + 2) * abs(E[m]), abs(E[m + 1]))
        est = str(math.isqrt(r.numerator * 10 ** 2000 // r.denominator))            # sqrt(r) x 10^1000
        results["pi_from_euler"][m] = correct_decimals(est)
        print(f"  m = {m}: {est[0]}.{est[1:21]}...  correct to {correct_decimals(est)} decimals")

    print("4b. The sum alone, and the sum plus the formula's terms up to the smallest")
    results["corrected"] = {}
    for terms in (50, 500):
        N = 2 * terms
        x = 4 * sum(Fraction((-1) ** k, 2 * k + 1) for k in range(terms))
        alone = correct_decimals(str(int(x * 10 ** 1200)))
        last = None
        for m, e in enumerate(E):
            term = Fraction(2 * e, N ** (2 * m + 1))
            if last is not None and abs(term) > abs(last): break
            x += term; last = term
        fixed = correct_decimals(str(int(x * 10 ** 1200)))
        results["corrected"][terms] = {"alone": alone, "corrected": fixed, "terms_of_formula": m}
        print(f"  {terms} terms: alone {alone} correct decimals; corrected with {m} terms of the formula: {fixed} "
              f"(theory: about pi N / 2 x log10(e) = {math.pi * N / 2 * math.log10(math.e):.0f})")

    print("5. The repeating cycle of 4 x the first 500,000 terms")
    M = 1_000_000
    spf = list(range(M + 1))
    for i in range(2, int(M ** 0.5) + 1):
        if spf[i] == i:
            for j in range(i * i, M + 1, i):
                if spf[j] == j: spf[j] = i
    L, count = 1, 0
    for p in range(333_335, M, 2):
        if spf[p] == p:
            L = math.lcm(L, order_of_10(p, spf)); count += 1
    results["cycle_at_least_digits_of_length"] = len(str(L))
    print(f"  {count:,} primes force the cycle to be a multiple of a number with {len(str(L)):,} digits")
    json.dump(results, open("analysis/results/leibniz/leibniz.json", "w"), indent=1)
