"""How unusual is it that the Leibniz number has two runs of six starting only 9 places apart
(999999 at decimal place 136,524 and 666666 at 136,533)?

Run from the project folder:  python3 analysis/scripts/leibniz/close_runs.py

For 20,000 strings of a million random digits, find the runs of six or more of the same digit and the
smallest distance between the starts of two of them. Compare with the four constants.
"""
import numpy as np
from multiprocessing import Pool

def run_starts(d, length=6):
    """Starting places of runs of `length` or more of the same digit."""
    breaks = np.flatnonzero(np.diff(d) != 0) + 1
    starts = np.concatenate(([0], breaks)); ends = np.concatenate((breaks, [len(d)]))
    return starts[(ends - starts) >= length]

def closest(d):
    s = run_starts(d)
    return int(np.diff(s).min()) if len(s) > 1 else 10**9

def random_closest(seed):
    return closest(np.random.default_rng(9_000 + seed).integers(0, 10, 1_000_000))

if __name__ == "__main__":
    for name, f in [("pi", "pi_1M"), ("sqrt2", "sqrt2_1M"), ("e", "e_1M"), ("phi", "phi_1M"), ("leibniz", "leibniz_500k_1M")]:
        d = np.frombuffer(open(f"analysis/digits/{f}.txt").read()[1:].encode(), dtype=np.uint8).astype(np.int16) - 48
        print(f"{name:8} closest two runs of six or more start {closest(d):,} places apart")
    with Pool(12) as pool:
        gaps = np.array(pool.map(random_closest, range(20_000)))
    for limit in (9, 20, 100, 1000):
        print(f"random strings with two such runs starting within {limit} places: {(gaps <= limit).sum()} of 20,000")
