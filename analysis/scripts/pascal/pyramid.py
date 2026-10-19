"""Checks the browser's Pascal's triangle mod p (mosaic views) and Pascal's pyramid mod p (cube page).

Run from the project folder:  python3 analysis/scripts/pascal/pyramid.py   (needs node, for the browser's values)

Triangle: C(n, k) mod p for p = 2, 3, 5 (256, 243 and 125 rows), from digits.js, against
  method 1: exact binomial coefficients (math.comb), and
  method 2: Lucas's theorem, C(n, k) = product of C(n_i, k_i) over the base-p digits n_i, k_i (mod p).
Pyramid: (x + y + z)! / (x! y! z!) mod p on a cube of side 64, 81 and 25, from cube.js, against
  method 1: exact values, C(x + y, x) C(x + y + z, z), and
  method 2: Lucas's theorem for three groups: the product of the digit-by-digit values, which is 0 when some
            base-p place has x_i + y_i + z_i >= p.
Also counts the non-zero points and the copies described on the cube page. Writes analysis/results/pascal/checks.json.
"""
import json, subprocess
from math import comb, factorial

JS = r"""
const fs = require("fs");
eval(fs.readFileSync("digits.js", "utf8") + ";globalThis.cd = computeDigits");
const src = fs.readFileSync("cube.js", "utf8");
const start = src.indexOf("const pascalPyramid"), end = src.indexOf("\n};", start) + 3;
eval(src.slice(start, end) + ";globalThis.pp = pascalPyramid");
const out = { triangle: {}, pyramid: {} };
for (const [p, w] of [[2, 256], [3, 243], [5, 125]]) out.triangle[p] = cd["pascal" + p](w * w);
for (const [p, s] of [[2, 64], [3, 81], [5, 25]]) out.pyramid[p] = Array.from(pp(p, s)).join("");
process.stdout.write(JSON.stringify(out));
"""

def digits(n, p):
    while n:
        yield n % p
        n //= p

def lucas_binomial(n, k, p):
    r = 1
    while n or k:
        r = r * comb(n % p, k % p) % p
        n //= p; k //= p
    return r

def lucas_multinomial(x, y, z, p):
    r = 1
    while x or y or z:
        a, b, c = x % p, y % p, z % p
        if a + b + c >= p: return 0
        r = r * factorial(a + b + c) // (factorial(a) * factorial(b) * factorial(c)) % p
        x //= p; y //= p; z //= p
    return r

if __name__ == "__main__":
    js = json.loads(subprocess.run(["node", "-e", JS], capture_output=True, text=True, check=True).stdout)
    results = {}
    for p, w in ((2, 256), (3, 243), (5, 125)):
        exact = "".join(str(comb(n, k) % p) if k <= n else "." for n in range(w) for k in range(w))
        luc = "".join(str(lucas_binomial(n, k, p)) if k <= n else "." for n in range(w) for k in range(w))
        ok = js["triangle"][str(p)] == exact == luc
        results[f"triangle mod {p}"] = {"rows": w, "browser = exact = Lucas": ok}
        print(f"triangle mod {p}, {w} rows: browser, exact and Lucas agree: {ok}")
    for p, s in ((2, 64), (3, 81), (5, 25)):
        exact, luc = [], []
        for z in range(s):
            for y in range(s):
                for x in range(s):
                    exact.append(str(comb(x + y, x) * comb(x + y + z, z) % p))
                    luc.append(str(lucas_multinomial(x, y, z, p)))
        exact, luc = "".join(exact), "".join(luc)
        ok = js["pyramid"][str(p)] == exact == luc
        nonzero = sum(ch != "0" for ch in exact)
        copies = sum(1 for a in range(p) for b in range(p) for c in range(p) if a + b + c < p)
        results[f"pyramid mod {p}"] = {"side": s, "browser = exact = Lucas": ok, "non-zero points": nonzero,
                                       "copies per level": copies}
        print(f"pyramid mod {p}, side {s}: browser, exact and Lucas agree: {ok} | non-zero: {nonzero:,} | copies: {copies}")
    json.dump(results, open("analysis/results/pascal/checks.json", "w"), indent=1)
