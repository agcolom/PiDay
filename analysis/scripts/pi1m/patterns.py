import numpy as np
from collections import Counter
s = open('/tmp/js_digits.txt').read()
N = len(s)
a = np.frombuffer(s.encode(), dtype=np.uint8) - 48

def repeats(W, h, w):
    """All h-by-w blocks that appear more than once when the digits wrap at W columns."""
    rows = N // W                       # full rows only (every width tested keeps the grid full or nearly)
    g = a[:rows * W].reshape(rows, W).astype(np.int64)
    if rows < h or W < w: return []
    code = np.zeros((rows - h + 1, W - w + 1), dtype=np.int64)
    for r in range(h):
        for c in range(w):
            code = code * 10 + g[r:r + rows - h + 1, c:c + W - w + 1]
    flat = code.ravel()
    u, inv, cnt = np.unique(flat, return_inverse=True, return_counts=True)
    out = []
    for k in np.nonzero(cnt > 1)[0]:
        pos = np.nonzero(inv == k)[0]
        out.append([(p // (W - w + 1), p % (W - w + 1)) for p in pos])
    return out

# 1. Her current width
for (h, w) in [(2,2),(3,3),(2,4),(4,2),(2,5),(5,2),(3,4),(4,3),(4,4)]:
    r = repeats(192, h, w)
    print(f"width 192, {h}x{w} blocks repeated: {len(r)}", r[:3] if r and h*w >= 9 else "")

print("\n--- scanning widths 10..400 ---")
hits = {}
for W in range(10, 401):
    for (h, w) in [(3,3),(4,4),(3,4),(4,3),(3,5),(5,3),(2,6),(6,2),(2,7),(7,2)]:
        for grp in repeats(W, h, w):
            hits.setdefault((h, w), []).append((W, grp))
for k, v in sorted(hits.items(), key=lambda kv: -kv[0][0]*kv[0][1]):
    print(f"{k[0]}x{k[1]} ({k[0]*k[1]} squares): found at {len(v)} widths; e.g.", v[:3])

# chance baseline for 3x3: pairs of block positions * 10^-9, per width
pairs = N * N / 2
print(f"\nexpected 3x3 repeats per width by chance ~ {pairs*1e-9:.2f}; over 391 widths ~ {391*pairs*1e-9:.0f}")
print(f"expected 4x3 (12 squares) over all widths ~ {391*2*pairs*1e-12:.3f}")
