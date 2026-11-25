/* Block H, part 3: p-values, critical values, full tests, confidence intervals. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h, X = H.X;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;
  var XB = X.XB, fx = X.fx, rd = X.rd, dt = X.dt, hyp = X.hyp, U = X.U, dec = X.dec, ttable = X.ttable, tc = X.tc, crit = X.crit;

  /* ========================================================= p-values */
  var ZP = [0.5, 0.8, 1, 1.2, 1.25, 1.4, 1.5, 1.6, 1.75, 1.8, 2, 2.2, 2.25, 2.4, 2.5];
  function nPhi(z) { /* Simpson's rule, used only by the self-test */
    var n = 2000, h = z / n, f = function (u) { return Math.exp(-u * u / 2) / Math.sqrt(2 * Math.PI); }, s = f(0) + f(z);
    for (var i = 1; i < n; i++) s += f(i * h) * (i % 2 ? 4 : 2);
    return 0.5 + s * h / 3;
  }
  function pvals(z) { /* from the 4-decimal table value of |z| */
    var a = Math.abs(z), phi = X.PHI[String(a)], tail = rd(1 - phi, 4);
    return { phi: phi, two: rd(2 * tail, 4), up: z > 0 ? tail : phi, down: z > 0 ? phi : tail, exactUp: 1 - nPhi(z), exactTwo: 2 * (1 - nPhi(a)) };
  }
  function curve(z, mode) {
    var W = 520, Hh = 190, L = 20, R = 500, B = 150, T = 14;
    var X_ = function (v) { return L + (v + 3.6) / 7.2 * (R - L); };
    var Y = function (v) { return B - v / 0.42 * (B - T); };
    var f = function (u) { return Math.exp(-u * u / 2) / Math.sqrt(2 * Math.PI); };
    function area(a, b) {
      var d = 'M' + X_(a).toFixed(1) + ',' + B, u;
      for (u = a; u < b; u += 0.05) d += ' L' + X_(u).toFixed(1) + ',' + Y(f(u)).toFixed(1);
      d += ' L' + X_(b).toFixed(1) + ',' + Y(f(b)).toFixed(1) + ' L' + X_(b).toFixed(1) + ',' + B + ' Z';
      return '<path d="' + d + '" fill="#c53030" fill-opacity="0.55"/>';
    }
    var s = '', a = Math.abs(z);
    if (mode === 'two') s += area(-3.6, -a) + area(a, 3.6);
    else if (mode === 'up') s += area(z, 3.6);
    else s += area(-3.6, z);
    var d = '';
    for (var u = -3.6; u <= 3.601; u += 0.05) d += (d ? ' L' : 'M') + X_(u).toFixed(1) + ',' + Y(f(u)).toFixed(1);
    s += '<path d="' + d + '" fill="none" stroke="#1f2933" stroke-width="2"/><line x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '" stroke="#52606d"/>';
    s += H.tx(X_(0), B + 18, '0');
    s += '<line x1="' + X_(z) + '" x2="' + X_(z) + '" y1="' + B + '" y2="' + (B + 5) + '" stroke="#1f2933" stroke-width="2"/>' + H.tx(X_(z), B + 18, 'z = ' + fx(z), { bold: true, fill: '#1f2933', size: 14 });
    if (mode === 'two') s += H.tx(X_(-z), B + 18, fx(-z), { size: 13 });
    return H.svg(W, Hh, s, 'pcurve');
  }
  var ALT = ['H₁: μ &gt; μ₀', 'H₁: μ &lt; μ₀', 'H₁: μ ≠ μ₀'];
  var AI = { up: 0, down: 1, two: 2 };
  var PHOW = { two: 'both tails, 2 · (1 − Φ(|z|))', up: 'the area to the right of z, 1 − Φ(z)', down: 'the area to the left of z, Φ(z)' };
  var NEG = 'For a negative z, use Φ(z) = 1 − Φ(|z|).';
  P.reg('pval', {
    title: 'Find the p-value', section: 3, est: 130,
    topic: 'The p-value is the area, computed under H₀, in the direction(s) named by H₁.',
    variants: ['From z', 'One-sided and two-sided', 'Read the picture'],
    gen: function (v) {
      if (v === 0) {
        var z = pick(ZP.filter(function (a) { return a >= 1; })) * pick([-1, 1]), q = pvals(z);
        var order = shuffle(['two', 'up', 'down']), names = { two: 'H₁: μ ≠ μ₀', up: 'H₁: μ &gt; μ₀', down: 'H₁: μ &lt; μ₀' };
        return { stmt: p('We test H₀: μ = μ₀ about a population mean μ, where μ₀ is the benchmark value. We use a random sample from a normal population, and σ is known. The test statistic computed from the sample is <i>z</i> = <b>' + fx(z) + '</b>. When H₀ is true, this statistic has the standard normal distribution. Use the table value below, and give p-values to 4 decimal places.') + p('Normal table: Φ(' + fx(Math.abs(z)) + ') = <b>' + q.phi.toFixed(4) + '</b>, where Φ(<i>a</i>) = P(<i>Z</i> ≤ <i>a</i>) and <i>Z</i> is standard normal.'),
          parts: order.map(function (d) { return dt('What is the p-value if the alternative hypothesis is <b>' + names[d] + '</b>?', q[d], PHOW[d] + '.'); }),
          sol: steps(['1 − Φ(' + fx(Math.abs(z)) + ') = ' + rd(1 - q.phi, 4).toFixed(4) + ' is the area in one tail beyond |z|.'].concat(order.map(function (d) { return names[d] + ': ' + PHOW[d] + ', so p = <b>' + fx(q[d]) + '</b>.'; })).concat([NEG, 'Check the sign: when z falls on the side <b>opposite</b> to H₁, the one-sided p-value is larger than 0.5.'])),
          meta: { chk: [[q.up, q.exactUp], [q.two, q.exactTwo]] } };
      }
      if (v === 1) {
        var p2 = pick([0.03, 0.04, 0.06, 0.08, 0.12, 0.16]), pos = Math.random() < 0.5, half = rd(p2 / 2, 4);
        var inD = pos ? 'H₁: μ &gt; μ₀' : 'H₁: μ &lt; μ₀', outD = pos ? 'H₁: μ &lt; μ₀' : 'H₁: μ &gt; μ₀';
        var q1 = pick([0.015, 0.02, 0.035, 0.04, 0.07]);
        return { stmt: p('Studies 1 and 2 are separate. Each tests H₀: μ = μ₀ about a population mean μ, where μ₀ is the benchmark value. In both, the test statistic has a distribution symmetric around 0 when H₀ is true (standard normal or Student’s <i>t</i>).') +
            p('<b>Study 1.</b> With the alternative H₁: μ ≠ μ₀, the p-value is <b>' + p2 + '</b>. The test statistic is <b>' + (pos ? 'positive' : 'negative') + '</b>.') +
            p('<b>Study 2.</b> With the alternative H₁: μ &gt; μ₀, the p-value is <b>' + q1 + '</b>. The sample mean is above μ₀.'),
          parts: [
            dt('Study 1: with the same data, what would the p-value be if the alternative were <b>' + inD + '</b>?', half, 'The data point in the direction of H₁: keep one of the two equal tails.'),
            dt('Study 1: with the same data, what would the p-value be if the alternative were <b>' + outD + '</b>?', rd(1 - half, 4), 'The data point away from H₁: the area is everything except the small tail.'),
            dt('Study 2: with the same data, what would the p-value be if the alternative were <b>H₁: μ ≠ μ₀</b>?', rd(2 * q1, 4), 'Add the equal area in the other tail: double it.')],
          sol: steps(['Study 1: the two-sided p-value ' + p2 + ' is split into two tails of ' + half + ' each.', inD + ': the statistic is on the side of H₁, so p = ' + p2 + '/2 = <b>' + fx(half) + '</b>.', outD + ': the statistic is on the other side, so p = 1 − ' + fx(half) + ' = <b>' + fx(rd(1 - half, 4)) + '</b>.', 'Study 2: the two-sided p-value is 2 × ' + q1 + ' = <b>' + fx(2 * q1) + '</b>.']) };
      }
      var mode = pick(['two', 'up', 'down']), zz = pick([1, 1.2, 1.4, 1.5, 1.6, 1.75]) * pick([-1, 1]), r = pvals(zz);
      return { stmt: p('We test H₀: μ = μ₀ about a population mean μ. We use a random sample from a normal population with known σ. The curve is the standard normal distribution, which the test statistic <i>z</i> has when H₀ is true. The value of <i>z</i> computed from the sample is marked on the axis. The <b>shaded area</b> is the p-value of the test.') + curve(zz, mode) + p('Normal table: Φ(' + fx(Math.abs(zz)) + ') = <b>' + r.phi.toFixed(4) + '</b>, where Φ(<i>a</i>) = P(<i>Z</i> ≤ <i>a</i>) and <i>Z</i> is standard normal.'),
        parts: [
          mc('Which alternative hypothesis does the picture show?', ALT, AI[mode], mode === 'two' ? 'Both tails are shaded.' : 'The shading goes from z to the ' + (mode === 'up' ? 'right' : 'left') + '.', true),
          dt('What is the shaded area? (4 decimal places)', r[mode], PHOW[mode] + '.'),
          dec('What is the decision at α = 0.05?', r[mode] < 0.05, 'Compare the shaded area with α.')],
        sol: steps([mode === 'two' ? 'Two shaded tails: <b>' + ALT[2] + '</b>.' : 'One shaded region, to the ' + (mode === 'up' ? 'right' : 'left') + ' of z: <b>' + ALT[AI[mode]] + '</b>.', 'Area: ' + PHOW[mode] + ' = <b>' + fx(r[mode]) + '</b>. ' + NEG, fx(r[mode]) + (r[mode] < 0.05 ? ' &lt; 0.05: <b>reject H₀</b>.' : ' ≥ 0.05: <b>fail to reject H₀</b>.')]),
        meta: { chk: [[r.up, r.exactUp], [r.two, r.exactTwo]] } };
    }
  });

  /* ========================================================= critical values */
  function clear(a, kind, df) { /* statistic not too close to any cutoff */
    return X.AREAS.every(function (ar) { return Math.abs(a - crit(kind, df, +ar)) > 0.035; });
  }
  function pickStat(lo, hi, kind, df) {
    var c = []; for (var k = Math.round(lo * 20); k <= Math.round(hi * 20); k++) { var a = k / 20; if (a > lo && a < hi && clear(a, kind, df)) c.push(a); }
    if (!c.length) throw new Error('no statistic in range');
    return pick(c);
  }
  function kindDraw() { var kind = pick(['z', 't', 't']), df = pick([8, 15, 24]); return { kind: kind, df: df }; }
  function intro(k, a) {
    var nm = k.kind === 'z' ? '<i>z</i>' : '<i>t</i>';
    return 'We test H₀: μ = μ₀ about a population mean μ, where μ₀ is the benchmark value. A random sample of <i>n</i> = <b>' + (k.df + 1) + '</b> observations is taken from a normal population, and σ is <b>' + (k.kind === 'z' ? 'known' : 'unknown') + '</b>. The test statistic computed from the sample is ' + nm + ' = <b>' + fx(a) + '</b>.';
  }
  var BR = ['p &lt; 0.01', '0.01 &lt; p &lt; 0.02', '0.02 &lt; p &lt; 0.05', '0.05 &lt; p &lt; 0.10', '0.10 &lt; p &lt; 0.20', 'p &gt; 0.20'];
  var BR1 = ['p &lt; 0.005', '0.005 &lt; p &lt; 0.01', '0.01 &lt; p &lt; 0.025', '0.025 &lt; p &lt; 0.05', '0.05 &lt; p &lt; 0.10', 'p &gt; 0.10'];
  function bracket(a, df) { /* index into BR / BR1 */
    var row = X.T[df], cnt = row.filter(function (c) { return a > c; }).length; /* number of cutoffs passed, 0..5 */
    return 5 - cnt;
  }
  P.reg('crit', {
    title: 'Critical values and the t-table', section: 3, est: 130,
    topic: 'Reject when the statistic lies beyond the critical value, on the side(s) named by H₁.',
    variants: ['Three significance levels', 'One-sided vs. two-sided', 'Bracket the p-value'],
    gen: function (v) {
      var k = kindDraw(), s = pick([-1, 1]);
      if (v === 0) {
        var rg = pick([[1, 1.62], [1.7, 1.95], [2.1, 2.5], [2.95, 3.6]]), a;
        try { a = pickStat(rg[0], rg[1], k.kind, k.df); } catch (e) { a = pickStat(1, 3.6, k.kind, k.df); }
        var al = [0.1, 0.05, 0.01];
        return { stmt: p(intro(k, s * a) + ' The alternative is <b>H₁: μ ≠ μ₀</b>. What is the decision at the significance level α given in the question?') + ttable(k.df),
          parts: al.map(function (x) { var c = crit(k.kind, k.df, x / 2); return dec('At significance level α = ' + x.toFixed(2) + ', what is the decision?', a > c, '|statistic| = ' + fx(a) + (a > c ? ' > ' : ' &lt; ') + c.toFixed(3) + '.'); }),
          sol: steps(['Two-sided: look up the upper-tail area α/2 in the ' + (k.kind === 'z' ? 'normal' : 'df = ' + k.df) + ' row, and compare with |statistic| = ' + fx(a) + '.'].concat(al.map(function (x) { var c = crit(k.kind, k.df, x / 2); return 'α = ' + x.toFixed(2) + ': cutoff ' + c.toFixed(3) + ', so <b>' + (a > c ? 'reject' : 'fail to reject') + '</b>.'; }))) };
      }
      if (v === 1) {
        var c1 = crit(k.kind, k.df, 0.05), c2 = crit(k.kind, k.df, 0.025);
        var where = pick(['mid', 'mid', 'mid', 'high', 'low']);
        var b = where === 'mid' ? pickStat(c1, c2, k.kind, k.df) : where === 'high' ? pickStat(c2, c2 + 0.7, k.kind, k.df) : pickStat(0.7, c1, k.kind, k.df);
        var st = s * b, same = s > 0 ? 'μ &gt; μ₀' : 'μ &lt; μ₀', opp = s > 0 ? 'μ &lt; μ₀' : 'μ &gt; μ₀';
        var items = shuffle([
          { h: 'μ ≠ μ₀', r: b > c2, ex: 'Two-sided cutoff ' + c2.toFixed(3) + ' (area 0.025 in each tail); compare with |statistic|.' },
          { h: same, r: b > c1, ex: 'One-sided cutoff ' + c1.toFixed(3) + ' (area 0.05), on the side where the statistic is.' },
          { h: opp, r: false, ex: 'The statistic is on the side opposite to H₁, so it can never lead to rejection.' }]);
        return { stmt: p(intro(k, st) + ' The significance level is α = <b>0.05</b>. Below are three separate cases. They differ only in which alternative hypothesis was chosen <b>before</b> the data were collected.') + ttable(k.df),
          parts: items.map(function (q) { return dec('If the alternative is H₁: ' + q.h + ', what is the decision?', q.r, q.ex); }),
          sol: steps(items.map(function (q) { return 'H₁: ' + q.h + ': <b>' + (q.r ? 'reject' : 'fail to reject') + '</b>. ' + q.ex; })) };
      }
      var df = pick([8, 15, 24]), R = pick([[0.5, 1.28], [1.45, 1.65], [1.9, 2.0], [2.2, 2.45], [2.55, 2.8], [2.95, 3.6]]), t;
      try { t = pickStat(R[0], R[1], 't', df); } catch (e) { t = pickStat(1.35, 2.5, 't', df); }
      var ib = bracket(t, df), dir = s > 0 ? 'μ &gt; μ₀' : 'μ &lt; μ₀';
      return { stmt: p(intro({ kind: 't', df: df }, s * t) + ' The table below cannot give the exact p-value, but it shows a range that contains it.') + ttable(df),
        parts: [
          mc('If the alternative is <b>H₁: μ ≠ μ₀</b>, in which range does the p-value lie?', BR, ib, 'Find where |t| falls in the df row, then double the two upper-tail areas.', true),
          mc('If the alternative is <b>H₁: ' + dir + '</b>, in which range does the p-value lie?', BR1, ib, 'One tail only: use the upper-tail areas as they are.', true),
          dec('With H₁: μ ≠ μ₀ and α = 0.05, what is the decision?', t > tc(df, 0.025), 'Compare |t| with ' + tc(df, 0.025).toFixed(3) + '.')],
        sol: steps(['Row df = ' + df + ': ' + X.T[df].map(function (c) { return c.toFixed(3); }).join(', ') + ' for upper-tail areas 0.10, 0.05, 0.025, 0.01, 0.005. Place |t| = ' + fx(t) + ' among them.', 'One tail beyond |t|: <b>' + BR1[ib] + '</b>.', 'Two tails: double it: <b>' + BR[ib] + '</b>.', 'At α = 0.05 two-sided: <b>' + (t > tc(df, 0.025) ? 'reject' : 'fail to reject') + '</b>.']) };
    }
  });

  /* ========================================================= full test */
  function fullTest(dir, kind) {
    var alpha = pick([0.05, 0.05, 0.01, 0.1]), area = dir === 'two' ? alpha / 2 : alpha, vals = [1.2, 1.5, 2, 2.2, 2.4, 2.5, 3];
    for (var g = 0; g < 200; g++) {
      var o = X.draw(kind, vals, kind === 't' ? [3, 4, 5, 6] : [4, 5, 6, 8, 10]);
      var df = o.df, c = crit(kind, df, area), a = o.stat;
      if (Math.abs(a - c) < 0.04) continue;
      var sign = dir === 'up' ? 1 : dir === 'down' ? -1 : pick([-1, 1]);
      if (dir !== 'two' && Math.random() < 0.12) sign = -sign;
      o.stat = sign * a; o.xb = rd(o.mu + o.stat * o.se, 4);
      if (!X.isDp(o.xb, 2)) continue;
      o.alpha = alpha; o.area = area; o.c0 = c; o.cut = dir === 'down' ? -c : c;
      o.rej = dir === 'two' ? Math.abs(o.stat) > c : dir === 'up' ? o.stat > c : o.stat < -c;
      return o;
    }
    throw new Error('fullTest failed');
  }
  var PHR = { two: 'differs from', up: 'is greater than', down: 'is less than' };
  function concl(suff, o, dir) { return 'At the ' + Math.round(o.alpha * 100) + '% level there ' + (suff ? 'is' : 'is not') + ' sufficient evidence that the mean ' + o.c.what + ' ' + PHR[dir] + ' ' + U(o.c, o.mu) + '.'; }
  P.reg('full', {
    title: 'A full test, start to finish', section: 3, est: 240,
    topic: 'Hypotheses, method, statistic, critical value, decision, conclusion sentence.',
    variants: ['Is there a difference?', 'Is there an increase?', 'Is it too low?'],
    gen: function (v) {
      var dir = ['two', 'up', 'down'][v], kind = v === 0 ? pick(['z', 'z', 't']) : v === 1 ? pick(['t', 't', 'z']) : pick(['z', 't']);
      var o = fullTest(dir, kind), m = U(o.c, o.mu), df = o.df;
      var ask = dir === 'two' ? 'Is the mean ' + o.c.what + ' <b>different from</b> ' + m + '?' : dir === 'up' ? 'Is the mean ' + o.c.what + ' <b>greater than</b> ' + m + '?' : 'Is the mean ' + o.c.what + ' <b>less than</b> ' + m + '?';
      var tdf = kind === 't' ? df : pick([8, 15, 24]);
      var showDf = X.T[o.df] ? o.df : X.T[tdf] ? tdf : 24; /* include the rows near this sample size */
      var hopts = [hyp(o.mu, dir)]; ['two', 'up', 'down'].forEach(function (d) { if (d !== dir) hopts.push(hyp(o.mu, d)); });
      var ruleTxt = dir === 'two' ? 'reject if |statistic| > ' + o.c0.toFixed(3) : dir === 'up' ? 'reject if the statistic > ' + o.c0.toFixed(3) : 'reject if the statistic &lt; ' + M + o.c0.toFixed(3);
      var cutQ = 'Find the critical value <i>c</i> for this test (3 decimals, as in the table). Use the rule that matches H₁:<br>• H₁ with ≠: reject if |statistic| &gt; <i>c</i>.<br>• H₁ with &gt;: reject if statistic &gt; <i>c</i>.<br>• H₁ with &lt;: reject if statistic &lt; <i>c</i>, where <i>c</i> is negative (type the minus sign).';
      var cutPart = num(cutQ, F(Math.round(o.cut * 1000), 1000), (kind === 'z' ? 'Normal row' : 't row, df = ' + df) + ', upper-tail area ' + rd(o.area, 4) + (dir === 'down' ? ', with a minus sign' : '') + '.');
      cutPart.a = (o.cut < 0 ? M : '') + o.c0.toFixed(3);
      var other = concl(!o.rej, o, dir);
      var cons = [concl(o.rej, o, dir), other,
        o.rej ? 'It is proven that the mean ' + o.c.what + ' ' + PHR[dir] + ' ' + m + '.' : 'It is proven that the mean ' + o.c.what + ' is exactly ' + m + '.',
        'The probability that H₀ is true is ' + o.alpha + '.'];
      return { stmt: p('Research question: ' + ask + ' ' + X.data(o) + ' The significance level is α = <b>' + o.alpha.toFixed(2) + '</b>.') + ttable(showDf),
        parts: [
          mc('Which hypotheses should be tested?', hopts, 0, 'The question fixes the direction of H₁.'),
          mc('Which test statistic should be used, and with which distribution?', ['<i>z</i>, with the standard normal distribution', '<i>t</i>, with Student’s <i>t</i>, df = ' + df, '<i>t</i>, with Student’s <i>t</i>, df = ' + o.n], kind === 'z' ? 0 : 1, kind === 'z' ? 'σ is known.' : 'σ is unknown: t with df = n − 1.', true),
          dt('Compute the value of the test statistic.', o.stat, X.statLine(o)),
          cutPart,
          dec('What is the decision at α = ' + o.alpha.toFixed(2) + '?', o.rej, ruleTxt + '.'),
          mc('Which sentence states the conclusion correctly?', cons, 0, 'State the level, whether the evidence is sufficient, and the claim in H₁.')],
        sol: steps([hyp(o.mu, dir) + '.', 'σ is ' + (kind === 'z' ? 'known: use <b>z</b>.' : 'unknown: use <b>t</b> with df = ' + df + '.'), X.seLine(o) + ' ' + X.statLine(o),
          'Rule: <b>' + ruleTxt + '</b>.', 'The statistic is ' + fx(o.stat) + ': <b>' + (o.rej ? 'reject H₀' : 'fail to reject H₀') + '</b>.' + (!o.rej && dir !== 'two' && (dir === 'up' ? o.stat < 0 : o.stat > 0) ? ' The sample mean is on the side opposite to H₁, so there is no evidence for the claim at all.' : ''), concl(o.rej, o, dir)]),
        meta: { test: { kind: kind, dir: dir, n: o.n, xb: o.xb, mu: o.mu, sd: o.sd, alpha: o.alpha, stat: o.stat, cut: o.cut, rej: o.rej } } };
    }
  });

  /* ========================================================= CI and test */
  function iv(a, b) { return '[' + a.toFixed(2) + ', ' + b.toFixed(2) + ']'; }
  var PB = ['p &lt; 0.01', '0.01 &lt; p &lt; 0.05', '0.05 &lt; p &lt; 0.10', 'p &gt; 0.10'];
  P.reg('dual', {
    title: 'Confidence interval and test', section: 3, est: 140,
    topic: 'What a confidence interval can tell you about a two-sided test.',
    variants: ['Use a given interval', 'Build it, then test', 'Two or three intervals'],
    gen: function (v) {
      var c = pick(X.CTX);
      if (v === 0) {
        var L = pick([90, 95, 99]), mid = rd(pick(c.mus) + ri(-3, 3) * 0.5, 2), me = rd(pick(c.ses) * 2.1, 2), lo = rd(mid - me, 2), hi = rd(mid + me, 2);
        var al = (100 - L) / 100;
        var inVal = rd(mid + pick([-0.6, 0.5, 0.7]) * me, 1), above = rd(hi + pick([0.4, 0.8]) * me, 1), below = rd(lo - pick([0.4, 0.8]) * me, 1);
        var vals = shuffle([[inVal, false], [above, true], [below, true]]);
        if (Math.random() < 0.5) vals = shuffle([[inVal, false], [rd(mid - 0.4 * me, 1), false], pick([[above, true], [below, true]])]);
        return { stmt: p('Let μ be the population mean ' + c.what + '. From one random sample, the <b>' + L + '%</b> confidence interval for μ is <b>' + iv(lo, hi) + '</b> (in ' + c.unit + '). It has the form <span class="xbar">X</span> ± margin of error. Any test in this question uses the same sample and the same method (standard error and distribution) as the interval.'),
          parts: vals.map(function (q) { return dec('Test H₀: μ = ' + fx(q[0]) + ' against H₁: μ ≠ ' + fx(q[0]) + ' at α = ' + al.toFixed(2) + '. What is the decision?', q[1], fx(q[0]) + ' lies ' + (q[1] ? 'outside' : 'inside') + ' the interval.'); }).concat([
            dt('What was the sample mean ' + XB + ' in this study?', mid, 'The interval is centred at the sample mean.')]),
          sol: steps(vals.map(function (q) { return 'μ₀ = ' + fx(q[0]) + ' is <b>' + (q[1] ? 'outside' : 'inside') + '</b> ' + iv(lo, hi) + ': <b>' + (q[1] ? 'reject' : 'fail to reject') + '</b>.'; }).concat(['The sample mean is the midpoint: <b>' + fx(mid) + '</b>.'])),
          meta: { dual: { lo: lo, hi: hi, vals: vals } } };
      }
      if (v === 1) {
        var o, df, t, m, lo2, hi2, mu0, g = 0;
        do { o = X.draw('t', [-3, -2.6, -1.5, -1, 1, 1.5, 2.6, 3], [3, 4, 5, 6]); df = o.df; t = tc(df, 0.025); m = t * o.se; lo2 = o.xb - m; hi2 = o.xb + m; g++; } while ((Math.abs(Math.abs(o.stat) - t) < 0.12 || Math.abs((m * 100) % 1 - 0.5) < 1e-6) && g < 200); /* no half-cent ties */
        var rej = Math.abs(o.stat) > t; mu0 = o.mu;
        return { stmt: p(X.data(o)) + ttable(df),
          parts: [
            dt('Find the margin of error of the <b>95%</b> confidence interval for μ (2 decimals).', rd(m, 2), 't with df = ' + df + ' and upper-tail area 0.025 is ' + t.toFixed(3) + '; multiply by the estimated standard error s/√n.'),
            dt('Find the <b>lower</b> endpoint of the 95% confidence interval for μ (2 decimals).', rd(lo2, 2), '<span class="xbar">X</span> minus the margin of error.'),
            dt('Find the <b>upper</b> endpoint of the 95% confidence interval for μ (2 decimals).', rd(hi2, 2), '<span class="xbar">X</span> plus the margin of error.'),
            dec('Compute the 95% confidence interval for μ, and use it to test H₀: μ = ' + fx(mu0) + ' against H₁: μ ≠ ' + fx(mu0) + ' at α = 0.05.', rej, fx(mu0) + ' is ' + (rej ? 'outside' : 'inside') + ' the interval.')],
          sol: steps([X.seLine(o), 'df = ' + df + ', so the critical value is <b>' + t.toFixed(3) + '</b>. Margin = ' + t.toFixed(3) + ' × ' + fx(o.se) + ' ≈ <b>' + m.toFixed(2) + '</b>.', 'Interval: <b>' + iv(rd(lo2, 2), rd(hi2, 2)) + '</b>.', fx(mu0) + ' is ' + (rej ? 'outside' : 'inside') + ': <b>' + (rej ? 'reject' : 'fail to reject') + ' H₀</b>.', 'Same answer from the statistic: |t| = ' + fx(Math.abs(o.stat)) + (rej ? ' > ' : ' &lt; ') + t.toFixed(3) + '.']),
          meta: { ci: { n: o.n, xb: o.xb, sd: o.sd, mu0: mu0, me: m, rej: rej } } };
      }
      var xb = pick(c.mus) + ri(-2, 2), se = pick(c.ses), zs = [1.645, 1.96, 2.576], h = zs.map(function (z) { return rd(z * se, 2); });
      var ib = ri(0, 3), side = pick([-1, 1]);
      /* ib: 0 outside 99, 1 between 95 and 99, 2 between 90 and 95, 3 inside 90 */
      var dist = ib === 0 ? h[2] + 0.6 * se : ib === 1 ? (h[1] + h[2]) / 2 : ib === 2 ? (h[0] + h[1]) / 2 : 0.7 * h[0];
      var m0 = rd(xb + side * dist, 2);
      var ints = zs.map(function (z, i) { return [rd(xb - h[i], 2), rd(xb + h[i], 2)]; });
      var inside = ints.map(function (q) { return m0 > q[0] && m0 < q[1]; });
      var lv = ['90%', '95%', '99%'], alph = [0.1, 0.05, 0.01];
      var two = shuffle([0, 1, 2]).slice(0, 2).sort();
      return { stmt: p('Let μ be the population mean ' + c.what + ' (in ' + c.unit + '). The population is normal and σ is known. From one random sample, three confidence intervals for μ were computed, each of the form <span class="xbar">X</span> ± <i>z</i> · σ/√<i>n</i>. The test below is the two-sided <i>z</i>-test based on the same sample.') + H.tbl(['Level', 'Interval'], lv.map(function (l, i) { return [l, iv(ints[i][0], ints[i][1])]; })) + p('Now test H₀: μ = <b>' + fx(m0) + '</b> against H₁: μ ≠ ' + fx(m0) + '.'),
        parts: [mc('In which range does the p-value of this test lie?', PB, ib, 'Find the levels at which μ₀ is inside or outside, then translate each into reject or fail to reject.', true)].concat(two.map(function (i) { return dec('What is the decision at α = ' + alph[i].toFixed(2) + '?', !inside[i], fx(m0) + ' is ' + (inside[i] ? 'inside' : 'outside') + ' the ' + lv[i] + ' interval.'); })),
        sol: steps([0, 1, 2].map(function (i) { return lv[i] + ': ' + fx(m0) + ' is ' + (inside[i] ? 'inside' : 'outside') + ', so at α = ' + alph[i].toFixed(2) + ' we <b>' + (inside[i] ? 'fail to reject' : 'reject') + '</b>.'; }).concat(['We reject exactly when p &lt; α, so <b>' + PB[ib] + '</b>.'])),
        meta: { levels: { xb: xb, se: se, m0: m0, ib: ib } } };
    }
  });
})();
