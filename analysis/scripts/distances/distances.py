"""Every distance at once: do digits a fixed number of places apart match more (or less) often than chance?

Run from the project folder:  python3 analysis/scripts/distances/distances.py

Every shape we tried (rows, columns, cube layers, diagonals) only ever compares digits a fixed number of
places apart. So instead of trying shapes one at a time, this test looks at every gap d from 1 to 100,000
(chosen before looking), using decimal places 1 to 1,000,000. For each gap it counts the pairs of decimal
places (k, k + d) where the two digits are related in one of four ways:
  same      the same digit                         (e.g. 7 ... 7)
  nine      the two digits add up to 9             (e.g. 2 ... 7)
  up        the second is one more, 9 rolls to 0   (e.g. 4 ... 5, 9 ... 0)
  down      the second is one less, 0 rolls to 9   (e.g. 5 ... 4, 0 ... 9)
For random digits each relation holds with probability exactly 1/10, so with n = 1,000,000 - d pairs the
count is n/10 on average with standard deviation sqrt(0.09 n). z = (count - n/10) / sqrt(0.09 n).
(The pairs overlap, but for random digits any two of them are independent, so this variance is exact,
and counts at different gaps are uncorrelated.)

With 100,000 gaps, a few |z| of 4 or more are expected by chance. So the summary for each relation is:
  biggest |z|, and the chance that random digits give one at least that big somewhere among 100,000 gaps
  how many gaps have |z| >= 4 (about 6.3 expected)
  the average z^2 over all gaps (1 for random digits): a check on the whole set at once
20 strings of random digits are run through the same test as a control.
Counts for all gaps come from FFTs (sums of products of digit indicators), then rounded to whole numbers;
a sample of gaps is recounted directly to check them.
"""
import json, math
import numpy as np

N, D = 1_000_000, 100_000
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M", "leibniz": "leibniz_500k_1M",
           "polygon96": "polygon96_1M", "liouville": "liouville_1M"}
PARTNER = {"same": lambda v: v, "nine": lambda v: 9 - v, "up": lambda v: (v + 1) % 10, "down": lambda v: (v - 1) % 10}

def counts_by_gap(d):
    """For each relation, the number of pairs (k, k + gap) where it holds, for gap = 1 .. D."""
    size = 1 << (2 * N - 1).bit_length()
    F = [np.fft.rfft((d == v).astype(np.float64), size) for v in range(10)]
    out = {}
    for name, partner in PARTNER.items():
        spectrum = sum(np.conj(F[v]) * F[partner(v)] for v in range(10))   # sum_k [d_k = v][d_k+gap = partner(v)]
        out[name] = np.rint(np.fft.irfft(spectrum, size)[1:D + 1]).astype(np.int64)
    return out

def direct(d, name, gap):
    a, b = d[:-gap], d[gap:]
    return int({"same": a == b, "nine": a + b == 9, "up": b == (a + 1) % 10, "down": b == (a - 1) % 10}[name].sum())

def summary(counts):
    n = N - np.arange(1, D + 1)
    out = {}
    for name, c in counts.items():
        z = (c - n / 10) / np.sqrt(0.09 * n)
        i = int(np.argmax(np.abs(z)))
        tail = math.erfc(abs(z[i]) / math.sqrt(2))                    # chance of |z| this big at one gap
        out[name] = {"max_abs_z": round(float(abs(z[i])), 3), "z": round(float(z[i]), 3), "gap": i + 1,
                     "share_at_gap": round(float(c[i] / n[i]), 5),
                     "chance_anywhere": float(-math.expm1(D * math.log1p(-tail))),   # 1 - (1 - tail)^D
                     "gaps_z4": int((np.abs(z) >= 4).sum()), "mean_z2": round(float(np.mean(z * z)), 4),
                     "top": [{"gap": int(g) + 1, "z": round(float(z[g]), 2)} for g in np.argsort(-np.abs(z))[:5]]}
    return out

if __name__ == "__main__":
    rng = np.random.default_rng(31415)
    results, check = {}, []
    sources = {name: open(f"analysis/digits/{f}.txt").read()[1:N + 1] for name, f in NUMBERS.items()}
    for i in range(1, 21):
        sources[f"random {i}"] = rng.integers(0, 10, N)
    for name, s in sources.items():
        d = s if isinstance(s, np.ndarray) else np.frombuffer(s.encode(), dtype=np.uint8).astype(np.int64) - 48
        counts = counts_by_gap(d)
        for rel in PARTNER:                                            # recount some gaps the slow way
            for gap in (1, 2, 99, 198, 9801, D, *rng.integers(1, D + 1, 3)):
                check.append(counts[rel][gap - 1] == direct(d, rel, int(gap)))
        results[name] = summary(counts)
        print(name, " | ".join(f"{r}: max|z| {v['max_abs_z']} at gap {v['gap']:,}, |z|>=4: {v['gaps_z4']}, mean z^2 {v['mean_z2']}"
                               for r, v in results[name].items()), flush=True)
    print("direct recounts agree:", all(check), f"({len(check)} checked)")
    expected_z4 = D * math.erfc(4 / math.sqrt(2))
    print(f"\nexpected for random digits: |z|>=4 at about {expected_z4:.1f} gaps; mean z^2 about 1")
    for rel in PARTNER:
        r = [results[f"random {i}"][rel] for i in range(1, 21)]
        print(f"random strings, {rel}: max|z| {min(x['max_abs_z'] for x in r)}-{max(x['max_abs_z'] for x in r)}, "
              f"|z|>=4 {min(x['gaps_z4'] for x in r)}-{max(x['gaps_z4'] for x in r)}, "
              f"mean z^2 {min(x['mean_z2'] for x in r)}-{max(x['mean_z2'] for x in r)}")
    print()
    for name in NUMBERS:
        for rel, v in results[name].items():
            print(f"{name:13} {rel:5} max|z| {v['max_abs_z']:8.2f} (z {v['z']:+.2f}) at gap {v['gap']:>7,}"
                  f" share {v['share_at_gap']:.4f}  chance anywhere {v['chance_anywhere']:.3g}"
                  f"  |z|>=4: {v['gaps_z4']:>6,}  mean z^2 {v['mean_z2']:.3f}")
    json.dump({"N": N, "D": D, "expected_gaps_z4": expected_z4, "results": results},
              open("analysis/results/distances/distances.json", "w"), indent=1)
