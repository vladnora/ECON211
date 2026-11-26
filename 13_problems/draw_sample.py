# Problem 1: draw the sample from N(165, 45^2), then nudge it so that xbar = 170 and s = 40 exactly.
import random, statistics as st
MU, SIG, N = 165, 45, 16
for seed in range(1, 10**6):
    r = random.Random(seed)
    raw = [r.gauss(MU, SIG) for _ in range(N)]
    m, s = st.mean(raw), st.stdev(raw)
    if abs(m-170) < 1.5 and abs(s-40) < 1.5 and min(raw) > 60:
        break
x = [round(170 + (v-m)*40/s) for v in raw]
def err(y): return abs(sum(y)-170*N)*1000 + abs(sum((v-170)**2 for v in y)-15*1600)
while err(x):
    best = min(([x[k]+(a if k==i else 0)+(b if k==j else 0) for k in range(N)]
                for i in range(N) for j in range(N) for a in (-1,1) for b in (-1,0,1) if i!=j), key=err)
    assert err(best) < err(x), "stuck"
    x = best
print("seed", seed, "raw mean %.2f sd %.2f" % (m, s))
print(x)
print("max change", max(abs(a-b) for a,b in zip(x,raw)))
print("check", st.mean(x), st.stdev(x))
