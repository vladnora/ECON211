/* Block E, part 3: interpreting confidence intervals and estimator properties (multiple choice and true/false). */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps;
  var fx = H.fx, r2 = H.r2, U = H.U, Z = H.Z, XB = 'X̄';
  var TF = ['True', 'False'];
  function tf(prompt, truth, ex) { return mc(prompt, TF, truth ? 0 : 1, ex, true); }
  function rep(c, L) { return L + '%'; }
  function ciDraw() {
    var c = pick(H.CTX), mu = pick(c.mus), sd = pick(c.sds), n = pick([25, 36, 49, 64, 100]), L = pick([90, 95, 99]);
    var se = sd / Math.sqrt(n), xb = Math.round((mu + ri(-4, 4) * sd / 10) * 10) / 10, me = r2(Z[L] * se);
    return { c: c, n: n, L: L, xb: xb, me: me, lo: r2(xb - me), hi: r2(xb + me), sd: sd };
  }
  function rng(o) { return '[' + fx(o.lo) + ', ' + fx(o.hi) + ']'; }
  function setup(o, lead) {
    return (lead || '') + 'Using a random sample of <i>n</i> = ' + o.n + ' observations of ' + o.c.name + ', a researcher computes a <b>' + o.L + '% confidence interval</b> for the population mean μ and gets <b>' + rng(o) + '</b>' + (o.c.unit === '$' ? ' (in $)' : ' (in ' + o.c.unit + ')') + '.';
  }
  function right(o) { return 'If we repeated the sampling many times and built an interval each time in this way, about ' + o.L + '% of those intervals would contain the true mean μ.'; }
  function wrongs(o) {
    return [
      'There is a ' + o.L + '% probability that the true mean μ lies between ' + fx(o.lo) + ' and ' + fx(o.hi) + '.',
      o.L + '% of all individual values of <i>X</i> in the population lie between ' + fx(o.lo) + ' and ' + fx(o.hi) + '.',
      o.L + '% of the observations in this sample lie between ' + fx(o.lo) + ' and ' + fx(o.hi) + '.',
      'The sample mean ' + XB + ' has a ' + o.L + '% probability of lying between ' + fx(o.lo) + ' and ' + fx(o.hi) + '.'
    ];
  }
  var GOOD = [
    function (o) { return 'The interval is centred at the sample mean ' + XB + ' = ' + fx(r2((o.lo + o.hi) / 2)) + '.'; },
    function (o) { return 'Values of μ inside ' + rng(o) + ' are plausible given the data; values far outside it are not.'; },
    function (o) { return 'With a larger sample size, the interval would be narrower, all else equal.'; },
    function (o) { return 'A ' + (o.L === 99 ? '90' : '99') + '% interval from the same data would be ' + (o.L === 99 ? 'narrower' : 'wider') + ' than this one.'; },
    function (o) { return 'The method that produced the interval captures μ in about ' + o.L + '% of repeated samples.'; }
  ];

  P.reg('ci_mc', {
    title: 'What does the interval mean?', section: 3, est: 120,
    topic: 'Choose the correct interpretation of a confidence interval.',
    variants: ['Which statement is correct?', 'Which statement is NOT correct?', 'Four classmates'],
    gen: function (v) {
      var o = ciDraw(), out;
      if (v === 0) {
        var opts = [right(o)].concat(wrongs(o).slice(0, 3)), rest = [
          ['It will be identical to ' + rng(o) + '.', 'It will generally differ from ' + rng(o) + ', because it is centred at the new sample mean.', 'It must lie entirely inside ' + rng(o) + '.', 'It is guaranteed to contain the true mean μ.']];
        var os = shuffle(wrongs(o)).slice(0, 3);
        var opt1 = shuffle([right(o)].concat(os)), ci1 = opt1.indexOf(right(o));
        out = { stmt: p(setup(o)),
          parts: [
            mc('Which statement is a <b>correct</b> interpretation of the ' + o.L + '% confidence interval ' + rng(o) + '?', opt1, ci1, 'The ' + o.L + '% describes the method: the long-run share of intervals that contain μ. Once computed, the interval is fixed, and μ is a fixed (unknown) number.'),
            mc('Another researcher draws a <b>new</b> random sample of the same size from the same population and computes a ' + o.L + '% interval in the same way. Which statement is true?', rest[0], 1, 'A new sample gives a new X̄, hence a new interval; it is not guaranteed to contain μ, and it need not lie inside the old interval.', false)],
          sol: steps(['The ' + o.L + '% is the success rate of the <b>procedure</b> in repeated sampling: about ' + o.L + ' out of 100 intervals built this way contain μ. The other options confuse the interval with a statement about μ, the population or the sample.', 'A new sample has a different ' + XB + ', so the new interval is centred elsewhere and <b>generally differs</b>. It also has the same probability ' + o.L + '% (not a guarantee) of containing μ.']) };
      } else if (v === 1) {
        var good = shuffle(GOOD).slice(0, 3).map(function (f) { return f(o); }), bad = pick(wrongs(o));
        var opt2 = shuffle(good.concat([bad])), ci2 = opt2.indexOf(bad);
        out = { stmt: p(setup(o)),
          parts: [mc('Exactly one of the following statements is <b>not</b> a correct reading of the interval. Which one?', opt2, ci2, 'The confidence level is about the procedure, not about a probability for μ in this fixed interval, nor about the share of data inside it.')],
          sol: steps(['Check each statement against the meaning of a confidence interval: it is built as ' + XB + ' ± <i>z</i> · σ/√<i>n</i>, it is a set of plausible values for μ, and its level is the long-run success rate of the method.', 'The statement <b>“' + bad + '”</b> is not correct: it treats the ' + o.L + '% as a probability about μ, the population or the sample, which the interval does not describe.']) };
      } else {
        var names = ['Anna', 'Ben', 'Chloe', 'Dan'], stm = [right(o), wrongs(o)[0], wrongs(o)[1], wrongs(o)[3]], idx = shuffle([0, 1, 2, 3]);
        var assign = names.map(function (nm, i) { return nm + ': “' + stm[idx[i]] + '”'; }), who = idx.indexOf(0), who_ = names[who];
        var mid = (o.lo + o.hi) / 2, kind = pick(['in', 'above', 'below']), cv = kind === 'in' ? r2(mid + pick([-0.4, 0.3, 0.5]) * o.me) : kind === 'above' ? r2(o.hi + pick([0.5, 1]) * o.me) : r2(o.lo - pick([0.5, 1]) * o.me);
        out = { stmt: p(setup(o)) + p('Four classmates interpret the result:') + '<ul>' + assign.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>',
          parts: [mc('Whose interpretation is correct?', names, who, 'Only the statement about repeated sampling describes what the confidence level means.', true),
            mc('The researcher’s boss claims that the true mean is ' + U(o.c, cv) + '. Judging by the interval ' + rng(o) + ', is this value plausible?', ['Yes, it lies inside the interval, so it is plausible', 'No, it lies outside the interval, so it is not plausible'], kind === 'in' ? 0 : 1, kind === 'in' ? 'The value lies between the endpoints.' : 'The value lies ' + kind + ' the interval.', true)],
          sol: steps(['Only <b>' + who_ + '</b> describes the long-run behaviour of the method; the others claim a probability for μ in the fixed interval, a share of the population, or a probability for ' + XB + '.', 'The claimed value ' + fx(cv) + ' is ' + (kind === 'in' ? 'inside ' + rng(o) + ': <b>plausible</b>' : kind + ' ' + rng(o) + ', outside the interval: <b>not plausible</b>') + ' at the ' + o.L + '% level.']) };
      }
      return out;
    }
  });

  /* ========================================================= true / false */
  var EST = [
    ['An unbiased estimator always gives an estimate exactly equal to the true parameter.', false, 'Unbiased means right <i>on average</i>; a single estimate still has error.'],
    ['“Unbiased” means that E(<span class="hat">θ</span>) = θ: the estimator is right on average.', true, 'That is the definition.'],
    ['If E(<span class="hat">θ</span>) = θ + 2, then <span class="hat">θ</span> is an unbiased estimator of θ.', false, 'Its bias is 2, so it is biased.'],
    ['The sample mean ' + XB + ' is an unbiased estimator of μ for any population with a finite mean.', true, 'E(X̄) = μ whenever the mean exists.'],
    ['Of two unbiased estimators, the one with the smaller variance is more efficient.', true, 'That is the definition of efficiency.'],
    ['An estimator with a very small variance is always better than an unbiased one, even if it is biased.', false, 'Efficiency only compares unbiased estimators; a tiny-variance estimator can be far from θ.'],
    ['For a Uniform[0, a] population, the estimator 2<i>X</i><sub>1</sub> (first observation only) is as efficient as 2' + XB + ' computed from <i>n</i> = 10 observations.', false, 'Var(2X̄) is n times smaller than Var(2X₁).'],
    ['Dividing the sum of squared deviations from the sample mean, Σ(<i>X</i><sub>i</sub> − ' + XB + ')², by <i>n</i> − 1 gives an unbiased estimator of σ².', true, 'E(s²) = σ².'],
    ['Dividing the sum of squared deviations from the sample mean, Σ(<i>X</i><sub>i</sub> − ' + XB + ')², by <i>n</i> gives an unbiased estimator of σ².', false, 'It is too small by the factor (n − 1)/n on average.'],
    ['A consistent estimator converges to the true parameter as the sample size grows.', true, 'That is the definition of consistency.'],
    ['An estimator that uses only the first observation <i>X</i><sub>1</sub> becomes more precise as the sample grows.', false, 'It ignores the new data, so its variance never shrinks.']
  ];
  P.reg('tf', {
    title: 'Concept checks', section: 3, est: 120,
    topic: 'Quick conceptual checks on estimators, intervals and repeated sampling.',
    variants: ['Reading a given interval', 'Repeated samples: counts', 'Properties of estimators'],
    gen: function (v) {
      var out;
      if (v === 0) {
        var c = pick(H.CTX), mu = pick(c.mus), sd = pick(c.sds), n = pick([25, 36, 100]), L = pick([90, 95]);
        var xb = Math.round((mu + ri(-3, 3) * sd / 10) * 10) / 10, me = r2(Z[L] * sd / Math.sqrt(n)), lo = r2(xb - me), hi = r2(xb + me), o = { c: c, n: n, L: L, lo: lo, hi: hi };
        var inside = r2((lo + xb) / 2), outside = r2(hi + me), outLo = r2(lo - 0.5 * me);
        var pool = [
          ['The sample mean of this sample is ' + fx(xb) + '.', true, 'It is the midpoint of the interval.'],
          ['μ = ' + fx(inside) + ' is a plausible value for the population mean.', true, 'It lies inside the interval.'],
          ['μ = ' + fx(outside) + ' is a plausible value for the population mean.', false, 'It lies above the upper endpoint ' + fx(hi) + '.'],
          ['μ = ' + fx(outLo) + ' is a plausible value for the population mean.', false, 'It lies below the lower endpoint ' + fx(lo) + '.'],
          ['A ' + (L === 90 ? '95' : '99') + '% interval from the same data would be wider than this one.', true, 'A higher level needs a larger z.'],
          ['A ' + (L === 90 ? '99' : '90') + '% interval from the same data would be ' + (L === 90 ? 'narrower' : 'wider') + ' than this one.', false, L === 90 ? 'A higher level gives a wider interval, not a narrower one.' : 'A lower level gives a smaller z, so a narrower interval, not a wider one.'],
          ['The true mean μ must be in the interval ' + rng(o) + '.', false, 'The interval is a plausible range, but μ is not guaranteed to lie in it.'],
          ['If the same study were repeated with four times as many observations, the new interval would be about half as wide.', true, 'Width is proportional to 1/√n.']
        ];
        var sel = shuffle(pool).slice(0, 4);
        out = { stmt: p('A random sample of <i>n</i> = ' + n + ' observations of ' + c.name + ' (σ known) gives a <b>' + L + '%</b> confidence interval for the mean <b>' + rng(o) + '</b>' + (c.unit === '$' ? ' (in $)' : ' (in ' + c.unit + ')') + '.'),
          parts: sel.map(function (q) { return tf('True or false? ' + q[0], q[1], q[2]); }),
          sol: steps(sel.map(function (q) { return q[0] + ' <b>' + (q[1] ? 'True' : 'False') + '</b>. ' + q[2]; })) };
      } else if (v === 1) {
        var Ln = pick([90, 95, 99]), N = pick([100, 200, 400, 500, 800, 1000, 2000]), c2 = Ln, k = N * Ln / 100, miss = N - k;
        out = { stmt: p('A statistician draws <b>' + N + '</b> independent random samples from the same population. From each sample she builds a <b>' + Ln + '%</b> confidence interval for the population mean μ.'),
          parts: [
            num('About how many of the ' + N + ' intervals do you expect to <b>contain</b> μ?', F(k), N + ' × ' + Ln + '%.'),
            num('About how many of the ' + N + ' intervals do you expect to <b>miss</b> μ?', F(miss), N + ' − ' + k + '.'),
            dn0('Before any data are collected, what is the probability that the interval she will compute from one sample contains μ? (Give a proportion between 0 and 1.)', Ln / 100, 'The level of the interval, ' + Ln + '% = ' + (Ln / 100) + '.')],
          sol: steps(['Expect ' + Ln + '% of ' + N + ' intervals to contain μ: <b>' + k + '</b>.', 'The others miss: ' + N + ' − ' + k + ' = <b>' + miss + '</b>.', 'Before sampling, the interval is random and contains μ with probability <b>' + (Ln / 100) + '</b>. (After it is computed, it either contains μ or not; we just do not know which.)']) };
      } else {
        var sel2 = shuffle(EST).slice(0, 4);
        out = { stmt: p('Decide whether each statement about estimators is true. Here θ is a population parameter and <span class="hat">θ</span> an estimator of it; X̄ is the sample mean and <i>n</i> the sample size.'),
          parts: sel2.map(function (q) { return tf('True or false? ' + q[0], q[1], q[2]); }),
          sol: steps(sel2.map(function (q) { return q[0] + ' <b>' + (q[1] ? 'True' : 'False') + '</b>. ' + q[2]; })) };
      }
      return out;
    }
  });
  function dn0(pr, v, ex) { return H.dt(pr, v, ex); }
})();
