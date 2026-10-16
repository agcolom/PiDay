"""Fold the 1000 x 1000 layout onto itself and look at where the two layers have the same digit.

Run from the project folder:  python3 analysis/scripts/3d/fold.py
For random digits every pair of squares matches with probability exactly 1/10, independently,
so the expected counts below are exact (apart from the edges, which are handled).
"""
import json
import numpy as np

S = 1000
NUMBERS = {"pi": "pi_1M", "sqrt2": "sqrt2_1M", "e": "e_1M", "phi": "phi_1M",
           "champernowne": "champernowne_1M", "1/9801": "one_over_9801_1M", "leibniz": "leibniz_500k_1M",
           "polygon96": "polygon96_1M", "liouville": "liouville_1M"}

def folds(A):
    """Match maps (True where the two layers agree), keeping one half; None marks squares left out."""
    lr = A[:, :S // 2] == A[:, ::-1][:, :S // 2]                     # column c meets column 999-c
    tb = A[:S // 2, :] == A[::-1, :][:S // 2, :]                     # row r meets row 999-r
    tr = A == A.T                                                    # (r, c) meets (c, r)
    ad = A == A[::-1, ::-1].T                                        # (r, c) meets (999-c, 999-r)
    upper = np.triu(np.ones((S, S), bool), 1)                        # keep one side, drop the fold line
    anti = np.flipud(np.tril(np.ones((S, S), bool), -1))             # cells strictly above the anti-diagonal
    return {"left onto right": (lr, np.ones_like(lr)), "top onto bottom": (tb, np.ones_like(tb)),
            "main diagonal": (tr, upper), "other diagonal": (ad, anti)}

def stats(m, keep):
    m = m & keep
    squares = int(keep.sum())
    blocks = keep[:-1, :-1] & keep[1:, :-1] & keep[:-1, 1:] & keep[1:, 1:]
    two_by_two = int((m[:-1, :-1] & m[1:, :-1] & m[:-1, 1:] & m[1:, 1:]).sum())
    def runs5(mm, kk):                                               # runs of 5+ matches along rows
        r = 0; e = 0.0
        for row, krow in zip(mm, kk):
            idx = np.flatnonzero(krow)
            if idx.size < 5: continue
            seg = row[idx[0]:idx[-1] + 1]
            n = seg.size
            # count maximal runs of >= 5 Trues
            padded = np.concatenate(([False], seg, [False]))
            d = np.diff(padded.astype(np.int8))
            starts, ends = np.flatnonzero(d == 1), np.flatnonzero(d == -1)
            r += int(((ends - starts) >= 5).sum())
            e += 0.1**5 * (1 + 0.9 * (n - 5))
        return r, e
    rr, er = runs5(m, keep); rc, ec = runs5(m.T, keep.T)
    return {"squares": squares, "match_share": float(m.sum() / squares),
            "two_by_two": two_by_two, "two_by_two_expected": float(blocks.sum() * 1e-4),
            "runs5": rr + rc, "runs5_expected": er + ec}

if __name__ == "__main__":
    rng = np.random.default_rng(4004)
    sources = {n: open(f"analysis/digits/{f}.txt").read()[:S * S] for n, f in NUMBERS.items()}
    for i in (1, 2): sources[f"random {i}"] = "".join(map(str, rng.integers(0, 10, S * S)))
    out = {}
    for name, d in sources.items():
        A = (np.frombuffer(d.encode(), dtype=np.uint8) - 48).reshape(S, S)
        for fold, (m, keep) in folds(A).items():
            st = stats(m, keep)
            out.setdefault(fold, {})[name] = st
    for fold, per in out.items():
        any_ = next(iter(per.values()))
        print(f"\n== {fold}: {any_['squares']:,} squares | chance: 10.00% match, "
              f"{any_['two_by_two_expected']:.1f} all-matching 2x2 groups, {any_['runs5_expected']:.1f} runs of 5+ ==")
        for name, st in per.items():
            print(f"{name:13} {st['match_share']:7.2%} | 2x2: {st['two_by_two']:>9,} | runs of 5+: {st['runs5']:>9,}")
    json.dump(out, open("analysis/results/3d/fold.json", "w"), indent=1)
