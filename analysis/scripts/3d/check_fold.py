"""Check fold.py's expected counts against 100 strings of random digits."""
import sys, numpy as np
from multiprocessing import Pool
sys.path.insert(0, "analysis/scripts/3d")
from fold import folds, stats, S

def one(seed):
    A = np.random.default_rng(20_000 + seed).integers(0, 10, (S, S))
    return [[st["match_share"], st["two_by_two"], st["runs5"]] for st in (stats(m, k) for m, k in folds(A).values())]

if __name__ == "__main__":
    with Pool(12) as p: res = np.array(p.map(one, range(100)))           # 100 strings x 4 folds x 3 measures
    A = np.random.default_rng(0).integers(0, 10, (S, S))
    exp = [stats(m, k) for m, k in folds(A).values()]
    for i, name in enumerate(["left onto right", "top onto bottom", "main diagonal", "other diagonal"]):
        r = res[:, i, :]
        print(f"{name:16} match share mean {r[:,0].mean():.4%} | 2x2 mean {r[:,1].mean():6.1f} (formula {exp[i]['two_by_two_expected']:.1f}) | "
              f"runs5 mean {r[:,2].mean():5.2f} (formula {exp[i]['runs5_expected']:.2f}), range {int(r[:,2].min())}-{int(r[:,2].max())}, "
              f"strings with 2 or fewer: {(r[:,2] <= 2).sum()}")
