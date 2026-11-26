# Problem 1: check every number on the slides (standard library only).
import math, random, statistics as st
from statistics import NormalDist
Phi = NormalDist().cdf
x = [235,199,211,155,210,147,88,91,167,176,169,175,141,172,197,187]
n, v, MU0, MU, SIG = 16, 15, 150, 165, 45
xbar, s = st.mean(x), st.stdev(x); se = s/4; t = (xbar-MU0)/se
print("sum", sum(x), "ss", sum((a-xbar)**2 for a in x), "xbar", xbar, "s", s, "se", se, "t", t)
c = math.gamma(8)/(math.sqrt(v*math.pi)*math.gamma(7.5))
f = lambda u: c*(1+u*u/v)**(-8)
def simpson(g, a, b, m=4000):
    h = (b-a)/m
    return h/3*(g(a)+g(b)+sum((4 if i % 2 else 2)*g(a+i*h) for i in range(1, m)))
tail = lambda q: .5-simpson(f, 0, q)
def crit(p):
    lo, hi = 0, 10
    for _ in range(60):
        m = (lo+hi)/2; lo, hi = (m, hi) if tail(m) > p else (lo, m)
    return lo
for a in (.10, .05, .01):
    q = crit(a/2); print("CI", 1-a, round(q,3), round(q*se,2), round(xbar-q*se,2), round(xbar+q*se,2))
c1, c2 = crit(.05), crit(.025)
print("p one %.4f two %.4f" % (tail(t), 2*tail(t)))
print("xbar cutoffs: one-sided", MU0+c1*se, "two-sided", MU0-c2*se, MU0+c2*se)
# exact power: T = (Z+d)/sqrt(W/15), W ~ chi2(15)
chi = lambda w: w**6.5*math.exp(-w/2)/(2**7.5*math.gamma(7.5))
def power(d, q, two):
    g = lambda w: chi(w)*(Phi(d-q*math.sqrt(w/v)) + (Phi(-d-q*math.sqrt(w/v)) if two else 0))
    return simpson(g, 1e-12, 100)
d = (MU-MU0)/(SIG/4)
print("delta", d, "power one", power(d,c1,False), "two", power(d,c2,True))
print("size   one", power(0,c1,False), "two", power(0,c2,True))
z = (xbar-MU)/(SIG/4)
print("true SE", SIG/4, "z", z, "P(|err|>=5)", 2*(1-Phi(abs(z))))
SEED, R = 2026, 400000; r = random.Random(SEED); h = [0,0,0]
for _ in range(R):
    y = [r.gauss(MU, SIG) for _ in range(n)]; m = st.fmean(y); e = st.stdev(y)/4
    T = (m-MU0)/e; h[0] += T > c1; h[1] += abs(T) > c2; h[2] += abs(m-MU) <= c2*e
print("MC seed", SEED, "reps", R, "one %.4f two %.4f coverage95 %.4f" % tuple(k/R for k in h))
