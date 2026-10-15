s = open('/tmp/js_digits.txt').read()
for W, (r1,c1), (r2,c2) in [(147,(90,80),(127,71)), (148,(89,137),(126,91))]:
    print(f"width {W}:")
    for (r,c) in [(r1,c1),(r2,c2)]:
        rows = [s[(r+i)*W+c:(r+i)*W+c+4] for i in range(3)]
        starts = [(r+i)*W+c for i in range(3)]
        print(f"  row {r+1}, col {c+1}: {rows}  digit positions {starts}")
