import re
s = open('/tmp/pi1m/chud.txt').read()
N = len(s)
top, mid, bot = "7068", "1461", "2311"
starts = [m.start() for m in re.finditer(f"(?={top})", s)]
print(f"'{top}' appears {len(starts)} times in the first million digits")
found = []
for p in starts:
    for W in range(4, 5001):
        if s[p+W:p+W+4] == mid and s[p+2*W:p+2*W+4] == bot:
            found.append((p, W))
print("full 3x4 block (7068/1461/2311) at any width 4..5000:", found)
# The 148-column view starts one digit earlier: 0706 / 1461 / 3112
starts2 = [m.start() for m in re.finditer("(?=0706)", s)]
f2 = [(p, W) for p in starts2 for W in range(4, 5001)
      if s[p+W:p+W+4] == "1461" and s[p+2*W:p+2*W+4] == "3112"]
print("148-column version (0706/1461/3112) at any width:", f2)
