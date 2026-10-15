import sys, re; sys.set_int_max_str_digits(0)
N = 1_000_000

# 1/9801. Index 0 is the whole-number part "0", so index k = decimal place k (same as the other numbers)
a = "0" + str(10**N // 9801).zfill(N)                       # method 1: long division
period = "".join(f"{n:02d}" for n in range(100) if n != 98)   # method 2: 00 01 ... 97 99, repeated
b = "0" + (period * (N // len(period) + 1))[:N]
print("1/9801: period", len(period), "| methods agree:", a == b, "| starts 0.", a[1:25])
open("r9801.txt", "w").write(a)

# Champernowne: 0.123456789101112...
c = "0" + "".join(str(n) for n in range(1, 200_000))[:N]   # method 1: write the numbers out
def digit_at(k):                                            # method 2: formula for decimal place k
    length, count, start = 1, 9, 1
    while k > length * count:
        k -= length * count; length += 1; count *= 10; start *= 10
    number = start + (k - 1) // length
    return str(number)[(k - 1) % length]
mismatches = [k for k in range(1, N + 1) if c[k] != digit_at(k)]   # every decimal place, 1 to N
print("Champernowne: formula agrees at all", N, "places:", not mismatches, "| starts 0.", c[1:25])
assert not mismatches, mismatches[:10]
open("champ.txt", "w").write(c)

for name, s in [("1/9801", a), ("Champernowne", c)]:
    runs = [(m.start(), m.group()) for m in re.finditer(r'(\d)\1{5,}', s)]
    longest = max((len(r) for _, r in runs), default=0)
    print(f"{name}: runs of 6+: {len(runs)}, longest {longest}", [x for x in runs if len(x[1]) == longest][:4], "| first:", runs[:1],
          "| longest run of any length:", max(len(m.group()) for m in re.finditer(r'(\d)\1*', s)))
