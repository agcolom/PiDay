import re
import sys; sys.set_int_max_str_digits(0)
src = open('pi.js').read()
block = src.split('const piDigits =')[1].split(';')[0]
s = ''.join(re.findall(r'"(\d+)"', block))
print("digits in file:", len(s))

# True pi via Machin-like spigot (integer arithmetic)
def pi_digits(n):
    prec = n + 20
    one = 10**prec
    def arctan_inv(x):
        total = term = one // x; x2 = x*x; k = 1; sign = -1
        while term:
            term //= x2; k += 2
            total += sign * (term // k); sign = -sign
        return total
    p = 4*(4*arctan_inv(5) - arctan_inv(239))
    return str(p)[:n]
true = pi_digits(len(s) + 2000)

first_bad = next((i for i,(a,b) in enumerate(zip(s,true)) if a!=b), None)
print("first mismatch with real pi at index:", first_bad)

# longest repeated substring (simple suffix sort)
sa = sorted(range(len(s)), key=lambda i: s[i:])
best=(0,0,0)
for a,b in zip(sa, sa[1:]):
    l=0
    while a+l<len(s) and b+l<len(s) and s[a+l]==s[b+l]: l+=1
    if l>best[0]: best=(l,min(a,b),max(a,b))
L,i,j=best
print(f"longest repeat: {L} digits, at index {i} and {j} (offset {j-i})")

# where does the file rejoin real pi?
for k in range(j, len(s)):
    pass
idx = true.find(s[j+L:j+L+30])
print("after repeat, file continues at real-pi index:", idx, "(file index", j+L, ")")

# longest repeat in genuine pi of the same length
t = true[:len(s)]
sa = sorted(range(len(t)), key=lambda i: t[i:])
m=0
for a,b in zip(sa, sa[1:]):
    l=0
    while a+l<len(t) and b+l<len(t) and t[a+l]==t[b+l]: l+=1
    m=max(m,l)
print("longest repeat in real pi over same length:", m)
fixed = s[:1901] + s[2834:]
print("file minus copy == real pi prefix:", fixed == true[:len(fixed)], len(fixed))
print("Feynman point 999999 at index:", true.find("999999"))
