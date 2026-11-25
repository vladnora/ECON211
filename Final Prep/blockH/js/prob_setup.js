/* Block H, part 2: hypotheses and the test statistic. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h, X = H.X;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps;
  var XB = X.XB, fx = X.fx, rd = X.rd, dt = X.dt, hyp = X.hyp, SYM = X.SYM, U = X.U;

  var STORIES = [
    ['A consumer group wants to check its suspicion that coffee packages labelled 500 g contain <b>less</b> than 500 g on average.', 500, 'down'],
    ['A bakery has changed its flour supplier. It wants to check whether the mean weight of a loaf has <b>changed</b> from the old value of 600 g.', 600, 'two'],
    ['A courier firm has installed new routing software. It wants evidence that the mean delivery time with the new software is <b>below</b> the old value of 45 minutes.', 45, 'down'],
    ['A seed company claims that the mean height of plants grown with its new fertilizer is <b>above</b> the usual 30 cm. A researcher looks for evidence for this claim.', 30, 'up'],
    ['An engineer wants to check whether the mean diameter of a machine part <b>differs</b> from the design value of 12 mm.', 12, 'two'],
    ['A city official wants to check the suspicion that the mean waiting time for a bus is <b>longer</b> than the scheduled 8 minutes.', 8, 'up'],
    ['The last census reported a mean household size of 3.5 persons. An economist wants to check whether the mean is <b>still equal</b> to 3.5 or has changed.', 3.5, 'two'],
    ['A phone maker wants evidence that the mean battery life of its new model is <b>more than</b> 24 hours.', 24, 'up'],
    ['A hospital wants evidence that the mean hospital stay under a new procedure is <b>shorter</b> than the old value of 6 days.', 6, 'down']
  ];
  function wordWhy(d) { return d === 'two' ? 'A change in either direction counts: two-sided.' : d === 'up' ? 'The claim to check points upward.' : 'The claim to check points downward.'; }
  function hypOpts(m, dir) {
    var o = [hyp(m, dir)];
    ['two', 'up', 'down'].forEach(function (d) { if (d !== dir) o.push(hyp(m, d)); });
    o.push('H₀: ' + XB + ' = ' + fx(m) + ', H₁: ' + XB + ' ' + SYM[dir] + ' ' + fx(m));
    return o;
  }

  var ERR = ['Hypotheses must be about the population mean μ, not about ' + XB,
    'H₀ must contain the equality, and H₁ must not contain =, ≤ or ≥',
    'The observed data were used to choose the direction of H₁',
    'H₁ points in the wrong direction for the research question fixed before the data were collected (for example H₁ uses “&gt;” when the question says “below”)',
    'Nothing is wrong'];
  function mistake(k) {
    var m = pick([50, 80, 200, 500]), b = m + pick([2, 3, 4]), a = m - pick([2, 3, 4]);
    if (k === 0) return { k: 0, t: 'To check whether the mean differs from ' + m + ', a student writes H₀: ' + XB + ' = ' + m + ', H₁: ' + XB + ' ≠ ' + m + '.', ex: XB + ' is known once the data are collected. The unknown quantity is μ.' };
    if (k === 1) return pick([
      { k: 1, t: 'To check whether the mean differs from ' + m + ', a student writes H₀: μ ≠ ' + m + ', H₁: μ = ' + m + '.', ex: 'The benchmark with the equality sign is H₀.' },
      { k: 1, t: 'To look for evidence that the mean is above ' + m + ', a student writes H₀: μ = ' + m + ', H₁: μ ≥ ' + m + '.', ex: 'H₁ must not contain equality: it should be μ > ' + m + '.' }]);
    if (k === 2) return { k: 2, t: 'Before collecting data, a student had no direction in mind. After seeing <span class="xbar">X</span> = ' + b + ', the student decides to ask whether the mean is above ' + m + ' and writes H₀: μ = ' + m + ', H₁: μ &gt; ' + m + '.', ex: 'The direction was taken from the data. It must be fixed before the data are seen.' };
    if (k === 3) return pick([
      { k: 3, t: 'A group wants to check whether the mean is <b>below</b> ' + m + ' and writes, before collecting data, H₀: μ = ' + m + ', H₁: μ &gt; ' + m + '.', ex: 'The claim is “below”, so H₁ should be μ &lt; ' + m + '.' },
      { k: 3, t: 'A firm wants evidence that the mean has <b>risen above</b> ' + m + ' and writes, before collecting data, H₀: μ = ' + m + ', H₁: μ &lt; ' + m + '.', ex: 'The claim is “above”, so H₁ should be μ > ' + m + '.' }]);
    return pick([
      { k: 4, t: 'Before collecting data, a group that wants to check whether the mean is below ' + m + ' writes H₀: μ = ' + m + ', H₁: μ &lt; ' + m + '. The sample later gives ' + XB + ' = ' + a + '.', ex: 'H₀ has the equality, H₁ states the claim, and the direction was fixed in advance.' },
      { k: 4, t: 'To check whether the mean differs from ' + (m + 40) + ', a student writes H₀: μ = ' + (m + 40) + ', H₁: μ ≠ ' + (m + 40) + '. The sample gives ' + XB + ' = ' + (b + 40) + '.', ex: 'This is a correct two-sided setup.' }]);
  }
  P.reg('hyp', {
    title: 'State the hypotheses', section: 2, est: 80,
    topic: 'H₀ states the benchmark with “=” (in a one-sided test it stands for ≤ or ≥). H₁ states the claim you want to check.',
    variants: ['From a story', 'Find the mistake', 'One setting, three questions'],
    gen: function (v) {
      if (v === 0) {
        var first = pick(STORIES), second = pick(STORIES.filter(function (s) { return s[2] !== first[2]; })), sel = [first, second];
        return { stmt: p('The situations below are separate. In each one, μ is the population mean of the quantity described, and ' + XB + ' is the mean of a sample. Which pair of hypotheses should be tested?'),
          parts: sel.map(function (s) { return mc(s[0], hypOpts(s[1], s[2]), 0, wordWhy(s[2])); }),
          sol: steps(sel.map(function (s) { return '<b>' + hyp(s[1], s[2]) + '</b>. ' + wordWhy(s[2]); }).concat(['Hypotheses are statements about μ. The number inside them is the benchmark from the question, never a number from the sample.'])) };
      }
      if (v === 1) {
        var ks = shuffle([0, 1, 2, 3, 4]).slice(0, 3), items = ks.map(mistake);
        return { stmt: p('In each separate case below, μ is a population mean, ' + XB + ' is the mean of a sample, and someone writes a null hypothesis H₀ and an alternative H₁. What is wrong with what was done, if anything?'),
          parts: items.map(function (q) { return mc(q.t, ERR, q.k, q.ex, true); }),
          sol: steps(items.map(function (q) { return '<b>' + ERR[q.k] + '.</b> ' + q.ex; })) };
      }
      var c = pick(X.CTX), m = pick(c.mus), w = U(c, m);
      var qs = shuffle([
        ['Is the mean ' + c.what + ' <b>different from</b> ' + w + '?', 'two'],
        ['Does the mean ' + c.what + ' <b>exceed</b> ' + w + '?', 'up'],
        ['Is the mean ' + c.what + ' <b>less than</b> ' + w + '?', 'down']]);
      var H1 = ['H₁: μ ≠ ' + m, 'H₁: μ &gt; ' + m, 'H₁: μ &lt; ' + m], idx = { two: 0, up: 1, down: 2 };
      return { stmt: p('Let μ be the population mean ' + c.what + ' (in ' + c.unit + '). Below are three separate research questions. For each of them the null hypothesis is H₀: μ = ' + m + '. Which alternative hypothesis H₁ matches the question?'),
        parts: qs.map(function (q) { return mc(q[0], H1, idx[q[1]], wordWhy(q[1]), true); }),
        sol: steps(qs.map(function (q) { return q[0] + ' <b>' + H1[idx[q[1]]] + '</b>. ' + wordWhy(q[1]); }).concat(['For the one-sided cases H₀ can also be written as μ ≤ ' + m + ' or μ ≥ ' + m + '; we test at the boundary μ = ' + m + '.'])) };
    }
  });

  /* ========================================================= test statistic */
  var STV = [-3, -2.5, -2.4, -2.2, -2, -1.5, -1.2, 1.2, 1.5, 2, 2.2, 2.4, 2.5, 3];
  function sideOpts(o) {
    var u = o.stat > 0, here = u ? 'above' : 'below', opp = u ? 'below' : 'above', m = fx(o.mu);
    return [X_ + ' is |<i>z</i>| standard errors ' + here + ' ' + m, X_ + ' is |<i>z</i>| standard errors ' + opp + ' ' + m,
      X_ + ' is |<i>z</i>| standard deviations of one observation ' + here + ' ' + m, X_ + ' is |<i>z</i>| ' + o.c.unit + ' ' + here + ' ' + m];
  }
  var X_ = '<span class="xbar">X</span>';
  P.reg('stat', {
    title: 'Compute the test statistic', section: 2, est: 130,
    topic: 'Distance from the benchmark, measured in standard errors (estimated from the sample when σ is unknown).',
    variants: ['z from summary data', 't from summary data', 't from raw data'],
    gen: function (v) {
      if (v < 2) {
        var o = X.draw(v === 0 ? 'z' : 't', STV), nm = X.statName(o);
        var parts = [
          dt(v === 0 ? 'Find the standard error of the sample mean, σ/√<i>n</i>.' : 'Since σ is unknown, find the <b>estimated</b> standard error of the sample mean, <i>s</i>/√<i>n</i>.', o.se, v === 0 ? 'σ/√n.' : 's/√n estimates the unknown standard error σ/√n.'),
          dt('Compute the test statistic ' + nm + ' for testing H₀: μ = ' + fx(o.mu) + '.', o.stat, X.statLine(o))];
        if (v === 0) parts.push(mc('Let <i>z</i> be the <i>z</i> statistic for testing H₀: μ = ' + fx(o.mu) + '. Which sentence says correctly what the number |<i>z</i>| measures here?', sideOpts(o), 0, '<i>z</i> counts how many standard errors <span class="xbar">X</span> is from the benchmark.'));
        else parts.push(num('How many degrees of freedom does the <i>t</i> statistic have?', F(o.df), 'df = n − 1.'));
        return { stmt: p(X.data(o) + ' We want to test H₀: μ = <b>' + fx(o.mu) + '</b>.'), parts: parts,
          sol: steps([X.seLine(o), X.statLine(o), v === 0 ? XB + ' is ' + fx(Math.abs(o.stat)) + ' standard errors ' + (o.stat > 0 ? 'above' : 'below') + ' the benchmark.' : 'df = n − 1 = <b>' + o.df + '</b>.']) };
      }
      var c = pick(X.CTX), a, xb, tv, mu0, g = 0, dev;
      do {
        a = pick([1, 2, 3]); xb = pick(c.mus) + ri(-3, 3); tv = pick([-3, -2, -1.5, 1.5, 2, 3, 4]); mu0 = rd(xb - tv * a, 4); g++;
      } while (!Number.isInteger(mu0) && g < 200);
      dev = pick([[-1, -1, -1, 3], [-3, 1, 1, 1]]);
      var xs = shuffle(dev.map(function (d) { return xb + d * a; })), s = 2 * a, se = a;
      var devs = xs.map(function (x) { return x - xb; });
      return { stmt: p('Let μ be the population mean ' + c.what + '. A random sample of <i>n</i> = 4 ' + c.thing + ' gives these values (in ' + c.unit + ', rounded to whole numbers): <b>' + xs.join(', ') + '</b>. The population is normal, and its standard deviation σ is unknown. Let <span class="xbar">X</span> be the sample mean and <i>s</i> the sample standard deviation. We want to test H₀: μ = <b>' + fx(mu0) + '</b>.'),
        parts: [
          dt('Compute the sample mean ' + XB + '.', xb, 'Add the values and divide by 4.'),
          dt('Compute the sample standard deviation <i>s</i>. (In the sample variance, divide the sum of squared deviations by <i>n</i> − 1.)', s, 's² = sum of squared deviations from the sample mean, divided by n − 1.'),
          dt('Compute the <b>estimated</b> standard error of the sample mean, <i>s</i>/√<i>n</i>.', se, 's/√4 estimates the unknown standard error σ/√4.'),
          dt('Compute the <i>t</i> statistic for testing H₀: μ = ' + fx(mu0) + '.', tv, '(<span class="xbar">X</span> − μ₀)/(s/√n).'),
          num('How many degrees of freedom does the <i>t</i> statistic have?', F(3), 'df = n − 1.')],
        sol: steps([XB + ' = (' + xs.join(' + ') + ')/4 = <b>' + xb + '</b>.',
          'Deviations: ' + devs.map(fx).join(', ') + '. Squares add up to ' + devs.reduce(function (q, d) { return q + d * d; }, 0) + ', so <i>s</i>² = that sum/3 = ' + (s * s) + ' and <i>s</i> = <b>' + s + '</b>.',
          'Estimated standard error: <i>s</i>/√<i>n</i> = ' + s + '/√4 = <b>' + se + '</b>.', '<i>t</i> = (' + xb + ' − ' + fx(mu0) + ')/' + se + ' = <b>' + fx(tv) + '</b>, with df = <b>3</b>.']) };
    }
  });
})();
