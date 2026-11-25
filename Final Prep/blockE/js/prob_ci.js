/* Block E, part 2: confidence intervals for a mean (sigma known): computing, level, width, sample size, plausible values. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;
  var fx = H.fx, r2 = H.r2, isDp = H.isDp, dn = H.dn, U = H.U, Z = H.Z, draw = H.draw, XB = '<span class="xbar">X</span>';
  var ciS = function (c, a, b) { return '[' + fx(a) + ', ' + fx(b) + ']'; };
  function uni(c) { return c.unit === '$' ? '$' : ''; }
  function popTxt(o) {
    return 'Let <i>X</i> be ' + o.c.name + '. The population standard deviation σ = <b>' + U(o.c, o.sd) + '</b> is <b>known</b>.';
  }
  function lvl(L) { return L + '%'; }
  function ci(o, L) { var me = r2(Z[L] * o.se); return { me: me, lo: o.xb - me, hi: o.xb + me }; }
  function seTxt(o) { return fx(o.sd) + ' / ' + o.k + ' = ' + fx(o.se); }
  /* SE a multiple of 0.25, so that 1.96 * SE has exactly 2 decimals */
  function drawQ(ks) {
    var c = pick(H.CTX), k = pick(ks || [4, 5, 6, 8, 10]), se = pick([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]), sd = se * k;
    var mu = pick(c.mus), xb = Math.round((mu + ri(-6, 6) * se) * 100) / 100;
    return { c: c, mu: mu, sd: sd, k: k, n: k * k, se: se, xb: xb };
  }

  /* ========================================================= 1. computing a CI */
  P.reg('ci', {
    title: 'Confidence interval for μ', section: 2, est: 170, note: true,
    topic: 'Build the interval <span class="xbar">X</span> ± z · σ/√n when σ is known.',
    variants: ['From summary statistics', 'From a short data list', 'From the interval back to the data'],
    gen: function (v) {
      var out, L = pick([90, 95, 99]), o, z, ci0;
      if (v === 0) {
        o = draw(); z = Z[L]; ci0 = ci(o, L);
        out = { stmt: p(popTxt(o) + ' A random sample of <i>n</i> = <b>' + o.n + '</b> observations has sample mean ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. Build a <b>' + lvl(L) + '</b> confidence interval for the population mean μ.'),
          parts: [
            dn('Find the standard error σ/√<i>n</i>.', o.se, 2, 'σ/√n.'),
            dn('Find the margin of error <i>z</i> · σ/√<i>n</i> (with <i>z</i> = ' + z + ' for ' + lvl(L) + ').', ci0.me, 2, 'z · SE.'),
            dn('Find the <b>lower</b> endpoint of the ' + lvl(L) + ' interval.', ci0.lo, 2, '<span class="xbar">X</span> − ME.'),
            dn('Find the <b>upper</b> endpoint of the ' + lvl(L) + ' interval.', ci0.hi, 2, '<span class="xbar">X</span> + ME.')],
          sol: steps(['SE = σ/√<i>n</i> = ' + seTxt(o) + '. (Here √' + o.n + ' = ' + o.k + '.)', 'Critical value for ' + lvl(L) + ': <i>z</i> = ' + z + '. ME = ' + z + ' × ' + fx(o.se) + ' = <b>' + r2(ci0.me).toFixed(2) + '</b>.', 'CI = ' + XB + ' ± ME = ' + fx(o.xb) + ' ± ' + r2(ci0.me).toFixed(2) + ' = <b>[' + r2(ci0.lo).toFixed(2) + ', ' + r2(ci0.hi).toFixed(2) + ']</b>.']) };
      } else if (v === 1) {
        var c = pick(H.CTX), mu = pick(c.mus), n = 4, xs, g, sm, sdc = pick(c.sds);
        var step = Math.max(1, Math.round(sdc / 4));
        for (g = 0; g < 500; g++) { xs = []; for (var i = 0; i < n; i++) xs.push(mu + ri(-4, 4) * step); sm = xs.reduce(function (a, b) { return a + b; }, 0); if (sm % n === 0 && new Set(xs).size > 1) break; }
        var xb = sm / n, k = Math.sqrt(n); o = { c: c, sd: sdc, n: n, xb: xb, se: sdc / k }; z = Z[L]; ci0 = ci(o, L);
        out = { stmt: p('Let <i>X</i> be ' + c.name + ', with known population standard deviation σ = <b>' + U(c, sdc) + '</b>. A random sample of <i>n</i> = <b>' + n + '</b> observations is: <b>' + xs.join(', ') + '</b>' + (c.unit === '$' ? ' (in $)' : ' (in ' + c.unit + ')') + '. Build a <b>' + lvl(L) + '</b> confidence interval for μ.'),
          parts: [
            dn('Compute the sample mean ' + XB + '.', xb, 2, 'Add the values and divide by n.'),
            dn('Compute the standard error σ/√<i>n</i>.', o.se, 2, 'σ/√n with n = ' + n + '.'),
            dn('Find the <b>lower</b> endpoint of the ' + lvl(L) + ' interval (use <i>z</i> = ' + z + ').', ci0.lo, 2, '<span class="xbar">X</span> − z · SE.'),
            dn('Find the <b>upper</b> endpoint of the ' + lvl(L) + ' interval (use <i>z</i> = ' + z + ').', ci0.hi, 2, '<span class="xbar">X</span> + z · SE.')],
          sol: steps([XB + ' = (' + xs.join(' + ') + ')/' + n + ' = <b>' + fx(xb) + '</b>.', 'SE = ' + fx(sdc) + '/√' + n + ' = <b>' + fx(o.se) + '</b>.', 'ME = ' + z + ' × ' + fx(o.se) + ' = ' + fx(Z[L] * o.se) + ' ≈ ' + ci0.me.toFixed(2) + '. CI = ' + fx(xb) + ' ± ' + ci0.me.toFixed(2) + ' = <b>[' + r2(ci0.lo).toFixed(2) + ', ' + r2(ci0.hi).toFixed(2) + ']</b>.']) };
      } else {
        o = drawQ(); L = pick([95, 95, 90]);
        if (L === 90) { o.se = pick([2, 4]); o.sd = o.se * o.k; o.xb = Math.round((o.mu + ri(-4, 4) * o.se) * 100) / 100; }
        z = Z[L]; ci0 = ci(o, L);
        out = { stmt: p(popTxt(o) + ' From a random sample, a <b>' + lvl(L) + '</b> confidence interval for the mean μ was reported as <b>[' + r2(ci0.lo).toFixed(2) + ', ' + r2(ci0.hi).toFixed(2) + ']</b> (in ' + (o.c.unit === '$' ? 'dollars' : o.c.unit) + ').'),
          parts: [
            dn('What was the sample mean ' + XB + '?', o.xb, 2, 'The interval is centred at <span class="xbar">X</span>: take the midpoint.'),
            dn('What is the margin of error?', ci0.me, 2, 'Half the width of the interval.'),
            num('Use the margin of error (with <i>z</i> = ' + z + ') to find the sample size <i>n</i>. (Margin of error = <i>z</i> · σ/√<i>n</i>.)', F(o.n), 'Solve ME = z σ/√n: √n = zσ/ME, so n = (zσ/ME)².')],
          sol: steps(['Midpoint: (' + r2(ci0.lo).toFixed(2) + ' + ' + r2(ci0.hi).toFixed(2) + ')/2 = <b>' + fx(o.xb) + '</b>.', 'ME = (upper − lower)/2 = (' + r2(ci0.hi).toFixed(2) + ' − ' + r2(ci0.lo).toFixed(2) + ')/2 = <b>' + r2(ci0.me).toFixed(2) + '</b>.', '√<i>n</i> = <i>z</i>σ/ME = ' + z + ' × ' + fx(o.sd) + ' / ' + r2(ci0.me).toFixed(2) + ' = ' + o.k + ', so <i>n</i> = <b>' + o.n + '</b>.']) };
      }
      return out;
    }
  });

  /* ========================================================= 2. confidence level */
  P.reg('level', {
    title: 'Confidence level and the interval', section: 2, est: 170, note: true,
    topic: 'More confidence needs a larger critical value, so a wider interval.',
    variants: ['Same sample, two levels', 'Change the level of a given interval', 'Which interval is which?'],
    gen: function (v) {
      var out, o, a, b, ca, cb;
      if (v === 0) {
        o = draw(); var pairs = [[90, 95], [90, 99], [95, 99]], pr = pick(pairs); a = pr[0]; b = pr[1]; ca = ci(o, a); cb = ci(o, b);
        out = { stmt: p(popTxt(o) + ' A random sample of <i>n</i> = <b>' + o.n + '</b> observations has ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. Build confidence intervals for μ at two levels, <b>' + lvl(a) + '</b> and <b>' + lvl(b) + '</b>.'),
          parts: [
            dn('Find the margin of error of the <b>' + lvl(a) + '</b> interval (<i>z</i> = ' + Z[a] + ').', ca.me, 2, 'z · σ/√n.'),
            dn('Find the margin of error of the <b>' + lvl(b) + '</b> interval (<i>z</i> = ' + Z[b] + ').', cb.me, 2, 'z · σ/√n.'),
            mc('Which interval is wider?', ['The ' + lvl(a) + ' interval', 'The ' + lvl(b) + ' interval', 'They have the same width'], 1, 'A higher confidence level needs a larger z.', true)],
          sol: steps(['SE = ' + seTxt(o) + '.', 'ME(' + lvl(a) + ') = ' + Z[a] + ' × ' + fx(o.se) + ' = <b>' + r2(ca.me).toFixed(2) + '</b>, so the interval is [' + r2(ca.lo).toFixed(2) + ', ' + r2(ca.hi).toFixed(2) + '].', 'ME(' + lvl(b) + ') = ' + Z[b] + ' × ' + fx(o.se) + ' = <b>' + r2(cb.me).toFixed(2) + '</b>, so the interval is [' + r2(cb.lo).toFixed(2) + ', ' + r2(cb.hi).toFixed(2) + '].', 'The ' + lvl(b) + ' interval is wider: more confidence costs precision.']) };
      } else if (v === 1) {
        o = drawQ(); var from = 95, to = pick([90, 99]), cf = ci(o, from), ct = ci(o, to);
        out = { stmt: p(popTxt(o) + ' From a random sample, a <b>95%</b> confidence interval for μ was <b>[' + r2(cf.lo).toFixed(2) + ', ' + r2(cf.hi).toFixed(2) + ']</b>. You are not told <i>n</i>. Use the interval to find the standard error, then build the <b>' + lvl(to) + '</b> interval (use <i>z</i> = 1.96 for 95% and <i>z</i> = ' + Z[to] + ' for ' + lvl(to) + ').'),
          parts: [
            dn('Find the standard error: (half-width of the 95% interval)/1.96.', o.se, 2, 'ME = 1.96 · SE.'),
            dn('Find the margin of error of the ' + lvl(to) + ' interval.', ct.me, 2, 'z · SE with the new z.'),
            dn('Find the <b>lower</b> endpoint of the ' + lvl(to) + ' interval.', ct.lo, 2, '<span class="xbar">X</span> − new ME.'),
            dn('Find the <b>upper</b> endpoint of the ' + lvl(to) + ' interval.', ct.hi, 2, '<span class="xbar">X</span> + new ME.')],
          sol: steps(['Centre ' + XB + ' = ' + fx(o.xb) + '. Half-width = ' + r2(cf.me).toFixed(2) + ', so SE = ' + r2(cf.me).toFixed(2) + ' / 1.96 = <b>' + fx(o.se) + '</b>.', 'New ME = ' + Z[to] + ' × ' + fx(o.se) + ' = <b>' + r2(ct.me).toFixed(2) + '</b>.', 'New interval: ' + fx(o.xb) + ' ± ' + r2(ct.me).toFixed(2) + ' = <b>[' + r2(ct.lo).toFixed(2) + ', ' + r2(ct.hi).toFixed(2) + ']</b>, which is ' + (to > from ? 'wider' : 'narrower') + ' than the 95% interval.']) };
      } else {
        o = drawQ(); var lv = shuffle([90, 95, 99]), labs = ['A', 'B', 'C'], cs = lv.map(function (L) { return ci(o, L); });
        var lst = lv.map(function (L, i) { return 'Interval ' + labs[i] + ': [' + r2(cs[i].lo).toFixed(2) + ', ' + r2(cs[i].hi).toFixed(2) + ']'; }).join('<br>');
        var optsL = ['Interval A', 'Interval B', 'Interval C'];
        out = { stmt: p('Three confidence intervals for the same population mean μ were built from the <b>same sample</b>, one at the 90% level, one at 95% and one at 99%. The labels A, B, C are in random order:<br>' + lst),
          parts: [
            mc('Which interval is the <b>99%</b> interval?', optsL, lv.indexOf(99), 'The highest confidence level gives the widest interval.', true),
            mc('Which interval is the <b>90%</b> interval?', optsL, lv.indexOf(90), 'The lowest confidence level gives the narrowest interval.', true),
            dn('What is the sample mean ' + XB + ', the common centre of the three intervals?', o.xb, 2, 'Take the midpoint of any one interval.')],
          sol: steps(['All three share the same centre ' + XB + ' = ' + fx(o.xb) + ', so they differ only in the margin of error ' + (lv.map(function (L, i) { return labs[i] + ': ' + r2(cs[i].me).toFixed(2); }).join(', ')) + '.', 'The margin is <i>z</i>·SE with <i>z</i> = 1.645, 1.96, 2.576 for 90%, 95%, 99%: the wider the interval, the higher the level.', 'Answer: 99% = ' + labs[lv.indexOf(99)] + ', 95% = ' + labs[lv.indexOf(95)] + ', 90% = ' + labs[lv.indexOf(90)] + '. The sample mean is the common midpoint, <b>' + fx(o.xb) + '</b>.']) };
      }
      return out;
    }
  });

  /* ========================================================= 3. what drives the width */
  var CH = [
    { t: 'the sample size <i>n</i> is <b>quadrupled</b>', f: F(1, 2), w: 'divided by 2 (√4 = 2)' },
    { t: 'the sample size <i>n</i> is multiplied by <b>9</b>', f: F(1, 3), w: 'divided by 3 (√9 = 3)' },
    { t: 'the sample size <i>n</i> is multiplied by <b>16</b>', f: F(1, 4), w: 'divided by 4 (√16 = 4)' },
    { t: 'the sample size <i>n</i> is cut to <b>one quarter</b>', f: F(2), w: 'multiplied by 2 (√4 = 2)' },
    { t: 'the population standard deviation σ is <b>doubled</b>', f: F(2), w: 'multiplied by 2' },
    { t: 'the population standard deviation σ is <b>halved</b>', f: F(1, 2), w: 'divided by 2' },
    { t: 'σ is <b>tripled</b>', f: F(3), w: 'multiplied by 3' }
  ];
  P.reg('width', {
    title: 'What makes the interval wider?', section: 2, est: 130,
    topic: 'Margin of error z · σ/√n: effect of n, σ and the confidence level.',
    variants: ['New margin of error after a change', 'Wider, narrower or unchanged?', 'Two studies compared'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var me0 = pick([6, 12, 18, 24, 30]), sel = (function () { var nCh = shuffle(CH.slice(0, 4)), sCh = shuffle(CH.slice(4)), a = [nCh[0], sCh[0]], seen = {}; a.forEach(function (c) { seen[H.fs(c.f)] = 1; }); shuffle(nCh.slice(1).concat(sCh.slice(1))).forEach(function (c) { if (a.length < 3 && !seen[H.fs(c.f)]) { seen[H.fs(c.f)] = 1; a.push(c); } }); return shuffle(a); })(), n0 = pick([36, 100, 144, 400]), lev = pick([90, 95, 99]);
        out = { stmt: p('A <b>' + lvl(lev) + '</b> confidence interval for a population mean μ (σ known) is built from a sample of <i>n</i> = ' + n0 + ' observations. Its margin of error is <b>' + me0 + '</b>. In each part below, change <b>only</b> the one thing named, keeping the confidence level and everything else as it is.'),
          parts: sel.map(function (c) { return num('What is the new margin of error if ' + c.t + '?', H.mul(c.f, F(me0)), 'ME = zσ/√n: the margin is ' + c.w + '.'); }),
          sol: steps(['ME = <i>z</i> σ/√<i>n</i>. So the margin of error is divided by the factor by which √<i>n</i> grows, and multiplied by the factor by which σ grows.'].concat(sel.map(function (c) { return 'If ' + c.t + ': the margin is ' + c.w + ', so <b>' + fx(H.fv(H.mul(c.f, F(me0)))) + '</b>.'; }))) };
      } else if (v === 1) {
        var pool = [
          { t: 'the sample size <i>n</i> is increased', a: 0, ex: 'Width = 2 z σ/√n: a larger n shrinks it.' }, { t: 'the sample size <i>n</i> is decreased', a: 1, ex: 'Width = 2 z σ/√n: a smaller n enlarges it.' },
          { t: 'the confidence level is raised from 95% to 99%', a: 1, ex: 'A higher level needs a larger z (2.576 instead of 1.96).' }, { t: 'the confidence level is lowered from 95% to 90%', a: 0, ex: 'A lower level needs a smaller z (1.645 instead of 1.96).' },
          { t: 'the population standard deviation σ is larger', a: 1, ex: 'The margin z σ/√n grows with σ.' }, { t: 'the population standard deviation σ is smaller', a: 0, ex: 'The margin z σ/√n shrinks with σ.' },
          { t: 'the sample happens to have a larger sample mean ' + XB, a: 2, ex: 'The width 2 z σ/√n does not involve the sample mean: the interval only shifts.' }, { t: 'the sample happens to have a smaller sample mean ' + XB, a: 2, ex: 'The width 2 z σ/√n does not involve the sample mean: the interval only shifts.' }
        ];
        var chosen = shuffle([pick(pool.slice(0, 2)), pick(pool.slice(2, 4)), pick(pool.slice(4, 6)), pick(pool.slice(6, 8))]).slice(0, 4), i;
        var O = ['The interval becomes narrower', 'The interval becomes wider', 'The width does not change'];
        out = { stmt: p('A confidence interval for a population mean μ is built with known σ, as ' + XB + ' ± <i>z</i> · σ/√<i>n</i>. Think about each change <b>separately</b>, holding everything else fixed.'),
          parts: chosen.map(function (q) { return mc('What happens to the width of the interval if ' + q.t + '?', O, q.a, q.ex, true); }),
          sol: steps(['The width of the interval is 2 · <i>z</i> · σ/√<i>n</i>. It depends on <i>z</i> (confidence level), σ and <i>n</i> only: not on the value of ' + XB + '.'].concat(chosen.map(function (q) { return 'If ' + q.t + ': <b>' + O[q.a].toLowerCase() + '</b>.'; }))) };
      } else {
        var sA = pick([0.25, 0.5, 1, 1.5, 2, 3]), sB = pick([0.25, 0.5, 1, 1.5, 2, 3]), kA = pick([5, 10, 20]), kB = pick([5, 10, 20]);
        if (Math.random() < 0.25) { sB = sA; while (kB === kA) kB = pick([5, 10, 20]); }
        var sdA = sA * kA, sdB = sB * kB, meA = 1.96 * sA, meB = 1.96 * sB, ansW = sA < sB ? 0 : sA > sB ? 1 : 2;
        out = { stmt: p('Two independent studies each build a <b>95%</b> confidence interval for a mean (σ known; use <i>z</i> = 1.96). <b>Study A</b>: σ = ' + fx(sdA) + ', <i>n</i> = ' + (kA * kA) + '. <b>Study B</b>: σ = ' + fx(sdB) + ', <i>n</i> = ' + (kB * kB) + '.'),
          parts: [
            dn('Find the margin of error of Study A.', meA, 2, '1.96 · σ/√n.'), dn('Find the margin of error of Study B.', meB, 2, '1.96 · σ/√n.'),
            mc('Which study gives the <b>narrower</b> interval?', ['Study A', 'Study B', 'The two intervals have the same width'], ansW, 'Compare the standard errors σ/√n.', true)],
          sol: steps(['Study A: SE = ' + fx(sdA) + '/' + kA + ' = ' + fx(sA) + ', ME = 1.96 × ' + fx(sA) + ' = <b>' + meA.toFixed(2) + '</b>.', 'Study B: SE = ' + fx(sdB) + '/' + kB + ' = ' + fx(sB) + ', ME = 1.96 × ' + fx(sB) + ' = <b>' + meB.toFixed(2) + '</b>.', ['Study A has the narrower interval.', 'Study B has the narrower interval.', 'The widths are equal: a larger n can be offset by a larger σ.'][ansW]]) };
      }
      return out;
    }
  });

  /* ========================================================= 4. sample size */
  function nMin(z1000, sd, m100) {                        /* smallest integer n with z*sd/sqrt(n) <= m, exact integer arithmetic */
    var num_ = Math.pow(z1000 * sd * 100, 2), den = Math.pow(1000 * m100, 2);
    return Math.floor((num_ + den - 1) / den);
  }
  function nReal(z1000, sd, m100) { return Math.pow(z1000 * sd * 100, 2) / Math.pow(1000 * m100, 2); }
  function nDraw(zz) {
    for (var g = 0; g < 400; g++) {
      var sd = pick([4, 5, 6, 8, 10, 12, 15, 20]), m100 = pick([50, 100, 150, 200, 250, 300, 400]);
      var r = nReal(Math.round(zz * 1000), sd, m100), r2_ = nReal(Math.round(zz * 1000), sd, m100 / 2);
      if (r >= 8 && r2_ <= 3000 && Math.abs(r - Math.round(r)) > 0.02 && Math.abs(r2_ - Math.round(r2_)) > 0.02) return { sd: sd, m100: m100 };
    }
    return { sd: 10, m100: 200 };
  }
  P.reg('nsize', {
    title: 'How large a sample do we need?', section: 2, est: 170, note: true,
    topic: 'Solve z · σ/√n ≤ m for n, and round up.',
    variants: ['Target margin of error', 'Make an interval narrower', 'A survey with a budget'],
    gen: function (v) {
      var out, L = pick([90, 95, 99]), zz = Z[L], z1 = Math.round(zz * 1000), d, n1, n2;
      if (v === 0) {
        d = nDraw(zz); var m = d.m100 / 100; n1 = nMin(z1, d.sd, d.m100); n2 = nMin(z1, d.sd, d.m100 / 2); var Lb = L === 99 ? 90 : 99, n3 = nMin(Math.round(Z[Lb] * 1000), d.sd, d.m100);
        out = { stmt: p('A researcher will estimate a population mean μ with a <b>' + lvl(L) + '</b> confidence interval. The population standard deviation is known: σ = <b>' + d.sd + '</b>. She wants the margin of error to be <b>at most ' + fx(m) + '</b>. The sample size must satisfy <i>z</i> · σ/√<i>n</i> ≤ ' + fx(m) + ', so <i>n</i> ≥ (<i>z</i>σ/' + fx(m) + ')². Always round <i>n</i> <b>up</b> to the next whole number.'),
          parts: [
            num('What is the smallest sample size <i>n</i> that works (' + lvl(L) + ', <i>z</i> = ' + zz + ')?', F(n1), 'n ≥ (' + zz + ' × ' + d.sd + ' / ' + fx(m) + ')² = ' + nReal(z1, d.sd, d.m100).toFixed(2) + '; round up.'),
            num('Now she wants the margin of error to be at most <b>' + fx(m / 2) + '</b> (half as large), at the same ' + lvl(L) + ' level. What is the smallest <i>n</i>?', F(n2), 'Halving the margin multiplies n by about 4: (' + zz + ' × ' + d.sd + ' / ' + fx(m / 2) + ')² = ' + nReal(z1, d.sd, d.m100 / 2).toFixed(2) + '; round up.'),
            num('With the <b>original</b> margin of error ' + fx(m) + ' but the confidence level changed to <b>' + lvl(Lb) + '</b> (<i>z</i> = ' + Z[Lb] + '), what is the smallest <i>n</i>?', F(n3), 'n ≥ (' + Z[Lb] + ' × ' + d.sd + ' / ' + fx(m) + ')² = ' + nReal(Math.round(Z[Lb] * 1000), d.sd, d.m100).toFixed(2) + '; round up.')],
          sol: steps(['<i>n</i> ≥ (<i>z</i>σ/<i>m</i>)² = (' + zz + ' × ' + d.sd + ' / ' + fx(m) + ')² = ' + nReal(z1, d.sd, d.m100).toFixed(2) + ', so the smallest whole number is <b>' + n1 + '</b>.', 'Margin ' + fx(m / 2) + ': (' + zz + ' × ' + d.sd + ' / ' + fx(m / 2) + ')² = ' + nReal(z1, d.sd, d.m100 / 2).toFixed(2) + ', so <b>' + n2 + '</b> (about 4 times as many).', 'Level ' + lvl(Lb) + ': (' + Z[Lb] + ' × ' + d.sd + ' / ' + fx(m) + ')² = ' + nReal(Math.round(Z[Lb] * 1000), d.sd, d.m100).toFixed(2) + ', so <b>' + n3 + '</b>.']) };
      } else if (v === 1) {
        var k0 = pick([5, 10, 12, 20]), n0 = k0 * k0, fct = pick([2, 3, 4]), sd = pick([5, 10, 20]), me0 = zz * sd / k0;
        out = { stmt: p('A survey with a known σ = <b>' + sd + '</b> and <i>n</i> = <b>' + n0 + '</b> observations gives a <b>' + lvl(L) + '</b> confidence interval for μ (use <i>z</i> = ' + zz + '). The team wants a <b>more precise</b> interval at the same confidence level.'),
          parts: [
            dn('Find the current margin of error.', me0, 2, 'z · σ/√n.'),
            num('The team wants the margin of error to be <b>' + ({ 2: 'half as large', 3: 'one third as large', 4: 'one quarter as large' }[fct]) + '</b>. What <i>n</i> is needed?', F(n0 * fct * fct), 'To divide the margin by ' + fct + ', multiply n by ' + fct + '² = ' + (fct * fct) + '.'),
            num('How many <b>additional</b> observations are needed beyond the current ' + n0 + ' to make the margin of error ' + ({ 2: 'half as large', 3: 'one third as large', 4: 'one quarter as large' }[fct]) + '?', F(n0 * (fct * fct - 1)), 'New n minus ' + n0 + '.')],
          sol: steps(['ME = ' + zz + ' × ' + sd + '/√' + n0 + ' = ' + zz + ' × ' + fx(sd / k0) + ' = <b>' + r2(me0).toFixed(2) + '</b>.', 'The margin is proportional to 1/√<i>n</i>. To divide it by ' + fct + ', <i>n</i> must be multiplied by ' + fct + '² = ' + (fct * fct) + ': ' + (fct * fct) + ' × ' + n0 + ' = <b>' + (n0 * fct * fct) + '</b>.', 'Additional: ' + (n0 * fct * fct) + ' − ' + n0 + ' = <b>' + (n0 * (fct * fct - 1)) + '</b>.']) };
      } else {
        d = nDraw(zz); var cost = pick([2, 3, 5, 8, 10]), m3 = d.m100 / 100; n1 = nMin(z1, d.sd, d.m100); n2 = nMin(z1, d.sd, d.m100 / 2);
        out = { stmt: p('A pollster measures a quantity with known standard deviation σ = <b>' + d.sd + '</b> and builds a <b>' + lvl(L) + '</b> confidence interval for the mean (<i>z</i> = ' + zz + '). Each observation costs <b>$' + cost + '</b>. She needs a margin of error of at most <b>' + fx(m3) + '</b>, so <i>n</i> ≥ (<i>z</i>σ/' + fx(m3) + ')²; always round <i>n</i> <b>up</b> to a whole number.'),
          parts: [
            num('What is the smallest sample size <i>n</i> that achieves a margin of error of at most ' + fx(m3) + '? (Round up.)', F(n1), 'n ≥ (zσ/m)² = ' + nReal(z1, d.sd, d.m100).toFixed(2) + '; round up.'),
            num('What is the total cost, in dollars, of the smallest sample that gives a margin of error of at most ' + fx(m3) + '? (Each observation costs $' + cost + '.)', F(n1 * cost), 'n × ' + cost + '.'),
            num('What would the total cost be if the margin of error had to be at most <b>' + fx(m3 / 2) + '</b> instead?', F(n2 * cost), 'n = ' + n2 + ' for half the margin: about 4 times the cost.')],
          sol: steps(['<i>n</i> ≥ (' + zz + ' × ' + d.sd + ' / ' + fx(m3) + ')² = ' + nReal(z1, d.sd, d.m100).toFixed(2) + ', so <i>n</i> = <b>' + n1 + '</b>.', 'Cost = ' + n1 + ' × $' + cost + ' = <b>$' + (n1 * cost) + '</b>.', 'For margin ' + fx(m3 / 2) + ': <i>n</i> ≥ ' + nReal(z1, d.sd, d.m100 / 2).toFixed(2) + ', so <i>n</i> = ' + n2 + ' and cost = ' + n2 + ' × $' + cost + ' = <b>$' + (n2 * cost) + '</b>.']) };
      }
      return out;
    }
  });

  /* ========================================================= 5. plausible values */
  function claimDraw(o, L1, L2) {                         /* mu0 clearly inside or outside, answers at 2 levels may differ */
    var c1 = ci(o, L1), c2 = ci(o, L2);
    for (var g = 0; g < 400; g++) {
      var d = (ri(7, 40) / 20) * o.se * (Math.random() < 0.5 ? -1 : 1), m0 = Math.round((o.xb + d) * 10) / 10, dd = Math.abs(m0 - o.xb);
      if (Math.abs(dd - c1.me) > 0.2 * o.se && Math.abs(dd - c2.me) > 0.2 * o.se && dd > 0.4 * o.se) return { m0: m0, in1: dd <= c1.me, in2: dd <= c2.me };
    }
    return { m0: Math.round((o.xb + 3 * o.se) * 10) / 10, in1: false, in2: false };
  }
  P.reg('plaus', {
    title: 'Which values of μ are plausible?', section: 3, est: 160, note: true,
    topic: 'The confidence interval collects the plausible values of the mean.',
    variants: ['Is a claimed value plausible?', 'Pick the plausible values', 'Read the limits of plausibility'],
    gen: function (v) {
      var out, o, cl, lo, hi;
      if (v === 0) {
        o = draw(); cl = claimDraw(o, 95, 99); var c95 = ci(o, 95), c99 = ci(o, 99);
        out = { stmt: p(popTxt(o) + ' A random sample of <i>n</i> = <b>' + o.n + '</b> observations has ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. A claim says that the true mean is μ<sub>0</sub> = <b>' + U(o.c, cl.m0) + '</b>.'),
          parts: [
            dn('Find the <b>lower</b> endpoint of the 95% confidence interval (<i>z</i> = 1.96).', c95.lo, 2, '<span class="xbar">X</span> − 1.96 σ/√n.'),
            dn('Find the <b>upper</b> endpoint of the 95% confidence interval (<i>z</i> = 1.96).', c95.hi, 2, '<span class="xbar">X</span> + 1.96 σ/√n.'),
            mc('Is the claimed value μ<sub>0</sub> = ' + U(o.c, cl.m0) + ' a plausible value of μ, judged by the <b>95%</b> interval?', ['Yes, it lies inside the interval', 'No, it lies outside the interval'], cl.in1 ? 0 : 1, 'Plausible values are those inside the interval.', true),
            mc('Judged by the <b>99%</b> interval (<i>z</i> = 2.576), is μ<sub>0</sub> = ' + U(o.c, cl.m0) + ' plausible?', ['Yes, it lies inside the interval', 'No, it lies outside the interval'], cl.in2 ? 0 : 1, 'Check whether μ0 is between <span class="xbar">X</span> ± 2.576 · SE.', true)],
          sol: steps(['SE = ' + seTxt(o) + '. 95%: ME = 1.96 × ' + fx(o.se) + ' = ' + r2(c95.me).toFixed(2) + ', interval <b>[' + r2(c95.lo).toFixed(2) + ', ' + r2(c95.hi).toFixed(2) + ']</b>.', 'μ<sub>0</sub> = ' + fx(cl.m0) + ' is ' + (cl.in1 ? 'inside' : 'outside') + ' it: <b>' + (cl.in1 ? 'plausible' : 'not plausible') + '</b> at 95%.', '99%: ME = 2.576 × ' + fx(o.se) + ' = ' + r2(c99.me).toFixed(2) + ', interval [' + r2(c99.lo).toFixed(2) + ', ' + r2(c99.hi).toFixed(2) + ']. μ<sub>0</sub> is ' + (cl.in2 ? 'inside' : 'outside') + ': <b>' + (cl.in2 ? 'plausible' : 'not plausible') + '</b> at 99%.']) };
      } else if (v === 1) {
        o = draw(); var L = pick([90, 95]), cc = ci(o, L), vals = [], names = ['A', 'B', 'C', 'D'], ins = shuffle([true, true, false, false]);
        var vals0 = null;
        for (var tr = 0; tr < 300 && !vals0; tr++) {
          ins = shuffle([true, true, false, false]); var tv = [];
          for (var i = 0; i < 4; i++) { var dd = ins[i] ? ri(2, 17) / 20 * cc.me : cc.me + ri(5, 25) / 10 * o.se, sgn = Math.random() < 0.5 ? -1 : 1; tv.push(Math.round((o.xb + sgn * dd) * 10) / 10); }
          var good = tv.every(function (t, i) { var d2 = Math.abs(t - o.xb); return (d2 <= cc.me) === ins[i] && Math.abs(d2 - cc.me) > 0.2 * o.se; }) && new Set(tv).size === 4;
          if (good) vals0 = tv;
        }
        if (!vals0) { ins = [true, false, true, false]; vals0 = [Math.round((o.xb + 0.3 * cc.me) * 10) / 10, Math.round((o.xb + cc.me + 1.5 * o.se) * 10) / 10, Math.round((o.xb - 0.6 * cc.me) * 10) / 10, Math.round((o.xb - cc.me - 2.5 * o.se) * 10) / 10]; }
        vals = vals0;
        var truth = names.filter(function (_, i) { return Math.abs(vals[i] - o.xb) <= cc.me; });
        var combos = []; for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) combos.push(names[a] + ' and ' + names[b]);
        var correctC = truth.join(' and '), optsC = [correctC].concat(shuffle(combos.filter(function (q) { return q !== correctC; })).slice(0, 3)); var ordC = shuffle(optsC);
        out = { stmt: p(popTxt(o) + ' A random sample of <i>n</i> = <b>' + o.n + '</b> observations has ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. Four people each claim a value for the true mean μ: ' + names.map(function (nm, i) { return '<b>' + nm + '</b>: ' + U(o.c, vals[i]); }).join('; ') + '.'),
          parts: [
            dn('Find the <b>lower</b> endpoint of the ' + lvl(L) + ' confidence interval (<i>z</i> = ' + Z[L] + ').', cc.lo, 2, '<span class="xbar">X</span> − z σ/√n.'),
            dn('Find the <b>upper</b> endpoint of the ' + lvl(L) + ' confidence interval (<i>z</i> = ' + Z[L] + ').', cc.hi, 2, '<span class="xbar">X</span> + z σ/√n.'),
            mc('Which claims are plausible, judged by the ' + lvl(L) + ' interval? (Claims: ' + names.map(function (nm, i) { return nm + ' = ' + fx(vals[i]); }).join(', ') + '.)', ordC, ordC.indexOf(correctC), 'A claim is plausible if its value lies inside the interval.', true)],
          sol: steps(['SE = ' + seTxt(o) + ', ME = ' + Z[L] + ' × ' + fx(o.se) + ' = ' + r2(cc.me).toFixed(2) + '. Interval: <b>[' + r2(cc.lo).toFixed(2) + ', ' + r2(cc.hi).toFixed(2) + ']</b>.', 'Inside the interval: ' + names.map(function (nm, i) { return nm + ' (' + fx(vals[i]) + ') ' + (Math.abs(vals[i] - o.xb) <= cc.me ? 'yes' : 'no'); }).join(', ') + '.', 'Plausible claims: <b>' + correctC + '</b>.']) };
      } else {
        var L3, cnt, gz = 0; do { o = drawQ(); L3 = pick([90, 95]); if (L3 === 90) { o.se = pick([2, 4]); o.sd = o.se * o.k; o.xb = Math.round((o.mu + ri(-4, 4) * o.se) * 100) / 100; }
        cc = ci(o, L3); lo = r2(cc.lo); hi = r2(cc.hi); cnt = Math.floor(hi) - Math.ceil(lo) + 1; } while (cnt < 2 && gz++ < 100);
        out = { stmt: p(popTxt(o) + ' A random sample of <i>n</i> = <b>' + o.n + '</b> observations has ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. Take the <b>' + lvl(L3) + '</b> confidence interval for μ as the set of plausible values (use <i>z</i> = ' + Z[L3] + ').'),
          parts: [
            dn('What is the <b>smallest</b> plausible value of μ?', lo, 2, 'The lower endpoint.'),
            dn('What is the <b>largest</b> plausible value of μ?', hi, 2, 'The upper endpoint.'),
            num('How many <b>whole-number</b> values of μ are plausible? (Count the integers inside the interval.)', F(cnt), 'Integers from ' + Math.ceil(lo) + ' to ' + Math.floor(hi) + '.')],
          sol: steps(['SE = ' + seTxt(o) + ', ME = ' + Z[L3] + ' × ' + fx(o.se) + ' = ' + r2(cc.me).toFixed(2) + '.', 'Interval: ' + fx(o.xb) + ' ± ' + r2(cc.me).toFixed(2) + ' = <b>[' + lo.toFixed(2) + ', ' + hi.toFixed(2) + ']</b>. Smallest plausible value ' + lo.toFixed(2) + ', largest ' + hi.toFixed(2) + '.', 'Whole numbers from ' + Math.ceil(lo) + ' to ' + Math.floor(hi) + ': <b>' + cnt + '</b> values.']) };
      }
      return out;
    }
  });
})();
