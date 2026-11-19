/* Block N, part 3: the Normal approximation for proportions, counts and totals. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;
  var T = H.T, PHI = H.PHI, Phi = H.Phi, f4 = H.f4, zs = H.zs, fx = H.fx, dn = H.dn, pn = H.pn, rz = H.rz, isDp = H.isDp, phiTxt = H.phiTxt, U = H.U, CTX = H.CTX;
  function ck(arr, a4, e) { arr.push([a4 / 1e4, e]); }
  function big(v) { return String(fx(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }   /* thin space as thousands separator */

  /* =========================================================== 12. a proportion */
  /* [p, n, standard deviation of p-hat]; n p >= 10 and n (1 - p) >= 10 so the Normal approximation is reasonable */
  var PHAT = [[.5, 100, .05], [.5, 400, .025], [.5, 25, .1], [.2, 100, .04], [.2, 400, .02], [.1, 100, .03], [.1, 225, .02], [.1, 400, .015], [.8, 100, .04], [.8, 400, .02], [.9, 100, .03]];
  var SCEN = {
    0: function (p_, n) { return 'A fair coin (<i>p</i> = 0.5) is flipped <b>' + n + '</b> times. Let <i>X</i><sub>i</sub> = 1 if flip <i>i</i> is heads and 0 otherwise (<i>X</i><sub>i</sub> ~ Bernoulli(0.5)). The proportion of heads is p̂ = (<i>X</i><sub>1</sub> + … + <i>X</i><sub>n</sub>)/<i>n</i>, where <i>n</i> = ' + n + ' is the number of flips.'; },
    1: function (p_, n) { return 'In a large city, a share <i>p</i> = <b>' + p_ + '</b> of residents support a new tax. A random sample of <b>' + n + '</b> residents is asked. Let <i>X</i><sub>i</sub> = 1 if resident <i>i</i> supports it and 0 otherwise (<i>X</i><sub>i</sub> ~ Bernoulli(' + p_ + ')). The sample proportion is p̂ = (<i>X</i><sub>1</sub> + … + <i>X</i><sub>n</sub>)/<i>n</i>, where <i>n</i> = ' + n + ' is the sample size.'; },
    2: function (p_, n) { return 'A factory produces items and a share <i>p</i> = <b>' + p_ + '</b> of them are defective. A random sample of <b>' + n + '</b> items is inspected. Let <i>X</i><sub>i</sub> = 1 if item <i>i</i> is defective and 0 otherwise (<i>X</i><sub>i</sub> ~ Bernoulli(' + p_ + ')). The proportion of defective items in the sample is p̂ = (<i>X</i><sub>1</sub> + … + <i>X</i><sub>n</sub>)/<i>n</i>, where <i>n</i> = ' + n + ' is the sample size.'; }
  };
  P.reg('phat', {
    title: 'Approximation: a proportion', section: 4, est: 170, table: true,
    topic: 'A sample proportion is a mean of 0/1 variables, so for large n it is approximately Normal.',
    variants: ['Fair coin', 'Survey', 'Quality control: find the cutoff'],
    gen: function (v) {
      var pool = PHAT.filter(function (r) { return v === 0 ? r[0] === .5 : v === 1 ? (r[0] === .2 || r[0] === .8 || r[0] === .1) : (r[0] === .1 || r[0] === .2) && r[1] >= 100; });
      var r = pick(pool), pp = r[0], n = r[1], se = r[2], chk = [], parts, sol;
      var mode = v === 1 ? 'between' : v === 2 ? 'cutoff' : pick(['above', 'below']);
      var pickZ = function (lo, hi, attain) { for (var g = 0; g < 600; g++) { var z = rz(lo, hi), x = pp + z * se; if (isDp(x, attain ? 3 : 4) && (!attain || isDp(x * n, 0))) return z; } return 1.5; };
      var xs = function (z) { return Math.round((pp + z * se) * 10000) / 10000; };
      var seTxt = 'SD(p̂) = √(<i>p</i>(1 − <i>p</i>)/<i>n</i>) = √(' + pp + ' × ' + (Math.round((1 - pp) * 10) / 10) + ' / ' + n + ') = <b>' + fx(se) + '</b>';
      var stmt = p(SCEN[v](pp, n)) + p('By the CLT, p̂ is approximately Normal.') + H.ZDEF + p('Use the standard Normal table. Give the standard deviation of p̂ to 3 decimals, z-scores to 2 decimals and probabilities to 4 decimals.');
      var sePart = dn('Find the standard deviation of p̂ (also called its standard error).', se, 3, 'SE = √(p(1−p)/n).', { trim: true });
      if (mode === 'between') {
        var za = pickZ(.2, 2.5, true), zb = pickZ(.2, 2.5, true), lo = xs(-za), hi = xs(zb), ans = PHI(zb) - PHI(-za);
        parts = [sePart, dn('Find the z-score of p̂ = ' + fx(hi) + '.', zb, 2, 'Distance from p in standard deviations.'), pn('Find P(' + fx(lo) + ' < p̂ < ' + fx(hi) + ').', ans, 'Difference of two Φ values.')];
        sol = steps([seTxt + '.', 'z for ' + fx(hi) + ': (' + fx(hi) + ' − ' + pp + ') / ' + fx(se) + ' = <b>' + zs(zb) + '</b>. For ' + fx(lo) + ': (' + fx(lo) + ' − ' + pp + ') / ' + fx(se) + ' = ' + zs(-za) + '.', 'P = Φ(' + zs(zb) + ') − Φ(' + zs(-za) + '). ' + phiTxt(zb) + '; ' + phiTxt(-za) + '. Difference: <b>' + f4(ans) + '</b>.']);
        ck(chk, ans, Phi(zb) - Phi(-za));
      } else if (mode === 'cutoff') {
        var z = pickZ(.2, 2.55, true), pv = 10000 - T(z), cc = xs(z);
        parts = [sePart, dn('To find the cutoff you first need the z-score <i>z</i> for which P(<i>Z</i> > <i>z</i>) = ' + f4(pv) + ', where <i>Z</i> is a standard Normal variable. Find <i>z</i>.', z, 2, 'Right tail: look up 1 − p.'),
          dn('Find the proportion <i>c</i> such that P(p̂ > <i>c</i>) = ' + f4(pv) + ' (that is, ' + (pv / 100).toFixed(2) + '% of samples have a proportion above <i>c</i>).', cc, 4, 'Convert the z-score back to a proportion.', { trim: true })];
        sol = steps([seTxt + '.', 'Φ(<i>z</i>) = 1 − ' + f4(pv) + ' = ' + f4(T(z)) + ', found at ' + H.loc(z) + ': <i>z</i> = <b>' + zs(z) + '</b>.', 'Convert back: <i>c</i> = <i>p</i> + <i>z</i> · SD(p̂) = ' + pp + ' + ' + zs(z) + ' × ' + fx(se) + ' = <b>' + fx(cc) + '</b>.']);
        chk.push([T(z) / 1e4, Phi(z)]);
      } else {
        var up = mode === 'above', zz = pickZ(.2, 2.8, true), x = xs(up ? zz : -zz), pv2 = 10000 - T(zz);
        parts = [sePart, dn('Find the z-score of p̂ = ' + fx(x) + '.', up ? zz : -zz, 2, 'Distance from p in standard deviations.'), pn('Find P(p̂ ' + (up ? '>' : '<') + ' ' + fx(x) + ').', pv2, up ? 'A right tail.' : 'A left tail below the mean: use symmetry.')];
        sol = steps([seTxt + '.', 'z = (' + fx(x) + ' − ' + pp + ') / ' + fx(se) + ' = <b>' + zs(up ? zz : -zz) + '</b>.', up ? 'P(p̂ > ' + fx(x) + ') = 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv2) + '</b>.' : 'P(p̂ < ' + fx(x) + ') = Φ(' + zs(-zz) + ') = 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv2) + '</b>.']);
        ck(chk, pv2, up ? 1 - Phi(zz) : Phi(-zz));
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: mode === 'cutoff' ? { chkInv: chk } : { chk: chk } };
    }
  });

  /* =========================================================== 13. a count (binomial) */
  var BIN = [[100, .5, 5], [400, .5, 10], [64, .5, 4], [144, .5, 6], [196, .5, 7], [256, .5, 8], [900, .5, 15], [100, .2, 4], [400, .2, 8], [225, .2, 6], [625, .2, 10], [100, .8, 4], [225, .8, 6], [100, .1, 3], [900, .1, 9]];
  var BTXT = {
    .5: function (n) { return 'A fair coin is flipped <b>' + n + '</b> times. Let <i>K</i> be the number of heads, so <i>K</i> ~ B(' + n + ', 0.5).'; },
    .2: function (n) { return 'Each of <b>' + n + '</b> visitors to a website buys something with probability 0.2, independently. Let <i>K</i> be the number of buyers, so <i>K</i> ~ B(' + n + ', 0.2).'; },
    .8: function (n) { return 'A treatment cures a patient with probability 0.8, independently. It is given to <b>' + n + '</b> patients. Let <i>K</i> be the number cured, so <i>K</i> ~ B(' + n + ', 0.8).'; },
    .1: function (n) { return 'An airline sells <b>' + n + '</b> tickets and each passenger independently fails to show up with probability 0.1. Let <i>K</i> be the number of no-shows, so <i>K</i> ~ B(' + n + ', 0.1).'; }
  };
  P.reg('binom', {
    title: 'Approximation: a count', section: 4, est: 180, table: true,
    topic: 'For large n, the number of successes in a Binomial experiment is approximately Normal.',
    variants: ['Above a count', 'Below a count', 'Between two counts', 'Find the cutoff count'],
    gen: function (v) {
      var r = pick(BIN), n = r[0], pp = r[1], sd = r[2], mu = Math.round(n * pp * 100) / 100, chk = [], parts, sol;
      var pickZ = function (lo, hi) { for (var g = 0; g < 400; g++) { var z = rz(lo, hi); if (isDp(z * sd, 0)) return z; } return 1.5; };
      var stmt = p(BTXT[pp](n)) + p('Approximate <i>K</i> by a Normal variable with the same mean and variance as <i>K</i> (treat <i>K</i> as a continuous Normal variable and use the numbers in the questions directly, with no adjustment).') + H.ZDEF + p('Use the standard Normal table. Give the standard deviation and z-scores to 2 decimals and probabilities to 4 decimals.');
      var head = [dn('Find the mean of <i>K</i>.', mu, 2, 'np.', { trim: true, noquiz: true }), dn('Find the standard deviation of <i>K</i>.', sd, 2, 'The square root of the variance.', { trim: true })];
      var hs = 'Mean <i>np</i> = ' + n + ' × ' + pp + ' = ' + fx(mu) + '. SD = √(<i>np</i>(1 − <i>p</i>)) = √(' + n + ' × ' + pp + ' × ' + (Math.round((1 - pp) * 10) / 10) + ') = √' + (sd * sd) + ' = <b>' + sd + '</b>.';
      if (v === 0 || v === 1) {
        var up = v === 0, z = pickZ(.2, 2.8), k = Math.round(mu + (up ? 1 : -1) * z * sd), zz = Math.abs(Math.round((k - mu) / sd * 100) / 100), pv = 10000 - T(zz);
        parts = head.concat([dn('Find the z-score of <i>K</i> = ' + k + '.', (k - mu) / sd, 2, 'Distance from the mean in standard deviations.'), pn('Find, approximately, P(<i>K</i> ' + (up ? '>' : '<') + ' ' + k + ').', pv, up ? 'A right tail.' : 'A left tail below the mean: use symmetry.')]);
        sol = steps([hs, 'z = (' + k + ' − ' + fx(mu) + ') / ' + sd + ' = <b>' + zs((k - mu) / sd) + '</b>.', up ? 'P(<i>K</i> > ' + k + ') ≈ 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv) + '</b>.' : 'P(<i>K</i> < ' + k + ') ≈ Φ(' + zs(-zz) + ') = 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv) + '</b>.']);
        ck(chk, pv, up ? 1 - Phi(zz) : Phi(-zz));
      } else if (v === 2) {
        var za = pickZ(.2, 2.4), zb = pickZ(.2, 2.4), lo = Math.round(mu - za * sd), hi = Math.round(mu + zb * sd), zl = Math.round((lo - mu) / sd * 100) / 100, zh = Math.round((hi - mu) / sd * 100) / 100, ans = PHI(zh) - PHI(zl);
        parts = head.concat([dn('Find the z-score of <i>K</i> = ' + hi + '.', zh, 2, 'Distance from the mean in standard deviations.'), pn('Find, approximately, P(' + lo + ' < <i>K</i> < ' + hi + ').', ans, 'Difference of two Φ values.')]);
        sol = steps([hs, 'z for ' + hi + ': (' + hi + ' − ' + fx(mu) + ') / ' + sd + ' = <b>' + zs(zh) + '</b>. For ' + lo + ': ' + zs(zl) + '.', 'P(' + lo + ' < <i>K</i> < ' + hi + ') ≈ Φ(' + zs(zh) + ') − Φ(' + zs(zl) + '). ' + phiTxt(zh) + '; ' + phiTxt(zl) + '. Difference: <b>' + f4(ans) + '</b>.']);
        ck(chk, ans, Phi(zh) - Phi(zl));
      } else {
        var zc = pickZ(.2, 2.55), kc = Math.round(mu + zc * sd), pc = 10000 - T(zc);
        parts = head.concat([dn('To find the cutoff count you first need the z-score <i>z</i> for which P(<i>Z</i> > <i>z</i>) = ' + f4(pc) + ', where <i>Z</i> is a standard Normal variable. Find <i>z</i>.', zc, 2, 'Right tail: look up 1 − p.'), dn('Find the count <i>k</i> such that, approximately, P(<i>K</i> > <i>k</i>) = ' + f4(pc) + '.', kc, 0, 'Convert the z-score back to a count.', { trim: true })]);
        sol = steps([hs, 'Φ(<i>z</i>) = 1 − ' + f4(pc) + ' = ' + f4(T(zc)) + ', found at ' + H.loc(zc) + ': <i>z</i> = <b>' + zs(zc) + '</b>.', 'Convert back: <i>k</i> = mean + <i>z</i> · SD = ' + fx(mu) + ' + ' + zs(zc) + ' × ' + sd + ' = <b>' + kc + '</b>.']);
        chk.push([T(zc) / 1e4, Phi(zc)]);
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: v === 3 ? { chkInv: chk } : { chk: chk } };
    }
  });

  /* =========================================================== 14. a total */
  P.reg('total', {
    title: 'Approximation: a total', section: 4, est: 190, table: true,
    topic: 'A total of many independent measurements is approximately Normal (CLT).',
    variants: ['Total above a limit', 'Total below a budget', 'Total between two values'],
    gen: function (v) {
      var pool = CTX.filter(function (q) { return q.tot; }), c = pick(pool), mu = pick(c.mus), sd = H.sdFor(c, mu), k = pick([4, 5, 6, 8, 10]), n = k * k, chk = [], parts, sol;
      var tm = n * mu, tsd = sd * k;
      var pickZ = function (lo, hi) { for (var g = 0; g < 400; g++) { var z = rz(lo, hi); if (isDp(tm + z * tsd, 1)) return z; } return 1.5; };
      var Sx = function (z) { return Math.round((tm + z * tsd) * 100) / 100; };
      var stmt = p(c.totTxt(n) + ', each with mean μ = <b>' + U(c, mu) + '</b> and standard deviation σ = <b>' + U(c, sd) + '</b>. Let <i>S</i> be the ' + c.totName + ' (the sum of the ' + n + ' values). Assume the CLT applies, so <i>S</i> is approximately Normal.') + H.ZDEF + p('Use the standard Normal table. Give the mean and SD of <i>S</i> exactly, z-scores to 2 decimals and probabilities to 4 decimals.');
      var head = [num('Find E(<i>S</i>).', F(tm), 'The mean of a sum.', { noquiz: true }), dn('Find SD(<i>S</i>).', tsd, 2, 'The variances of independent values add.', { trim: true })];
      var hs = 'E(<i>S</i>) = <i>n</i>μ = ' + n + ' × ' + fx(mu) + ' = ' + big(tm) + '. SD(<i>S</i>) = σ√<i>n</i> = ' + fx(sd) + ' × √' + n + ' = ' + fx(sd) + ' × ' + k + ' = <b>' + big(tsd) + '</b>.';
      if (v < 2) {
        var up = v === 0, z = pickZ(.2, 2.8), s = Sx(up ? z : -z), zz = Math.abs(Math.round((s - tm) / tsd * 100) / 100), pv = 10000 - T(zz);
        parts = head.concat([dn('Find the z-score of <i>S</i> = ' + big(s) + '.', (s - tm) / tsd, 2, 'Distance from E(S) in standard deviations of S.'), pn('Find, approximately, P(<i>S</i> ' + (up ? '>' : '<') + ' ' + big(s) + ').', pv, up ? 'A right tail.' : 'A left tail below the mean: use symmetry.')]);
        sol = steps([hs, 'z = (' + big(s) + ' − ' + big(tm) + ') / ' + big(tsd) + ' = <b>' + zs(zz * (up ? 1 : -1)) + '</b>.', up ? 'P(<i>S</i> > ' + big(s) + ') ≈ 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv) + '</b>.' : 'P(<i>S</i> < ' + big(s) + ') ≈ Φ(' + zs(-zz) + ') = 1 − Φ(' + zs(zz) + ') = 1 − ' + f4(T(zz)) + ' = <b>' + f4(pv) + '</b>.']);
        ck(chk, pv, up ? 1 - Phi(zz) : Phi(-zz));
      } else {
        var za = pickZ(.2, 2.4), zb = pickZ(.2, 2.4), lo = Sx(-za), hi = Sx(zb), zl = Math.round((lo - tm) / tsd * 100) / 100, zh = Math.round((hi - tm) / tsd * 100) / 100, ans = PHI(zh) - PHI(zl);
        parts = head.concat([dn('Find the z-score of <i>S</i> = ' + big(hi) + '.', zh, 2, 'Distance from E(S) in standard deviations of S.'), pn('Find, approximately, P(' + big(lo) + ' < <i>S</i> < ' + big(hi) + ').', ans, 'Difference of two Φ values.')]);
        sol = steps([hs, 'z for ' + big(hi) + ': (' + big(hi) + ' − ' + big(tm) + ') / ' + big(tsd) + ' = <b>' + zs(zh) + '</b>. For ' + big(lo) + ': ' + zs(zl) + '.', 'P ≈ Φ(' + zs(zh) + ') − Φ(' + zs(zl) + '). ' + phiTxt(zh) + '; ' + phiTxt(zl) + '. Difference: <b>' + f4(ans) + '</b>.']);
        ck(chk, ans, Phi(zh) - Phi(zl));
      }
      return { stmt: stmt, parts: parts, sol: sol, meta: { chk: chk } };
    }
  });
})();
