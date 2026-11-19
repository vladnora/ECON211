/* Block N, part 1: the Normal distribution and the standard Normal table. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;

  /* ---------- accurate Phi and the printed table (4 decimals, z >= 0 only) ---------- */
  function Phi(x) { var s = x, t = x; for (var i = 1; i < 300; i++) { t *= x * x / (2 * i + 1); s += t; if (Math.abs(t) < 1e-17) break; } return 0.5 + s * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }
  function T(z) { return Math.round(Phi(Math.abs(z)) * 1e4); }                 /* table entry for |z|, in 1e-4 units */
  function PHI(z) { return z >= 0 ? T(z) : 10000 - T(z); }                      /* Phi(z) by table + symmetry, any sign */
  function f4(n) { return (n / 1e4).toFixed(4); }
  function zs(z) { return (z < 0 ? M : '') + Math.abs(z).toFixed(2); }
  function fx(v) { var s = String(+Math.abs(v).toFixed(4)); return (v < 0 && +s !== 0 ? M : '') + s; }
  function dn(pr, v, dp, ex, o) {                                                /* decimal numeric part */
    var s = Math.pow(10, dp), n = Math.round(v * s), r = num(pr, F(n, s), ex, o);
    r.a = (o && o.trim) ? fx(n / s) : (n < 0 ? M : '') + (Math.abs(n) / s).toFixed(dp); return r;
  }
  function pn(pr, n4, ex, o) { return dn(pr, n4 / 1e4, 4, ex, o); }
  function rz(lo, hi) { return ri(Math.round(lo * 100), Math.round(hi * 100)) / 100; }
  function isDp(x, dp) { var s = Math.pow(10, dp); return Math.abs(x * s - Math.round(x * s)) < 1e-6; }
  function loc(z) { z = Math.abs(z); var k = Math.round(z * 100); return 'row ' + (Math.floor(k / 10) / 10).toFixed(1) + ', column .0' + (k % 10); }
  function phiTxt(z) {
    return z >= 0 ? 'Φ(' + zs(z) + ') = ' + f4(T(z)) + ' (' + loc(z) + ')'
      : 'Φ(' + zs(z) + ') = 1 − Φ(' + zs(-z) + ') = 1 − ' + f4(T(z)) + ' = ' + f4(PHI(z));
  }
  function invNearest(t) {                                                         /* z whose table entry is closest to t */
    var ds = [];
    for (var k = 0; k < 350; k++) ds.push([Math.abs(T(k / 100) - t), k / 100]);
    ds.sort(function (a, b) { return a[0] - b[0]; });
    return { z: ds[0][1], diff: ds[0][0], second: ds[1][0], tie: ds[0][0] === ds[1][0] };
  }
  function distinct(n, lo, hi) { var a = [], g = 0; while (a.length < n && g++ < 500) { var z = rz(lo, hi), ok = true; a.forEach(function (q) { if (Math.abs(q - z) < .15) ok = false; }); if (ok) a.push(z); } while (a.length < n) a.push(lo + a.length * .3); return a; }

  function tableHTML() {
    var head = ['z'], rows = [], r, c;
    for (c = 0; c < 10; c++) head.push('.0' + c);
    for (r = 0; r < 35; r++) { var row = ['<b>' + (r / 10).toFixed(1) + '</b>']; for (c = 0; c < 10; c++) row.push(f4(T((r * 10 + c) / 100))); rows.push(row); }
    return tbl_(head, rows);
  }
  function tbl_(head, rows) { return H.tbl(head, rows, 'ztab'); }
  var INFO = '<p><b>How the table works.</b> It gives Φ(<i>z</i>) = P(<i>Z</i> ≤ <i>z</i>), the area to the <b>left</b> of <i>z</i>, for the standard Normal <i>Z</i>, and only for <b><i>z</i> ≥ 0</b>. Take <i>z</i> to one decimal in the left column (row) and the second decimal in the top row (column). Example: Φ(1.92) is in row 1.9, column .02: <b>0.9726</b>.</p>' +
    '<p><b>Negative <i>z</i> and right tails.</b> There are no negative <i>z</i> in the table. Use symmetry: Φ(−<i>z</i>) = 1 − Φ(<i>z</i>), so P(<i>Z</i> ≤ −1.92) = 1 − 0.9726 = 0.0274. For a right tail, P(<i>Z</i> > <i>z</i>) = 1 − Φ(<i>z</i>).</p>' +
    '<p><b>Finding <i>z</i> from a probability.</b> Find the probability inside the table and read off row + column. A probability below 0.5 is not in the table: look up 1 − <i>p</i> instead and put a minus sign in front of the answer.</p>';
  H.TABLE_INFO = INFO; H.tableHTML = tableHTML;
  H.Phi = Phi; H.T = T; H.PHI = PHI; H.f4 = f4; H.zs = zs; H.fx = fx; H.dn = dn; H.pn = pn; H.rz = rz; H.isDp = isDp; H.loc = loc; H.phiTxt = phiTxt; H.invNearest = invNearest; H.distinct = distinct;

  /* ---------- contexts shared by several problems ---------- */
  var CTX = [
    { name: 'the height of a randomly chosen student', pl: 'students', unit: 'cm', mus: [165, 170, 172, 175], sds: [4, 5, 8, 10] },
    { name: 'the time a customer waits at a bank', pl: 'customers', unit: 'minutes', mus: [10, 12, 15, 20], sds: [2, 4, 5, 10], tot: true, totName: 'total waiting time', totTxt: function (n) { return 'The waiting times of <b>' + n + '</b> customers at a bank are independent and identically distributed'; } },
    { name: 'the monthly electricity bill of a household', pl: 'households', unit: '$', mus: [80, 100, 120, 150], sds: [10, 20, 25, 40], tot: true, totName: 'total of the bills', totTxt: function (n) { return 'The monthly electricity bills of <b>' + n + '</b> households are independent and identically distributed'; } },
    { name: 'the score of a test-taker on a standardized test', pl: 'test-takers', unit: 'points', mus: [500, 520, 600, 650], sds: [40, 50, 80, 100] },
    { name: 'the lifetime of a light bulb', pl: 'bulbs', unit: 'hours', mus: [1000, 1200, 1500, 2000], sds: [100, 200, 250, 400], tot: true, totName: 'total running time', totTxt: function (n) { return 'A lamp uses <b>' + n + '</b> bulbs one after another (each is replaced as soon as it burns out). The bulb lifetimes are independent and identically distributed'; } }
  ];
  function U(c, v) { return c.unit === '$' ? '$' + (v === Math.round(v) ? fx(v) : v.toFixed(2)) : fx(v) + ' ' + c.unit; }
  function sdFor(c, mu) { var ok = c.sds.filter(function (q) { return mu >= 3 * q; }); return pick(ok.length ? ok : [c.sds[0]]); }
  function nctx(pool) { var c = pick(pool || CTX), mu = pick(c.mus); return { c: c, mu: mu, sd: sdFor(c, mu) }; }
  function pz(o, lo, hi, dp) {                                                     /* z (2 d.p.) so that mu + z*sd has dp decimals */
    for (var g = 0; g < 400; g++) { var z = rz(lo, hi); if (isDp(o.mu + z * o.sd, dp)) return z; }
    return 1.5;
  }
  function xz(o, z) { return Math.round((o.mu + z * o.sd) * 100) / 100; }
  H.CTX = CTX; H.U = U; H.sdFor = sdFor; H.nctx = nctx; H.pz = pz; H.xz = xz;
  function popTxt(o) { return '<p>Let <i>X</i> be ' + o.c.name + '. Suppose <i>X</i> ~ N(μ, σ²) with mean μ = <b>' + U(o.c, o.mu) + '</b> and standard deviation σ = <b>' + U(o.c, o.sd) + '</b>.</p>'; }
  H.popTxt = popTxt;
  H.ZDEF = '<p class="note">A <b>z-score</b> says how many standard deviations a value lies above (+) or below (−) its mean.</p>';
  function ck(arr, a4, e) { arr.push([a4 / 1e4, e]); }

  /* =========================================================== 1. reading the table */
  P.reg('ztable', {
    title: 'Reading the Φ table', section: 1, est: 100, table: true,
    topic: 'Standard Normal probabilities from the table, including negative z.',
    variants: ['Below and above', 'Between two values', 'Outside an interval'],
    gen: function (v) {
      var intro = p('Let <i>Z</i> ~ N(0, 1) be a standard Normal variable and Φ(<i>z</i>) = P(<i>Z</i> ≤ <i>z</i>). Use the standard Normal table. Give answers to 4 decimal places.');
      var q = distinct(4, 0.2, 2.9), a = q[0], b = q[1], c = q[2], d = q[3], parts, sol, chk = [];
      if (v === 0) {
        parts = [
          pn('P(<i>Z</i> ≤ ' + zs(a) + ') =', T(a), 'Read Φ(' + zs(a) + ') directly.'),
          pn('P(<i>Z</i> > ' + zs(b) + ') =', 10000 - T(b), '1 − Φ(' + zs(b) + ').'),
          pn('P(<i>Z</i> ≤ ' + M + zs(c) + ') =', 10000 - T(c), 'Symmetry: Φ(−z) = 1 − Φ(z).'),
          pn('P(<i>Z</i> ≥ ' + M + zs(d) + ') =', T(d), 'The area right of −z equals the area left of z.')
        ];
        sol = steps([
          'P(<i>Z</i> ≤ ' + zs(a) + ') = Φ(' + zs(a) + '): read it in ' + loc(a) + ': <b>' + f4(T(a)) + '</b>.',
          'P(<i>Z</i> > ' + zs(b) + ') = 1 − Φ(' + zs(b) + ') = 1 − ' + f4(T(b)) + ' = <b>' + f4(10000 - T(b)) + '</b>.',
          'No negative <i>z</i> in the table. By symmetry P(<i>Z</i> ≤ −' + zs(c) + ') = 1 − Φ(' + zs(c) + ') = 1 − ' + f4(T(c)) + ' = <b>' + f4(10000 - T(c)) + '</b>.',
          'By symmetry the area to the right of −' + zs(d) + ' equals the area to the left of ' + zs(d) + ': P(<i>Z</i> ≥ −' + zs(d) + ') = Φ(' + zs(d) + ') = <b>' + f4(T(d)) + '</b>.']);
        ck(chk, T(a), Phi(a)); ck(chk, 10000 - T(b), 1 - Phi(b)); ck(chk, 10000 - T(c), Phi(-c)); ck(chk, T(d), 1 - Phi(-d));
      } else if (v === 1) {
        var lo = Math.min(c, d), hi = Math.max(c, d); if (hi - lo < .15) hi = lo + .3;
        parts = [
          pn('P(−' + zs(a) + ' ≤ <i>Z</i> ≤ ' + zs(a) + ') =', 2 * T(a) - 10000, 'Φ(a) − Φ(−a) = 2Φ(a) − 1.'),
          pn('P(0 ≤ <i>Z</i> ≤ ' + zs(b) + ') =', T(b) - 5000, 'Φ(b) − Φ(0) = Φ(b) − 0.5.'),
          pn('P(' + zs(lo) + ' ≤ <i>Z</i> ≤ ' + zs(hi) + ') =', T(hi) - T(lo), 'Φ(hi) − Φ(lo): both values are positive.'),
          pn('P(−' + zs(c) + ' ≤ <i>Z</i> ≤ ' + zs(d) + ') =', T(c) + T(d) - 10000, 'Φ(d) − Φ(−c) = Φ(d) − (1 − Φ(c)).')
        ];
        sol = steps([
          'P(−' + zs(a) + ' ≤ <i>Z</i> ≤ ' + zs(a) + ') = Φ(' + zs(a) + ') − Φ(−' + zs(a) + ') = Φ(' + zs(a) + ') − (1 − Φ(' + zs(a) + ')) = 2(' + f4(T(a)) + ') − 1 = <b>' + f4(2 * T(a) - 10000) + '</b>.',
          'P(0 ≤ <i>Z</i> ≤ ' + zs(b) + ') = Φ(' + zs(b) + ') − Φ(0) = ' + f4(T(b)) + ' − 0.5000 = <b>' + f4(T(b) - 5000) + '</b>.',
          'P(' + zs(lo) + ' ≤ <i>Z</i> ≤ ' + zs(hi) + ') = Φ(' + zs(hi) + ') − Φ(' + zs(lo) + ') = ' + f4(T(hi)) + ' − ' + f4(T(lo)) + ' = <b>' + f4(T(hi) - T(lo)) + '</b>.',
          'P(−' + zs(c) + ' ≤ <i>Z</i> ≤ ' + zs(d) + ') = Φ(' + zs(d) + ') − Φ(−' + zs(c) + ') = ' + f4(T(d)) + ' − (1 − ' + f4(T(c)) + ') = <b>' + f4(T(c) + T(d) - 10000) + '</b>.']);
        ck(chk, 2 * T(a) - 10000, Phi(a) - Phi(-a)); ck(chk, T(b) - 5000, Phi(b) - .5); ck(chk, T(hi) - T(lo), Phi(hi) - Phi(lo)); ck(chk, T(c) + T(d) - 10000, Phi(d) - Phi(-c));
      } else {
        parts = [
          pn('P(|<i>Z</i>| > ' + zs(a) + ') =', 2 * (10000 - T(a)), '|Z| > a means Z < −a or Z > a: two equal tails.'),
          pn('P(<i>Z</i> < ' + M + zs(b) + ' or <i>Z</i> > ' + zs(c) + ') =', 20000 - T(b) - T(c), 'Left tail plus right tail.'),
          pn('P(|<i>Z</i>| ≤ ' + zs(d) + ') =', 2 * T(d) - 10000, 'The complement of the two tails.')
        ];
        sol = steps([
          '|<i>Z</i>| > ' + zs(a) + ' means <i>Z</i> < −' + zs(a) + ' or <i>Z</i> > ' + zs(a) + '. Each tail is 1 − Φ(' + zs(a) + ') = 1 − ' + f4(T(a)) + ' = ' + f4(10000 - T(a)) + ' (symmetry), so the total is <b>' + f4(2 * (10000 - T(a))) + '</b>.',
          'Left tail: P(<i>Z</i> < −' + zs(b) + ') = 1 − Φ(' + zs(b) + ') = ' + f4(10000 - T(b)) + '. Right tail: P(<i>Z</i> > ' + zs(c) + ') = 1 − Φ(' + zs(c) + ') = ' + f4(10000 - T(c)) + '. Sum: <b>' + f4(20000 - T(b) - T(c)) + '</b>.',
          'P(|<i>Z</i>| ≤ ' + zs(d) + ') = 1 − 2(1 − Φ(' + zs(d) + ')) = 2(' + f4(T(d)) + ') − 1 = <b>' + f4(2 * T(d) - 10000) + '</b>.']);
        ck(chk, 2 * (10000 - T(a)), 2 * (1 - Phi(a))); ck(chk, 20000 - T(b) - T(c), 2 - Phi(b) - Phi(c)); ck(chk, 2 * T(d) - 10000, 2 * Phi(d) - 1);
      }
      return { stmt: intro, parts: parts, sol: sol, meta: { chk: chk } };
    }
  });

  /* =========================================================== 2. probabilities for a Normal variable */
  function pHi(z) { return PHI(z); }
  P.reg('normprob', {
    title: 'Probabilities for a Normal', section: 1, est: 140, table: true,
    topic: 'Probabilities for a Normal variable with any mean and SD.',
    variants: ['Above and below', 'Between two values', 'Far from the mean'],
    gen: function (v) {
      var o = nctx(), c = o.c, mu = o.mu, sd = o.sd, stmt = popTxt(o) + H.ZDEF + p('Use the standard Normal table. Give z-scores to 2 decimals and probabilities to 4 decimals.'), parts, sol, chk = [];
      var Zs = function (x) { return Math.round((x - mu) / sd * 100) / 100; };
      if (v === 0) {
        var z1 = pz(o, .2, 2.8, 1), z2, g = 0; do { z2 = pz(o, .2, 2.8, 1); } while (Math.abs(z2 - z1) < .15 && g++ < 50);
        var c1 = xz(o, z1), c2 = xz(o, -z2);
        parts = [
          dn('Find the z-score of <i>x</i> = ' + U(c, c1) + '.', z1, 2, 'z = (x − μ)/σ.'),
          pn('Find P(<i>X</i> > ' + fx(c1) + ').', 10000 - T(z1), 'P(Z > z) = 1 − Φ(z).'),
          pn('Find P(<i>X</i> < ' + fx(c2) + ').', 10000 - T(z2), 'z is negative: use symmetry.')
        ];
        sol = steps([
          'z = (' + fx(c1) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = <b>' + zs(z1) + '</b>.',
          'P(<i>X</i> > ' + fx(c1) + ') = P(<i>Z</i> > ' + zs(z1) + ') = 1 − Φ(' + zs(z1) + ') = 1 − ' + f4(T(z1)) + ' = <b>' + f4(10000 - T(z1)) + '</b>.',
          'z = (' + fx(c2) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = ' + zs(-z2) + '. P(<i>X</i> < ' + fx(c2) + ') = Φ(' + zs(-z2) + ') = 1 − Φ(' + zs(z2) + ') = 1 − ' + f4(T(z2)) + ' = <b>' + f4(10000 - T(z2)) + '</b>.']);
        ck(chk, 10000 - T(z1), 1 - Phi(z1)); ck(chk, 10000 - T(z2), Phi(-z2));
      } else if (v === 1) {
        var side = pick(['opp', 'up', 'down']), za, zb, g2 = 0;
        do { za = pz(o, .2, 2.8, 1); zb = pz(o, .2, 2.8, 1); } while (g2++ < 80 && (side !== 'opp') && Math.abs(za - zb) < .3);
        var lo, hi;
        if (side === 'opp') { lo = xz(o, -za); hi = xz(o, zb); }
        else if (side === 'up') { lo = xz(o, Math.min(za, zb)); hi = xz(o, Math.max(za, zb)); }
        else { lo = xz(o, -Math.max(za, zb)); hi = xz(o, -Math.min(za, zb)); }
        var zlo = Zs(lo), zhi = Zs(hi), ans = PHI(zhi) - PHI(zlo);
        parts = [
          dn('Find the z-score of <i>x</i> = ' + U(c, lo) + '.', zlo, 2, 'Distance from μ in standard deviations.'),
          dn('Find the z-score of <i>x</i> = ' + U(c, hi) + '.', zhi, 2, 'Distance from μ in standard deviations.'),
          pn('Find P(' + fx(lo) + ' < <i>X</i> < ' + fx(hi) + ').', ans, 'Φ(z_hi) − Φ(z_lo).')
        ];
        sol = steps([
          'z for ' + fx(lo) + ': (' + fx(lo) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = <b>' + zs(zlo) + '</b>.',
          'z for ' + fx(hi) + ': (' + fx(hi) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = <b>' + zs(zhi) + '</b>.',
          'P(' + fx(lo) + ' < <i>X</i> < ' + fx(hi) + ') = Φ(' + zs(zhi) + ') − Φ(' + zs(zlo) + '). ' + phiTxt(zhi) + '; ' + phiTxt(zlo) + '. The difference is <b>' + f4(ans) + '</b>.']);
        ck(chk, ans, Phi(zhi) - Phi(zlo));
      } else {
        var z = pz(o, .3, 2.8, 1), d = Math.round(z * sd * 100) / 100, xl = Math.round((mu - d) * 100) / 100;
        parts = [
          pn('Find P(<i>X</i> < ' + fx(xl) + ').', 10000 - T(z), 'A left tail: use symmetry.'),
          pn('Find the probability that <i>X</i> is more than ' + U(c, d) + ' away from the mean, i.e. P(|<i>X</i> − ' + fx(mu) + '| > ' + fx(d) + ').', 2 * (10000 - T(z)), 'Two equal tails.'),
          pn('Find the probability that <i>X</i> is within ' + U(c, d) + ' of the mean, i.e. P(|<i>X</i> − ' + fx(mu) + '| ≤ ' + fx(d) + ').', 2 * T(z) - 10000, 'The complement of the two tails.')
        ];
        sol = steps([
          'z = (' + fx(xl) + ' − ' + fx(mu) + ') / ' + fx(sd) + ' = ' + zs(-z) + '. P(<i>X</i> < ' + fx(xl) + ') = Φ(' + zs(-z) + ') = 1 − Φ(' + zs(z) + ') = 1 − ' + f4(T(z)) + ' = <b>' + f4(10000 - T(z)) + '</b>.',
          '|<i>X</i> − μ| > ' + fx(d) + ' means <i>X</i> < ' + fx(xl) + ' or <i>X</i> > ' + fx(mu + d) + ': z below −' + zs(z) + ' or above ' + zs(z) + '. By symmetry the two tails are equal: 2(1 − ' + f4(T(z)) + ') = <b>' + f4(2 * (10000 - T(z))) + '</b>.',
          'Complement: 1 − ' + f4(2 * (10000 - T(z))) + ' = <b>' + f4(2 * T(z) - 10000) + '</b>.']);
        ck(chk, 10000 - T(z), Phi(-z)); ck(chk, 2 * (10000 - T(z)), 2 * (1 - Phi(z))); ck(chk, 2 * T(z) - 10000, 2 * Phi(z) - 1);
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: { chk: chk } };
    }
  });

  /* =========================================================== 3. finding c from a probability */
  var TWO = [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.2];            /* total area of two equal tails */
  var PCT = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10];                /* a tail, in percent */
  var MIDP = [80, 90, 95, 96, 97, 98, 99];                                /* a middle area, in percent */
  function okT(t) { var r = invNearest(t); return !r.tie && r.diff <= 3 && r.second >= 2 * r.diff + 3; }
  P.reg('zfind', {
    title: 'Finding z from a probability', section: 1, est: 120, table: true,
    topic: 'From a probability back to a z-score.',
    variants: ['One tail', 'Two tails', 'Areas described in words'],
    gen: function (v) {
      var intro = p('Let <i>Z</i> ~ N(0, 1) be a standard Normal variable and Φ(<i>z</i>) = P(<i>Z</i> ≤ <i>z</i>). A <b>z-score</b> is a value of <i>Z</i>: how many standard deviations a point lies above the mean 0 (positive) or below it (negative). In each part you are given a probability and must find the z-score <i>c</i> that produces it. Look <i>inside</i> the table for the probability you need; if it is not listed exactly, use the closest entry. Give <i>c</i> to 2 decimals.' + (v === 1 ? ' Here |<i>Z</i>| is the absolute value of <i>Z</i>, so P(|<i>Z</i>| > <i>c</i>) = P(<i>Z</i> < −<i>c</i>) + P(<i>Z</i> > <i>c</i>).' : ''));
      var q = distinct(4, .2, 2.55), parts, sol, chk = [];
      var inside = function (t, z) { return 'Look for ' + f4(t) + ' inside the table: it is in ' + loc(z) + ', so the value is ' + zs(z) + '.'; };
      var near = function (t, z) { return 'Closest entry to ' + f4(t) + ': ' + f4(T(z)) + ', at ' + loc(z) + '.'; };
      if (v === 0) {
        var c = q[0], d = q[1], e = q[2], f = q[3];
        parts = [
          dn('Find <i>c</i> such that P(<i>Z</i> ≤ <i>c</i>) = ' + f4(T(c)) + '.', c, 2, 'Find the probability in the table.'),
          dn('Find <i>c</i> such that P(<i>Z</i> > <i>c</i>) = ' + f4(10000 - T(d)) + '.', d, 2, 'Right tail: look up 1 − p.'),
          dn('Find <i>c</i> such that P(<i>Z</i> ≤ <i>c</i>) = ' + f4(10000 - T(e)) + '.', -e, 2, 'Below 0.5, so c is negative: look up 1 − p and flip the sign.'),
          dn('Find <i>c</i> such that P(<i>Z</i> ≥ <i>c</i>) = ' + f4(T(f)) + '.', -f, 2, 'More than half of the area is to the right, so c is negative.')
        ];
        sol = steps([
          inside(T(c), c) + ' So <i>c</i> = <b>' + zs(c) + '</b>.',
          'P(<i>Z</i> > <i>c</i>) = ' + f4(10000 - T(d)) + ' means Φ(<i>c</i>) = 1 − ' + f4(10000 - T(d)) + ' = ' + f4(T(d)) + '. ' + inside(T(d), d) + ' So <i>c</i> = <b>' + zs(d) + '</b>.',
          f4(10000 - T(e)) + ' is below 0.5, so it is not in the table and <i>c</i> is negative. By symmetry Φ(−<i>c</i>) = 1 − ' + f4(10000 - T(e)) + ' = ' + f4(T(e)) + ', which is at ' + loc(e) + ': <i>c</i> = <b>' + zs(-e) + '</b>.',
          'P(<i>Z</i> ≥ <i>c</i>) = ' + f4(T(f)) + ' means P(<i>Z</i> < <i>c</i>) = 1 − ' + f4(T(f)) + ' = ' + f4(10000 - T(f)) + ' < 0.5. By symmetry look up ' + f4(T(f)) + ' (' + loc(f) + '): <i>c</i> = <b>' + zs(-f) + '</b>.']);
        chk.push([T(c) / 1e4, Phi(c)], [T(d) / 1e4, Phi(d)], [T(e) / 1e4, Phi(e)], [T(f) / 1e4, Phi(f)]);
      } else if (v === 1) {
        var a1 = q[0], tw = H.shuffle(TWO.filter(function (x) { return okT(10000 - Math.round(x * 5000)); })).slice(0, 2);
        var A = 2 * (10000 - T(a1)), r1 = invNearest(10000 - Math.round(tw[0] * 5000)), r2 = invNearest(10000 - Math.round(tw[1] * 5000));
        var tailsTxt = function (a) { return 'The two tails together have area ' + f4(a) + ', and by symmetry they are equal: ' + f4(a / 2) + ' each. So Φ(<i>c</i>) = 1 − ' + f4(a / 2) + ' = ' + f4(10000 - a / 2) + '. '; };
        parts = [
          dn('Find <i>c</i> > 0 such that P(|<i>Z</i>| > <i>c</i>) = ' + f4(A) + '.', a1, 2, 'Each tail has half of it.'),
          dn('Find <i>c</i> > 0 such that P(|<i>Z</i>| > <i>c</i>) = ' + tw[0].toFixed(2) + '.', r1.z, 2, 'Closest table entry.'),
          dn('Find <i>c</i> > 0 such that P(|<i>Z</i>| > <i>c</i>) = ' + tw[1].toFixed(2) + '.', r2.z, 2, 'Closest table entry.')
        ];
        sol = steps([
          tailsTxt(A) + inside(T(a1), a1) + ' So <i>c</i> = <b>' + zs(a1) + '</b>.',
          tailsTxt(Math.round(tw[0] * 10000)) + near(10000 - Math.round(tw[0] * 5000), r1.z) + ' So <i>c</i> = <b>' + zs(r1.z) + '</b>.',
          tailsTxt(Math.round(tw[1] * 10000)) + near(10000 - Math.round(tw[1] * 5000), r2.z) + ' So <i>c</i> = <b>' + zs(r2.z) + '</b>.']);
        chk.push([T(a1) / 1e4, Phi(a1)], [(10000 - Math.round(tw[0] * 5000)) / 1e4, Phi(r1.z)], [(10000 - Math.round(tw[1] * 5000)) / 1e4, Phi(r2.z)]);
      } else {
        var pc = H.shuffle(PCT.filter(function (x) { return okT(10000 - Math.round(x * 100)); })).slice(0, 2), mp = pick(MIDP.filter(function (x) { return okT(5000 + x * 50); }));
        var ra = invNearest(10000 - Math.round(pc[0] * 100)), rb = invNearest(10000 - Math.round(pc[1] * 100)), rm = invNearest(5000 + mp * 50);
        var pcs = function (x) { return String(x) + '%'; };
        parts = [
          dn('Find <i>c</i> such that <b>' + pcs(pc[0]) + '</b> of the area under the standard Normal curve lies to the <b>right</b> of <i>c</i>.', ra.z, 2, 'A right tail of ' + pc[0] + '% = ' + (pc[0] / 100) + '.'),
          dn('Find <i>c</i> such that <b>' + pcs(pc[1]) + '</b> of the area under the standard Normal curve lies to the <b>left</b> of <i>c</i>.', -rb.z, 2, 'A left tail below 0.5: c is negative.'),
          dn('Find <i>c</i> > 0 such that the <b>middle ' + pcs(mp) + '</b> of the area lies between −<i>c</i> and <i>c</i>.', rm.z, 2, 'The two tails share the rest equally.')
        ];
        sol = steps([
          pcs(pc[0]) + ' = ' + f4(Math.round(pc[0] * 100)) + ' in the right tail, so Φ(<i>c</i>) = 1 − ' + f4(Math.round(pc[0] * 100)) + ' = ' + f4(10000 - Math.round(pc[0] * 100)) + '. ' + near(10000 - Math.round(pc[0] * 100), ra.z) + ' So <i>c</i> = <b>' + zs(ra.z) + '</b>.',
          pcs(pc[1]) + ' = ' + f4(Math.round(pc[1] * 100)) + ' in the left tail. It is below 0.5, so <i>c</i> is negative. By symmetry Φ(−<i>c</i>) = 1 − ' + f4(Math.round(pc[1] * 100)) + ' = ' + f4(10000 - Math.round(pc[1] * 100)) + '. ' + near(10000 - Math.round(pc[1] * 100), rb.z) + ' So <i>c</i> = <b>' + zs(-rb.z) + '</b>.',
          'The middle ' + pcs(mp) + ' leaves ' + (100 - mp) + '% in the two tails together, ' + ((100 - mp) / 2) + '% in each. So Φ(<i>c</i>) = 1 − ' + f4(Math.round((100 - mp) * 50)) + ' = ' + f4(5000 + mp * 50) + '. ' + near(5000 + mp * 50, rm.z) + ' So <i>c</i> = <b>' + zs(rm.z) + '</b>.']);
        chk.push([(10000 - Math.round(pc[0] * 100)) / 1e4, Phi(ra.z)], [(10000 - Math.round(pc[1] * 100)) / 1e4, Phi(rb.z)], [(5000 + mp * 50) / 1e4, Phi(rm.z)]);
      }
      return { stmt: intro, parts: parts, sol: sol, meta: { chkInv: chk } };
    }
  });

  /* =========================================================== 4. cutoffs for a Normal variable */
  P.reg('cutoff', {
    title: 'Cutoffs for a Normal variable', section: 1, est: 150, table: true,
    topic: 'Find the value of X that cuts off a given share of the population.',
    variants: ['Top share', 'Bottom share', 'Middle share'],
    gen: function (v) {
      var o = nctx(), c = o.c, mu = o.mu, sd = o.sd, q = distinct(3, .2, 2.55), z1 = q[0], z2 = q[1], z3 = q[2], parts, sol;
      var stmt = popTxt(o) + p('Use the standard Normal table. Give the values to at most 2 decimals.'), chk = [];
      var xv = function (z) { return Math.round((mu + z * sd) * 100) / 100; };
      var conv = function (z, sign) { return 'Look up the z-score: ' + f4(T(z)) + ' is at ' + loc(z) + ', so z = ' + zs(sign * z) + '. Convert: <i>x</i> = μ + <i>z</i>σ = ' + fx(mu) + (sign < 0 ? ' − ' : ' + ') + zs(z) + ' × ' + fx(sd) + ' = <b>' + fx(xv(sign * z)) + '</b>.'; };
      if (v === 0) {
        var pr = [z1, z2, z3].map(function (z) { return 10000 - T(z); });
        parts = [z1, z2, z3].map(function (z, i) {
          return dn('Find the value <i>x</i> such that P(<i>X</i> > <i>x</i>) = ' + f4(pr[i]) + ' (that is, ' + (pr[i] / 100).toFixed(2) + '% of ' + c.pl + ' are above <i>x</i>).', xv(z), 2, 'Find z for the right tail, then convert back to x.', { trim: true });
        });
        sol = steps([z1, z2, z3].map(function (z, i) { return 'The right tail is ' + f4(pr[i]) + ', so Φ(<i>z</i>) = 1 − ' + f4(pr[i]) + ' = ' + f4(T(z)) + '. ' + conv(z, 1); }));
        chk.push([T(z1) / 1e4, Phi(z1)], [T(z2) / 1e4, Phi(z2)], [T(z3) / 1e4, Phi(z3)]);
      } else if (v === 1) {
        var pl = [z1, z2, z3].map(function (z) { return 10000 - T(z); });
        parts = [z1, z2, z3].map(function (z, i) {
          return dn('Find the value <i>x</i> such that P(<i>X</i> < <i>x</i>) = ' + f4(pl[i]) + ' (that is, ' + (pl[i] / 100).toFixed(2) + '% of ' + c.pl + ' are below <i>x</i>).', xv(-z), 2, 'A left tail below 0.5 means a negative z: use symmetry.', { trim: true });
        });
        sol = steps([z1, z2, z3].map(function (z, i) { return 'The left tail is ' + f4(pl[i]) + ' < 0.5, so z is negative. By symmetry Φ(−<i>z</i>) = 1 − ' + f4(pl[i]) + ' = ' + f4(T(z)) + '. ' + conv(z, -1); }));
        chk.push([T(z1) / 1e4, Phi(z1)], [T(z2) / 1e4, Phi(z2)], [T(z3) / 1e4, Phi(z3)]);
      } else {
        var m1 = 2 * T(z1) - 10000, m2 = 2 * T(z2) - 10000, m3 = 2 * T(z3) - 10000;
        parts = [
          dn('The middle ' + (m1 / 100).toFixed(2) + '% of ' + c.pl + ' lie in an interval centered at the mean μ = ' + fx(mu) + '. Find the <b>upper</b> end of this interval.', xv(z1), 2, 'The tails share the rest equally.', { trim: true }),
          dn('The middle ' + (m2 / 100).toFixed(2) + '% of ' + c.pl + ' lie in an interval centered at the mean μ = ' + fx(mu) + '. Find the <b>lower</b> end of this interval.', xv(-z2), 2, 'The tails share the rest equally.', { trim: true }),
          dn('The middle ' + (m3 / 100).toFixed(2) + '% of ' + c.pl + ' lie in an interval centered at the mean μ = ' + fx(mu) + '. Find the <b>length</b> of this interval (upper end minus lower end).', 2 * z3 * sd, 2, 'Twice the distance from the mean to the upper end.', { trim: true })
        ];
        var tl = function (m) { return 'The tails share 1 − ' + f4(m) + ' = ' + f4(10000 - m) + ', so each has ' + f4((10000 - m) / 2) + ' and Φ(<i>z</i>) = ' + f4(10000 - (10000 - m) / 2) + '. '; };
        sol = steps([
          tl(m1) + conv(z1, 1),
          tl(m2) + 'The lower end is below the mean. ' + conv(z2, -1),
          tl(m3) + 'Look up the z-score: ' + f4(T(z3)) + ' is at ' + loc(z3) + ', so the interval runs from z = −' + zs(z3) + ' to z = ' + zs(z3) + ', i.e. μ ± ' + zs(z3) + 'σ. Length = 2 × ' + zs(z3) + ' × ' + fx(sd) + ' = <b>' + fx(Math.round(2 * z3 * sd * 100) / 100) + '</b>.']);
        chk.push([T(z1) / 1e4, Phi(z1)], [T(z2) / 1e4, Phi(z2)], [T(z3) / 1e4, Phi(z3)]);
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: { chkInv: chk } };
    }
  });
})();
