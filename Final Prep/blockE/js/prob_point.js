/* Block E, part 1: point estimation (unbiasedness, randomized response, efficiency) and shared helpers. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;
  var XB = 'X̄';

  /* ---------- shared helpers (used by the other prob_ files) ---------- */
  function fx(v) { var s = String(+Math.abs(v).toFixed(4)); return (v < 0 && +s !== 0 ? M : '') + s; }
  function r2(v) { return Math.round((v + 1e-9 * (v < 0 ? -1 : 1)) * 100) / 100; }
  function isDp(x, dp) { var s = Math.pow(10, dp); return Math.abs(x * s - Math.round(x * s)) < 1e-6; }
  function dn(pr, v, dp, ex, o) {                         /* decimal numeric part, answer shown with dp decimals */
    var s = Math.pow(10, dp), n = Math.round(v * s + (v < 0 ? -1e-7 : 1e-7)), r = num(pr, F(n, s), ex, o);
    r.a = (n < 0 ? M : '') + (Math.abs(n) / s).toFixed(dp); return r;
  }
  function dt(pr, v, ex, o) {                             /* decimal numeric part, trailing zeros trimmed */
    var n = Math.round(v * 10000), r = num(pr, F(n, 10000), ex, o); r.a = fx(n / 10000); return r;
  }
  function it(s) { return '<i>' + s + '</i>'; }
  function sb(s, i) { return '<i>' + s + '</i><sub>' + i + '</sub>'; }
  var Z = { 90: 1.645, 95: 1.96, 99: 2.576 };
  H.Z = Z; H.fx = fx; H.r2 = r2; H.isDp = isDp; H.dn = dn; H.dt = dt;
  H.NOTE = '<p class="note">Critical values: <b>90%</b>: <i>z</i> = 1.645, <b>95%</b>: <i>z</i> = 1.96, <b>99%</b>: <i>z</i> = 2.576. Round answers to 2 decimals unless the answer is exact.</p>';

  var CTX = [
    { name: 'the weekly study time of a student', unit: 'hours', mus: [12, 15, 18, 20], sds: [4, 5, 6, 8] },
    { name: 'the commute time of a student to campus', unit: 'minutes', mus: [25, 30, 35, 40], sds: [6, 8, 10, 12] },
    { name: 'the daily sales of a café', unit: '$', mus: [400, 450, 500, 600], sds: [50, 80, 100, 120] },
    { name: 'the battery life of a phone', unit: 'hours', mus: [20, 24, 30], sds: [3, 4, 6, 9] },
    { name: 'the monthly electricity bill of a household', unit: '$', mus: [80, 100, 120, 150], sds: [10, 20, 25, 40] },
    { name: 'the test score of a student', unit: 'points', mus: [60, 65, 70, 75], sds: [8, 10, 12, 15] }
  ];
  function U(c, v) { return c.unit === '$' ? '$' + fx(v) : fx(v) + ' ' + c.unit; }
  function Un(c, v) { return c.unit === '$' ? '$' + fx(v) : fx(v) + ' ' + c.unit; }
  /* population draw: sigma known, n = k^2 so that SE = sigma/k is a short decimal */
  function draw(pool, ks) {
    var c = pick(pool || CTX), mu = pick(c.mus), sd = pick(c.sds), k = pick(ks || [4, 5, 6, 8, 10]);
    for (var g = 0; g < 200 && !isDp(sd / k, 1); g++) { sd = pick(c.sds); k = pick(ks || [4, 5, 6, 8, 10]); }
    var xb = Math.round((mu + ri(-8, 8) * sd / 16) * 10) / 10;
    return { c: c, mu: mu, sd: sd, k: k, n: k * k, se: sd / k, xb: xb };
  }
  H.CTX = CTX; H.U = U; H.draw = draw; H.it = it; H.sb = sb;

  function dc(f) { var d = f.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 ? fx(H.fv(f)) : H.fs(f); }
  var TH = '<span class="hat">θ</span>';
  function th(i) { return TH + '<sub>' + i + '</sub>'; }
  function pop(mu) { return 'a population with mean μ = <b>' + mu + '</b>'; }

  /* ========================================================= 1. unbiasedness */
  function lin(w, s) {                                    /* (w1 X1 + w2 X2 + ...)/s as html */
    var t = [];
    w.forEach(function (c, i) { if (c === 0) return; t.push((c === 1 ? '' : c) + sb('X', i + 1)); });
    return (t.length > 1 ? '(' + t.join(' + ') + ')' : t[0]) + (s === 1 ? '' : '/' + s);
  }
  function wEst(unb) {                                    /* weights for 3 observations: sum/s = 1 iff unbiased */
    for (var g = 0; g < 300; g++) {
      var s = pick([2, 3, 4, 5, 6]), a = ri(0, s), b = ri(0, s - a), c = s - a - b, w = [a, b, c];
      if (unb) { if (w.filter(function (t) { return t > 0; }).length < 2) continue; return { w: shuffle(w), s: s, tot: s }; }
      var tot = pick([s - 2, s - 1, s + 1, s + 2]); if (tot < 1 || tot === s) continue;
      a = ri(0, tot); b = ri(0, tot - a); c = tot - a - b; w = [a, b, c];
      if (w.filter(function (t) { return t > 0; }).length < 2) continue; return { w: shuffle(w), s: s, tot: tot };
    }
    return unb ? { w: [1, 1, 1], s: 3, tot: 3 } : { w: [1, 1, 1], s: 4, tot: 3 };
  }
  P.reg('unbiased', {
    title: 'Is the estimator unbiased?', section: 1, est: 150,
    topic: 'Compute E(<span class="hat">θ</span>) for simple estimators and decide whether they are unbiased.',
    variants: ['Weighted averages of 3 values', 'Dividing by n vs. n − 1', 'Shifted or rescaled mean', 'Estimating a probability'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var kind = pick(['AB', 'A', 'B', 'AB', 'none']), mu = pick([60, 120, 180, 240]);
        var A = wEst(kind.indexOf('A') >= 0), B = wEst(kind.indexOf('B') >= 0);
        for (var gg = 0; gg < 50 && JSON.stringify(A) === JSON.stringify(B); gg++) B = wEst(kind.indexOf('B') >= 0);
        var EA = F(A.tot * mu, A.s), EB = F(B.tot * mu, B.s);
        var ans = kind === 'AB' ? 0 : kind === 'A' ? 1 : kind === 'B' ? 2 : 3;
        function estP(e, lab) { return 'Find E(' + lab + ').'; }
        out = { stmt: p('A random sample <i>X</i><sub>1</sub>, <i>X</i><sub>2</sub>, <i>X</i><sub>3</sub> is drawn from ' + pop(mu) + '. Two estimators of μ are ' + th('A') + ' = ' + lin(A.w, A.s) + ' and ' + th('B') + ' = ' + lin(B.w, B.s) + '.'),
          parts: [
            num(estP(0, '<span class="hat">θ</span><sub>A</sub>') + ' (Use E(<i>X</i><sub>i</sub>) = μ.)', EA, 'E of a sum is the sum of the E: the weights add up to ' + A.tot + '/' + A.s + ', so E(' + th('A') + ') = ' + A.tot + '/' + A.s + ' · ' + mu + '.'),
            num(estP(0, '<span class="hat">θ</span><sub>B</sub>') + ' (Use E(<i>X</i><sub>i</sub>) = μ.)', EB, 'The weights add up to ' + B.tot + '/' + B.s + ', so E(' + th('B') + ') = ' + B.tot + '/' + B.s + ' · ' + mu + '.'),
            mc('Which of ' + th('A') + ' and ' + th('B') + ' are unbiased estimators of μ?', ['Both', 'Only ' + th('A'), 'Only ' + th('B'), 'Neither'], ans, 'An estimator is unbiased when E equals μ, that is, when the weights add up to 1.', true)],
          sol: steps(['Each <i>X</i><sub>i</sub> has E = μ = ' + mu + ', and E of a weighted sum is the weighted sum of the E. So E(' + th('A') + ') = (' + A.w.join(' + ') + ')/' + A.s + ' · ' + mu + ' = <b>' + H.fd(EA) + '</b>.',
            'E(' + th('B') + ') = (' + B.w.join(' + ') + ')/' + B.s + ' · ' + mu + ' = <b>' + H.fd(EB) + '</b>.',
            'Unbiased means E(<span class="hat">θ</span>) = μ = ' + mu + ': ' + th('A') + ' is ' + (EA.n === mu * EA.d ? '' : 'not ') + 'unbiased and ' + th('B') + ' is ' + (EB.n === mu * EB.d ? '' : 'not ') + 'unbiased. Answer: <b>' + ['both', 'only <span class="hat">θ</span><sub>A</sub>', 'only <span class="hat">θ</span><sub>B</sub>', 'neither'][ans] + '</b>. (Rule: the weights must add up to 1.)']) };
      } else if (v === 1) {
        var n = pick([4, 5]), vals, g, SS, mean0;
        for (g = 0; g < 2000; g++) {
          vals = []; for (var i = 0; i < n; i++) vals.push(ri(1, 14));
          var sm = vals.reduce(function (a, b) { return a + b; }, 0); if (sm % n) continue;
          mean0 = sm / n; SS = vals.reduce(function (a, b) { return a + (b - mean0) * (b - mean0); }, 0);
          if (SS > 0 && SS % (n * (n - 1)) === 0 && SS / (n * (n - 1)) >= 1) break;
        }
        if (g >= 2000) { n = 4; vals = [2, 4, 6, 8]; mean0 = 5; SS = 20; var fix = [1, 3, 5, 11]; vals = fix; mean0 = 5; SS = 16 + 4 + 0 + 36; }
        var s2 = F(SS, n - 1), sn = F(SS, n), sg2 = pick([2, 3, 4, 5]) * n * 2;
        var EV = F(sg2 * (n - 1), n);
        out = { stmt: p('A random sample of <i>n</i> = <b>' + n + '</b> values is drawn from a population with variance σ². The sample is <b>' + vals.join(', ') + '</b>. Two estimators of σ² are: ' + it('s') + '² = (1/(' + it('n') + ' − 1)) Σ(<i>X</i><sub>i</sub> − ' + XB + ')², which divides by <i>n</i> − 1, and ' + it('<span class="hat">σ</span>') + '² = (1/' + it('n') + ') Σ(<i>X</i><sub>i</sub> − ' + XB + ')², which divides by <i>n</i>.'),
          parts: [
            num('Compute ' + it('s') + '² (divide by <i>n</i> − 1) for this sample.', s2, 'Mean ' + mean0 + ', sum of squared deviations ' + SS, { }),
            num('Compute ' + it('<span class="hat">σ</span>') + '² (divide by <i>n</i>) for this sample.', sn, 'Same sum of squares, divided by n = ' + n + '.'),
            num('Suppose the population variance is σ² = ' + sg2 + '. For samples of size <i>n</i> = ' + n + ', the estimator ' + it('<span class="hat">σ</span>') + '² (divides by <i>n</i>) has E(' + it('<span class="hat">σ</span>') + '²) = ((<i>n</i> − 1)/<i>n</i>) σ². Compute E(' + it('<span class="hat">σ</span>') + '²).', EV, 'Multiply σ² by (n − 1)/n = ' + (n - 1) + '/' + n + '.'),
            mc('Which estimator of σ² is unbiased?', ['Only ' + it('s') + '² (divides by <i>n</i> − 1)', 'Only ' + it('<span class="hat">σ</span>') + '² (divides by <i>n</i>)', 'Both', 'Neither'], 0, 'E(s²) = σ², while dividing by n gives a value that is too small on average.')],
          sol: steps(['Mean = ' + mean0 + '. Deviations: ' + vals.map(function (x) { return fx(x - mean0); }).join(', ') + '. Sum of squares = <b>' + SS + '</b>.',
            it('s') + '² = ' + SS + '/' + (n - 1) + ' = <b>' + H.fd(s2) + '</b>.',
            it('<span class="hat">σ</span>') + '² = ' + SS + '/' + n + ' = <b>' + H.fd(sn) + '</b>.',
            'E(' + it('<span class="hat">σ</span>') + '²) = ((' + n + ' − 1)/' + n + ') · ' + sg2 + ' = <b>' + H.fd(EV) + '</b>, below σ² = ' + sg2 + ': the divide-by-<i>n</i> estimator is biased downward. Only ' + it('s') + '² is unbiased.']) };
      } else if (v === 2) {
        var typ = pick(['shift', 'shift', 'scale']), mu2 = pick([40, 50, 60, 80, 100]), m4, xs;
        for (g = 0; g < 500; g++) { xs = [mu2 + ri(-8, 8), mu2 + ri(-8, 8), mu2 + ri(-8, 8), mu2 + ri(-8, 8)]; var s4 = xs[0] + xs[1] + xs[2] + xs[3]; if (s4 % 4 === 0 && new Set(xs).size > 2) break; }
        if (g >= 500) xs = [mu2 - 2, mu2 + 2, mu2 - 4, mu2 + 4];
        m4 = (xs[0] + xs[1] + xs[2] + xs[3]) / 4;
        var estTxt, Ev, bias, val, fixTxt;
        if (typ === 'shift') {
          var c = pick([-5, -3, -2, 2, 3, 5]); estTxt = XB + ' ' + (c < 0 ? M : '+') + ' ' + Math.abs(c);
          Ev = F(mu2 + c); bias = F(c); val = F(m4 + c); fixTxt = 'subtract ' + c + (c < 0 ? ' (add ' + (-c) + ')' : '');
          fixTxt = c > 0 ? 'subtract ' + c + ' from ' + th('') : 'add ' + (-c) + ' to ' + th('');
        } else {
          var kf = pick([[1, 2], [3, 2], [2, 1], [4, 5], [3, 1]]); estTxt = (kf[1] === 1 ? kf[0] : kf[0] + '/' + kf[1]) + ' · ' + XB;
          Ev = F(mu2 * kf[0], kf[1]); bias = F(mu2 * kf[0] - mu2 * kf[1], kf[1]); val = F(m4 * kf[0], kf[1]); fixTxt = 'multiply ' + th('') + ' by ' + (kf[1] === 1 ? '1/' + kf[0] : kf[1] + '/' + kf[0]);
        }
        out = { stmt: p('A random sample of <i>n</i> = 4 values is drawn from ' + pop(mu2) + '. The sample is <b>' + xs.join(', ') + '</b>. Consider the estimator ' + th('') + ' = ' + estTxt + ' of μ. The <b>bias</b> of an estimator is E(' + th('') + ') − μ.'),
          parts: [
            num('Find E(' + th('') + '). (Use E(' + XB + ') = μ.)', Ev, 'E(' + th('') + ') = ' + estTxt.replace(XB, 'E(' + XB + ')') + ' = ' + H.fd(Ev) + '.'),
            num('Find the bias of ' + th('') + '.', bias, 'Bias = E(' + th('') + ') − μ = ' + H.fd(Ev) + ' − ' + mu2 + '.'),
            num('Compute the value of ' + th('') + ' for the sample above.', val, 'Compute ' + XB + ' = ' + m4 + ', then apply the formula.')],
          sol: steps(['E(' + XB + ') = μ = ' + mu2 + ', so E(' + th('') + ') = ' + estTxt.replace(XB, mu2 + '') + ' = <b>' + H.fd(Ev) + '</b>.',
            'Bias = E(' + th('') + ') − μ = ' + H.fd(Ev) + ' − ' + mu2 + ' = <b>' + H.fd(bias) + '</b>' + (bias.n === 0 ? '' : ': ' + th('') + ' is biased') + '.',
            XB + ' = (' + xs.join(' + ') + ')/4 = ' + m4 + ', so ' + th('') + ' = <b>' + H.fd(val) + '</b>. To get an unbiased estimator, ' + fixTxt.replace(th(''), th('')) + ' (this just gives back ' + XB + ' = ' + m4 + ').']) };
      } else {
        var n3 = pick([4, 5, 6]), pp = pick([F(1, 5), F(1, 4), F(1, 3), F(2, 5), F(3, 5), F(3, 4)]);
        var pool = [
          { t: '(<i>X</i><sub>1</sub> + … + <i>X</i><sub>' + n3 + '</sub>)/' + n3 + ' = ' + XB, E: pp, u: true },
          { t: '<i>X</i><sub>1</sub> (only the first value)', E: pp, u: true },
          { t: '(<i>X</i><sub>1</sub> + … + <i>X</i><sub>' + n3 + '</sub> + 1)/' + (n3 + 2), E: H.div(H.add(H.mul(F(n3), pp), F(1)), F(n3 + 2)), u: false },
          { t: '(<i>X</i><sub>1</sub> + … + <i>X</i><sub>' + n3 + '</sub>)/' + (n3 + 1), E: H.div(H.mul(F(n3), pp), F(n3 + 1)), u: false },
          { t: '(<i>X</i><sub>1</sub> + … + <i>X</i><sub>' + n3 + '</sub>)/' + (n3 - 1), E: H.div(H.mul(F(n3), pp), F(n3 - 1)), u: false }
        ];
        var ch, e1, e2, gq = 0; do { ch = shuffle([0, 1, 2, 3, 4]).slice(0, 2); e1 = pool[ch[0]]; e2 = pool[ch[1]]; } while (H.fv(e1.E) === H.fv(e2.E) && gq++ < 50);
        var ans2 = e1.u && e2.u ? 0 : e1.u ? 1 : e2.u ? 2 : 3;
        out = { stmt: p('A coin lands heads with unknown probability <i>p</i> (the <i>true</i> value is <i>p</i> = ' + H.fs(pp) + '). It is tossed <b>' + n3 + '</b> times. Let <i>X</i><sub>i</sub> = 1 if toss <i>i</i> is heads and 0 otherwise, so E(<i>X</i><sub>i</sub>) = <i>p</i>. Two estimators of <i>p</i> are ' + th('A') + ' = ' + e1.t + ' and ' + th('B') + ' = ' + e2.t + '.'),
          parts: [
            num('Find E(' + th('A') + ') when <i>p</i> = ' + H.fs(pp) + '.', e1.E, 'Take E of each term: E(X<sub>i</sub>) = p = ' + H.fs(pp) + '.'),
            num('Find E(' + th('B') + ') when <i>p</i> = ' + H.fs(pp) + '.', e2.E, 'Take E of each term: E(X<sub>i</sub>) = p = ' + H.fs(pp) + '.'),
            mc('Which of ' + th('A') + ' and ' + th('B') + ' are unbiased estimators of <i>p</i>?', ['Both', 'Only ' + th('A'), 'Only ' + th('B'), 'Neither'], ans2, 'Unbiased means E(<span class="hat">θ</span>) = p.', true)],
          sol: steps(['E(' + th('A') + ') = <b>' + H.fd(e1.E) + '</b>' + (e1.u ? ' = <i>p</i>: unbiased.' : ' ≠ <i>p</i> = ' + H.fs(pp) + ': biased.'),
            'E(' + th('B') + ') = <b>' + H.fd(e2.E) + '</b>' + (e2.u ? ' = <i>p</i>: unbiased.' : ' ≠ <i>p</i> = ' + H.fs(pp) + ': biased.'),
            'Unbiased estimators: <b>' + ['both', 'only <span class="hat">θ</span><sub>A</sub>', 'only <span class="hat">θ</span><sub>B</sub>', 'neither'][ans2] + '</b>.']) };
      }
      return out;
    }
  });

  /* ========================================================= 2. randomized response */
  function drawRR(f, forcedNo) {                          /* true share ph, n respondents, k "Yes" answers */
    for (var g = 0; g < 800; g++) {
      var ph = F(ri(1, 14), 20), y = forcedNo ? H.mul(H.sub(F(1), f), ph) : H.add(f, H.mul(H.sub(F(1), f), ph)), n = pick([60, 80, 100, 120, 150, 200, 240, 300]);
      if (n % y.d === 0) return { n: n, k: y.n * (n / y.d), ph: ph, y: y };
    }
    var ph0 = F(1, 5), y0 = forcedNo ? H.mul(H.sub(F(1), f), ph0) : H.add(f, H.mul(H.sub(F(1), f), ph0)); return { n: y0.d * 10, k: y0.n * 10, ph: ph0, y: y0 };
  }
  var MON = { 3: 'January, February or March', 4: 'January, February, March or April', 6: 'one of the months January to June' };
  P.reg('randresp', {
    title: 'Randomized response', section: 1, est: 150,
    topic: 'Recover the true share from answers that are partly forced.',
    variants: ['Forced "Yes" by birth month', 'Forced "Yes" by coin or die', 'Forced "No" by birth month'],
    gen: function (v) {
      var out, f, d, ph, rule, ex;
      if (v === 0) {
        var m = pick([3, 4, 6]); f = F(m, 12); d = drawRR(f, false); var pt = pick([F(1, 5), F(1, 4), F(2, 5), F(3, 10)]);
        var PY = H.add(f, H.mul(H.sub(F(1), f), pt));
        out = { stmt: p('To ask <b>“Have you ever cheated during your studies?”</b> anonymously, each student follows this rule: if you were born in <b>' + MON[m] + '</b>, answer “Yes” whatever the truth; otherwise answer truthfully. The person collecting the answers does not know anyone’s birth month. Assume birth months are equally likely, so a share ' + H.fs(f) + ' of students are forced to say “Yes”. Let <i>p</i> be the true share of students who cheated.'),
          parts: [
            num('If the true share is <i>p</i> = ' + H.fs(pt) + ', what is P(“Yes”)? (Forced and truthful answers together.)', PY, 'P(Yes) = ' + H.fs(f) + ' · 1 + ' + H.fs(H.sub(F(1), f)) + ' · p.'),
            num('In a survey of <i>n</i> = ' + d.n + ' students, <b>' + d.k + '</b> answered “Yes”, so the share of “Yes” answers is <span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + '. Find the estimate <span class="hat">p</span> = (<span class="hat">y</span> − ' + H.fs(f) + ')/(' + H.fs(H.sub(F(1), f)) + ').', d.ph, 'Subtract the forced share, then divide by the truthful share.'),
            mc('A classmate suggests using the raw share <span class="hat">y</span> of ‘Yes’ answers as the estimate of the true share <i>p</i>. On average (in expectation), <span class="hat">y</span> is:', ['Too high, because forced “Yes” answers are added', 'Too low, because some students lie', 'Right on average, since <span class="hat">y</span> is a sample share', 'Equal to <i>p</i> exactly'], 0, 'E(<span class="hat">y</span>) = P(Yes) = f + (1 − f)p, which is larger than p whenever p < 1.')],
          sol: steps(['A student says “Yes” if forced (probability ' + H.fs(f) + ') or if not forced (probability ' + H.fs(H.sub(F(1), f)) + ') and truthful “Yes”: P(Yes) = ' + H.fs(f) + ' + ' + H.fs(H.sub(F(1), f)) + ' · ' + H.fs(pt) + ' = <b>' + H.fd(PY) + '</b>.',
            '<span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + '. <span class="hat">p</span> = (' + dc(d.y) + ' − ' + H.fs(f) + ')/(' + H.fs(H.sub(F(1), f)) + ') = <b>' + H.fd(d.ph) + '</b>.',
            'E(<span class="hat">y</span>) = ' + H.fs(f) + ' + ' + H.fs(H.sub(F(1), f)) + ' · p > p: the raw share is <b>too high</b>. The estimator <span class="hat">p</span> removes the forced part, and is unbiased.']) };
      } else if (v === 1) {
        var rr = pick([{ t: 'flips a coin in private: if it is heads, answer “Yes”, otherwise answer truthfully', f: F(1, 2), nm: 'heads', dev: 'coin' }, { t: 'rolls a die in private: if it shows 1 or 2, answer “Yes”, otherwise answer truthfully', f: F(1, 3), nm: '1 or 2', dev: 'die' }, { t: 'flips two coins in private: if both are heads, answer “Yes”, otherwise answer truthfully', f: F(1, 4), nm: 'both heads', dev: 'coins' }, { t: 'rolls a die in private: if it shows 1, answer “Yes”, otherwise answer truthfully', f: F(1, 6), nm: 'a 1', dev: 'die' }]);
        f = rr.f; d = drawRR(f, false); var pt2 = pick([F(1, 5), F(1, 4), F(2, 5), F(3, 10)]), nn = pick([60, 120, 240]);
        var EY = H.mul(F(nn), H.add(f, H.mul(H.sub(F(1), f), pt2)));
        out = { stmt: p('Respondents are asked a sensitive “Yes/No” question. Each respondent ' + rr.t + '. Nobody but the respondent sees the ' + rr.dev + '. Let <i>p</i> be the true share of respondents for whom the truthful answer is “Yes”.'),
          parts: [
            num('What is the probability that a respondent is <b>forced</b> to say “Yes” by this rule?', f, 'Count the favourable outcomes: the share of coin or die results that force a “Yes”.'),
            num('In a survey of <i>n</i> = ' + d.n + ' respondents, <b>' + d.k + '</b> answered “Yes”. Using the estimator <span class="hat">p</span> = (<span class="hat">y</span> − <i>f</i>)/(1 − <i>f</i>), where <span class="hat">y</span> is the share of “Yes” answers and <i>f</i> is the probability of being forced to say “Yes”, find <span class="hat">p</span>.', d.ph, 'f = ' + H.fs(f) + ', <span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + '.'),
            num('Suppose the true share is <i>p</i> = ' + H.fs(pt2) + ' and <i>n</i> = ' + nn + ' respondents are asked. What is the expected number of “Yes” answers?', EY, 'n · P(Yes) = n · (f + (1 − f)p).')],
          sol: steps(['The rule forces “Yes” when you get ' + rr.nm + ': <i>f</i> = <b>' + H.fs(f) + '</b>.',
            '<span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + '. <span class="hat">p</span> = (' + dc(d.y) + ' − ' + H.fs(f) + ')/(' + H.fs(H.sub(F(1), f)) + ') = <b>' + H.fd(d.ph) + '</b>.',
            'P(Yes) = ' + H.fs(f) + ' + ' + H.fs(H.sub(F(1), f)) + ' · ' + H.fs(pt2) + ' = ' + H.fd(H.add(f, H.mul(H.sub(F(1), f), pt2))) + '. Expected number = ' + nn + ' × that = <b>' + H.fd(EY) + '</b>.']) };
      } else {
        var m2 = pick([3, 4, 6]); f = F(m2, 12); d = drawRR(f, true); var pt3 = pick([F(1, 5), F(1, 4), F(2, 5), F(3, 10)]);
        var PY3 = H.mul(H.sub(F(1), f), pt3);
        out = { stmt: p('Students are asked <b>“Have you ever cheated during your studies?”</b> with a different rule: if you were born in <b>' + MON[m2] + '</b>, answer “No” whatever the truth; otherwise answer truthfully. The person collecting the answers does not know anyone’s birth month. Assume birth months are equally likely, so a share ' + H.fs(f) + ' of students are forced to say “No”. Let <i>p</i> be the true share of students who cheated.'),
          parts: [
            num('If the true share is <i>p</i> = ' + H.fs(pt3) + ', what is P(“Yes”)?', PY3, 'A “Yes” needs a student who is not forced and who cheated: ' + H.fs(H.sub(F(1), f)) + ' · p.'),
            num('In a survey of <i>n</i> = ' + d.n + ' students, <b>' + d.k + '</b> answered “Yes”, so the share of “Yes” answers is <span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + '. Replace P(“Yes”) by <span class="hat">y</span> in P(“Yes”) = (' + H.fs(H.sub(F(1), f)) + ') · <i>p</i> and solve for <i>p</i>. What is <span class="hat">p</span>?', d.ph, '<span class="hat">p</span> = <span class="hat">y</span>/(' + H.fs(H.sub(F(1), f)) + ').'),
            mc('On average (in expectation), the raw share <span class="hat">y</span> of “Yes” answers is:', ['Too low, because forced “No” answers are added', 'Too high, because some students lie', 'Right on average', 'Equal to <i>p</i> exactly'], 0, 'E(<span class="hat">y</span>) = (1 − f)p < p: forced “No” answers push the share down.')],
          sol: steps(['A “Yes” requires: not forced (probability ' + H.fs(H.sub(F(1), f)) + ') and truthful “Yes” (probability p). P(Yes) = ' + H.fs(H.sub(F(1), f)) + ' · ' + H.fs(pt3) + ' = <b>' + H.fd(PY3) + '</b>.',
            '<span class="hat">y</span> = ' + d.k + '/' + d.n + ' = ' + dc(d.y) + ' = (' + H.fs(H.sub(F(1), f)) + ') · <span class="hat">p</span>, so <span class="hat">p</span> = ' + dc(d.y) + '/(' + H.fs(H.sub(F(1), f)) + ') = <b>' + H.fd(d.ph) + '</b>.',
            'E(<span class="hat">y</span>) = ' + H.fs(H.sub(F(1), f)) + ' · p < p: the raw share is <b>too low</b>.']) };
      }
      return out;
    }
  });

  /* ========================================================= 3. efficiency */
  P.reg('efficiency', {
    title: 'Efficiency: comparing estimators', section: 1, est: 150,
    topic: 'Among unbiased estimators, the one with the smaller variance is more efficient.',
    variants: ['Uniform on [0, a]: 2X₁ vs. 2X̄', 'Averaging more observations', 'Different weights', 'Table: bias and variance'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var a = pick([60, 120, 180, 240]), n = pick([4, 16, 25]);
        var v1 = F(a * a, 3), v2 = F(a * a, 3 * n);
        out = { stmt: p('The serial numbers of <i>n</i> = <b>' + n + '</b> captured tanks are modelled as independent <i>X</i><sub>i</sub> ~ Uniform[0, <i>a</i>], with <i>a</i> = <b>' + a + '</b> in this exercise (but unknown in practice). Recall that Var(<i>X</i><sub>i</sub>) = <i>a</i>²/12. Two <b>unbiased</b> estimators of <i>a</i> are ' + th('1') + ' = 2<i>X</i><sub>1</sub> (uses only the first tank) and ' + th('2') + ' = 2' + XB + ' (uses all ' + n + ' tanks).'),
          parts: [
            num('Find Var(' + th('1') + ') = 4 · Var(<i>X</i><sub>1</sub>).', v1, '4 · a²/12 = a²/3.'),
            num('Find Var(' + th('2') + ') = 4 · Var(' + XB + '), where Var(' + XB + ') = Var(<i>X</i><sub>i</sub>)/' + n + '.', v2, 'Var(X̄) = (a²/12)/n, so Var(2X̄) = a²/(3n).'),
            mc('Which estimator is more efficient?', [th('1') + ' = 2<i>X</i><sub>1</sub>', th('2') + ' = 2' + XB, 'They are equally efficient'], 1, 'Both are unbiased, so the one with the smaller variance wins.')],
          sol: steps(['Var(' + th('1') + ') = 4 · ' + a + '²/12 = <b>' + H.fd(v1) + '</b>.', 'Var(' + th('2') + ') = 4 · (' + a + '²/12)/' + n + ' = <b>' + H.fd(v2) + '</b>, which is ' + n + ' times smaller.', 'Both are unbiased, and Var(' + th('2') + ') < Var(' + th('1') + '), so <b>' + th('2') + ' = 2' + XB + '</b> is more efficient.']) };
      } else if (v === 1) {
        var s2 = pick([12, 24, 36, 60]), n2 = pick([4, 6]), k2 = pick([2, 3]);
        var ests = [{ t: '<i>X</i><sub>1</sub>', k: 1 }, { t: '(<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub>)/2', k: 2 }, { t: XB + ' = (<i>X</i><sub>1</sub> + … + <i>X</i><sub>' + n2 + '</sub>)/' + n2, k: n2 }];
        var order = shuffle([0, 1, 2]), L = ['A', 'B', 'C'];
        var best = order.indexOf(2);
        out = { stmt: p('A random sample <i>X</i><sub>1</sub>, …, <i>X</i><sub>' + n2 + '</sub> is drawn from a population with mean μ and variance σ² = <b>' + s2 + '</b>. Three estimators of μ are ' + order.map(function (o, i) { return th(L[i]) + ' = ' + ests[o].t; }).join('; ') + '. All three are unbiased. Recall Var(<i>X</i><sub>i</sub>) = σ² and that for independent values Var(' + XB + ') = σ²/<i>n</i>.'),
          parts: [
            num('Find the variance of the estimator ' + th(L[order.indexOf(1)]) + ' = (<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub>)/2 (two values averaged; σ² = ' + s2 + ').', F(s2, 2), 'Var of a mean of 2 independent values: σ²/2.'),
            num('Find the variance of the sample mean ' + XB + ' of <i>n</i> = ' + n2 + ' values (σ² = ' + s2 + ').', F(s2, n2), 'σ²/n.'),
            mc('Which of the three estimators is the most efficient?', [th('A'), th('B'), th('C')], best, 'All are unbiased, so choose the smallest variance: the mean of all n values.', true)],
          sol: steps(['Var(<i>X</i><sub>1</sub>) = ' + s2 + '. Var((<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub>)/2) = ' + s2 + '/2 = <b>' + fx(s2 / 2) + '</b>.', 'Var(' + XB + ') = ' + s2 + '/' + n2 + ' = <b>' + H.fd(F(s2, n2)) + '</b>.', 'Variances: ' + s2 + ' (one value), ' + fx(s2 / 2) + ' (two values), ' + H.fd(F(s2, n2)) + ' (all ' + n2 + '). All unbiased, so the most efficient is ' + th(L[best]) + ' = ' + XB + '.']) };
      } else if (v === 2) {
        var s3 = pick([12, 24, 36, 48]), swap = Math.random() < 0.5;
        var wB = pick([[1, 2, 3], [1, 1, 2], [2, 1, 1], [1, 3, 2], [3, 1, 2], [1, 1, 4]]), sB = wB.reduce(function (a, b) { return a + b; }, 0);
        var sq = wB.reduce(function (a, b) { return a + b * b; }, 0), Vu = F(s3 * sq, sB * sB), Ve = F(s3, 3);
        var eqL = swap ? 'B' : 'A', unL = swap ? 'A' : 'B', Ea = swap ? Vu : Ve, Eb = swap ? Ve : Vu;
        var eqT = '(<i>X</i><sub>1</sub> + <i>X</i><sub>2</sub> + <i>X</i><sub>3</sub>)/3', unT = lin(wB, sB);
        var tA = swap ? unT : eqT, tB = swap ? eqT : unT, wAtxt = swap ? wB : [1, 1, 1], sAtxt = swap ? sB : 3, wBtxt = swap ? [1, 1, 1] : wB, sBtxt = swap ? 3 : sB;
        out = { stmt: p('A random sample <i>X</i><sub>1</sub>, <i>X</i><sub>2</sub>, <i>X</i><sub>3</sub> is drawn from a population with mean μ and variance σ² = <b>' + s3 + '</b>. Two estimators of μ are ' + th('A') + ' = ' + tA + ' and ' + th('B') + ' = ' + tB + '. In both, the weights add up to 1, so both are unbiased. For independent values, Var(Σ <i>c</i><sub>i</sub><i>X</i><sub>i</sub>) = σ² Σ <i>c</i><sub>i</sub>², where <i>c</i><sub>i</sub> are the weights.'),
          parts: [
            num('Find Var(' + th('A') + ').', Ea, 'σ² · Σ c² with the weights of <span class="hat">θ</span><sub>A</sub>.'),
            num('Find Var(' + th('B') + ').', Eb, 'σ² · Σ c² with the weights of <span class="hat">θ</span><sub>B</sub>.'),
            mc('Both estimators are unbiased. Which one is more efficient?', [th('A'), th('B'), 'They are equally efficient'], swap ? 1 : 0, 'The smaller variance wins.', true)],
          sol: steps(['Weights of ' + th('A') + ': ' + wAtxt.join(' + ') + ' over ' + sAtxt + '; Var(' + th('A') + ') = ' + s3 + ' · (' + wAtxt.map(function (w) { return w * w; }).join(' + ') + ')/' + (sAtxt * sAtxt) + ' = <b>' + H.fd(Ea) + '</b>.',
            'Weights of ' + th('B') + ': ' + wBtxt.join(' + ') + ' over ' + sBtxt + '; Var(' + th('B') + ') = ' + s3 + ' · (' + wBtxt.map(function (w) { return w * w; }).join(' + ') + ')/' + (sBtxt * sBtxt) + ' = <b>' + H.fd(Eb) + '</b>.',
            'Smaller variance: <b>' + th(eqL) + '</b> (equal weights), so it is more efficient. Equal weights give the smallest variance among unbiased weighted averages.']) };
      } else {
        var tt = shuffle([{ b: 0, vr: pick([4, 6]) }, { b: 0, vr: pick([9, 12, 16]) }, { b: pick([2, 3]), vr: 1 }]);
        var bi = tt.findIndex(function (q) { return q.b !== 0; }), unb = [];
        tt.forEach(function (q, i) { if (q.b === 0) unb.push(i); });
        var bestI = unb.reduce(function (m, i) { return tt[i].vr < tt[m].vr ? i : m; }, unb[0]);
        var Ls = ['A', 'B', 'C'], names = tt.map(function (q, i) { return th(Ls[i]); });
        var ansU = (function () { var key = unb.join(''); return { '01': 'Only ' + names[0] + ' and ' + names[1], '02': 'Only ' + names[0] + ' and ' + names[2], '12': 'Only ' + names[1] + ' and ' + names[2], '012': 'All three' }[key]; })();
        var optsU = ['Only ' + names[0] + ' and ' + names[1], 'Only ' + names[0] + ' and ' + names[2], 'Only ' + names[1] + ' and ' + names[2], 'All three'];
        out = { stmt: p('Three estimators of an unknown parameter θ have these properties:') + H.tbl(['Estimator', 'E(<span class="hat">θ</span>)', 'Var(<span class="hat">θ</span>)'], tt.map(function (q, i) { return [names[i], q.b ? 'θ + ' + q.b : 'θ', q.vr]; })),
          parts: [
            num('What is the bias E(<span class="hat">θ</span>) − θ of ' + names[bi] + '?', F(tt[bi].b), 'Bias = E − θ.'),
            mc('Which estimators are unbiased?', optsU, optsU.indexOf(ansU), 'Unbiased: E(<span class="hat">θ</span>) = θ.', true),
            mc('Among the <b>unbiased</b> estimators, which is the most efficient?', names, bestI, 'Efficiency compares only unbiased estimators: the smallest variance among them.', true)],
          sol: steps(['Bias of ' + names[bi] + ' = (θ + ' + tt[bi].b + ') − θ = <b>' + tt[bi].b + '</b>: it is biased. The others have E = θ, so they are unbiased.', 'Unbiased: <b>' + ansU.charAt(0).toLowerCase() + ansU.slice(1) + '</b>.', 'Variances of the unbiased ones: ' + unb.map(function (i) { return names[i] + ' = ' + tt[i].vr; }).join(', ') + '. The smallest is ' + names[bestI] + ', the most efficient. (' + names[bi] + ' has Var = ' + tt[bi].vr + ' but is not in the comparison because it is biased.)']) };
      }
      return out;
    }
  });
})();
