"""Follow-up: the other unusual counts in the 96-gon's first million, recounted in its decimal places
1,000,001-2,000,000 (computed and checked two ways by second_million.py, not looked at before):
  - counting runs of 5 or more in a row (1D): 80 found, 110 expected (0.17% chance of 80 or fewer), and
    with rollover 151 found, 180 expected (1.5%);
  - straight lines of 6 or more of one digit in the 100x100x100 cube: 133 found, 105.5 expected (0.55%).
Same functions as analysis/scripts/counting/counting_runs.py and analysis/scripts/3d/alignments.py.

Run from the project folder:  python3 analysis/scripts/polygons/followup.py
"""
import json
import sys

sys.path.insert(0, "analysis/scripts/counting")
sys.path.insert(0, "analysis/scripts/3d")
import alignments
import counting_runs

if __name__ == "__main__":
    fresh = open("analysis/digits/polygon96_second_1M.txt").read()
    out = {}

    counts, _ = counting_runs.counting_runs(fresh, (1_000_000,))
    found = sum(m for k, m in counts.items() if k >= 5)
    out["counting runs 1D, 5+"] = {"found": found, "expected": counting_runs.expected((1_000_000,), 5)}

    counts, _ = counting_runs.counting_runs(fresh, (1_000_000,), rollover=True)
    found = sum(m for k, m in counts.items() if k >= 5)
    out["counting runs 1D with rollover, 5+"] = {"found": found, "expected": counting_runs.expected((1_000_000,), 5, rollover=True)}

    totals = {}
    for c in alignments.runs(fresh, (100, 100, 100)).values():
        for k, m in c.items():
            totals[k] = totals.get(k, 0) + m
    out["lines 3D 100x100x100, 6+"] = {"found": sum(m for k, m in totals.items() if k >= 6),
                                        "expected": alignments.expected((100, 100, 100), 6)}

    for name, r in out.items():
        print(f"{name}, decimals 1,000,001-2,000,000: {r['found']} (expected {r['expected']:.2f})")
    json.dump(out, open("analysis/results/polygons/followup.json", "w"), indent=1)
