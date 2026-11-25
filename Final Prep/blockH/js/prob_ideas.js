/* Block H, part 4: interpretation, errors, what changes the result, concept checks. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h, X = H.X;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps;
  var XB = X.XB, fx = X.fx, rd = X.rd, dt = X.dt, hyp = X.hyp, U = X.U;

  var PHR = { two: 'differs from', up: 'is greater than', down: 'is less than' };

  /* ========================================================= meaning */
  P.reg('meaning', {
    title: 'What does the result mean?', section: 4, est: 90,
    topic: 'Say exactly what a p-value and a test decision do, and do not, tell us.',
    variants: ['Meaning of a p-value', 'Meaning of “fail to reject”', 'Write the conclusion'],
    gen: function (v) {
      var c = pick(X.CTX), m = pick(c.mus), mt = U(c, m), dir = pick(['two', 'up', 'down']);
      var base = 'We test ' + hyp(m, dir) + ', where μ is the population mean ' + c.what + ' (in ' + c.unit + '). The data are a random sample from a normal population with known σ, and we use a <i>z</i>-test.';
      if (v === 0) {
        var pv = pick([0.02, 0.03, 0.04, 0.12, 0.21]);
        var ext = dir === 'two' ? 'a sample mean at least as far from ' + mt + ' (in either direction) as the one we observed' : dir === 'up' ? 'a sample mean as high as the one we observed, or higher,' : 'a sample mean as low as the one we observed, or lower,';
        var good = 'If μ were ' + mt + ', the probability of getting ' + ext + ' would be ' + pv + '.';
        var bad = shuffle([
          'Given the sample we observed, the probability that H₀ is true, so that μ equals ' + mt + ', is ' + pv + '.',
          'Given the sample we observed, the probability that H₁ is true, so that H₀ is wrong, is ' + fx(1 - pv) + '.',
          'Given the sample we observed, the probability that our decision about H₀ turns out to be wrong is ' + pv + '.',
          'If we repeated the study, the probability of getting exactly the same sample mean as the one observed would be ' + pv + '.',
          'In the population, a share ' + pv + ' of all individual values lies at least as far from ' + mt + ' as the observed sample mean.']).slice(0, 3);
        return { stmt: p(base + ' The p-value is <b>' + pv + '</b>.'),
          parts: [mc('Which statement about the p-value ' + pv + ' is correct?', [good].concat(bad), 0, 'The p-value is computed assuming H₀ is true, and it is about samples at least as extreme as ours.'),
            mc('A second study of the same population uses a new random sample of the same size and the same test. Its p-value is ' + { 0.02: 0.004, 0.03: 0.008, 0.04: 0.01, 0.12: 0.03, 0.21: 0.06 }[pv] + '. Compared with the first study (p-value ' + pv + '), the data of the second study are …', ['stronger evidence against H₀', 'weaker evidence against H₀', 'equally strong evidence against H₀'], 0, 'The smaller the p-value, the more surprising the sample is under H₀.', true)],
          sol: steps(['A p-value is a probability about the <b>data</b>, computed <b>assuming H₀</b>. It is not the probability of any hypothesis.', '<b>' + good + '</b>', 'A smaller p-value means the data are harder to explain under H₀.']) };
      }
      if (v === 1) {
        var pv2 = pick([0.18, 0.27, 0.43, 0.62]);
        var good2 = 'The data are not surprising enough under H₀ to rule it out.';
        var bad2 = ['We have shown that μ = ' + m + '.', 'H₀ is true with probability ' + pv2 + '.', 'We have shown that H₁ is false.'];
        var other = rd(m + pick([-1, 1]) * pick(c.ses) * 0.5, 2);
        return { stmt: p(base + ' The p-value is <b>' + pv2 + '</b>, and at α = 0.05 we fail to reject H₀.'),
          parts: [mc('Which statement correctly says what “fail to reject H₀” means here?', [good2].concat(bad2), 0, '“Fail to reject” is not “H₀ is true”.'),
            mc('Could the true mean be ' + fx(other) + ' ' + c.unit + ', even though we did not reject μ = ' + m + '?', ['Yes: failing to reject μ = ' + m + ' does not show that μ equals ' + m, 'Yes: failing to reject H₀ shows that μ is not equal to ' + m, 'No: failing to reject H₀ shows that μ equals ' + m, 'No: a large p-value shows that ' + m + ' is the only possible value'], 0, 'Other values can also be consistent with the same data. A confidence interval collects them.')],
          sol: steps(['Failing to reject says only that the data are compatible with H₀.', 'The same data are also compatible with other values near ' + m + ', so we cannot conclude that μ equals ' + m + '.']) };
      }
      var cases = pick([[0.03, 0.05, 0.01], [0.07, 0.1, 0.05], [0.004, 0.01, 0.001], [0.14, 0.2, 0.1], [0.022, 0.05, 0.01]]);
      var pv3 = cases[0];
      function sent(a, yes) { return 'At the ' + fx(a * 100) + '% level there ' + (yes ? 'is' : 'is not') + ' sufficient evidence that the mean ' + c.what + ' ' + PHR[dir] + ' ' + mt + '.'; }
      function opts(a) {
        var yes = pv3 < a;
        return [sent(a, yes), sent(a, !yes),
          yes ? 'At the ' + fx(a * 100) + '% level it is proven that the mean ' + c.what + ' ' + PHR[dir] + ' ' + mt + '.' : 'At the ' + fx(a * 100) + '% level there is sufficient evidence that the mean ' + c.what + ' equals ' + mt + '.',
          yes ? 'At the ' + fx(a * 100) + '% level there is sufficient evidence that the sample mean ' + PHR[dir] + ' ' + mt + '.' : 'At the ' + fx(a * 100) + '% level H₀ is true.'];
      }
      return { stmt: p(base + ' The p-value is <b>' + pv3 + '</b>.'),
        parts: [mc('Which conclusion is correct at α = ' + cases[1] + '?', opts(cases[1]), 0, pv3 + ' &lt; ' + cases[1] + ': reject H₀.'),
          mc('Which conclusion is correct at α = ' + cases[2] + '?', opts(cases[2]), 0, pv3 + ' ≥ ' + cases[2] + ': fail to reject H₀.')],
        sol: steps(['At α = ' + cases[1] + ': p &lt; α, reject. <b>' + sent(cases[1], true) + '</b>', 'At α = ' + cases[2] + ': p ≥ α, fail to reject. <b>' + sent(cases[2], false) + '</b>', 'The data and the p-value are the same; the threshold differs. This is why α is chosen before looking at the data.']) };
    }
  });

  /* ========================================================= errors */
  function NB(r, m) { return ' (Here H₀: μ = ' + m + ' stands for μ ' + r + ' ' + m + '. We test at the boundary ' + m + '.)'; }
  var ESC = [
    { s: 'A food inspector tests whether the mean weight of packages labelled 500 g is below 500 g.', mu: 'the mean weight of a package (in g)', h: 'H₀: μ = 500, H₁: μ &lt; 500.' + NB('≥', 500), t: 'the mean weight really is 500 g', f: 'the mean weight really is below 500 g', rej: 'concludes that the mean weight is below 500 g', keep: 'does not find enough evidence that the mean weight is below 500 g' },
    { s: 'With its old queue system, the mean waiting time at a pharmacy chain was 9 minutes. The chain tests whether the mean under a new system is below 9 minutes.', mu: 'the mean waiting time under the new system (in minutes)', h: 'H₀: μ = 9, H₁: μ &lt; 9.' + NB('≥', 9), t: 'the mean waiting time under the new system really is 9 minutes', f: 'the mean waiting time under the new system really is below 9 minutes', rej: 'concludes that the mean waiting time is below 9 minutes', keep: 'does not find enough evidence that the mean waiting time is below 9 minutes' },
    { s: 'An engineer tests whether the mean length of the bolts made by a machine differs from the target of 50 mm.', mu: 'the mean bolt length (in mm)', h: 'H₀: μ = 50, H₁: μ ≠ 50.', t: 'the mean bolt length really is 50 mm', f: 'the mean bolt length really is different from 50 mm', rej: 'concludes that the mean bolt length differs from 50 mm', keep: 'does not find enough evidence that the mean bolt length differs from 50 mm' },
    { s: 'With the old study method, the mean test score at a school was 70 points. The school tests whether the mean score with a new method is above 70.', mu: 'the mean score with the new method (in points)', h: 'H₀: μ = 70, H₁: μ &gt; 70.' + NB('≤', 70), t: 'the mean score with the new method really is 70', f: 'the mean score with the new method really is above 70', rej: 'concludes that the mean score is above 70', keep: 'does not find enough evidence that the mean score is above 70' }
  ];
  var ET = ['Type I error', 'Type II error', 'Correct decision'];
  function errCase(e, truth, rej) { return { k: truth ? (rej ? 0 : 2) : (rej ? 2 : 1), t: 'Suppose ' + (truth ? e.t : e.f) + ', and the test ' + (rej ? e.rej : e.keep) + '.', truth: truth, rej: rej }; }
  function errWhy(q) { return (q.truth ? 'H₀ is true' : 'H₀ is false') + ' and we ' + (q.rej ? 'reject it' : 'fail to reject it') + '.'; }
  P.reg('errors', {
    title: 'Type I and Type II errors', section: 4, est: 90,
    topic: 'Compare what the test concluded with what is actually true.',
    variants: ['Name the error', 'Which error is still possible?', 'Many tests'],
    gen: function (v) {
      var e = pick(ESC);
      if (v === 0) {
        var all = shuffle([errCase(e, true, true), errCase(e, false, false), pick([errCase(e, true, false), errCase(e, false, true)])]);
        return { stmt: p(e.s + ' Here μ is ' + e.mu + '. The hypotheses are ' + e.h) + p('In each case below, suppose that we know the truth. Is the result of the test a Type I error, a Type II error, or a correct decision?'),
          parts: all.map(function (q) { return mc(q.t, ET, q.k, errWhy(q), true); }),
          sol: steps(all.map(function (q) { return errWhy(q) + ' <b>' + ET[q.k] + '</b>.'; })) };
      }
      if (v === 1) {
        var rej = Math.random() < 0.5;
        var poss = ['Only a Type I error', 'Only a Type II error', 'Both are still possible', 'Neither: a test cannot be wrong'];
        var meanings = rej ? ['The test ' + e.rej + ', although ' + e.t + '.', 'The test ' + e.keep + ', although ' + e.f + '.', 'The test ' + e.rej + ', and ' + e.f + '.']
          : ['The test ' + e.keep + ', although ' + e.f + '.', 'The test ' + e.rej + ', although ' + e.t + '.', 'The test ' + e.keep + ', and ' + e.t + '.'];
        return { stmt: p(e.s + ' Here μ is ' + e.mu + '. The hypotheses are ' + e.h) + p('The data are in, and the test <b>' + (rej ? 'rejects H₀' : 'fails to reject H₀') + '</b>.'),
          parts: [mc('We do not know the true mean. Which error could we have made?', poss, rej ? 0 : 1, rej ? 'We rejected, so the only possible mistake is that H₀ was true.' : 'We did not reject, so the only possible mistake is that H₀ was false.', true),
            mc('The true mean is unknown. Which description below is a <b>wrong</b> result that could have happened in this study?', meanings, 0, rej ? 'A false alarm.' : 'A missed effect.')],
          sol: steps([rej ? 'After rejecting H₀ only a <b>Type I error</b> is possible.' : 'After failing to reject H₀ only a <b>Type II error</b> is possible.', '<b>' + meanings[0] + '</b>']) };
      }
      var N = pick([100, 200, 400, 600, 1000]), a = pick([0.05, 0.1]);
      var CH = ['It gets smaller', 'It gets larger', 'It does not change'];
      var MQ = 'One machine is really faulty (its μ is not 50 mm). A Type II error means that its test does not flag it. ';
      return { stmt: p('A factory has many machines that cut bolts. For one machine, μ is the mean length of its bolts, and the target is 50 mm. The machine works correctly if μ = 50 and is faulty if μ ≠ 50. Each machine is tested with its own random sample of bolt lengths (normally distributed): H₀: μ = 50 against H₁: μ ≠ 50, at significance level α. If H₀ is rejected, the machine is <b>flagged</b>.'),
        parts: [
          num('Suppose <b>' + N + '</b> machines are tested at α = <b>' + a.toFixed(2) + '</b>, and in fact all of them work correctly. What is the expected number of flagged machines?', F(Math.round(N * a)), 'α = P(reject H₀ | H₀ is true), so the expected number is N × α.'),
          num('Suppose <b>' + N + '</b> machines are tested at α = <b>0.01</b>, and in fact all of them work correctly. What is the expected number of flagged machines?', F(Math.round(N * 0.01)), 'N × 0.01.'),
          mc(MQ + 'If α is made smaller and the sample size stays the same, what happens to the probability of this error?', CH, 1, 'A stricter threshold needs stronger evidence, so a real fault is missed more often.', true),
          mc(MQ + 'If α stays the same and the sample is larger, what happens to the probability of this error?', CH, 0, 'More data make a real fault easier to detect.', true)],
        sol: steps(['When every H₀ is true, every rejection is a Type I error. Expected number: ' + N + ' × ' + a + ' = <b>' + Math.round(N * a) + '</b>.', 'With α = 0.01: ' + N + ' × 0.01 = <b>' + Math.round(N * 0.01) + '</b>.', 'Fewer false alarms come at a price: for a faulty machine, the Type II probability <b>gets larger</b> (same n).', 'A larger n makes the Type II probability <b>smaller</b>, with α unchanged.']) };
    }
  });

  /* ========================================================= what changes */
  var PEFF = ['The p-value gets smaller', 'The p-value gets larger', 'The p-value does not change'];
  var CHG = [
    ['The sample size is multiplied by 4; ' + XB + ' and σ stay the same.', 0, 'The standard error is halved, so |z| doubles.'],
    ['The sample size is cut to one quarter; ' + XB + ' and σ stay the same.', 1, 'The standard error doubles, so |z| is halved.'],
    ['The known σ is larger; ' + XB + ' and <i>n</i> stay the same.', 1, 'A larger standard error gives a smaller |z|.'],
    ['The known σ is smaller; ' + XB + ' and <i>n</i> stay the same.', 0, 'A smaller standard error gives a larger |z|.'],
    [XB + ' is farther above μ₀; σ and <i>n</i> stay the same.', 0, 'A larger distance gives a larger |z|.'],
    [XB + ' is closer to μ₀ (still above it); σ and <i>n</i> stay the same.', 1, 'A smaller distance gives a smaller |z|.'],
    ['The significance level α is changed from 0.05 to 0.01; the data stay the same.', 2, 'The p-value depends on the data and the hypotheses, not on α. Only the decision rule changes.'],
    ['Before seeing the data, the researcher chooses H₁: μ &gt; μ₀ instead of H₁: μ ≠ μ₀.', 0, 'Only the upper tail is counted: half the two-sided p-value, since ' + XB + ' is above μ₀.']
  ];
  var TP = { 3: 0.145, 5: 0.107, 8: 0.086, 9: 0.082, 15: 0.069, 24: 0.062 };
  P.reg('change', {
    title: 'What changes the result?', section: 4, est: 100,
    topic: 'Follow the change through: standard error, then statistic, then reference distribution, then p-value.',
    variants: ['Effect on the p-value', 't or z for the same number', 'Using the cutoff 1.96'],
    gen: function (v) {
      if (v === 0) {
        var sel = shuffle(CHG).slice(0, 4);
        return { stmt: p('Original study: a <i>z</i>-test of H₀: μ = μ₀ against H₁: μ ≠ μ₀ about a population mean μ. The data are a random sample from a normal population, σ is known, and the sample mean <span class="xbar">X</span> is above the benchmark μ₀. Each question changes <b>one</b> thing and keeps everything else as in the original study.'),
          parts: sel.map(function (q) { return mc('Change: ' + q[0] + ' What happens to the p-value?', PEFF, q[1], q[2], true); }),
          sol: steps(sel.map(function (q) { return q[0] + ' <b>' + PEFF[q[1]] + '.</b> ' + q[2]; })) };
      }
      if (v === 1) {
        var df = pick([3, 8, 15, 24]), tcv = X.tc(df, 0.025);
        var cand = []; for (var k = 39; k <= 62; k++) { var a = rd(k * 0.05, 2); if (a > 1.99 && a < tcv - 0.03) cand.push(a); }
        var st = pick(cand), n = df + 1;
        return { stmt: p('Ann and Bek run two separate studies. Each tests H₀: μ = μ₀ against H₁: μ ≠ μ₀ about a population mean μ, each using its own random sample of <i>n</i> = <b>' + n + '</b> observations from a normal population. Ann <b>knows</b> σ and computes <i>z</i> = (' + XB + ' − μ₀)/(σ/√<i>n</i>). Bek <b>does not know</b> σ and computes <i>t</i> = (' + XB + ' − μ₀)/(<i>s</i>/√<i>n</i>), where <i>s</i> is the sample standard deviation. By coincidence, both get the same number: Ann has <i>z</i> = <b>' + fx(st) + '</b> and Bek has <i>t</i> = <b>' + fx(st) + '</b>.') + X.ttable(df),
          parts: [
            mc('Whose p-value is larger?', ['Ann’s (<i>z</i>)', 'Bek’s (<i>t</i>)', 'They are equal'], 1, 'The t-distribution has thicker tails, so more area lies beyond the same number.', true),
            mc('At α = 0.05, who rejects H₀?', ['Only Ann', 'Only Bek', 'Both', 'Neither'], 0, fx(st) + ' is above 1.960 but below ' + tcv.toFixed(3) + '.', true),
            mc('Suppose instead that both use the same, much larger sample size, and again get <i>z</i> = ' + fx(st) + ' and <i>t</i> = ' + fx(st) + '. Compared with <i>n</i> = ' + n + ', the difference between their two p-values would be …', ['closer to zero', 'larger', 'exactly the same as before'], 0, 'The t-distribution approaches the standard normal as df grows.', true)],
          sol: steps(['Same number, different reference curves. Thicker tails: <b>Bek’s p-value is larger</b>.', 'Cutoffs: Ann 1.960, Bek ' + tcv.toFixed(3) + ' (df = ' + df + '). Since 1.960 &lt; ' + fx(st) + ' &lt; ' + tcv.toFixed(3) + ', <b>only Ann</b> rejects.', 'As df grows, <i>t</i> approaches <i>z</i> and the gap <b>shrinks</b>.']) };
      }
      var d2 = pick([3, 5, 8, 15]), n2 = d2 + 1, rate = TP[d2];
      return { stmt: p('A student wants to test H₀: μ = μ₀ against H₁: μ ≠ μ₀ at the 5% significance level. The population is normal and σ is unknown. From a random sample of <i>n</i> = <b>' + n2 + '</b> observations the student computes <i>t</i> = (' + XB + ' − μ₀)/(<i>s</i>/√<i>n</i>), where ' + XB + ' is the sample mean and <i>s</i> the sample standard deviation. The student’s rule is: reject H₀ if the absolute value of <i>t</i> is larger than <b>1.96</b>.'),
        parts: [
          mc('Suppose H₀ is true and we draw many samples. In what share of the samples does the student’s rule reject H₀?', ['More than 5% of the time', 'Exactly 5% of the time', 'Less than 5% of the time'], 0, 'The t-distribution has more than 5% of its area beyond ±1.96. For n = ' + n2 + ' it is about ' + Math.round(rate * 1000) / 10 + '%.', true),
          mc('The student uses 1.96 as the critical value for this <i>t</i> statistic with <i>n</i> = ' + n2 + '. Which statement about this choice is correct?', ['It is not valid, because <i>s</i> also varies from sample to sample, so <i>t</i> has thicker tails than <i>z</i>', 'It is valid, because <i>s</i> estimates σ, so <i>t</i> has the same distribution as <i>z</i>', 'It is valid, because the population is normal, so <i>t</i> is standard normal for every <i>n</i>', 'It is not valid, because in a small sample the sample mean is a biased estimator of μ'], 0, 'Two sources of randomness, <span class="xbar">X</span> and <i>s</i>.'),
          mc('Suppose instead that the sample size is <i>n</i> = 400 and the rule is still: reject H₀ if the absolute value of <i>t</i> is larger than 1.96. When H₀ is true, the share of samples in which H₀ is rejected is …', ['very close to 5%', 'far above 5%', 'close to 0%'], 0, 'With df = 399 the t-distribution is almost the standard normal.', true)],
        sol: steps(['The correct cutoff comes from <i>t</i> with df = ' + d2 + ', and it is larger than 1.96.', 'Using 1.96 rejects a true H₀ about <b>' + Math.round(rate * 1000) / 10 + '%</b> of the time instead of 5%: too many false alarms.', 'For large n the two cutoffs almost coincide.']),
        meta: { rate: { df: d2, rate: rate } } };
    }
  });

  /* ========================================================= concept checks */
  var TF = ['True', 'False'];
  var SETS = [
    [
      ['In a <i>z</i>-test or <i>t</i>-test (normal population) of H₀: μ = μ₀ against H₁: μ ≠ μ₀, the significance level α is the probability of rejecting H₀ when H₀ is true.', true, 'This is the definition: the probability of a Type I error.'],
      ['The p-value is the probability that H₀ is true.', false, 'It is computed assuming H₀ is true; it is a probability about the data.'],
      ['If the p-value of a test is 0.03, we reject H₀ at α = 0.05 but not at α = 0.01.', true, '0.03 &lt; 0.05 and 0.03 ≥ 0.01.'],
      ['With the same data and the same hypotheses: if we reject H₀ at the 1% level, then we must also reject it at the 5% level.', true, 'p &lt; 0.01 implies p &lt; 0.05.'],
      ['With the same data and the same hypotheses: if we reject H₀ at the 10% level, then we must also reject it at the 5% level.', false, 'For example, p = 0.08.'],
      ['The value of α should be chosen after computing the p-value.', false, 'It is chosen before looking at the data.'],
      ['Failing to reject H₀ proves that H₀ is true.', false, 'It only says the data are not surprising enough to rule it out.'],
      ['In a two-sided <i>z</i>-test, a larger observed |<i>z</i>| gives a smaller p-value.', true, 'Less area lies farther out in the tails.']
    ], [
      ['Hypotheses are statements about a population parameter, such as μ.', true, 'They are not about sample quantities.'],
      ['In this course, H₁ may contain the sign ≤.', false, 'H₁ never contains an equality sign.'],
      ['To test H₀: μ ≤ 10 against H₁: μ &gt; 10, we use μ₀ = 10 in the formula of the test statistic.', true, '10 is the hardest value in H₀ to reject.'],
      ['Take H₁: μ &gt; μ₀ and a sample with <span class="xbar">X</span> above μ₀ (<i>z</i>- or <i>t</i>-test). The p-value is then half the p-value that the same data give for H₁: μ ≠ μ₀.', true, 'Only one of two equal tails is counted.'],
      ['With H₁: μ &gt; μ₀, a sample mean far below μ₀ is strong evidence for rejecting H₀.', false, 'It is on the side that H₀ predicts or tolerates.'],
      ['It is fine to pick the direction of H₁ after seeing on which side of μ₀ the sample mean falls.', false, 'The direction comes from the claim, before the data.'],
      ['Take one distribution (standard normal, or <i>t</i> with fixed df) and α = 0.05. Compare a one-sided test (H₁: μ &gt; μ₀) with a two-sided test (H₁: μ ≠ μ₀). The positive critical value is closer to 0 in the one-sided test.', true, 'All of α sits in one tail.'],
      ['For the same sample and the same method (both <i>z</i> with σ, or both <i>t</i> with <i>s</i>), the 95% confidence interval for μ contains exactly the values μ₀ that a two-sided test at α = 0.05 does not reject.', true, 'This is the duality of intervals and two-sided tests.']
    ], [
      ['Student’s <i>t</i>-distribution has thicker tails than the standard normal distribution.', true, 'Estimating σ adds uncertainty.'],
      ['In a <i>t</i>-test about one population mean, the number of degrees of freedom is <i>n</i> − 1.', true, 'df = n − 1.'],
      ['As the degrees of freedom grow, the <i>t</i>-distribution approaches the standard normal.', true, 'The two become practically the same.'],
      ['For the same α and the same H₁, the <i>t</i> critical value is closer to 0 than the <i>z</i> critical value.', false, 'It is farther from 0.'],
      ['If σ is known, we still use the <i>t</i>-distribution whenever <i>n</i> is small (normal population).', false, 'With σ known and a normal population, z is exactly N(0, 1) for any n.'],
      ['If σ is unknown but <i>n</i> is small, we may simply replace σ by <i>s</i> and keep the <i>z</i> critical values.', false, 'The cutoffs must come from the t-distribution.'],
      ['Take a random sample from a normal population in which <i>s</i> turns out to be equal to σ. The 95% interval built with <i>s</i> and a <i>t</i> critical value is then wider than the 95% interval built from the same sample with σ and a <i>z</i> critical value. (Both are confidence intervals for μ.)', true, 'The t critical value is larger.'],
      ['The statistic (<span class="xbar">X</span> − μ)/(<i>s</i>/√<i>n</i>) has a Student’s <i>t</i>-distribution when the data are a random sample from a normal population with mean μ.', true, 'This is the result stated in the lecture.']
    ]
  ];
  P.reg('tf', {
    title: 'Concept checks', section: 4, est: 90,
    topic: 'Quick true-or-false checks on the main ideas.',
    variants: ['α and p-values', 'Hypotheses and sides', 't and normal'],
    gen: function (v) {
      var sel, guard = 0;
      do { sel = shuffle(SETS[v]).slice(0, 4); guard++; } while (sel.filter(function (q) { return q[1]; }).length % 4 === 0 && guard < 50);
      return { stmt: p('Notation: μ is a population mean and μ₀ a benchmark value; H₀ and H₁ are the null and alternative hypotheses; α is the significance level; <i>n</i> is the sample size; ' + XB + ' is the sample mean; σ and <i>s</i> are the population and sample standard deviations.'),
        parts: sel.map(function (q) { return mc('True or false? ' + q[0], TF, q[1] ? 0 : 1, q[2], true); }),
        sol: steps(sel.map(function (q) { return q[0] + ' <b>' + (q[1] ? 'True' : 'False') + '</b>. ' + q[2]; })) };
    }
  });
})();
