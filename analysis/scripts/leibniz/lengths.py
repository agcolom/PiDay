"""How far the Leibniz pattern reaches as the series gets longer: T = 5, 50, 500, ... terms (N = 2T = 10^k).

Run from the project folder:  python3 analysis/scripts/leibniz/lengths.py

For each k, the digits of 4 x (first T terms) are compared with pi, measuring
  - the first decimal that differs (how good an approximation it is), and
  - where the pattern ends: the last decimal place ending 5 decimals in a row that all match pi
    (as in leibniz.py; for unrelated digits such a stretch turns up about once in 100,000 places).
Up to 5,000,000 terms the terms are added directly. Beyond that the digits come from the Borwein-Borwein-Dilcher
formula pi - 4 x (first T terms) = sum of 2 E_2m / N^(2m+1), which leibniz.py checked against direct sums
for 50,000, 500,000 and 5,000,000 terms (and which this script checks again for k = 4 to 7).
Each comparison uses D decimals, at least four times as many as the pattern reaches.
As a check on the measure, the end is also found with stretches of 6 (stretches of 4 are too common by
chance over thousands of decimals), and compared with theory: cluster m ends at decimal place k(2m + 1) and
is about as wide as 2|E_2m|, so the clusters merge at the first m where 2|E_2m| has 2k digits or more.
"""
import json, math, sys
sys.set_int_max_str_digits(0)
sys.path.insert(0, "analysis/scripts/leibniz")
from leibniz import euler_numbers, by_adding, by_formula, matches, last_stretch

PI = open("analysis/digits/pi_1M.txt").read()

def digits_for(k, D, E):
    terms = 5 * 10 ** (k - 1)
    if k <= 7:
        a = by_adding(terms, D)
        if k >= 4: assert a == by_formula(terms, E, D), f"methods disagree at k = {k}"
        return a
    return by_formula(terms, E, D)

if __name__ == "__main__":
    E = euler_numbers(1200)
    rows = []
    print(f"{'terms':>10} {'correct decimals':>17} {'pattern ends at':>16} {'(stretch of 6)':>15} {'clusters merge':>15} {'decimals compared':>18}")
    for k in range(1, 31):
        D = 400
        while True:
            x = digits_for(k, D, E)
            same = matches(x)
            first_wrong = same.index(False)
            end = last_stretch(same)
            if D >= 4 * max(end, 50): break
            D *= 2
        end6 = last_stretch(same, 6)
        m = next(m for m in range(len(E)) if len(str(2 * abs(E[m]))) >= 2 * k)
        rows.append({"k": k, "terms": f"5 x 10^{k - 1}", "correct_decimals": first_wrong - 1, "pattern_end": end,
                     "pattern_end_stretch6": end6, "clusters_merge": k * (2 * m + 1), "D": D})
        print(f"{'5 x 10^' + str(k - 1):>10} {first_wrong - 1:>17} {end:>16} {end6:>15} {k * (2 * m + 1):>15} {D:>18}")
    json.dump(rows, open("analysis/results/leibniz/lengths.json", "w"), indent=1)
