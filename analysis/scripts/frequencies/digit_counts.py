"""Does each digit 0-9 appear equally often? Chi-squared test on the verified digits.

Run from the project folder:  python3 analysis/scripts/frequencies/digit_counts.py

For n digits, each digit is expected n/10 times. The chi-squared statistic adds (count - n/10)^2 / (n/10)
over the ten digits. For random digits it follows a chi-squared distribution with 9 degrees of freedom
(10 digits, minus 1 because the counts must add up to n); p is how often random digits would give a
value at least this big. Counts start at the first decimal place (the whole-number part is left out).
"""
import json, math
import numpy as np

NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M", "leibniz": "leibniz_500k_1M"}
STRETCHES = (1_000, 10_000, 100_000, 1_000_000)
BLOCK = 10_000

def upper_gamma_regularized(a, x):
    """Q(a, x), the regularized upper incomplete gamma function (series / continued fraction)."""
    if x <= 0: return 1.0
    if x < a + 1:
        term = total = 1.0 / a; k = a
        while abs(term) > abs(total) * 1e-15:
            k += 1; term *= x / k; total += term
        return 1.0 - total * math.exp(-x + a * math.log(x) - math.lgamma(a))
    b = x + 1 - a; c = 1e300; d = 1 / b; h = d
    for i in range(1, 1000):
        an = -i * (i - a); b += 2
        d = an * d + b; d = 1e-300 if abs(d) < 1e-300 else d
        c = b + an / c; c = 1e-300 if abs(c) < 1e-300 else c
        d = 1 / d; delta = d * c; h *= delta
        if abs(delta - 1) < 1e-15: break
    return math.exp(-x + a * math.log(x) - math.lgamma(a)) * h

def chi_squared(counts):
    n = sum(counts); e = n / 10
    stat = sum((c - e) ** 2 / e for c in counts)
    return stat, upper_gamma_regularized(4.5, stat / 2)

def digit_counts(s): return np.bincount(np.frombuffer(s.encode(), dtype=np.uint8) - 48, minlength=10).tolist()

if __name__ == "__main__":
    decimals = {n: open(f"analysis/digits/{f}.txt").read()[1:1_000_001] for n, f in NUMBERS.items()}
    decimals["sqrt2, decimals 1,000,001-2,000,000"] = open("analysis/digits/sqrt2_second_1M.txt").read()
    rng = np.random.default_rng(8008)
    randoms = {f"random {i}": "".join(map(str, rng.integers(0, 10, 1_000_000))) for i in range(1, 21)}
    out = {}
    for name, s in {**decimals, **randoms}.items():
        stretches = {}
        for n in STRETCHES:
            if n > len(s): continue
            c = digit_counts(s[:n]); stat, p = chi_squared(c)
            stretches[n] = {"counts": c, "chi2": stat, "p": p}
        blocks = [chi_squared(digit_counts(s[i:i + BLOCK]))[1] for i in range(0, len(s), BLOCK)]
        out[name] = {"stretches": stretches, "blocks_below_5pct": sum(p < 0.05 for p in blocks),
                     "blocks_below_1pct": sum(p < 0.01 for p in blocks), "smallest_block_p": min(blocks)}
    json.dump(out, open("analysis/results/frequencies/digit_counts.json", "w"), indent=1)

    for name in decimals:
        print(f"\n{name}")
        for n, r in out[name]["stretches"].items():
            share = " ".join(f"{d}:{100 * c / n:5.2f}%" for d, c in enumerate(r["counts"]))
            print(f"  first {n:>9,}: chi2 {r['chi2']:7.2f}, p {r['p']:.3f} | {share}")
        b = out[name]
        print(f"  100 blocks of 10,000: {b['blocks_below_5pct']} below 5%, {b['blocks_below_1pct']} below 1%, smallest p {b['smallest_block_p']:.4f}")
    rb = [out[r]["blocks_below_5pct"] for r in randoms]
    rp = [out[r]["stretches"][1_000_000]["p"] for r in randoms]
    print(f"\n20 random strings: blocks below 5% range {min(rb)}-{max(rb)} (average {np.mean(rb):.1f}); "
          f"million-digit p values range {min(rp):.3f}-{max(rp):.3f}")
