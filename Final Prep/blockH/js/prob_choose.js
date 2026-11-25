/* Block H, part 1: shared helpers, "estimation or testing?" and "z or t?". */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, shuffle = H.shuffle, F = H.F, num = H.num, mc = H.mc, p = H.p, steps = H.steps, M = H.MINUS;
  var XB = '<span class="xbar">X</span>';

  /* ---------- numbers ---------- */
  function fx(v) { var s = String(+Math.abs(v).toFixed(4)); return (v < 0 && +s !== 0 ? M : '') + s; }
  function rd(v, dp) { var s = Math.pow(10, dp); return Math.round(v * s + (v < 0 ? -1e-7 : 1e-7)) / s; }
  function isDp(x, dp) { var s = Math.pow(10, dp); return Math.abs(x * s - Math.round(x * s)) < 1e-6; }
  function dt(pr, v, ex, o) { /* decimal numeric part */
    var r = num(pr, F(Math.round(v * 10000), 10000), ex, o); r.a = fx(v); return r;
  }

  /* ---------- tables ---------- */
  var Z = { '0.1': 1.282, '0.05': 1.645, '0.025': 1.96, '0.01': 2.326, '0.005': 2.576 };
  var AREAS = ['0.1', '0.05', '0.025', '0.01', '0.005'];
  var T = {
    3: [1.638, 2.353, 3.182, 4.541, 5.841], 4: [1.533, 2.132, 2.776, 3.747, 4.604], 8: [1.397, 1.860, 2.306, 2.896, 3.355], 9: [1.383, 1.833, 2.262, 2.821, 3.250],
    15: [1.341, 1.753, 2.131, 2.602, 2.947], 16: [1.337, 1.746, 2.120, 2.583, 2.921], 24: [1.318, 1.711, 2.064, 2.492, 2.797],
    25: [1.316, 1.708, 2.060, 2.485, 2.787], 35: [1.306, 1.690, 2.030, 2.438, 2.724], 36: [1.306, 1.688, 2.028, 2.434, 2.719]
  };
  function tc(df, area) { return T[df][AREAS.indexOf(String(area))]; }
  function zc(area) { return Z[String(area)]; }
  function crit(kind, df, area) { return kind === 'z' ? zc(area) : tc(df, area); }
  /* excerpt: the row the student needs, two other rows, and the normal row */
  function ttable(df) {
    var rows = [df];
    var other = [3, 8, 15, 24, 35].filter(function (d) { return d !== df; });
    other.sort(function (a, b) { return Math.abs(a - df) - Math.abs(b - df); });
    rows.push(other[0], other[1]);
    if (T[df + 1] && rows.indexOf(df + 1) < 0) rows.push(df + 1);
    rows.sort(function (a, b) { return a - b; });
    var body = rows.map(function (d) { return ['<i>t</i>, df = ' + d].concat(T[d].map(function (v) { return v.toFixed(3); })); });
    body.push(['Normal <i>z</i>'].concat(AREAS.map(function (a) { return Z[a].toFixed(3); })));
    return '<div class="tbl-cap"><b>Table of critical values.</b> Find your distribution in the left column: Student’s <i>t</i> with its degrees of freedom (df), or standard normal <i>z</i>. The top row is an area in the <b>right</b> tail. Each number inside the table has that area to its right.</div>' +
      H.tbl(['Area to the right of <i>c</i>', '0.10', '0.05', '0.025', '0.01', '0.005'], body, 'crit');
  }
  /* printed 4-decimal Normal table values */
  var PHI = { '0.5': 0.6915, '0.8': 0.7881, '1': 0.8413, '1.2': 0.8849, '1.25': 0.8944, '1.4': 0.9192, '1.5': 0.9332, '1.6': 0.9452, '1.75': 0.9599,
    '1.8': 0.9641, '2': 0.9772, '2.2': 0.9861, '2.25': 0.9878, '2.4': 0.9918, '2.5': 0.9938 };

  /* ---------- contexts (one-sample tests about a mean) ---------- */
  var CTX = [
    { thing: 'coffee packages', one: 'package', what: 'weight of a coffee package', unit: 'g', mus: [250, 500], ses: [1, 1.5, 2, 2.5] },
    { thing: 'juice bottles', one: 'bottle', what: 'volume of juice in a bottle', unit: 'ml', mus: [330, 500, 1000], ses: [0.5, 1, 1.5, 2] },
    { thing: 'phones', one: 'phone', what: 'battery life of a phone model', unit: 'hours', mus: [20, 24, 30], ses: [0.4, 0.5, 0.8] },
    { thing: 'food orders', one: 'order', what: 'delivery time of a food order', unit: 'minutes', mus: [30, 35, 45], ses: [0.5, 1, 1.5] },
    { thing: 'chocolate bars', one: 'bar', what: 'weight of a chocolate bar', unit: 'g', mus: [90, 100], ses: [0.4, 0.5, 0.8] },
    { thing: 'patients', one: 'patient', what: 'waiting time of a patient at a clinic', unit: 'minutes', mus: [15, 20, 25], ses: [0.5, 0.8, 1] },
    { thing: 'drivers', one: 'driver', what: 'reaction time of a driver in a braking test', unit: 'ms', mus: [250, 300], ses: [4, 5, 8] }
  ];
  function U(c, v) { return fx(v) + ' ' + c.unit; }

  /* data for a one-sample test: statistic = tv exactly, SE = sd / sqrt(n) a short decimal */
  function draw(kind, tvals, ks) {
    for (var g = 0; g < 500; g++) {
      var c = pick(CTX), mu = pick(c.mus), k = pick(ks || (kind === 'z' ? [4, 5, 6, 8, 10] : [3, 4, 5, 6])), se = pick(c.ses), tv = pick(tvals);
      var sd = rd(se * k, 4), xb = rd(mu + tv * se, 4);
      if (!isDp(sd, 1) || !isDp(xb, 2)) continue;
      return { c: c, mu: mu, k: k, n: k * k, se: se, sd: sd, xb: xb, stat: tv, kind: kind, df: k * k - 1 };
    }
    throw new Error('draw failed');
  }
  function data(o) {
    return 'The population is normal, and μ is the population mean ' + o.c.what + '. A random sample of <i>n</i> = <b>' + o.n + '</b> ' + o.c.thing + ' has sample mean ' + XB + ' = <b>' + U(o.c, o.xb) + '</b>. ' +
      (o.kind === 'z' ? 'The population standard deviation is <b>known</b>: σ = <b>' + U(o.c, o.sd) + '</b>.'
        : 'The population standard deviation σ is <b>unknown</b>. The standard deviation computed from this sample is <i>s</i> = <b>' + U(o.c, o.sd) + '</b>.');
  }
  function seLine(o) { return o.kind === 'z' ? 'Standard error of the sample mean: σ/√<i>n</i> = ' + fx(o.sd) + '/' + o.k + ' = <b>' + fx(o.se) + '</b>.'
    : 'The standard error σ/√<i>n</i> cannot be computed, because σ is unknown. We <b>estimate</b> it by <i>s</i>/√<i>n</i> = ' + fx(o.sd) + '/' + o.k + ' = <b>' + fx(o.se) + '</b>.'; }
  function seName(o) { return o.kind === 'z' ? 'standard error' : 'estimated standard error'; }
  function statName(o) { return o.kind === 'z' ? '<i>z</i>' : '<i>t</i>'; }
  function statLine(o) { return statName(o) + ' = (' + XB + ' − μ₀)/(' + seName(o) + ') = (' + fx(o.xb) + ' − ' + fx(o.mu) + ')/' + fx(o.se) + ' = <b>' + fx(o.stat) + '</b>' + (o.kind === 't' ? ', with df = ' + o.df : '') + '.'; }

  var DEC = ['Reject H₀', 'Fail to reject H₀'];
  function dec(pr, rej, ex) { return mc(pr, DEC, rej ? 0 : 1, ex, true); }
  var SYM = { two: '≠', up: '&gt;', down: '&lt;' };
  function hyp(m, dir) { return 'H₀: μ = ' + fx(m) + ', H₁: μ ' + SYM[dir] + ' ' + fx(m); }

  var X = { XB: XB, fx: fx, rd: rd, isDp: isDp, dt: dt, tc: tc, zc: zc, crit: crit, T: T, Z: Z, AREAS: AREAS, ttable: ttable, PHI: PHI,
    CTX: CTX, U: U, draw: draw, data: data, seLine: seLine, seName: seName, statName: statName, statLine: statLine, DEC: DEC, dec: dec, SYM: SYM, hyp: hyp };
  H.X = X;

  /* ========================================================= 1. estimation or testing */
  var Q = [
    ['What is the average monthly rent of a one-bedroom flat in Astana?', 0, 'It asks for the size of a mean: no benchmark.'],
    ['Is the average monthly rent of a one-bedroom flat in Astana above 250 thousand tenge?', 1, 'The mean is compared with the benchmark 250 thousand.'],
    ['What share of households in a city own a car?', 0, 'It asks for the size of a share.'],
    ['Do more than half of the households in a city own a car?', 1, 'The share is compared with the benchmark one half.'],
    ['How many cups of coffee does an office worker drink per day, on average?', 0, 'It asks how large a mean is.'],
    ['Is the mean weight of the packages filled by this machine equal to the 500 g printed on the label?', 1, 'The label gives the benchmark 500 g.'],
    ['By how much does one extra year of experience change a worker’s monthly salary?', 0, 'It asks for the size of an effect.'],
    ['Does experience have any effect on a worker’s salary?', 1, 'The benchmark is “no effect”.'],
    ['What is a range of plausible values for the mean lifetime of a new LED bulb?', 0, 'A range of plausible values is a confidence interval.'],
    ['Has the mean lifetime of the bulbs changed from the old value of 12,000 hours?', 1, 'The old value is the benchmark.'],
    ['How long does a bank customer wait in line, on average?', 0, 'It asks how large a mean is.'],
    ['With the new queue system, is the mean waiting time below the old value of 9 minutes?', 1, 'The old mean is the benchmark.'],
    ['What fraction of a firm’s orders arrive late?', 0, 'It asks for the size of a share.'],
    ['Is the average starting salary of graduates equal to the figure of 300 thousand tenge quoted in a brochure?', 1, 'The quoted figure is the benchmark.']
  ];
  var TOOLS = ['Point estimate', 'Confidence interval', 'Two-sided test', 'One-sided test'];
  var TASKS = [
    ['A planner needs <b>one number</b> as the best guess for the mean daily number of visitors of a park, to put into a budget formula.', 0, 'One best guess: a point estimate, such as <span class="xbar">X</span>.'],
    ['An analyst needs a single best guess for the mean electricity bill in a district.', 0, 'One number, no precision and no benchmark: a point estimate.'],
    ['A report must give a <b>range of plausible values</b> for the mean monthly spending on groceries.', 1, 'A range of plausible values is a confidence interval.'],
    ['A manager asks how <b>precisely</b> a sample of 40 repairs lets us estimate the population mean repair time.', 1, 'Precision is shown by the margin of error of a confidence interval.'],
    ['An engineer must decide whether a machine’s mean bolt length <b>differs</b> from the target of 50 mm. Too long and too short are both a problem.', 2, 'There is a benchmark and both directions matter.'],
    ['A researcher must make a yes-or-no decision: is the mean sleep time of adults <b>different</b> from the 7 hours reported ten years ago? A change in either direction is of interest.', 2, 'There is a benchmark and both directions matter.'],
    ['A regulator must decide whether the data support the suspicion that bottles labelled 1 litre are <b>underfilled</b> on average.', 3, 'There is a benchmark and only one direction supports the suspicion.'],
    ['A firm must decide whether the data show that mean sales per worker under a new training program are <b>above</b> the old level of 40 units.', 3, 'There is a benchmark and the claim points upward.']
  ];
  var DD = 'wants a yes-or-no decision at a chosen significance level: is there evidence that ';
  var GOALS = [
    { c: CTX[0], a: 'wants to know how large the mean weight of a package is, and how precise this estimate is', who: ['The production manager', 'A food inspector'], b: DD + 'the mean weight of a package <b>differs</b> from the {m} printed on the label (heavier or lighter)?', dir: 'two', m: 500 },
    { c: CTX[1], a: 'wants to know how much juice a bottle contains on average, with a range of plausible values', who: ['The plant manager', 'A consumer group'], b: DD + 'the mean volume of juice in a bottle is <b>less</b> than the {m} on the label?', dir: 'down', m: 330 },
    { c: CTX[3], a: 'wants to know how long a delivery takes on average, and how uncertain this figure is', who: ['A logistics planner', 'The owner'], b: DD + 'the mean delivery time is now <b>longer</b> than the promised {m}?', dir: 'up', m: 35 },
    { c: CTX[2], a: 'wants to know how long the battery lasts on average, with a range of plausible values', who: ['A product designer', 'A journalist'], b: DD + 'the mean battery life <b>differs</b> from the advertised {m} (longer or shorter)?', dir: 'two', m: 24 }
  ];
  P.reg('goal', {
    title: 'Estimation or testing?', section: 1, est: 90,
    topic: 'Decide what kind of answer each question is asking for.',
    variants: ['Classify research questions', 'Same data, two people', 'Pick the right tool'],
    gen: function (v) {
      if (v === 0) {
        var sel; do { sel = shuffle(Q).slice(0, 4); } while (sel.filter(function (q) { return q[1] === 1; }).length % 4 === 0);
        return { stmt: p('Below are separate research questions. To answer each one from sample data, would you use <b>estimation</b> or a <b>hypothesis test</b>?'),
          parts: sel.map(function (q) { return mc(q[0], ['Estimation', 'Hypothesis testing'], q[1], q[2], true); }),
          sol: steps(sel.map(function (q) { return q[0] + ' <b>' + (q[1] ? 'Testing' : 'Estimation') + '</b>. ' + q[2]; }).concat(['Hint: a test question contains a <b>benchmark</b> (a number, or “no effect”) and asks yes or no. An estimation question asks how large something is.'])) };
      }
      if (v === 1) {
        var s = pick(GOALS), c = s.c, m = U(c, s.m), n = pick([36, 49, 64]), xb = rd(s.m + (s.dir === 'down' ? -1 : 1) * pick(c.ses), 2);
        var tools = ['A confidence interval for μ', 'A two-sided test', 'A one-sided test', 'Nothing more: ' + XB + ' is equal to μ'];
        var H0s = [hyp(s.m, s.dir)].concat(['two', 'up', 'down'].filter(function (d) { return d !== s.dir; }).map(function (d) { return hyp(s.m, d); }));
        return { stmt: p('Let μ be the population mean ' + c.what + '. A random sample of ' + n + ' ' + c.thing + ' gives ' + XB + ' = ' + U(c, xb) + '.') +
            '<ul><li><b>Person 1.</b> ' + s.who[0] + ' ' + s.a + '.</li><li><b>Person 2.</b> ' + s.who[1] + ' ' + s.b.replace('{m}', m) + '</li></ul>',
          parts: [
            mc('Which method most directly answers the question of <b>Person 1</b>?', tools, 0, 'Person 1 asks how large μ is. There is no benchmark.', true),
            mc('Which method is designed to give <b>Person 2</b> this yes-or-no decision directly, without first building an interval?', tools, s.dir === 'two' ? 1 : 2, s.dir === 'two' ? 'There is a benchmark, and a difference in either direction counts.' : 'There is a benchmark, and only one direction counts.', true),
            mc('Which hypotheses match the question of <b>Person 2</b>?', H0s, 0, 'The benchmark ' + m + ' goes into H₀, the claim to check goes into H₁.')],
          sol: steps(['Person 1 asks <b>how large</b> μ is and how precise the answer is: <b>estimation</b>. Report ' + XB + ' with a confidence interval.', 'Person 2 compares μ with the benchmark ' + m + ' and wants a yes/no decision: <b>testing</b>, ' + (s.dir === 'two' ? 'two-sided' : 'one-sided') + '.', hyp(s.m, s.dir) + '.', 'The data are the same; the <b>question</b> decides the method.']) };
      }
      var by = [0, 1, 2, 3].map(function (k) { return pick(TASKS.filter(function (t) { return t[1] === k; })); });
      var sel2 = shuffle(by);
      if (Math.random() < 0.5) sel2[0] = pick(TASKS.filter(function (t) { return sel2.indexOf(t) < 0; }));
      return { stmt: p('Each item below is a separate task about a population mean, to be done with data from a random sample. Which tool fits the task best?'),
        parts: sel2.map(function (q) { return mc(q[0], TOOLS, q[1], q[2], true); }),
        sol: steps(sel2.map(function (q) { return '<b>' + TOOLS[q[1]] + '</b>: ' + q[2]; }).concat(['First ask: is there a benchmark and a yes/no question? If no, estimate (one number, or a range). If yes, test, and let the wording of the claim decide one or two sides.'])) };
    }
  });

  /* ========================================================= 2. z or t */
  var WHICH = ['<i>z</i>, which uses σ; compare it with the standard normal distribution', '<i>t</i>, which uses <i>s</i>; compare it with Student’s <i>t</i> with <i>n</i> − 1 degrees of freedom', 'Neither: with the results from the lecture, we do not know the distribution of either statistic, even approximately'];
  function study(type) {
    var c = pick(CTX), sd = rd(pick(c.ses) * 4, 1), n;
    var pre = 'The variable is the ' + c.what + '. ';
    var kn = 'The population standard deviation is known: σ = ' + U(c, sd) + '. ';
    var un = 'The population standard deviation σ is unknown; the sample standard deviation is <i>s</i> = ' + U(c, sd) + '. ';
    if (type === 'znorm') { n = pick([8, 10, 12]); return { t: pre + 'It is normally distributed in the population. ' + kn + 'The sample size is <i>n</i> = ' + n + '.', k: 0, ex: 'σ is known and the population is normal: <i>z</i> is exactly standard normal when H₀ is true.' }; }
    if (type === 'zclt') { n = pick([100, 150, 200]); return { t: pre + 'Its distribution in the population is strongly skewed. ' + kn + 'The sample size is <i>n</i> = ' + n + '.', k: 0, ex: 'σ is known and <i>n</i> is large: by the Central Limit Theorem, <i>z</i> is approximately standard normal when H₀ is true.' }; }
    if (type === 'tsmall') { n = pick([8, 10, 12, 16]); return { t: pre + 'It is normally distributed in the population. ' + un + 'The sample size is <i>n</i> = ' + n + '.', k: 1, ex: 'σ is replaced by <i>s</i> and the population is normal: Student’s <i>t</i> with df = ' + (n - 1) + '.' }; }
    if (type === 'tlarge') { n = pick([150, 200, 400]); return { t: pre + 'It is normally distributed in the population. ' + un + 'The sample size is <i>n</i> = ' + n + '.', k: 1, ex: 'σ is unknown, so the statistic is <i>t</i> with df = ' + (n - 1) + ', even though <i>n</i> is large. Here the standard normal cutoffs would be a close approximation.' }; }
    n = pick([5, 6, 7, 8]); return { t: pre + 'Its distribution in the population is strongly skewed. ' + un + 'The sample size is <i>n</i> = ' + n + '.', k: 2, ex: 'The <i>t</i> result needs a normal population, and <i>n</i> = ' + n + ' is too small to rely on the Central Limit Theorem.' };
  }
  var LAB = 'ABCD';
  P.reg('zort', {
    title: 'z or t?', section: 1, est: 100,
    topic: 'Ask first: is σ known? Then check what makes the reference distribution valid.',
    variants: ['Four studies', 'Where does the SD come from?', 'Which expression is correct?', 'Which critical value?'],
    gen: function (v) {
      if (v === 0) {
        var types = shuffle([pick(['znorm', 'zclt']), 'tsmall', 'tlarge', 'none']), st = types.map(study);
        return { stmt: p('We test H₀: μ = μ₀ about a population mean μ with a random sample of size <i>n</i>. Here μ₀ is the benchmark value, <span class="xbar">X</span> is the sample mean, and <i>s</i> is the sample standard deviation. The two possible statistics are <i>z</i> = (<span class="xbar">X</span> − μ₀)/(σ/√<i>n</i>) and <i>t</i> = (<span class="xbar">X</span> − μ₀)/(<i>s</i>/√<i>n</i>). Use σ when it is known. Choose “Neither” when the results from the lecture give the distribution of neither statistic, even approximately.') + p('Each study below is a separate case. Which statistic should we use?'),
          parts: st.map(function (s, i) { return mc('<b>Study ' + LAB[i] + '.</b> ' + s.t, WHICH, s.k, s.ex, true); }),
          sol: steps(st.map(function (s, i) { return 'Study ' + LAB[i] + ': <b>' + WHICH[s.k] + '</b>. ' + s.ex; }).concat(['Order of questions: is σ <b>known</b>? If yes, use <i>z</i> (needs a normal population, or a large <i>n</i> for the Central Limit Theorem). If no, use <i>s</i> and <i>t</i> with df = <i>n</i> − 1 (the lecture’s result assumes a normal population).'])) };
      }
      if (v === 1) {
        var c = pick(CTX), m = pick(c.mus), n = pick([9, 16, 25, 36]), k = Math.sqrt(n), sd = rd(pick(c.ses) * k, 1), v2 = rd(sd * sd, 4);
        var KNOWN = [
          'Before taking the sample, the researcher already knows from long past records that the standard deviation of the whole population is ' + U(c, sd) + '.',
          'Before taking the sample, the researcher already knows from many years of past data that the variance of the whole population is σ² = ' + fx(v2) + '.'];
        var UNK = [
          'The researcher does not know the population standard deviation. After measuring the ' + n + ' sampled ' + c.thing + ', the researcher computes the standard deviation of these ' + n + ' values (dividing by <i>n</i> − 1) and gets ' + U(c, sd) + '.',
          'The researcher does not know the population standard deviation. The only information about the spread will be the ' + n + ' measurements in the sample.',
          'The researcher does not know the population variance. After measuring the ' + n + ' sampled ' + c.thing + ', the researcher computes the sample variance and gets <i>s</i>² = ' + fx(v2) + '.'];
        var sel = shuffle([{ t: pick(KNOWN), k: 0 }].concat(shuffle(UNK).slice(0, 2).map(function (t) { return { t: t, k: 1 }; })));
        var opts = ['<i>z</i>, compared with the standard normal distribution', '<i>t</i>, compared with Student’s <i>t</i> with ' + (n - 1) + ' degrees of freedom', '<i>t</i>, compared with Student’s <i>t</i> with ' + n + ' degrees of freedom'];
        var parts = sel.map(function (s, i) { return mc('<b>Situation ' + LAB[i] + '.</b> ' + s.t + ' Which test statistic should the researcher use?', opts, s.k, s.k === 0 ? 'The population value is known without using this sample, so it can be used as σ.' : 'The spread must be estimated from this sample, so the statistic uses <i>s</i>, with df = <i>n</i> − 1 = ' + (n - 1) + '.', true); });
        return { stmt: p('A researcher wants to test H₀: μ = ' + fx(m) + ' against H₁: μ ≠ ' + fx(m) + ', where μ is the population mean ' + c.what + ' (in ' + c.unit + '). The researcher will use a random sample of <i>n</i> = <b>' + n + '</b> ' + c.thing + '. The variable is normally distributed in the population. The three situations below are separate. They differ only in <b>what is known about the spread</b> of the variable.') +
            p('The two possible test statistics are <i>z</i> = (' + XB + ' − ' + fx(m) + ')/(σ/√<i>n</i>) and <i>t</i> = (' + XB + ' − ' + fx(m) + ')/(<i>s</i>/√<i>n</i>), where ' + XB + ' is the sample mean, σ the population standard deviation and <i>s</i> the sample standard deviation.'),
          parts: parts,
          sol: steps(sel.map(function (s, i) { return 'Situation ' + LAB[i] + ': <b>' + opts[s.k] + '</b>.'; }).concat(['What matters is <b>where the number comes from</b>. A population σ (or σ²) known without this sample gives <i>z</i>. A standard deviation computed from this sample is only an estimate of σ, which gives <i>t</i> with df = <i>n</i> − 1 = ' + (n - 1) + '.'])) };
      }
      if (v === 2) {
        var known = Math.random() < 0.5, o = draw(known ? 'z' : 't', [-2.4, -1.5, 1.5, 2.4], [3, 4, 5, 6]);
        var S = known ? 'σ' : '<i>s</i>', sdv = fx(o.sd), diff = '(' + fx(o.xb) + ' − ' + fx(o.mu) + ')';
        var stOpts = [diff + ' / (' + sdv + '/√' + o.n + ')', diff + ' / ' + sdv, diff + ' / (' + sdv + '/' + o.n + ')', diff + ' / (' + sdv + '/√' + (o.n - 1) + ')'];
        var cz = '1.960', ct = tc(o.df, 0.025).toFixed(3), good = known ? cz : ct, root = '·' + sdv + '/√' + o.n;
        var wr = '·' + sdv + '/√' + (o.n - 1), other = known ? ct : cz;
        var meOpts = [good + root, other + root, other + '·' + sdv + '/' + o.n, good + wr];
        return { stmt: p(data(o)) + ttable(o.df),
          parts: [
            mc('We test H₀: μ = ' + fx(o.mu) + ' against H₁: μ ≠ ' + fx(o.mu) + '. Which expression gives the value of the test statistic?', stOpts, 0, 'Divide the distance ' + XB + ' − μ₀ by the ' + X.seName(o) + ' ' + S + '/√n.'),
            mc('A <b>95%</b> confidence interval for μ has the form ' + XB + ' ± margin of error. Which expression is the margin of error?', meOpts, 0, known ? 'σ is known: use z = 1.960 with σ/√n.' : 'σ is unknown: use t with df = n − 1 = ' + o.df + ', which is ' + good + ', with s/√n.')],
          sol: steps(['σ is <b>' + (known ? 'known' : 'unknown') + '</b>, so we use ' + (known ? 'z' : 't with df = ' + o.df) + '.', 'Statistic: <b>' + stOpts[0] + '</b> = ' + fx(o.stat) + '.', 'Margin of error: critical value times the ' + X.seName(o) + ': <b>' + meOpts[0] + '</b>.']) };
      }
      var kn = Math.random() < 0.35, df = pick([8, 15, 24]), nn = df + 1, two = Math.random() < 0.5, alpha = pick([0.1, 0.05]);
      if (two && alpha === 0.1) alpha = 0.05;
      var area = two ? alpha / 2 : alpha, other = two ? alpha : alpha / 2;
      var kind = kn ? 'z' : 't', val = crit(kind, df, area);
      var cand = [val, crit(kind, df, other), crit(kn ? 't' : 'z', df, area), crit(kn ? 't' : 'z', df, other)];
      var opts4 = []; cand.forEach(function (x) { var s = x.toFixed(3); if (opts4.indexOf(s) < 0) opts4.push(s); });
      var c4 = pick(CTX);
      return { stmt: p('We test H₀: μ = μ₀ against <b>H₁: μ ' + (two ? '≠' : '&gt;') + ' μ₀</b>, where μ is the population mean ' + c4.what + ' and μ₀ is the benchmark value. We use a random sample of <i>n</i> = <b>' + nn + '</b> observations from a normal population. The population standard deviation σ is <b>' + (kn ? 'known' : 'unknown') + '</b>. The significance level is α = <b>' + alpha.toFixed(2) + '</b>. ' + (two ? 'The test rejects H₀ if the absolute value of the test statistic is larger than the critical value <i>c</i>.' : 'The test rejects H₀ if the test statistic is larger than the critical value <i>c</i>.')) + ttable(df),
        parts: [
          mc('Which distribution should be used to find <i>c</i>?', ['Standard normal', 'Student’s <i>t</i>, df = ' + df, 'Student’s <i>t</i>, df = ' + nn], kn ? 0 : 1, kn ? 'σ is known.' : 'σ is unknown: df = n − 1 = ' + df + '.', true),
          mc('What is the critical value <i>c</i>?', opts4, 0, (two ? 'Two-sided: put α/2 = ' + area + ' in each tail.' : 'One-sided: the whole α = ' + area + ' is in one tail.'))],
        sol: steps([(kn ? 'σ is known: use the <b>normal</b> row.' : 'σ is unknown: use the <i>t</i> row with df = ' + nn + ' − 1 = <b>' + df + '</b>.'), (two ? 'Two-sided test: upper-tail area α/2 = <b>' + area + '</b>.' : 'One-sided test: upper-tail area α = <b>' + area + '</b>.'), 'Critical value: <b>' + val.toFixed(3) + '</b>.']) };
    }
  });
})();
