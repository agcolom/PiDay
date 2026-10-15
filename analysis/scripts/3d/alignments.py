"""Straight lines of one repeated digit in 2D, 3D and 4D arrangements of the digits.

Run from the project folder:  python3 analysis/scripts/3d/alignments.py
Digit k goes to coordinates by filling the last axis first (like the mosaic's rows),
so a step along a direction v is a fixed jump in decimal places.
A "line of length L" is L cells in a straight line, inside the box (no wrapping), all the same
digit, and maximal (the cells just before and after are outside the box or a different digit).
"""
import itertools, json, sys
import numpy as np

LAYOUTS = {"2D 1000x1000": (1000, 1000), "3D 100x100x100": (100, 100, 100), "4D 31x31x31x31": (31, 31, 31, 31)}
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M"}
LENGTHS = (5, 6, 7, 8)
PAD = 40

def directions(d):
    """One of each pair of opposite directions: (3^d - 1) / 2 of them."""
    return [v for v in itertools.product((-1, 0, 1), repeat=d) if any(v) and next(x for x in v if x) == 1]

def runs(digits, shape):
    """For each direction: list of maximal run lengths >= min(LENGTHS) (as counts by length)."""
    n = int(np.prod(shape))
    A = np.full(tuple(s + 2 * PAD for s in shape), -1, dtype=np.int8)
    A[tuple(slice(PAD, PAD + s) for s in shape)] = (np.frombuffer(digits[:n].encode(), dtype=np.uint8) - 48).reshape(shape)
    inside = A >= 0
    out = {}
    for v in directions(len(shape)):
        shift = lambda m: np.roll(A, shift=tuple(-m * x for x in v), axis=tuple(range(len(shape))))  # value at c + m v
        prev = shift(-1)
        start = inside & (prev != A)                       # c - v is outside or a different digit
        same = start.copy(); length = 1; counts = {}
        while same.any():
            nxt = shift(length)
            longer = same & (nxt == A)                     # cells c..c+length*v all equal
            ended = int((same & ~longer).sum())            # maximal runs of exactly `length` cells
            if length >= LENGTHS[0] and ended: counts[length] = ended
            same, length = longer, length + 1
        out[v] = counts
    return out

def expected(shape, L):
    """Expected maximal runs of length >= L for random digits, summed over all directions."""
    total = 0.0
    for v in directions(len(shape)):
        reach = np.prod([s - (L - 1) * abs(x) for s, x in zip(shape, v)])     # c and c+(L-1)v inside
        interior = np.prod([max(s - L * abs(x), 0) for s, x in zip(shape, v)])  # ... and c-v inside too
        if reach <= 0: continue
        total += 10.0 ** -(L - 1) * ((reach - interior) + 0.9 * interior)
    return total

if __name__ == "__main__":
    rng = np.random.default_rng(2026)
    sources = {name: open(f"analysis/digits/{f}.txt").read() for name, f in NUMBERS.items()}
    for i in (1, 2):
        sources[f"random {i}"] = "".join(map(str, rng.integers(0, 10, 1_000_000)))
    results = {}
    for layout, shape in LAYOUTS.items():
        print(f"\n== {layout}: {len(directions(len(shape)))} directions, {int(np.prod(shape)):,} digits ==")
        print("expected for random digits: " + ", ".join(f"{L}+: {expected(shape, L):,.2f}" for L in LENGTHS))
        for name, digits in sources.items():
            per_dir = runs(digits, shape)
            allruns = {}
            for c in per_dir.values():
                for k, m in c.items(): allruns[k] = allruns.get(k, 0) + m
            atleast = {L: sum(m for k, m in allruns.items() if k >= L) for L in LENGTHS}
            longest = max(allruns) if allruns else 0
            best_dirs = [list(v) for v, c in per_dir.items() if longest in c]
            results.setdefault(layout, {})[name] = {"at_least": atleast, "longest": longest, "longest_directions": best_dirs}
            print(f"{name:13} " + ", ".join(f"{L}+: {atleast[L]:>9,}" for L in LENGTHS) + f" | longest {longest} in {len(best_dirs)} direction(s)")
        results[layout]["expected"] = {L: expected(shape, L) for L in LENGTHS}
    json.dump(results, open("analysis/results/3d/alignments.json", "w"), indent=1, default=str)
