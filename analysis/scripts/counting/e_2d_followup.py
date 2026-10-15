"""Follow-up: counting runs in the 2D 1000x1000 layout, using e's decimals 1,000,001 to 2,000,000 (not looked at before).
e is computed two ways (factorial series and continued fraction) and the two must agree."""
import sys, math
sys.set_int_max_str_digits(0)
sys.path.insert(0, "analysis/scripts/counting")
from counting_runs import counting_runs, expected, LENGTHS

N, G = 2_000_000, 30
n, lg = 1, 0.0
while lg < N + G: n += 1; lg += math.log10(n)
def split(a, b):
    if b - a == 1: return 1, b
    m = (a + b) // 2
    P1, Q1 = split(a, m); P2, Q2 = split(m, b)
    return P1 * Q2 + P2, Q1 * Q2
P, Q = split(0, n)
series = str((10**(N + G) * (Q + P)) // Q)[:N + 1]

def terms(k):
    out, j = [2], 1
    while len(out) < k: out += [1, 2 * j, 1]; j += 1
    return out[:k]
def prod(ts, lo, hi):
    if hi - lo == 1: return (ts[lo], 1, 1, 0)
    m = (lo + hi) // 2
    a, b, c, d = prod(ts, lo, m); e, f, g, h = prod(ts, m, hi)
    return (a * e + b * g, a * f + b * h, c * e + d * g, c * f + d * h)
k = 700_000
h, _, q, _ = prod(terms(k), 0, k)
assert q.bit_length() * 0.30103 * 2 > N + 2 * G, "not enough continued-fraction terms"
cf = str((10**(N + G) * h) // q)[:N + 1]
assert series == cf, "the two methods disagree"
assert series[:1_000_001] == open("analysis/digits/e_1M.txt").read(), "first million doesn't match the verified file"
print("e to 2,000,000 decimals: series and continued fraction agree")

fresh = series[1_000_001:2_000_001]
counts, _ = counting_runs(fresh, (1000, 1000), record_from=99)
for L in LENGTHS:
    print(f"e decimals 1,000,001-2,000,000, 2D {L}+: {sum(m for kk, m in counts.items() if kk >= L)} (chance {expected((1000, 1000), L):.2f})")
