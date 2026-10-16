"""Follow-up: straight lines of one digit in the Leibniz number's decimal places 1,000,001-2,000,000 (computed
and checked two ways by second_million.py, not looked at before), in the same 2D and 4D boxes as
analysis/scripts/3d/alignments.py. In the first million, 4D had 6 lines of 8 or more (1.73 expected, 0.9%)
and 29 of 7 or more (19.2 expected), and 2D had a line of 9 (0.036 expected).

Run from the project folder:  python3 analysis/scripts/leibniz/lines_followup.py
"""
import json, sys
sys.path.insert(0, "analysis/scripts/3d")
from alignments import runs, expected, LENGTHS

fresh = open("analysis/digits/leibniz_500k_second_1M.txt").read()
out = {}
for shape in ((1000, 1000), (31, 31, 31, 31)):
    n = 1
    for s in shape: n *= s
    totals = {}
    for c in runs(fresh[:n], shape).values():
        for k, m in c.items(): totals[k] = totals.get(k, 0) + m
    name = "x".join(map(str, shape))
    out[name] = {L: {"found": sum(m for k, m in totals.items() if k >= L), "expected": expected(shape, L)} for L in LENGTHS}
    out[name]["longest"] = max(totals)
    for L in LENGTHS:
        print(f"{name}, decimals 1,000,001-{1_000_000 + n:,}, {L}+: {out[name][L]['found']} (expected {out[name][L]['expected']:.2f})")
    print(f"{name}: longest {max(totals)}")
json.dump(out, open("analysis/results/leibniz/lines_followup.json", "w"), indent=1)
