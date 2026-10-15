# Method 2: Gauss-Legendre iteration with the decimal module (different algorithm, different arithmetic)
import time
from decimal import Decimal as D, getcontext
t0 = time.time()
getcontext().prec = 1_000_000 + 50
a, b, t, p = D(1), D(1)/D(2).sqrt(), D(1)/4, D(1)
for i in range(25):
    an = (a+b)/2; b = (a*b).sqrt(); t -= p*(a-an)**2; a = an; p *= 2
pi = (a+b)**2/(4*t)
open('gl.txt','w').write(str(pi).replace('.','')[:1_000_001])
print('gauss-legendre done', round(time.time()-t0,1), 's')
