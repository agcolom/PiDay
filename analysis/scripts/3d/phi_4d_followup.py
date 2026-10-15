"""Follow-up: count 4D (31^4) single-digit lines in phi's decimals 1,000,001 onwards (not looked at before)."""
import sys
from math import isqrt
sys.set_int_max_str_digits(0)
sys.path.insert(0, "analysis/scripts/3d")
from alignments import runs, expected, LENGTHS

N, G = 2_000_000, 20
scale = 10**(N + G)
phi = str((scale + isqrt(5 * scale * scale)) // 2)[:N + 1]
assert phi[:1_000_001] == open("analysis/digits/phi_1M.txt").read(), "first million doesn't match the verified file"
fresh = phi[1_000_001:1_000_001 + 31**4]
per_dir = runs(fresh, (31, 31, 31, 31))
allruns = {}
for c in per_dir.values():
    for k, m in c.items(): allruns[k] = allruns.get(k, 0) + m
for L in LENGTHS:
    print(f"phi decimals 1,000,001-{1_000_000 + 31**4:,}, 4D {L}+: {sum(m for k, m in allruns.items() if k >= L)} (expected {expected((31,)*4, L):.2f})")
