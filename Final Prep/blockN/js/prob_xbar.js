/* Block N, part 2: the sampling distribution of the sample mean, and probabilities about it. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS, tbl = H.tbl;
  var T = H.T, PHI = H.PHI, Phi = H.Phi, f4 = H.f4, zs = H.zs, fx = H.fx, dn = H.dn, pn = H.pn, rz = H.rz, isDp = H.isDp, loc = H.loc, phiTxt = H.phiTxt, U = H.U, CTX = H.CTX;
  var XB = '<span class="xbar">X</span>';

  /* population mean mu, sd sigma, sample size n = k^2 so that SE = sigma/k is a short decimal */
  function drawSE(pool) {
    var c = pick(pool || CTX), mu = pick(c.mus);
    var sds = c.sds.filter(function (q) { return mu >= 3 * q; }); if (!sds.length) sds = [c.sds[0]];
    for (var g = 0; g < 300; g++) { var sd = pick(sds), k = pick([4, 5, 6, 8, 10]), se = sd / k; if (isDp(se, 2)) return { c: c, mu: mu, sd: sd, k: k, n: k * k, se: se }; }
    var sd0 = sds[0]; return { c: c, mu: mu, sd: sd0, k: 4, n: 16, se: sd0 / 4 };
  }
  function pickX(o, zlo, zhi, dp) {                       /* z (2 d.p.) so that mu + z*se has dp decimals */
    for (var g = 0; g < 400; g++) { var z = rz(zlo, zhi); if (isDp(o.mu + z * o.se, dp)) return z; }
    return 1.5;
  }
  function xe(o, z) { return Math.round((o.mu + z * o.se) * 100) / 100; }
  function sampTxt(o, extra) {
    return '<p>Let <i>X</i> be ' + o.c.name + ', with mean μ = <b>' + U(o.c, o.mu) + '</b> and standard deviation σ = <b>' + U(o.c, o.sd) + '</b>. The distribution of <i>X</i> is not necessarily Normal. A random sample of <i>n</i> = <b>' + o.n + '</b> is taken, and ' + XB + ' is the sample mean. Assume the CLT gives a good approximation, so ' + XB + ' is approximately Normal.</p>' + (extra || '');
  }
  function frac(n, d) { return F(n, d); }

  /* =========================================================== 5. exact distribution of the sample mean */
  function dist(vals, probs, n) {
    var map = {};
    (function rec(i, s, pr) {
      if (i === n) { map[s] = map[s] ? H.add(map[s], pr) : pr; return; }
      for (var j = 0; j < vals.length; j++) rec(i + 1, s + vals[j], H.mul(pr, probs[j]));
    })(0, 0, F(1));
    return Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).map(function (s) { return { s: s, m: F(s, n), p: map[s] }; });
  }
  function mtxt(f) { var v = f.n / f.d; return String(+v.toFixed(3)); }
  function pmfTable(d, label, asFrac) {
    return tbl([label].concat(d.map(function (r) { return asFrac ? H.fs(r.m) : mtxt(r.m); })), [['probability'].concat(d.map(function (r) { return H.fs(r.p); }))]);
  }
  function pSum(d, f) { return d.filter(f).reduce(function (a, r) { return H.add(a, r.p); }, F(0)); }

  P.reg('xbarexact', {
    title: 'Exact distribution of <span class="xbar">X</span>', section: 2, est: 170,
    topic: 'Exact probabilities for the sample mean when n is small.',
    variants: ['Two dice', 'Three free throws (0/1 data)', 'Two draws from a 3-value pmf'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var vals = [1, 2, 3, 4, 5, 6], pr = vals.map(function () { return F(1, 6); }), d = dist(vals, pr, 2);
        var s0 = ri(4, 10), t = s0 / 2, u = ri(8, 11) / 2, ways = d.filter(function (r) { return r.s === s0; })[0];
        var pu = pSum(d, function (r) { return r.m.n / r.m.d >= u; });
        out = { stmt: p('A fair die is rolled <b>twice</b>. Let <i>X</i><sub>1</sub>, <i>X</i><sub>2</sub> be the two results (each value 1, …, 6 has probability 1/6, independently) and ' + XB + ' = (<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub>)/2 their mean.'),
          parts: [
            num('Find P(' + XB + ' = ' + t + ').', ways.p, 'Count the pairs with sum ' + s0 + ': each has probability 1/36.'),
            num('Find P(' + XB + ' ≥ ' + u + ').', pu, 'Add up the pmf over all values of the mean that are ≥ ' + u + '.'),
            num('Find E(' + XB + ').', F(7, 2), 'E(<span class="xbar">X</span>) = μ = 3.5.')],
          sol: steps(['There are 36 equally likely pairs. ' + XB + ' = ' + t + ' means the sum is ' + s0 + ': ' + (ways.p.n * 36 / ways.p.d) + ' pair(s). So P = <b>' + H.fd(ways.p) + '</b>.',
            'pmf of ' + XB + ':' + pmfTable(d, XB),
            'P(' + XB + ' ≥ ' + u + ') = <b>' + H.fd(pu) + '</b>.',
            'E(' + XB + ') = μ = (1 + … + 6)/6 = <b>3.5</b>, whatever the sample size.']) };
      } else if (v === 1) {
        var pp = pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(2, 5), F(3, 5)]), d1 = dist([0, 1], [H.sub(F(1), pp), pp], 3);
        var pa = d1.filter(function (r) { return r.s === 1; })[0].p, pb = pSum(d1, function (r) { return r.s >= 2; });
        out = { stmt: p('A basketball player makes each free throw with probability <i>p</i> = ' + H.fs(pp) + ', independently. She takes <b>3</b> throws. Let <i>X</i><sub>i</sub> = 1 if throw <i>i</i> is made and 0 if missed, and ' + XB + ' = (<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub> + <i>X</i><sub>3</sub>)/3, the <i>fraction</i> of throws made. So ' + XB + ' can be 0, 1/3, 2/3 or 1.'),
          parts: [
            num('Find P(' + XB + ' = 1/3).', pa, 'Exactly one of three throws is made: 3 arrangements.'),
            num('Find P(' + XB + ' ≥ 2/3).', pb, 'At least two of three throws are made.'),
            num('Find E(' + XB + ').', pp, 'E(<span class="xbar">X</span>) = μ = p.')],
          sol: steps(['pmf of ' + XB + ':' + pmfTable(d1, XB, true) + 'with P(' + XB + ' = k/3) = C(3, k) <i>p</i><sup>k</sup>(1 − <i>p</i>)<sup>3−k</sup>.',
            'P(' + XB + ' = 1/3) = 3 · ' + H.fs(pp) + ' · ' + H.fs(H.sub(F(1), pp)) + '² = <b>' + H.fd(pa) + '</b>.',
            'P(' + XB + ' ≥ 2/3) = P(' + XB + ' = 2/3) + P(' + XB + ' = 1) = <b>' + H.fd(pb) + '</b>.',
            'E(' + XB + ') = μ = <i>p</i> = <b>' + H.fs(pp) + '</b>.']) };
      } else {
        var VS = pick([[0, 2, 4], [1, 2, 4], [0, 1, 3], [2, 4, 8]]), W = pick([[2, 1, 1], [1, 2, 1], [1, 1, 2], [3, 1, 1], [1, 3, 1]]), tot = W[0] + W[1] + W[2];
        var pr3 = W.map(function (w) { return F(w, tot); }), d3 = dist(VS, pr3, 2), mixed = (VS[0] + VS[1]) / 2, thr = (VS[1] + VS[2]) / 2;
        var pm = d3.filter(function (r) { return Math.abs(r.m.n / r.m.d - mixed) < 1e-9; })[0].p, pt = pSum(d3, function (r) { return r.m.n / r.m.d >= thr - 1e-9; });
        var mu = pr3.reduce(function (a, q, i) { return H.add(a, H.mul(q, F(VS[i]))); }, F(0)), s2 = pr3.reduce(function (a, q, i) { return H.add(a, H.mul(q, F(VS[i] * VS[i]))); }, F(0)), vr = H.sub(s2, H.mul(mu, mu));
        out = { stmt: p('A random variable <i>X</i> has pmf:') + tbl(['<i>x</i>'].concat(VS), [['P(<i>X</i> = <i>x</i>)'].concat(pr3.map(H.fs))]) + p('Two independent observations <i>X</i><sub>1</sub>, <i>X</i><sub>2</sub> are drawn, and ' + XB + ' = (<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub>)/2.'),
          parts: [
            num('Find P(' + XB + ' = ' + mtxt(F(VS[0] + VS[1], 2)) + ').', pm, 'Two orders: (' + VS[0] + ', ' + VS[1] + ') and (' + VS[1] + ', ' + VS[0] + ').'),
            num('Find P(' + XB + ' ≥ ' + mtxt(F(VS[1] + VS[2], 2)) + ').', pt, 'Add the probabilities of all pairs whose mean is at least that.'),
            num('Find Var(' + XB + ').', H.div(vr, F(2)), 'Var(<span class="xbar">X</span>) = σ²/n with n = 2.')],
          sol: steps(['pmf of ' + XB + ' (list all 9 pairs):' + pmfTable(d3, XB),
            'P(' + XB + ' = ' + mtxt(F(VS[0] + VS[1], 2)) + ') = 2 · ' + H.fs(pr3[0]) + ' · ' + H.fs(pr3[1]) + ' = <b>' + H.fd(pm) + '</b>.',
            'P(' + XB + ' ≥ ' + mtxt(F(VS[1] + VS[2], 2)) + ') = <b>' + H.fd(pt) + '</b>.',
            'μ = ' + H.fs(mu) + ', E(<i>X</i>²) = ' + H.fs(s2) + ', σ² = ' + H.fs(s2) + ' − (' + H.fs(mu) + ')² = ' + H.fs(vr) + '. Var(' + XB + ') = σ²/2 = <b>' + H.fd(H.div(vr, F(2))) + '</b>.']) };
      }
      return out;
    }
  });

  /* =========================================================== 6. mean and sd of the sample mean */
  P.reg('xbarmom', {
    title: 'Mean and SD of <span class="xbar">X</span>', section: 2, est: 110,
    topic: 'The center and the spread of the sample mean, for any population and any sample size.',
    variants: ['Given μ and σ', 'Population given as a pmf', 'Sample mean vs. total'],
    gen: function (v) {
      var o = drawSE(v === 2 ? CTX.filter(function (q) { return q.tot; }) : null), c = o.c, varF = F(Math.round(o.sd * o.sd * 100), 100 * o.n), seF = F(Math.round(o.se * 100), 100);
      if (v === 0) {
        return { stmt: p('Let <i>X</i> be ' + c.name + ', with mean μ = <b>' + U(c, o.mu) + '</b> and standard deviation σ = <b>' + U(c, o.sd) + '</b>. A random sample of <i>n</i> = <b>' + o.n + '</b> is taken, and ' + XB + ' is the sample mean.'),
          parts: [num('Find E(' + XB + ').', F(o.mu), 'E(<span class="xbar">X</span>) = μ.'), num('Find Var(' + XB + ').', varF, 'σ²/n.'), num('Find SD(' + XB + ').', seF, 'σ/√n.')],
          sol: steps(['E(' + XB + ') = μ = <b>' + fx(o.mu) + '</b> (true for every <i>n</i>).', 'Var(' + XB + ') = σ²/<i>n</i> = ' + fx(o.sd) + '² / ' + o.n + ' = ' + fx(o.sd * o.sd) + ' / ' + o.n + ' = <b>' + H.fd(varF) + '</b>.',
            'SD(' + XB + ') = σ/√<i>n</i> = ' + fx(o.sd) + ' / ' + o.k + ' = <b>' + fx(o.se) + '</b>. (Equivalently the square root of the variance.)']) };
      }
      if (v === 1) {
        var VS = pick([[0, 1, 2], [1, 2, 3], [2, 4, 6], [0, 2, 4], [1, 3, 5]]), W = pick([[1, 2, 1], [2, 1, 1], [1, 1, 2], [1, 3, 1], [3, 1, 1]]), tot = W[0] + W[1] + W[2];
        var pr = W.map(function (w) { return F(w, tot); }), mu = pr.reduce(function (a, q, i) { return H.add(a, H.mul(q, F(VS[i]))); }, F(0)), s2 = pr.reduce(function (a, q, i) { return H.add(a, H.mul(q, F(VS[i] * VS[i]))); }, F(0)), vr = H.sub(s2, H.mul(mu, mu));
        var n = pick([4, 9, 16, 25, 36]);
        return { stmt: p('A random variable <i>X</i> has pmf:') + tbl(['<i>x</i>'].concat(VS), [['P(<i>X</i> = <i>x</i>)'].concat(pr.map(H.fs))]) + p('A random sample of <i>n</i> = <b>' + n + '</b> independent observations is taken, and ' + XB + ' is the sample mean.'),
          parts: [num('Find the population mean μ = E(<i>X</i>).', mu, 'Σ x · P(x).'), num('Find the population variance σ² = Var(<i>X</i>).', vr, 'E(X²) − μ².'), num('Find Var(' + XB + ').', H.div(vr, F(n)), 'σ²/n.')],
          sol: steps(['μ = ' + VS.map(function (x, i) { return x + '·' + H.fs(pr[i]); }).join(' + ') + ' = <b>' + H.fd(mu) + '</b>.', 'E(<i>X</i>²) = ' + VS.map(function (x, i) { return x * x + '·' + H.fs(pr[i]); }).join(' + ') + ' = ' + H.fs(s2) + '. σ² = ' + H.fs(s2) + ' − (' + H.fs(mu) + ')² = <b>' + H.fd(vr) + '</b>.',
            'Var(' + XB + ') = σ²/<i>n</i> = ' + H.fs(vr) + ' / ' + n + ' = <b>' + H.fd(H.div(vr, F(n))) + '</b>.']) };
      }
      var totSD = o.sd * o.k;
      return { stmt: p(c.totTxt(o.n) + ', each with mean μ = <b>' + U(c, o.mu) + '</b> and standard deviation σ = <b>' + U(c, o.sd) + '</b>. Let <i>n</i> = ' + o.n + ' be the number of values and <i>X</i><sub>i</sub> the <i>i</i>-th value. Let ' + XB + ' = (<i>X</i><sub>1</sub> + … + <i>X</i><sub>n</sub>)/<i>n</i> be their mean and <i>S</i> = <i>X</i><sub>1</sub> + … + <i>X</i><sub>n</sub> their total.'),
        parts: [num('Find E(' + XB + ').', F(o.mu), 'E(<span class="xbar">X</span>) = μ.'), num('Find SD(' + XB + ').', seF, 'σ/√n.'), num('Find E(<i>S</i>).', F(o.mu * o.n), 'E(S) = nμ.'), num('Find SD(<i>S</i>).', F(Math.round(totSD * 100), 100), 'SD(S) = σ√n.')],
        sol: steps(['E(' + XB + ') = μ = <b>' + fx(o.mu) + '</b>.', 'SD(' + XB + ') = σ/√<i>n</i> = ' + fx(o.sd) + ' / ' + o.k + ' = <b>' + fx(o.se) + '</b>.', 'E(<i>S</i>) = <i>n</i>μ = ' + o.n + ' × ' + fx(o.mu) + ' = <b>' + fx(o.n * o.mu) + '</b>.', 'Var(<i>S</i>) = <i>n</i>σ², so SD(<i>S</i>) = σ√<i>n</i> = ' + fx(o.sd) + ' × ' + o.k + ' = <b>' + fx(totSD) + '</b>. (Also SD(S) = n · SD(<span class="xbar">X</span>).)']) };
    }
  });

  /* =========================================================== 7. how n changes the spread */
  P.reg('xbarn', {
    title: 'How n changes the spread', section: 2, est: 110,
    topic: 'How the spread of the sample mean responds to the sample size.',
    variants: ['More data', 'Sample size for a target SD', 'Two samples compared'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var k1 = pick([2, 3, 4, 5, 6, 8, 10]), n1 = k1 * k1, m = pick([2, 3]), n2 = n1 * m * m, j = ri(2, 6), s1 = j * m, sg = s1 * k1;
        out = { stmt: p('A random sample of <i>n</i> = <b>' + n1 + '</b> observations is taken from some population, and ' + XB + ' denotes the sample mean. Its standard deviation is SD(' + XB + ') = <b>' + s1 + '</b>.'),
          parts: [num('Find the population standard deviation σ.', F(sg), 'σ = SD(<span class="xbar">X</span>) · √n.'), num('A new random sample of <i>n</i> = <b>' + n2 + '</b> observations is taken from the same population. Find the new SD(' + XB + ').', F(j), 'Compare the two sample sizes.'), num('A new random sample of <i>n</i> = <b>' + n2 + '</b> observations is taken from the same population. Find the new Var(' + XB + ').', F(j * j), 'Compare the two sample sizes.')],
          sol: steps(['σ = SD(' + XB + ') · √<i>n</i> = ' + s1 + ' × ' + k1 + ' = <b>' + sg + '</b>.', 'The sample is ' + (m * m) + ' times larger (' + n2 + ' = ' + (m * m) + ' × ' + n1 + '), so SD(' + XB + ') is divided by √' + (m * m) + ' = ' + m + ': ' + s1 + ' / ' + m + ' = <b>' + j + '</b>. Check: ' + sg + ' / √' + n2 + ' = ' + sg + ' / ' + (k1 * m) + ' = ' + j + '.', 'Var = ' + j + '² = <b>' + (j * j) + '</b>.']) };
      } else if (v === 1) {
        var n = pick([20, 25, 40, 50, 100]), m2 = pick([2, 3, 4]), q = pick([2, 3, 5]), s = m2 * ri(2, 8);
        out = { stmt: p('A lab technician averages <i>n</i> = <b>' + n + '</b> independent measurements of the same quantity. The standard deviation of the average ' + XB + ' is SD(' + XB + ') = <b>' + s + '</b> (in the units of the measurements). She wants a more precise average.'),
          parts: [num('How large must <i>n</i> be so that SD(' + XB + ') becomes <b>' + fx(s / m2) + '</b>?', F(n * m2 * m2), 'Cutting the SD by m needs m² times the data.'), num('How many <b>additional</b> measurements (beyond the ' + n + ') are needed so that SD(' + XB + ') becomes <b>' + fx(s / m2) + '</b>?', F(n * (m2 * m2 - 1)), 'New n minus old n.'), num('She now wants Var(' + XB + ') to be only <b>1/' + q + '</b> of its current value. How large must <i>n</i> be?', F(n * q), 'Dividing the variance by q needs q times the data.')],
          sol: steps(['SD(' + XB + ') goes from ' + s + ' to ' + fx(s / m2) + ': divided by ' + m2 + '. Since SD = σ/√<i>n</i>, <i>n</i> must grow by ' + m2 + '² = ' + (m2 * m2) + ': ' + (m2 * m2) + ' × ' + n + ' = <b>' + (n * m2 * m2) + '</b>.', 'Additional: ' + (n * m2 * m2) + ' − ' + n + ' = <b>' + (n * (m2 * m2 - 1)) + '</b>.', 'Var(' + XB + ') = σ²/<i>n</i> is inversely proportional to <i>n</i>, so ' + q + ' times the data: ' + q + ' × ' + n + ' = <b>' + (n * q) + '</b>.']) };
      } else {
        var ka = pick([2, 3, 4, 5]), mm = pick([2, 3]), nA = ka * ka, nB = nA * mm * mm, sg2 = ri(1, 5) * ka * mm;
        var seA = sg2 / ka, seB = sg2 / (ka * mm);
        out = { stmt: p('A population has standard deviation σ = <b>' + sg2 + '</b>. Sample A has <i>n</i> = <b>' + nA + '</b> observations and sample B has <i>n</i> = <b>' + nB + '</b>. Let ' + XB + '<sub>A</sub> and ' + XB + '<sub>B</sub> be the sample means of A and B.'),
          parts: [dn('<b>Without computing either SD</b>: how many times larger is SD(' + XB + '<sub>A</sub>) than SD(' + XB + '<sub>B</sub>)?', mm, 2, 'B has ' + (mm * mm) + ' times the data.', { trim: true }), dn('Compute SD(' + XB + '<sub>A</sub>).', seA, 2, 'σ/√n_A.', { trim: true }), dn('Compute SD(' + XB + '<sub>B</sub>).', seB, 2, 'σ/√n_B.', { trim: true })],
          sol: steps(['Sample B has ' + (mm * mm) + ' times as many observations (' + nB + ' = ' + (mm * mm) + ' × ' + nA + '), and SD(' + XB + ') is proportional to 1/√<i>n</i>, so SD(' + XB + '<sub>B</sub>) is ' + mm + ' times smaller: SD(' + XB + '<sub>A</sub>) is <b>' + mm + '</b> times larger.', 'SD(' + XB + '<sub>A</sub>) = ' + sg2 + ' / √' + nA + ' = ' + sg2 + ' / ' + ka + ' = <b>' + fx(seA) + '</b>.', 'SD(' + XB + '<sub>B</sub>) = ' + sg2 + ' / √' + nB + ' = ' + sg2 + ' / ' + (ka * mm) + ' = <b>' + fx(seB) + '</b>. Check: ' + fx(seA) + ' / ' + fx(seB) + ' = ' + mm + '.']) };
      }
      return out;
    }
  });

  /* =========================================================== 8. shape of the distribution of the sample mean */
  function gammaCounts(n) {                                  /* means of n draws from a right-skewed population with mean 1 (Gamma shape n, rate n) */
    var lg = 0; for (var i = 2; i < n; i++) lg += Math.log(i);
    var w = []; for (var b = 0; b < 30; b++) { var x = (b + .5) * .1; w.push(Math.exp(n * Math.log(n) + (n - 1) * Math.log(x) - n * x - lg)); }
    return H.roundTo(w, 1000);
  }
  function gh(n, label) { return H.hist(gammaCounts(n), { lo: 0, step: .1, w: 330, h: 215, title: label, ymax: 400, ystep: 100, tickEvery: 5, xlabel: 'sample mean (1000 samples)' }); }
  var STATEMENTS = [
    { s: 'E(<span class="xbar">X</span>) = μ holds for every sample size n, even n = 2.', t: true, e: 'The proof uses only linearity of expectation. The CLT is about the <i>shape</i>.' },
    { s: 'By the CLT, when n is large the histogram of the <i>population</i> becomes bell-shaped.', t: false, e: 'The population does not change. It is the distribution of <span class="xbar">X</span> that becomes approximately Normal.' },
    { s: 'Steps per day are right-skewed. The average of n = 100 randomly chosen days is approximately Normal.', t: true, e: 'CLT: for large n, <span class="xbar">X</span> is approximately Normal whatever the population looks like.' },
    { s: 'Increasing n makes the population standard deviation σ smaller.', t: false, e: 'σ is a fixed feature of the population. Only SD(<span class="xbar">X</span>) = σ/√n shrinks.' },
    { s: 'For large n, <span class="xbar">X</span> is approximately Normal, whatever the shape of the population.', t: true, e: 'This is the Central Limit Theorem.' },
    { s: 'To make SD(<span class="xbar">X</span>) half as large, it is enough to double the sample size.', t: false, e: 'SD(<span class="xbar">X</span>) = σ/√n: halving it needs four times the data. Doubling n only divides it by √2.' },
    { s: 'The CLT says that <span class="xbar">X</span> equals μ when n is large.', t: false, e: '<span class="xbar">X</span> is still random. It is only approximately Normal around μ, with spread σ/√n.' }
  ];
  P.reg('cltshape', {
    title: 'Shape of the distribution of <span class="xbar">X</span>', section: 2, est: 90, quiz: false,
    topic: 'How the center, spread and shape of the sample mean change with n. Read it off the histograms.',
    variants: ['Match n to the histogram', 'Compare two histograms', 'True or false?'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var ns = pick([[1, 5, 40], [2, 10, 50], [1, 10, 60], [3, 15, 75]]), perm = H.shuffle([0, 1, 2]), L = ['A', 'B', 'C'], at = [];
        perm.forEach(function (ni, li) { at[ni] = L[li]; });
        out = { stmt: p('A population is strongly right-skewed with mean 1 (think of waiting times). For each of three sample sizes, 1000 random samples were drawn and their sample means ' + XB + ' were plotted. The three histograms (A, B, C) use the same axes, and they correspond to the sample sizes <i>n</i> = ' + ns.join(', ') + ', in some order.') + H.row(gh(ns[perm[0]], 'A'), gh(ns[perm[1]], 'B'), gh(ns[perm[2]], 'C')),
          parts: ns.map(function (nv, i) { return mc('Which histogram shows the sample means for <i>n</i> = ' + nv + '?', ['A', 'B', 'C'], ['A', 'B', 'C'].indexOf(at[i]), (i === 0 ? 'The widest and most skewed' : i === 2 ? 'The narrowest and most bell-shaped' : 'In between') + ' one.', true); }),
          sol: steps(['All three histograms are centered near 1 (E(' + XB + ') = μ for every <i>n</i>). What changes is the spread, σ/√<i>n</i>.', 'Smallest <i>n</i> (' + ns[0] + '): widest and still skewed: <b>' + at[0] + '</b>. Largest <i>n</i> (' + ns[2] + '): narrowest and bell-shaped: <b>' + at[2] + '</b>. The remaining histogram, <b>' + at[1] + '</b>, is for <i>n</i> = ' + ns[1] + '.']) };
      } else if (v === 1) {
        var pr = pick([[2, 25], [5, 50], [1, 20], [3, 40]]), flip = Math.random() < .5, nA = flip ? pr[1] : pr[0], nB = flip ? pr[0] : pr[1];
        var big = flip ? 'A' : 'B';
        out = { stmt: p('A right-skewed population (mean 1) is sampled 1000 times with two different sample sizes: <i>n</i> = ' + nA + ' for histogram A and <i>n</i> = ' + nB + ' for histogram B. Each histogram shows the 1000 sample means ' + XB + '. Same axes.') + H.row(gh(nA, 'A'), gh(nB, 'B')),
          parts: [H.AB('Which histogram is more spread out, that is, has the larger standard deviation SD(' + XB + ') of the sample means?', big === 'A' ? 'B' : 'A', 'SD(<span class="xbar">X</span>) = σ/√n is larger for the smaller n.'), H.AB('Which histogram is centered at the larger mean?', 'Equal', 'Both are centered at μ: E(<span class="xbar">X</span>) = μ for every n.'), H.AB('Which histogram looks closer to a Normal bell curve?', big, 'The CLT: the larger the n, the better the Normal approximation.')],
          sol: steps(['A has <i>n</i> = ' + nA + ' and B has <i>n</i> = ' + nB + '. The wider histogram is the one with the <b>smaller</b> <i>n</i>: ' + (big === 'A' ? 'B' : 'A') + ' has the larger SD(' + XB + ').', 'Both are centered at μ = 1, so they are <b>Equal</b>.', 'The histogram with the larger <i>n</i> (<b>' + big + '</b>) is narrower and closer to the bell shape.']) };
      } else {
        var st, g = 0; do { st = H.sample(STATEMENTS, 3); } while (g++ < 60 && (st.every(function (x) { return x.t; }) || st.every(function (x) { return !x.t; })));
        out = { stmt: p('Let <i>X</i><sub>1</sub>, …, <i>X</i><sub>n</sub> be a random sample from a population with mean μ and standard deviation σ, and let ' + XB + ' be the sample mean. CLT stands for the Central Limit Theorem. Decide whether each statement is true or false.'),
          parts: st.map(function (x) { return mc(x.s, ['True', 'False'], x.t ? 0 : 1, x.e, true); }),
          sol: steps(st.map(function (x) { return (x.t ? '<b>True.</b> ' : '<b>False.</b> ') + x.e; })) };
      }
      return out;
    }
  });

  /* =========================================================== 9. probability for a sample mean */
  P.reg('pxbar', {
    title: 'Probability for a sample mean', section: 3, est: 170, table: true,
    topic: 'Probabilities about a sample mean, using the CLT and the standard Normal table.',
    variants: ['Above a value', 'Find the cutoff for <span class="xbar">X</span>', 'Between two values', 'Close to μ'],
    gen: function (v) {
      var o = drawSE(), c = o.c, mu = o.mu, se = o.se, seS = fx(se), chk = [], parts, sol, kind = 'chk';
      var stmt = sampTxt(o, H.ZDEF + p('Use the standard Normal table. Give SD to 2 decimals, z-scores to 2 decimals and probabilities to 4 decimals.'));
      var meanPart = dn('Find E(' + XB + ').', mu, 2, 'The mean of the sample mean.', { trim: true, noquiz: true });
      var sdPart = dn('Find SD(' + XB + ').', se, 2, 'The population SD divided by the square root of n.', { trim: true });
      var sdStep = 'E(' + XB + ') = μ = ' + fx(mu) + '. SD(' + XB + ') = σ/√<i>n</i> = ' + fx(o.sd) + ' / ' + o.k + ' = <b>' + seS + '</b>.';
      var zOf = function (x) { return Math.round((x - mu) / se * 100) / 100; };
      var zq = function (x) { return 'Find the z-score of ' + XB + ' = ' + fx(x) + '.'; };
      if (v === 0) {
        var z = pickX(o, .2, 2.8, 2), x = xe(o, z), pv = 10000 - T(z);
        parts = [meanPart, sdPart, dn(zq(x), z, 2, 'Distance from μ in standard deviations of <span class="xbar">X</span>.'), pn('Find P(' + XB + ' > ' + fx(x) + ').', pv, 'A right tail.')];
        sol = steps([sdStep, 'z = (' + fx(x) + ' − ' + fx(mu) + ') / ' + seS + ' = <b>' + zs(z) + '</b>.', 'P(' + XB + ' > ' + fx(x) + ') = 1 − Φ(' + zs(z) + ') = 1 − ' + f4(T(z)) + ' = <b>' + f4(pv) + '</b>.']);
        ck(chk, pv, 1 - Phi(z));
      } else if (v === 1) {
        var z1 = pickX(o, .2, 2.55, 2), pc = 10000 - T(z1), cx = xe(o, z1); kind = 'chkInv';
        parts = [meanPart, sdPart, dn('The standardized sample mean is a standard Normal variable <i>Z</i>. Find the z-score <i>z</i> that cuts off the upper ' + (pc / 100).toFixed(2) + '% of its distribution, i.e. P(<i>Z</i> > <i>z</i>) = ' + f4(pc) + '.', z1, 2, 'Right tail: look up 1 − p.'), dn('Find the value <i>c</i> such that P(' + XB + ' > <i>c</i>) = ' + f4(pc) + ' (only ' + (pc / 100).toFixed(2) + '% of sample means are above <i>c</i>).', cx, 2, 'Convert the z-score back to a value of <span class="xbar">X</span>.', { trim: true })];
        sol = steps([sdStep, 'Φ(<i>z</i>) = 1 − ' + f4(pc) + ' = ' + f4(T(z1)) + ', found at ' + loc(z1) + ': <i>z</i> = <b>' + zs(z1) + '</b>.', 'Convert back: <i>c</i> = μ + <i>z</i> · SD(' + XB + ') = ' + fx(mu) + ' + ' + zs(z1) + ' × ' + seS + ' = <b>' + fx(cx) + '</b>.']);
        chk.push([T(z1) / 1e4, Phi(z1)]);
      } else if (v === 2) {
        var za = pickX(o, .2, 2.5, 2), zb = pickX(o, .2, 2.5, 2), lo = xe(o, -za), hi = xe(o, zb), zl = zOf(lo), zh = zOf(hi), ans = PHI(zh) - PHI(zl);
        parts = [meanPart, sdPart, dn(zq(hi), zh, 2, 'Distance from μ in standard deviations of <span class="xbar">X</span>.'), pn('Find P(' + fx(lo) + ' < ' + XB + ' < ' + fx(hi) + ').', ans, 'Difference of two Φ values.')];
        sol = steps([sdStep, 'z for ' + fx(lo) + ' is (' + fx(lo) + ' − ' + fx(mu) + ') / ' + seS + ' = ' + zs(zl) + '; z for ' + fx(hi) + ' is (' + fx(hi) + ' − ' + fx(mu) + ') / ' + seS + ' = <b>' + zs(zh) + '</b>.', 'P = Φ(' + zs(zh) + ') − Φ(' + zs(zl) + '). ' + phiTxt(zh) + '; ' + phiTxt(zl) + '. Difference: <b>' + f4(ans) + '</b>.']);
        ck(chk, ans, Phi(zh) - Phi(zl));
      } else {
        var z4 = pickX(o, .3, 2.8, 2), d = Math.round(z4 * se * 100) / 100, zq4 = Math.round(d / se * 100) / 100, ans4 = 2 * T(zq4) - 10000;
        parts = [meanPart, sdPart, dn(zq(mu + d), zq4, 2, 'Distance from μ in standard deviations of <span class="xbar">X</span>.'), pn('Find P(|' + XB + ' − ' + fx(mu) + '| < ' + fx(d) + '), the probability that the sample mean is within ' + fx(d) + ' of μ.', ans4, 'The area between −z and z.')];
        sol = steps([sdStep, 'z = (' + fx(mu + d) + ' − ' + fx(mu) + ') / ' + seS + ' = <b>' + zs(zq4) + '</b>.', 'P(−' + zs(zq4) + ' < <i>Z</i> < ' + zs(zq4) + ') = 2Φ(' + zs(zq4) + ') − 1 = 2(' + f4(T(zq4)) + ') − 1 = <b>' + f4(ans4) + '</b>.']);
        ck(chk, ans4, 2 * Phi(zq4) - 1);
      }
      var meta = {}; meta[kind] = chk;
      return { stmt: stmt, parts: parts, sol: sol, meta: meta };
    }
  });
  function ck(arr, a4, e) { arr.push([a4 / 1e4, e]); }

  /* =========================================================== 10. one observation vs a sample mean */
  P.reg('onevsmean', {
    title: 'One observation vs. a sample mean', section: 3, est: 160, table: true,
    topic: 'Compare the probability for a single observation with the probability for a sample mean.',
    variants: ['Above a value', 'Below a value', 'Within a distance of μ'],
    gen: function (v) {
      var c = pick(CTX), mu = pick(c.mus), sd = H.sdFor(c, mu), k = pick([2, 3, 4]), n = k * k, z1, g = 0;
      var o = { c: c, mu: mu, sd: sd };
      do { z1 = H.pz(o, .2, Math.min(.9, 2.8 / k), 1); } while (z1 * k > 2.85 && g++ < 50);
      var z2 = Math.round(z1 * k * 100) / 100, se = sd / k, chk = [], parts, sol;
      var stmt = p('Let <i>X</i> be ' + c.name + '. Suppose <i>X</i> is Normal with mean μ = <b>' + U(c, mu) + '</b> and standard deviation σ = <b>' + U(c, sd) + '</b>. A random sample of <i>n</i> = <b>' + n + '</b> is taken and ' + XB + ' is the sample mean. Because <i>X</i> is Normal, ' + XB + ' is also Normal.') + H.ZDEF + p('Use the standard Normal table and give probabilities to 4 decimals.');
      var seTxt = 'SD(' + XB + ') = ' + fx(sd) + ' / ' + k + ' = ' + fx(se);
      if (v < 2) {
        var up = v === 0, x = Math.round((mu + (up ? 1 : -1) * z1 * sd) * 100) / 100, s = up ? 1 : -1, op = up ? '>' : '<';
        var p1 = 10000 - T(z1), p2 = 10000 - T(z2);
        parts = [pn('Find P(<i>X</i> ' + op + ' ' + fx(x) + '): the probability for one randomly chosen individual.', p1, up ? 'A right tail.' : 'A left tail below the mean: use symmetry.'),
          dn('Find the z-score of ' + XB + ' = ' + fx(x) + ' for the sample mean of <i>n</i> = ' + n + '.', s * z2, 2, 'Distance from μ in standard deviations of <span class="xbar">X</span>.'),
          pn('Find P(' + XB + ' ' + op + ' ' + fx(x) + '): the probability for the mean of the sample of <i>n</i> = ' + n + '.', p2, up ? 'A right tail.' : 'A left tail below the mean: use symmetry.'),
          mc('Without computing: which event is more likely?', ['The single value, <i>X</i> ' + op + ' ' + fx(x), 'The sample mean, ' + XB + ' ' + op + ' ' + fx(x), 'Equally likely'], 0, 'Think about which one varies more.', false)];
        parts[3].noquiz = true; parts.unshift(parts.pop());
        sol = steps(['Individual: z = (' + fx(x) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = ' + zs(s * z1) + '. P(<i>X</i> ' + op + ' ' + fx(x) + ') = ' + (up ? '1 − Φ(' + zs(z1) + ')' : 'Φ(' + zs(-z1) + ') = 1 − Φ(' + zs(z1) + ')') + ' = 1 − ' + f4(T(z1)) + ' = <b>' + f4(p1) + '</b>.',
          seTxt + '. z = (' + fx(x) + ' − ' + fx(mu) + ') / ' + fx(se) + ' = <b>' + zs(s * z2) + '</b>.',
          'P(' + XB + ' ' + op + ' ' + fx(x) + ') = ' + (up ? '1 − Φ(' + zs(z2) + ')' : 'Φ(' + zs(-z2) + ') = 1 − Φ(' + zs(z2) + ')') + ' = 1 − ' + f4(T(z2)) + ' = <b>' + f4(p2) + '</b>.',
          'The value is ' + zs(z1) + ' standard deviations from the mean for one individual but ' + zs(z2) + ' standard deviations of ' + XB + ': the sample mean is <b>less likely</b> to be that far out.']);
        ck(chk, p1, up ? 1 - Phi(z1) : Phi(-z1)); ck(chk, p2, up ? 1 - Phi(z2) : Phi(-z2));
      } else {
        var d = Math.round(z1 * sd * 100) / 100, a1 = 2 * T(z1) - 10000, a2 = 2 * T(z2) - 10000;
        parts = [pn('Find P(|<i>X</i> − ' + fx(mu) + '| < ' + fx(d) + '): one randomly chosen individual is within ' + fx(d) + ' of μ.', a1, 'The area between −z and z.'),
          dn('Find the z-score of ' + XB + ' = ' + fx(mu + d) + ', the upper end of the interval from ' + fx(mu - d) + ' to ' + fx(mu + d) + ', for the sample mean of <i>n</i> = ' + n + '.', z2, 2, 'Distance from μ in standard deviations of <span class="xbar">X</span>.'),
          pn('Find P(|' + XB + ' − ' + fx(mu) + '| < ' + fx(d) + '): the sample mean of <i>n</i> = ' + n + ' is within ' + fx(d) + ' of μ.', a2, 'The area between −z and z.'),
          mc('Without computing: which is more likely to land within ' + fx(d) + ' of μ?', ['One individual, <i>X</i>', 'The sample mean, ' + XB, 'Equally likely'], 1, 'Think about which one varies more.', false)];
        parts[3].noquiz = true; parts.unshift(parts.pop());
        sol = steps(['Individual: z = ' + fx(d) + ' / ' + fx(sd) + ' = ' + zs(z1) + '. P = 2Φ(' + zs(z1) + ') − 1 = 2(' + f4(T(z1)) + ') − 1 = <b>' + f4(a1) + '</b>.',
          seTxt + '. z = ' + fx(d) + ' / ' + fx(se) + ' = <b>' + zs(z2) + '</b>.', 'P = 2Φ(' + zs(z2) + ') − 1 = 2(' + f4(T(z2)) + ') − 1 = <b>' + f4(a2) + '</b>.',
          'The average of ' + n + ' is far more concentrated around μ than a single value.']);
        ck(chk, a1, 2 * Phi(z1) - 1); ck(chk, a2, 2 * Phi(z2) - 1);
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: { chk: chk } };
    }
  });

  /* =========================================================== 11. sample size for a margin */
  P.reg('nneeded', {
    title: 'Sample size for a given margin', section: 3, est: 170, table: true,
    topic: 'How much data do we need so that the sample mean is close to μ with a given probability?',
    variants: ['Smallest n for a given margin', 'Making the margin smaller', 'Margin for a given n'],
    gen: function (v) {
      var c = pick(CTX), mu = pick(c.mus), sd = H.sdFor(c, mu), chk = [], parts, sol, stmt, g = 0;
      var unit = c.unit === '$' ? '' : ' ' + c.unit;
      var who = function (sdv) { return 'Let <i>X</i> be ' + c.name + ', with standard deviation σ = <b>' + U(c, sdv) + '</b> and unknown mean μ. ' + XB + ' is the sample mean of a random sample of <i>n</i> observations; assume the CLT gives a good approximation, so ' + XB + ' is approximately Normal.'; };
      if (v === 0) {
        var m3, cz, pr, raw, nn, ok = false;
        do {
          m3 = pick([2, 3, 4, 5]); if (!isDp(sd / m3, 2)) continue;
          cz = Math.random() < .4 ? 1.96 : rz(1.0, 2.55); pr = 2 * T(cz) - 10000;
          raw = Math.pow(Math.round(cz * 100) * m3, 2) / 10000; nn = Math.ceil(raw - 1e-9);
          var frac = raw - Math.floor(raw);
          var exactOK = (2 * Phi(Math.sqrt(nn) / m3) - 1 >= pr / 1e4 - 1e-12) && (2 * Phi(Math.sqrt(nn - 1) / m3) - 1 < pr / 1e4);
          ok = nn >= 30 && (frac === 0 || frac > .05) && exactOK;
        } while (!ok && g++ < 3000);
        if (!ok) { m3 = 5; cz = 1.96; pr = 9750; raw = Math.pow(196 * m3, 2) / 10000; nn = Math.ceil(raw - 1e-9); sd = 5 * pick([2, 4]); }
        var d = sd / m3;
        stmt = p(who(sd)) + p('We want the probability that ' + XB + ' is within the margin <i>d</i> = <b>' + U(c, d) + '</b> of μ to be at least <b>' + f4(pr) + '</b>, that is P(|' + XB + ' − μ| < <i>d</i>) ≥ ' + f4(pr) + '. Use the standard Normal table.');
        parts = [dn('To standardize ' + XB + ' you need the z-score <i>z</i> for which P(−<i>z</i> ≤ <i>Z</i> ≤ <i>z</i>) = ' + f4(pr) + ', where <i>Z</i> is a standard Normal variable. Find <i>z</i>.', cz, 2, 'Each tail has (1 − p)/2.'), num('Find the smallest sample size <i>n</i> that achieves this.', F(nn), 'Solve for n and round up to a whole number.')];
        sol = steps(['Each tail has (1 − ' + f4(pr) + ')/2 = ' + f4(10000 - T(cz)) + ', so Φ(<i>z</i>) = ' + f4(T(cz)) + ', at ' + loc(cz) + ': <i>z</i> = <b>' + zs(cz) + '</b>.', 'We need <i>z</i> · σ/√<i>n</i> ≤ <i>d</i>, so √<i>n</i> ≥ <i>z</i>σ/<i>d</i> = ' + zs(cz) + ' × ' + fx(sd) + ' / ' + fx(d) + ' = ' + fx(cz * m3) + '.', '<i>n</i> ≥ ' + fx(cz * m3) + '² = ' + raw.toFixed(4).replace(/0+$/, '') + ', so the smallest whole number is <i>n</i> = <b>' + nn + '</b> (round <i>up</i>).']);
        chk.push([T(cz) / 1e4, Phi(cz)]);
      } else if (v === 1) {
        var n0 = pick([25, 36, 50, 64, 100]), d0 = pick([2, 3, 4, 5, 6]), mm = pick([2, 3, 4, 5]), t9 = pick([2, 3, 4]);
        if (t9 === mm) t9 = mm === 4 ? 3 : mm + 1 > 4 ? 2 : mm + 1;
        stmt = p('A researcher estimates the mean μ of ' + c.name + ' with the sample mean ' + XB + ' of <i>n</i> = <b>' + n0 + '</b> independent observations (the standard deviation σ is known). Assume ' + XB + ' is approximately Normal. With this <i>n</i>, the probability that ' + XB + ' is within the margin <i>d</i> = <b>' + U(c, d0) + '</b> of μ is 0.95. She wants to keep the probability at 0.95 but make this margin smaller. (No table is needed.)');
        parts = [num('By what factor must <i>n</i> be multiplied to make the margin <b>' + mm + ' times smaller</b>, at the same probability 0.95?', F(mm * mm), 'Think about how the margin depends on n.'), num('What sample size <i>n</i> makes the margin ' + fx(d0 / mm) + unit + ' (instead of ' + d0 + unit + ') at probability 0.95?', F(n0 * mm * mm), 'Use the factor from the first question.'), num('If the sample size is multiplied by <b>' + (t9 * t9) + '</b>, by what factor does the margin shrink (probability kept at 0.95)?', F(t9), 'Think about how the margin depends on n.')];
        sol = steps(['For a fixed probability the margin is <i>d</i> = <i>z</i>σ/√<i>n</i>, with the same <i>z</i> and σ. To make <i>d</i> ' + mm + ' times smaller, √<i>n</i> must be ' + mm + ' times larger, so <i>n</i> is multiplied by ' + mm + '² = <b>' + (mm * mm) + '</b>.', '<i>n</i> = ' + mm * mm + ' × ' + n0 + ' = <b>' + (n0 * mm * mm) + '</b>.', 'Multiplying <i>n</i> by ' + (t9 * t9) + ' multiplies √<i>n</i> by √' + (t9 * t9) + ' = ' + t9 + ', so the margin shrinks by a factor of <b>' + t9 + '</b>.']);
      } else {
        var k, se, cz3, pr3, dd;
        do {
          k = pick([4, 5, 6, 8, 10]); se = sd / k; cz3 = Math.random() < .5 ? 1.96 : rz(1.0, 2.55);
        } while ((!isDp(se, 2) || !isDp(cz3 * se, 3)) && g++ < 3000);
        if (!isDp(se, 2) || !isDp(cz3 * se, 3)) { k = 4; sd = 8; se = 2; cz3 = 1.96; }
        pr3 = 2 * T(cz3) - 10000; dd = Math.round(cz3 * se * 1000) / 1000;
        stmt = p(who(sd).replace('random sample of <i>n</i> observations', 'random sample of <i>n</i> = <b>' + (k * k) + '</b> observations')) + p('We want the margin <i>d</i> for which P(|' + XB + ' − μ| < <i>d</i>) = <b>' + f4(pr3) + '</b>. Use the standard Normal table. Give <i>d</i> to 3 decimals.');
        parts = [dn('Find SD(' + XB + ').', se, 2, 'How much does the sample mean vary from sample to sample?', { trim: true }), dn('To standardize ' + XB + ' you need the z-score <i>z</i> for which P(−<i>z</i> ≤ <i>Z</i> ≤ <i>z</i>) = ' + f4(pr3) + ', where <i>Z</i> is a standard Normal variable. Find <i>z</i>.', cz3, 2, 'Each tail has (1 − p)/2.'), dn('Find the margin <i>d</i> such that P(|' + XB + ' − μ| < <i>d</i>) = ' + f4(pr3) + '.', dd, 3, 'The margin is a number of standard deviations of <span class="xbar">X</span>.', { trim: true })];
        sol = steps(['SD(' + XB + ') = σ/√<i>n</i> = ' + fx(sd) + ' / ' + k + ' = <b>' + fx(se) + '</b>.', 'Each tail has ' + f4((10000 - pr3) / 2) + ', so Φ(<i>z</i>) = ' + f4(T(cz3)) + ', at ' + loc(cz3) + ': <i>z</i> = <b>' + zs(cz3) + '</b>.', '<i>d</i> = <i>z</i> · SD(' + XB + ') = ' + zs(cz3) + ' × ' + fx(se) + ' = <b>' + fx(dd) + '</b>' + (c.unit === '$' ? ' dollars' : ' ' + c.unit) + '.']);
        chk.push([T(cz3) / 1e4, Phi(cz3)]);
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: { chkInv: chk } };
    }
  });
})();
