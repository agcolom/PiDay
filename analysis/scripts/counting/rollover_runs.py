"""Counting runs with rollover: like counting_runs.py, but 9 is followed by 0 going up (7890123) and 0 by 9
going down (2109876).

Run from the project folder:  python3 analysis/scripts/counting/rollover_runs.py

Same numbers, layouts and lengths as counting_runs.py, and the same 20 random strings as a control.
The chance formula (in counting_runs.expected with rollover=True) is checked against 200 more random strings
in 1D and 2D. Results go to analysis/results/counting/rollover_runs.json.
"""
import json, sys
import numpy as np
from multiprocessing import Pool
sys.path.insert(0, "analysis/scripts/counting")
from counting_runs import counting_runs, expected, directions, LAYOUTS, NUMBERS, LENGTHS

def job(args):
    name, digits, layout = args
    counts, long_runs = counting_runs(digits, LAYOUTS[layout], rollover=True)
    at_least = {L: sum(m for k, m in counts.items() if k >= L) for L in LENGTHS}
    return name, layout, at_least, max(counts) if counts else 0, long_runs

def check(seed):
    d = "".join(map(str, np.random.default_rng(70_000 + seed).integers(0, 10, 1_000_000)))
    out = []
    for shape in ((1_000_000,), (1000, 1000)):
        counts, _ = counting_runs(d, shape, record_from=99, rollover=True)
        out.append([sum(m for k, m in counts.items() if k >= L) for L in LENGTHS])
    return out

if __name__ == "__main__":
    sources = {n: open(f"analysis/digits/{f}.txt").read()[:1_000_000] for n, f in NUMBERS.items()}
    rng = np.random.default_rng(6006)                       # the same random strings as counting_runs.py
    for i in range(1, 21):
        sources[f"random {i}"] = "".join(map(str, rng.integers(0, 10, 1_000_000)))
    with Pool(12) as p:
        res = p.map(job, [(n, s, layout) for layout in LAYOUTS for n, s in sources.items()])
        formula = np.array(p.map(check, range(200)))
    results = {}
    for name, layout, at_least, longest, long_runs in res:
        results.setdefault(layout, {})[name] = {"at_least": at_least, "longest": longest,
                                                "long_runs": long_runs if name in ("pi", "sqrt2", "e", "phi") else len(long_runs)}
    for layout, shape in LAYOUTS.items():
        E = {L: expected(shape, L, rollover=True) for L in LENGTHS}
        results[layout]["expected"] = E
        print(f"\n== {layout} ({len(directions(len(shape)))} direction(s), rising and falling, with rollover) ==")
        print("chance:        " + "  ".join(f"{L}+: {E[L]:>10,.2f}" for L in LENGTHS))
        rnd = [results[layout][f"random {i}"]["at_least"] for i in range(1, 21)]
        print("random (mean): " + "  ".join(f"{L}+: {np.mean([r[L] for r in rnd]):>10,.2f}" for L in LENGTHS))
        for name in NUMBERS:
            r = results[layout][name]
            print(f"{name:13}  " + "  ".join(f"{L}+: {r['at_least'][L]:>10,}" for L in LENGTHS) + f"  | longest {r['longest']}")
    print("\nFormula check, 200 random strings:")
    results["formula_check"] = {}
    for j, (name, shape) in enumerate((("1D", (1_000_000,)), ("2D", (1000, 1000)))):
        m = formula[:, j, :].mean(axis=0); se = formula[:, j, :].std(axis=0, ddof=1) / np.sqrt(len(formula))
        results["formula_check"][name] = {L: {"formula": expected(shape, L, rollover=True), "mean": m[i], "se": se[i]} for i, L in enumerate(LENGTHS)}
        print(name, "  ".join(f"{L}+: formula {expected(shape, L, rollover=True):9.3f}, random {m[i]:9.3f} ± {se[i]:.3f}" for i, L in enumerate(LENGTHS)))
    json.dump(results, open("analysis/results/counting/rollover_runs.json", "w"), indent=1, default=float)
    print("\nLong runs (7 or more) in pi, sqrt2, e and phi:")
    for layout in LAYOUTS:
        for name in ("pi", "sqrt2", "e", "phi"):
            for r in results[layout][name]["long_runs"]:
                print(f"  {layout:15} {name:6} {r['digits']} at decimal place {r['first_decimal_place']:,} (step {r['step_in_places']:,} places, direction {r['direction']})")
