import numpy as np, json
from multiprocessing import Pool
s = open('/tmp/e1m/series.txt').read()
N = len(s)
a = np.frombuffer(s.encode(), dtype=np.uint8) - 48
SHAPES = [(3,4),(4,3),(2,6),(6,2),(3,5),(5,3),(2,7),(7,2),(4,4),(2,8),(8,2),(3,6),(6,3),(2,9),(9,2)]

def scan(W):
    rows = N // W
    g = a[:rows*W].reshape(rows, W).astype(np.int64)
    out = []
    for h, w in SHAPES:
        R, C = rows-h+1, W-w+1
        if R < 2 or C < 1: continue
        code = np.zeros((R, C), dtype=np.int64)
        for r in range(h):
            for c in range(w):
                code = code*10 + g[r:r+R, c:c+C]
        flat = np.sort(code.ravel())
        dup = np.unique(flat[1:][flat[1:] == flat[:-1]])
        for v in dup:
            pos = np.nonzero(code.ravel() == v)[0]
            out.append((h, w, [(int(p//C)*W + int(p%C)) for p in pos]))
    return W, out, rows

if __name__ == "__main__":
    with Pool(12) as pool:
        res = pool.map(scan, range(2, 2001))
    tally, expected, examples = {}, {}, {}
    for W, out, rows in res:
        for h, w in SHAPES:
            R, C = rows-h+1, W-w+1
            if R < 2 or C < 1: continue  # block doesn't fit at this width (fixed after review, 15 Oct 2026)
            expected[(h,w)] = expected.get((h,w), 0) + R*C*(R*C-1)/2 * 10.0**-(h*w)
        for h, w, pos in out:
            tally[(h,w)] = tally.get((h,w), 0) + 1
            examples.setdefault((h,w), []).append((W, pos))
    print(f"{'shape':>6} {'squares':>7} {'found':>6} {'chance':>8}")
    for h, w in sorted(SHAPES, key=lambda x: (x[0]*x[1], x)):
        print(f"{h}x{w:<4} {h*w:>7} {tally.get((h,w),0):>6} {expected[(h,w)]:>8.2f}")
    big = {k: v for k, v in examples.items() if k[0]*k[1] >= 14}
    json.dump({f"{k[0]}x{k[1]}": v for k, v in big.items()}, open('/tmp/e1m/big2000.json','w'))
    for k, v in big.items(): print(k, v)
