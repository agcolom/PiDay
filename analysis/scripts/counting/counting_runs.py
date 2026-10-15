"""Counting runs: digits that go up by one (123456) or down by one (987654), with no wrapping from 9 to 0.

Run from the project folder:  python3 analysis/scripts/counting/counting_runs.py

Part 1: along the digits (the order they come in).
Part 2: straight lines in the same 2D, 3D and 4D boxes as analysis/scripts/3d/alignments.py,
        where the digits count up (or down) by one at every step along the line.
A run is maximal: the digit before it does not continue the count (or is outside the box).

Chance, for random digits: a rising run of length L or more starts at a given place when its first digit
d is at most 10 - L (so the count fits below 9) and each of the next L - 1 digits is one more than the
last (probability 10^-(L-1)); and the digit before it is not d - 1 (probability 9/10, or 1 when d = 0 or
there is no digit before). Falling runs are the mirror image. So per possible start:
  10^-(L-1) x (1/10) x [ (11 - L) if nothing comes before, else 1 + 0.9 x (10 - L) ], for each direction of counting.
"""
import itertools, json, sys
import numpy as np
from multiprocessing import Pool

LAYOUTS = {"1D 1,000,000": (1_000_000,), "2D 1000x1000": (1000, 1000), "3D 100x100x100": (100, 100, 100),
           "4D 31x31x31x31": (31, 31, 31, 31)}
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M"}
LENGTHS = (4, 5, 6, 7, 8)
PAD = 12
EMPTY = -100   # padding value that can never continue a count

def directions(d):
    return [v for v in itertools.product((-1, 0, 1), repeat=d) if any(v) and next(x for x in v if x) == 1]

def counting_runs(digits, shape, record_from=7):
    """Maximal rising and falling runs along every direction: counts by length, plus where the long ones are."""
    n = int(np.prod(shape))
    A = np.full(tuple(s + 2 * PAD for s in shape), EMPTY, dtype=np.int16)
    A[tuple(slice(PAD, PAD + s) for s in shape)] = (np.frombuffer(digits[:n].encode(), dtype=np.uint8).astype(np.int16) - 48).reshape(shape)
    inside = A != EMPTY
    strides = [int(np.prod(shape[i + 1:])) for i in range(len(shape))]
    counts, long_runs = {}, []
    axes = tuple(range(len(shape)))
    for v in directions(len(shape)):
        shift = lambda m: np.roll(A, shift=tuple(-m * x for x in v), axis=axes)   # value at c + m v
        prev = shift(-1)
        for step in (1, -1):                                                       # counting up, counting down
            alive = inside & (prev != A - step)                                    # the digit before doesn't continue the count
            length = 1
            while alive.any() and length <= 10:
                longer = alive & (shift(length) == A + step * length)
                ended = alive & ~longer
                k = int(ended.sum())
                if length >= LENGTHS[0] and k:
                    counts[length] = counts.get(length, 0) + k
                    if length >= record_from:
                        for idx in np.argwhere(ended):
                            c = [int(i) - PAD for i in idx]
                            place = sum(a * b for a, b in zip(c, strides))
                            jump = sum(a * b for a, b in zip(v, strides))
                            long_runs.append({"length": length, "first_decimal_place": place, "step_in_places": jump,
                                              "direction": list(v), "digits": "".join(digits[place + i * jump] for i in range(length))})
                alive, length = longer, length + 1
    return counts, long_runs

def expected(shape, L):
    total = 0.0
    for v in directions(len(shape)):
        reach = np.prod([s - (L - 1) * abs(x) for s, x in zip(shape, v)])
        interior = np.prod([max(s - L * abs(x), 0) for s, x in zip(shape, v)])
        if reach <= 0: continue
        boundary = reach - interior
        total += 2 * 10.0 ** -(L - 1) * 0.1 * (boundary * (11 - L) + interior * (1 + 0.9 * (10 - L)))
    return total

def job(args):
    name, digits, layout = args
    counts, long_runs = counting_runs(digits, LAYOUTS[layout])
    at_least = {L: sum(m for k, m in counts.items() if k >= L) for L in LENGTHS}
    return name, layout, at_least, max(counts) if counts else 0, long_runs

if __name__ == "__main__":
    sources = {n: open(f"analysis/digits/{f}.txt").read()[:1_000_000] for n, f in NUMBERS.items()}
    rng = np.random.default_rng(6006)
    for i in range(1, 21):
        sources[f"random {i}"] = "".join(map(str, rng.integers(0, 10, 1_000_000)))
    jobs = [(n, s, layout) for layout in LAYOUTS for n, s in sources.items()]
    with Pool(12) as p:
        res = p.map(job, jobs)
    results = {}
    for name, layout, at_least, longest, long_runs in res:
        results.setdefault(layout, {})[name] = {"at_least": at_least, "longest": longest,
                                                "long_runs": long_runs if not name.startswith("random") and name not in ("champernowne", "1/9801") else len(long_runs)}
    for layout, shape in LAYOUTS.items():
        E = {L: expected(shape, L) for L in LENGTHS}
        results[layout]["expected"] = E
        print(f"\n== {layout} ({len(directions(len(shape)))} direction(s), rising and falling) ==")
        print("chance:        " + "  ".join(f"{L}+: {E[L]:>10,.2f}" for L in LENGTHS))
        rnd = [results[layout][f"random {i}"]["at_least"] for i in range(1, 21)]
        print("random (mean): " + "  ".join(f"{L}+: {np.mean([r[L] for r in rnd]):>10,.2f}" for L in LENGTHS))
        for name in NUMBERS:
            r = results[layout][name]
            print(f"{name:13}  " + "  ".join(f"{L}+: {r['at_least'][L]:>10,}" for L in LENGTHS) + f"  | longest {r['longest']}")
    json.dump(results, open("analysis/results/counting/counting_runs.json", "w"), indent=1, default=str)
    print("\nLong runs (7 or more) in pi, sqrt2, e and phi:")
    for layout in LAYOUTS:
        for name in ("pi", "sqrt2", "e", "phi"):
            for r in results[layout][name]["long_runs"]:
                print(f"  {layout:15} {name:6} {r['digits']} at decimal place {r['first_decimal_place']:,} (step {r['step_in_places']:,} places, direction {r['direction']})")
