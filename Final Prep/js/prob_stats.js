/* Problem generators, part 1: summary statistics and least squares. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, fs = H.fs, fd = H.fd, fv = H.fv, mul = H.mul, sub = H.sub, add = H.add, div = H.div;
  var num = H.num, mc = H.mc, p = H.p, steps = H.steps, tbl = H.tbl, M = H.MINUS;

  function lst(a) { return a.join(', '); }
  function olsTable(x, y, o) {
    var X = H.toF(x), Y = H.toF(y);
    var rows = x.map(function (xi, i) { var dx = sub(X[i], o.xb), dy = sub(Y[i], o.yb); return [xi, y[i], fs(dx), fs(dy), fs(mul(dx, dy)), fs(mul(dx, dx))]; });
    rows.push(['<b>sum</b>', '', '', '', '<b>' + fs(o.Sxy) + '</b>', '<b>' + fs(o.Sxx) + '</b>']);
    return tbl(['x', 'y', 'x − <span class="xbar low">x</span>', 'y − ȳ', '(x − <span class="xbar low">x</span>)(y − ȳ)', '(x − <span class="xbar low">x</span>)²'], rows);
  }
  function olsSol(x, y, o) {
    return steps([
      'Means: <span class="xbar low">x</span> = ' + fd(o.xb) + ', ȳ = ' + fd(o.yb) + '.',
      'Deviations table:' + olsTable(x, y, o),
      'Slope: b₁ = Σ(x−<span class="xbar low">x</span>)(y−ȳ) / Σ(x−<span class="xbar low">x</span>)² = ' + fs(o.Sxy) + ' / ' + fs(o.Sxx) + ' = <b>' + fd(o.b1) + '</b>.',
      'Intercept: b₀ = ȳ − b₁<span class="xbar low">x</span> = ' + fs(o.yb) + ' − (' + fs(o.b1) + ')(' + fs(o.xb) + ') = <b>' + fd(o.b0) + '</b>.',
      'Fitted values: ' + o.fit.map(fd).join(', ') + '. Residuals (y − ŷ): ' + o.res.map(fd).join(', ') + '. They add up to ' + fs(H.sumF(o.res)) + '.'
    ]);
  }

  H.olsSol = olsSol;
  var COVN = '<p class="note">Notation: s<sub>x</sub>² and s<sub>y</sub>² are the sample variances (divide by n − 1); s<sub>xy</sub> = Σ(x − <span class="xbar low">x</span>)(y − ȳ)/(n − 1) is the sample covariance; r = s<sub>xy</sub>/(s<sub>x</sub>s<sub>y</sub>) is the sample correlation; the OLS line is ŷ = b₀ + b₁x, where ŷ is the predicted y.</p>';
  var NOTE = '<p class="note">Notation: the fitted line is \u0177 = b\u2080 + b\u2081x, where \u0177 (\u201cy-hat\u201d) is the value of y predicted by the line for a given x. The <b>residual</b> of an observation is y \u2212 \u0177: the observed y minus the predicted y.</p>';
  H.NOTE = NOTE;

  /* =========================================================== 1. center and spread */
  P.reg('stats1', {
    title: 'Mean, median, mode, variance', section: 1, est: 150,
    topic: 'Summary statistics from a data set, and which variance formula to use.',
    variants: ['Data list', 'Frequency table', 'Find the missing value'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var d, m, md;
        do { var n = pick([5, 6]); d = []; for (var i = 0; i < n; i++) d.push(ri(1, 12)); m = H.mean(d); md = H.modes(d); }
        while (m.d !== 1 || md.vals.length !== 1 || md.count !== 2 || new Set(d).size !== n - 1);
        var isPop = Math.random() < .5, n_ = d.length, SS = H.ss(d);
        var sorted = d.slice().sort(function (a, b) { return a - b; });
        out.stmt = p(isPop ?
          'The ' + n_ + ' people who share one flat reported how many hours they slept last night: <b>' + lst(d) + '</b>. These are <b>all</b> the residents of the flat.' :
          'A random sample of ' + n_ + ' students from a large university reported how many hours they studied last week: <b>' + lst(d) + '</b>.');
        var varAns = isPop ? div(SS, F(n_)) : div(SS, F(n_ - 1));
        out.parts = [
          num('Find the mean.', m, 'Add up and divide by ' + n_ + '.'),
          num('Find the median.', H.median(d), 'Sort: ' + lst(sorted) + '.'),
          num('Find the mode.', F(md.vals[0]), 'The most frequent value.'),
          num('Find the range.', F(sorted[n_ - 1] - sorted[0]), 'Largest minus smallest.'),
          num('Find the variance of these data. Use the version of the formula that suits these data.', varAns,
            isPop ? 'Population: divide by N.' : 'Sample: divide by n − 1.')
        ];
        out.sol = steps([
          'Sorted data: ' + lst(sorted) + ' (n = ' + n_ + ').',
          'Mean = ' + fs(H.sumF(d)) + ' / ' + n_ + ' = ' + fs(m) + '. Median: ' + (n_ % 2 ? 'the middle value' : 'the average of the two middle values') + ' = ' + fd(H.median(d)) + '. Mode = ' + md.vals[0] + ' (appears twice). Range = ' + sorted[n_ - 1] + ' − ' + sorted[0] + ' = ' + (sorted[n_ - 1] - sorted[0]) + '.',
          'Squared deviations from ' + fs(m) + ': ' + d.map(function (t) { return Math.pow(t - m.n, 2); }).join(' + ') + ' = ' + fs(SS) + '.',
          isPop ? 'These are <b>all</b> members of the group, so it is a <b>population</b>: σ² = ' + fs(SS) + ' / ' + n_ + ' = <b>' + fd(varAns) + '</b>.' :
            'This is a <b>sample</b>, so divide by n − 1: s² = ' + fs(SS) + ' / ' + (n_ - 1) + ' = <b>' + fd(varAns) + '</b>.'
        ]);
      } else if (v === 1) {
        var counts, tot, md2;
        do { tot = pick([10, 20]); counts = H.roundTo([ri(1, 6), ri(2, 9), ri(2, 9), ri(1, 6), ri(0, 3)], tot); md2 = H.modes([].concat.apply([], counts.map(function (c, k) { return Array(c).fill(k); }))); }
        while (md2.vals.length !== 1 || counts.filter(function (c) { return c > 0; }).length < 4 || Math.min.apply(null, counts.slice(0, 4)) === 0);
        var data = [].concat.apply([], counts.map(function (c, k) { return Array(c).fill(k); }));
        var mm = H.mean(data), SS1 = H.ss(data);
        out.stmt = p('In a survey of <b>' + tot + '</b> randomly chosen students, each reported the number of siblings. The results:') +
          tbl(['Siblings'].concat([0, 1, 2, 3, 4]), [['Students'].concat(counts)]);
        out.parts = [
          num('Find the mean number of siblings.', mm, 'Sum of (value × count) divided by ' + tot + '.'),
          num('Find the median.', H.median(data), 'Find the middle position(s) of the ' + tot + ' ordered values.'),
          num('Find the mode.', F(md2.vals[0]), 'The value with the largest count.'),
          num('Find the sample variance s² (divide the sum of squared deviations by n − 1).', div(SS1, F(tot - 1)), 'Weighted sum of squared deviations divided by n − 1.')
        ];
        var cum = 0, cumS = counts.map(function (c) { cum += c; return cum; });
        out.sol = steps([
          'Total of siblings = ' + counts.map(function (c, k) { return k + '·' + c; }).join(' + ') + ' = ' + fs(H.sumF(data)) + '. Mean = ' + fs(H.sumF(data)) + ' / ' + tot + ' = ' + fd(mm) + '.',
          'Cumulative counts for 0,1,2,3,4: ' + cumS.join(', ') + '. With n = ' + tot + ' the median is the ' + (tot % 2 ? '' : 'average of the ' + (tot / 2) + 'th and ' + (tot / 2 + 1) + 'th values') + ' = <b>' + fd(H.median(data)) + '</b>.',
          'Mode: the largest count is ' + md2.count + ', at ' + md2.vals[0] + ' siblings.',
          'Sum of squared deviations = ' + counts.map(function (c, k) { return c + '·(' + k + '−' + fs(mm) + ')²'; }).join(' + ') + ' = ' + fs(SS1) + '. Then s² = ' + fs(SS1) + ' / ' + (tot - 1) + ' = <b>' + fd(div(SS1, F(tot - 1))) + '</b>.'
        ]);
      } else {
        var M0, known, miss;
        do { M0 = ri(4, 9); known = []; for (var j = 0; j < 4; j++) known.push(ri(1, 12)); miss = 5 * M0 - known.reduce(function (a, b) { return a + b; }, 0); }
        while (miss < 1 || miss > 14 || known.indexOf(miss) >= 0);
        var all = known.concat([miss]), SS2 = H.ss(all), sorted2 = all.slice().sort(function (a, b) { return a - b; });
        out.stmt = p('Five students were asked how many cups of coffee they drank yesterday. The mean answer was <b>' + M0 + '</b>. Four of the answers were <b>' + lst(known) + '</b>. The fifth answer is unknown. The five students are a random sample.');
        out.parts = [
          num('What was the fifth answer?', F(miss), 'The five values must add up to 5 × mean.'),
          num('Find the median of all five answers.', H.median(all), 'Sort the five values (including the one you found).'),
          num('Find the sample variance s² of all five answers (divide the sum of squared deviations by n − 1).', div(SS2, F(4)), 'Divide the sum of squared deviations by n − 1 = 4.')
        ];
        out.sol = steps([
          'The mean is the total divided by 5, so the total is 5 × ' + M0 + ' = ' + (5 * M0) + '.',
          'Known values add to ' + known.reduce(function (a, b) { return a + b; }, 0) + ', so the missing value is ' + (5 * M0) + ' − ' + known.reduce(function (a, b) { return a + b; }, 0) + ' = <b>' + miss + '</b>.',
          'Sorted: ' + lst(sorted2) + '. The median is the middle (third) value = <b>' + sorted2[2] + '</b>.',
          'Squared deviations from ' + M0 + ': ' + all.map(function (t) { return Math.pow(t - M0, 2); }).join(' + ') + ' = ' + fs(SS2) + '. It is a sample, so s² = ' + fs(SS2) + ' / 4 = <b>' + fd(div(SS2, F(4))) + '</b>.'
        ]);
      }
      return out;
    }
  });

  /* =========================================================== 2. covariance and correlation */
  P.reg('cov', {
    title: 'Covariance and correlation', section: 1, est: 150,
    topic: 'Sample covariance, correlation, and what happens when units change.',
    variants: ['Compute from four pairs', 'Change of units', 'From summary statistics'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var perm, r;
        do { perm = H.shuffle([1, 2, 3, 4]); var sxy_ = H.sxy([1, 2, 3, 4], perm); r = div(sxy_, F(5)); }
        while (Math.abs(fv(r)) < .15 || Math.abs(fv(r)) > .85);
        var step = pick([1, 2]), base = pick([0, 3]); var y = perm.map(function (t) { return base + step * t; }), x = [1, 2, 3, 4];
        var ctx = pick([['hours of study', 'exam score'], ['years of experience', 'salary ($k)'], ['advertising spend ($k)', 'sales (units)']]);
        var S = H.sxy(x, y), Sx = H.ss(x), Sy = H.ss(y), rr = fv(S) / Math.sqrt(fv(Sx) * fv(Sy));
        var rF = F(Math.round(rr * 100), 100);
        out.stmt = p('Four observations of (<b>x</b> = ' + ctx[0] + ', <b>y</b> = ' + ctx[1] + '):') + tbl(['x', 1, 2, 3, 4], [['y'].concat(y)]) + COVN;
        out.parts = [
          num('Compute the sample covariance s<sub>xy</sub>.', div(S, F(3)), 'Sum of products of deviations divided by n − 1 = 3.'),
          num('Compute s<sub>x</sub>² (sample variance of x).', div(Sx, F(3)), 'Divide by n − 1.'),
          num('Compute s<sub>y</sub>² (sample variance of y).', div(Sy, F(3)), 'Divide by n − 1.'),
          num('Compute the sample correlation r.', rF, 'r = s_xy / (s_x s_y).'),
          num('Compute the OLS slope b₁ of y on x.', div(S, Sx), 'b₁ = s_xy / s_x².')
        ];
        out.sol = steps([
          '<span class="xbar low">x</span> = 2.5, ȳ = ' + fs(H.mean(y)) + '. Deviations of x: −1.5, −0.5, 0.5, 1.5. Deviations of y: ' + y.map(function (t) { return fs(sub(F(t), H.mean(y))); }).join(', ') + '.',
          'Products of deviations sum to ' + fs(S) + ', so s<sub>xy</sub> = ' + fs(S) + '/3 = <b>' + fd(div(S, F(3))) + '</b>.',
          'Sum of squares: x: ' + fs(Sx) + ', y: ' + fs(Sy) + '. So s<sub>x</sub>² = ' + fd(div(Sx, F(3))) + ' and s<sub>y</sub>² = ' + fd(div(Sy, F(3))) + '.',
          'r = s<sub>xy</sub> / (s<sub>x</sub> s<sub>y</sub>) = ' + fs(S) + ' / √(' + fs(Sx) + '·' + fs(Sy) + ') = <b>' + fd(rF, 2) + '</b>.',
          'Slope: b₁ = s<sub>xy</sub> / s<sub>x</sub>² = ' + fs(S) + ' / ' + fs(Sx) + ' = <b>' + fd(div(S, Sx)) + '</b>. It has the same sign as r.'
        ]);
      } else if (v === 1) {
        var rr0 = pick([F(3, 5), F(4, 5), F(1, 2), F(-3, 5), F(-4, 5), F(-1, 2)]);
        var sx = pick([5, 10]), sy = pick([4, 5, 10]);
        var s0 = mul(rr0, F(sx * sy));
        var T = pick([
          { n: 'x is measured in metres instead of centimetres (x′ = x/100)', cx: F(1, 100), cy: F(1) },
          { n: 'y is measured in grams instead of kilograms (y′ = 1000y)', cx: F(1), cy: F(1000) },
          { n: 'y is replaced by its reverse y′ = 100 − y', cx: F(1), cy: F(-1) },
          { n: 'both are doubled (x′ = 2x, y′ = 2y)', cx: F(2), cy: F(2) },
          { n: 'x′ = 10x (a different unit for x)', cx: F(10), cy: F(1) }
        ]);
        var sxy1 = mul(mul(T.cx, T.cy), s0), r1 = (T.cx.n * T.cy.n < 0) ? H.neg(rr0) : rr0;
        var b10 = div(s0, F(sx * sx)), b11 = mul(div(T.cy, T.cx), b10);
        out.stmt = p('For heights <b>x</b> (cm) and weights <b>y</b> (kg) of a sample of students, we computed the sample variances s<sub>x</sub>² = ' + (sx * sx) + ' and s<sub>y</sub>² = ' + (sy * sy) + ', the sample covariance s<sub>xy</sub> = ' + fd(s0) + ' and the sample correlation r = ' + fd(rr0, 2) + '.') +
          p('Now the data are re-expressed: <b>' + T.n + '</b>. Recompute these quantities for the re-expressed data. (Adding a constant, such as the 100 in a reverse, does not change variances, covariance or correlation.)');
        out.parts = [
          num('What is the sample covariance s′<sub>xy</sub> of the re-expressed data?', sxy1, 'Covariance scales by the product of the two factors.'),
          num('What is the sample correlation r′ of the re-expressed data?', r1, 'Correlation is unit-free; only a sign flip changes it.'),
          num('Before the change, the OLS slope of y on x (the b₁ in ŷ = b₀ + b₁x) was ' + fd(b10) + '. What is the OLS slope b₁′ for the re-expressed data?', b11, 'Slope scales by (factor of y) / (factor of x).')
        ];
        out.sol = steps([
          'Covariance is linear in each variable: multiply by the factor applied to x and by the factor applied to y. Here factors are ' + fs(T.cx) + ' and ' + fs(T.cy) + ', so s′<sub>xy</sub> = ' + fs(T.cx) + '·' + fs(T.cy) + '·' + fd(s0) + ' = <b>' + fd(sxy1) + '</b>.',
          'Correlation divides out both standard deviations, so positive rescaling leaves it unchanged. A negative factor flips the sign. New r′ = <b>' + fd(r1, 2) + '</b>.',
          'The slope is s<sub>xy</sub>/s<sub>x</sub>². New: b₁′ = (' + fs(T.cy) + '/' + fs(T.cx) + ')·' + fd(b10) + ' = <b>' + fd(b11) + '</b>. Intuition: if y is in bigger units its slope gets bigger; if x is in bigger units the slope gets smaller.'
        ]);
      } else {
        var sxv = pick([2, 3, 4, 5]), syv = pick([2, 4, 5, 6, 10]), rv = pick([F(3, 5), F(1, 2), F(-1, 2), F(-3, 5), F(4, 5), F(-4, 5), F(1, 5)]);
        var sxyv = mul(rv, F(sxv * syv));
        out.stmt = p('For a sample of pairs (x, y), the sample variances are s<sub>x</sub>² = ' + (sxv * sxv) + ' and s<sub>y</sub>² = ' + (syv * syv) + ', and the sample covariance is s<sub>xy</sub> = ' + fd(sxyv) + '.') + COVN;
        out.parts = [
          num('Find the correlation r.', rv, 'r = s_xy / (s_x s_y); take square roots of the variances first.'),
          num('Find the OLS slope b₁ of y on x.', div(sxyv, F(sxv * sxv)), 'b₁ = s_xy / s_x².'),
          num('By how many standard deviations of y does the predicted y change when x rises by one standard deviation of x?', rv, 'b₁ s_x / s_y equals r.')
        ];
        out.sol = steps([
          's<sub>x</sub> = √' + (sxv * sxv) + ' = ' + sxv + ' and s<sub>y</sub> = √' + (syv * syv) + ' = ' + syv + '.',
          'r = ' + fd(sxyv) + ' / (' + sxv + '·' + syv + ') = <b>' + fd(rv, 2) + '</b>.',
          'b₁ = ' + fd(sxyv) + ' / ' + (sxv * sxv) + ' = <b>' + fd(div(sxyv, F(sxv * sxv))) + '</b>.',
          'Moving x up by s<sub>x</sub> moves ŷ up by b₁ s<sub>x</sub> = ' + fd(mul(div(sxyv, F(sxv * sxv)), F(sxv))) + ', which is ' + fd(rv, 2) + ' of s<sub>y</sub> = ' + syv + '. So the answer is r.'
        ]);
      }
      return out;
    }
  });

  /* =========================================================== 3. OLS, three observations */
  var CTX3 = [
    { x: 'hours of study', y: 'exam score', ux: 'hour', uy: 'points' },
    { x: 'years of experience', y: 'salary ($k)', ux: 'year', uy: '$k' },
    { x: 'weekly hours of exercise', y: 'resting pulse (bpm)', ux: 'hour', uy: 'bpm' },
    { x: 'advertising spend ($k)', y: 'weekly sales (units)', ux: '$k', uy: 'units' }
  ];
  P.reg('ols3', {
    title: 'OLS by hand: three points', note: true, section: 2, est: 210,
    topic: 'Fit y = b₀ + b₁x to three observations using the deviation formulas or the normal equations.',
    variants: ['Deviation formulas', 'Normal equations from sums', 'Story with prediction'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '', meta: {} };
      var x, y, o, c = pick(CTX3);
      if (v === 0) {
        do { x = [1, 2, 3]; y = [ri(1, 9), ri(1, 9), ri(1, 9)]; } while (y[0] === y[2] || y[0] === y[1] && y[1] === y[2]);
        o = H.ols(x, y);
        out.stmt = p('Three data points (x, y): ' + x.map(function (t, i) { return '(' + t + ', ' + y[i] + ')'; }).join(', ') + '. Fit the line ŷ = b₀ + b₁x by ordinary least squares (OLS).');
        out.parts = [
          num('Find b₁.', o.b1, 'Covariance over variance of x.'),
          num('Find b₀.', o.b0, 'Use that the line passes through (<span class="xbar low">x</span>, ȳ).'),
          num('Find the prediction ŷ at x = 4.', add(o.b0, mul(o.b1, F(4))), 'Plug x = 4 into the fitted line.'),
          num('Find the residual of the third observation, (3, ' + y[2] + '): its observed y minus the y predicted by your line.', o.res[2], 'Residual = observed y − predicted ŷ.'),
          num('What is the sum of the three residuals?', F(0), 'It is always 0 when the line has an intercept.', { noquiz: true })
        ];
        out.sol = olsSol(x, y, o);
      } else if (v === 1) {
        var xs = pick([[1, 2, 3], [0, 1, 2], [0, 2, 4], [1, 2, 4], [0, 1, 3], [2, 3, 4]]);
        do { y = [ri(1, 9), ri(1, 9), ri(1, 9)]; x = xs; } while (new Set(y).size < 2);
        o = H.ols(x, y);
        var Sx = x.reduce(function (a, b) { return a + b; }, 0), Sy = y.reduce(function (a, b) { return a + b; }, 0);
        var Sxx = x.reduce(function (a, b) { return a + b * b; }, 0), Sxy2 = x.reduce(function (a, b, i) { return a + b * y[i]; }, 0);
        out.stmt = p('For three observations the following sums are known: n = 3, Σx = ' + Sx + ', Σy = ' + Sy + ', Σx² = ' + Sxx + ', Σxy = ' + Sxy2 + '.') +
          p('The least squares line ŷ = b₀ + b₁x has coefficients that solve the <b>normal equations</b>: n·b₀ + b₁Σx = Σy and b₀Σx + b₁Σx² = Σxy (Σ means "sum over the observations").');
        out.parts = [
          num('Find b₁.', o.b1, 'Eliminate b₀ from the two equations.'),
          num('Find b₀.', o.b0, 'Substitute b₁ back into the first equation.'),
          num('Find the prediction ŷ at x = 3.', add(o.b0, mul(o.b1, F(3))), 'Plug x = 3 into the line.')
        ];
        out.sol = steps([
          'Write the system: 3b₀ + ' + Sx + 'b₁ = ' + Sy + ' and ' + Sx + 'b₀ + ' + Sxx + 'b₁ = ' + Sxy2 + '.',
          'Multiply the first equation by ' + Sx + ' and the second by 3, then subtract to eliminate b₀: (3·' + Sxx + ' − ' + Sx + '·' + Sx + ')b₁ = 3·' + Sxy2 + ' − ' + Sx + '·' + Sy + '.',
          'That is ' + (3 * Sxx - Sx * Sx) + ' b₁ = ' + (3 * Sxy2 - Sx * Sy) + ', so b₁ = <b>' + fd(o.b1) + '</b>.',
          'From the first equation: b₀ = (' + Sy + ' − ' + Sx + 'b₁)/3 = <b>' + fd(o.b0) + '</b>.',
          'Check with the deviation formula: <span class="xbar low">x</span> = ' + fd(o.xb) + ', ȳ = ' + fd(o.yb) + ', b₁ = ' + fs(o.Sxy) + '/' + fs(o.Sxx) + ' = ' + fd(o.b1) + '. Same answer.'
        ]);
      } else {
        var x0 = pick([0, 1, 2]);
        do { x = [0, 1, 2]; y = [ri(2, 12), ri(2, 12), ri(2, 12)]; } while (y[0] === y[2]);
        o = H.ols(x, y); var xn = pick([3, 4, 5]);
        out.stmt = p('Three people were observed. For each we recorded <b>x</b> = ' + c.x + ' and <b>y</b> = ' + c.y + ': ' + x.map(function (t, i) { return '(' + t + ', ' + y[i] + ')'; }).join(', ') + '.');
        out.parts = [
          num('Find the OLS slope b₁.', o.b1, 'Slope = covariance of x and y divided by the variance of x.'),
          num('Find the OLS intercept b₀.', o.b0, 'b₀ = ȳ − b₁<span class="xbar low">x</span>.'),
          num('Predict y for x = ' + xn + '.', add(o.b0, mul(o.b1, F(xn))), 'Plug in.'),
          num('The observation with x = 1 has y = ' + y[1] + '. Find its residual (observed y minus the y predicted by your line).', o.res[1], 'Observed minus predicted.'),
          mc('Which sentence interprets the slope correctly?', [
            'On average, one more ' + c.ux + ' of x goes with ' + fd(o.b1) + ' ' + c.uy + ' change in y.',
            'One more ' + c.ux + ' of x causes exactly ' + fd(o.b1) + ' ' + c.uy + ' change in y for every person.',
            'When x = 0, y equals ' + fd(o.b1) + '.',
            'y is ' + fd(o.b1) + ' times larger than x.'], 0, 'Slope = average change in y associated with one more unit of x.', false)
        ];
        out.sol = olsSol(x, y, o) + p('<b>Interpretation:</b> the slope b₁ = ' + fd(o.b1) + ' means that, in this data, people with one more unit of x have on average ' + fd(o.b1) + ' more units of y. The intercept b₀ = ' + fd(o.b0) + ' is the fitted y at x = 0. A regression describes association; it does not by itself prove that changing x changes y.');
      }
      out.meta = { x: x, y: y, b0: fv(o.b0), b1: fv(o.b1) };
      return out;
    }
  });

  /* =========================================================== 4. OLS, four observations */
  P.reg('ols4', {
    title: 'OLS by hand: four points', note: true, section: 2, est: 240,
    topic: 'Fit a line to four observations and check the first-order conditions.',
    variants: ['x = 1, 2, 3, 4', 'x in larger units', 'Repeated x values'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '', meta: {} };
      var x, y, o, c = pick(CTX3);
      if (v === 0) { x = [1, 2, 3, 4]; do { y = [ri(1, 8), ri(1, 8), ri(1, 8), ri(1, 8)]; } while (new Set(y).size < 3 || y[0] === y[3]); }
      else if (v === 1) { x = [10, 20, 30, 40]; do { y = [ri(1, 9), ri(1, 9), ri(1, 9), ri(1, 9)]; } while (new Set(y).size < 3 || y[0] === y[3]); }
      else { x = pick([[1, 2, 2, 3], [0, 1, 1, 2], [1, 1, 3, 3], [1, 2, 2, 5], [2, 4, 4, 6]]); do { y = [ri(1, 9), ri(1, 9), ri(1, 9), ri(1, 9)]; } while (new Set(y).size < 3 || H.sxy(x, y).n === 0); }
      o = H.ols(x, y);
      var xi = 2;
      var sumxe = H.sumF(o.res.map(function (e, i) { return mul(e, F(x[i])); }));
      out.stmt = p('Four observations of <b>x</b> = ' + c.x + ' and <b>y</b> = ' + c.y + ':') + tbl(['x'].concat(x), [['y'].concat(y)]) +
        (v === 2 ? p('Note that two observations share the same x. OLS works exactly the same way.') : '') +
        (v === 1 ? p('The x values are in larger units, so the slope will be small. Keep fractions exact.') : '');
      out.parts = [
        num('Find the slope b₁.', o.b1, 'b₁ = Σ(x−<span class="xbar low">x</span>)(y−ȳ) / Σ(x−<span class="xbar low">x</span>)².'),
        num('Find the intercept b₀.', o.b0, 'b₀ = ȳ − b₁<span class="xbar low">x</span>.'),
        num('Find the residual of observation number ' + (xi + 1) + ' (x = ' + x[xi] + ', y = ' + y[xi] + '): its observed y minus the y predicted by your line.', o.res[xi], 'Observed y − predicted ŷ.'),
        num('Add up the four residuals. What do you get?', F(0), 'First-order condition for b₀.', { noquiz: true }),
        num('Multiply each observation’s x by its residual, and add the four products.', sumxe, 'First-order condition for b₁.', { noquiz: true })
      ];
      out.sol = olsSol(x, y, o) + steps(['Check the first-order conditions. Sum of the residuals = ' + fs(H.sumF(o.res)) + '. Sum of (x × residual) = ' + o.res.map(function (e, i) { return '(' + x[i] + ')(' + fs(e) + ')'; }).join(' + ') + ' = <b>' + fs(sumxe) + '</b>. Both are zero: these two conditions are exactly the two equations that define OLS.']);
      out.meta = { x: x, y: y, b0: fv(o.b0), b1: fv(o.b1) };
      return out;
    }
  });

  /* =========================================================== 6. what is best */
  P.reg('best', {
    title: 'Squares, residual conditions, outliers', note: true, section: 2, est: 200,
    topic: 'What "best fit" means: squared vs absolute errors, the first-order conditions, and sensitivity to outliers.',
    variants: ['Two lines, two criteria', 'Which line is the OLS line?', 'Moving one point'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var k = pick([6, 12, 18]), x = [0, 1, 2], y = [0, 0, k];
        var bo = H.ols(x, y), K = F(k);
        var A = { b0: bo.b0, b1: bo.b1 }, B = { b0: F(0), b1: F(k, 2) };
        var sA = H.lineStats(x, y, A.b0, A.b1), sB = H.lineStats(x, y, B.b0, B.b1);
        var flip = Math.random() < .5, L1 = flip ? B : A, L2 = flip ? A : B, s1 = flip ? sB : sA, s2 = flip ? sA : sB;
        var nm = function (L) { return 'ŷ = ' + (fv(L.b0) === 0 ? '' : fs(L.b0) + ' + ') + fs(L.b1) + 'x'; };
        out.stmt = p('Three points: (0, 0), (1, 0), (2, ' + k + '). Two candidate lines: <b>Line A:</b> ' + nm(L1) + '  and  <b>Line B:</b> ' + nm(L2) + '.');
        out.parts = [
          num('Compute the sum of squared residuals for Line A (square each residual, then add).', s1.sse, 'Residual = y − ŷ at each point.'),
          num('Compute the sum of squared residuals for Line B.', s2.sse, 'Same.'),
          num('Compute the sum of absolute residuals for Line A (ignore the signs, then add).', s1.sad, 'Add absolute values of the residuals.'),
          num('Compute the sum of absolute residuals for Line B.', s2.sad, 'Same.'),
          mc('Which line is the OLS line?', ['Line A', 'Line B'], (fv(s1.sse) < fv(s2.sse)) ? 0 : 1, 'OLS minimizes the sum of squared residuals.', true),
          mc('Which line has the smaller sum of absolute residuals?', ['Line A', 'Line B'], (fv(s1.sad) < fv(s2.sad)) ? 0 : 1, 'The other criterion gives the other line.', true)
        ];
        var line = function (nme, L, s) { return '<b>' + nme + '</b> (' + nm(L) + '): fitted ' + [0, 1, 2].map(function (i) { return fs(H.add(L.b0, H.mul(L.b1, F(x[i])))); }).join(', ') + '; residuals ' + s.res.map(fs).join(', ') + '; sum of squared residuals = ' + fs(s.sse) + ', sum of absolute residuals = ' + fs(s.sad) + '.'; };
        out.sol = steps([line('Line A', L1, s1), line('Line B', L2, s2),
          'OLS minimizes the sum of <b>squared</b> residuals, so the OLS line is the one with the smaller sum of squared residuals. The other line has the smaller sum of absolute residuals: it passes through two points exactly and ignores the third. Different criteria, different "best" lines.']);
      } else if (v === 1) {
        var b0 = ri(1, 5), b1 = ri(1, 4) * pick([1, -1]), t = pick([1, 2, -1, -2]);
        var xx = [1, 2, 3], yy = xx.map(function (xi, i) { return b0 + b1 * xi + [t, -2 * t, t][i]; });
        var wrong = Math.random() < .5;
        var P1 = { b0: F(b0), b1: F(b1) }, Q;
        if (wrong) Q = { b0: F(b0 + pick([1, -1, 2])), b1: F(b1) }; else { var ds = pick([1, -1]); Q = { b0: F(b0 - 2 * ds), b1: F(b1 + ds) }; }
        var flip2 = Math.random() < .5, LA = flip2 ? Q : P1, LB = flip2 ? P1 : Q;
        var sa = H.lineStats(xx, yy, LA.b0, LA.b1), sb = H.lineStats(xx, yy, LB.b0, LB.b1);
        var nm2 = function (L) { return 'ŷ = ' + fs(L.b0) + (L.b1.n < 0 ? ' − ' + fs(H.absF(L.b1)) : ' + ' + fs(L.b1)) + 'x'; };
        var ols1 = flip2 ? 1 : 0;
        out.stmt = p('Three points: ' + xx.map(function (t_, i) { return '(' + t_ + ', ' + yy[i] + ')'; }).join(', ') + '. One of these lines is the OLS line and one is not. <b>Line A:</b> ' + nm2(LA) + '. <b>Line B:</b> ' + nm2(LB) + '.') +
          p('The OLS line satisfies two <b>first-order conditions</b>: (1) its residuals add up to zero, and (2) if you multiply each residual by the x of its observation and add the products, you also get zero.');
        out.parts = [
          num('For Line A, add up the three residuals.', sa.sum, 'Condition (1) for Line A.'),
          num('For Line A, multiply each residual by its x and add the three products.', sa.sumx, 'Condition (2) for Line A.'),
          num('For Line B, add up the three residuals.', sb.sum, 'Condition (1) for Line B.'),
          num('For Line B, multiply each residual by its x and add the three products.', sb.sumx, 'Condition (2) for Line B.'),
          mc('Which line is the OLS line?', ['Line A', 'Line B'], ols1, 'The OLS line satisfies both first-order conditions.', true)
        ];
        out.sol = steps([
          'Line A: residuals ' + sa.res.map(fs).join(', ') + ' → sum of residuals = ' + fs(sa.sum) + '; sum of (x × residual) = ' + fs(sa.sumx) + '.',
          'Line B: residuals ' + sb.res.map(fs).join(', ') + ' → sum of residuals = ' + fs(sb.sum) + '; sum of (x × residual) = ' + fs(sb.sumx) + '.',
          'The OLS line must satisfy <b>both</b> conditions. Line ' + (ols1 ? 'B' : 'A') + ' does. The other line fails at least one (' + (wrong ? 'its residuals do not even add to zero, the intercept is off' : 'its residuals add to zero because it goes through (<span class="xbar low">x</span>, ȳ), but the slope is wrong so the sum of (x × residual) is not 0') + ').'
        ]);
      } else {
        var b0v = ri(1, 4), b1v = ri(1, 3), d = pick([-6, -4, 4, 6]);
        var x4 = [1, 2, 3, 4], yA = x4.map(function (t_) { return b0v + b1v * t_; }), yB = yA.slice(); yB[3] += d;
        var oA = H.ols(x4, yA), oB = H.ols(x4, yB);
        out.stmt = p('Four points lie exactly on the line y = ' + b0v + ' + ' + b1v + 'x: x = 1, 2, 3, 4 and y = ' + yA.join(', ') + '. Now the last point is mistyped: its y changes from ' + yA[3] + ' to <b>' + yB[3] + '</b>. The other three points stay the same.');
        out.parts = [
          num('Find the OLS slope using the correct data.', oA.b1, 'The points are on a line.'),
          num('Find the OLS slope using the mistyped data.', oB.b1, 'Here <span class="xbar low">x</span> = 2.5 and Σ(x − <span class="xbar low">x</span>)² = 5.'),
          num('Find the OLS intercept using the mistyped data.', oB.b0, 'b₀ = ȳ − b₁<span class="xbar low">x</span>.'),
          num('Find the residual of the mistyped point (x = 4) under the new OLS line: its y minus the y predicted by that line.', oB.res[3], 'Observed minus predicted.')
        ];
        out.sol = olsSol(x4, yB, oB) + p('<b>Lesson:</b> one wrong point moved the slope from ' + b1v + ' to ' + fd(oB.b1) + ', and the new line does not pass through any of the four points. Because deviations are squared, a point far from the others pulls the OLS line towards itself. Notice also that the outlier’s own residual (' + fd(oB.res[3]) + ') is smaller than its distance from the old line (' + d + '): the line moved towards it.');
      }
      return out;
    }
  });

  /* =========================================================== 7. interpreting a regression */
  P.reg('interp', {
    title: 'Interpreting a regression', section: 2, est: 150,
    topic: 'Reading coefficients, predictions, residuals, units, multiple regression, causation.',
    variants: ['Simple regression', 'Change of units', 'Multiple regression', 'Association or causation?'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      var C = pick([
        { y: 'exam score (points)', x: 'weekly study hours', a: 52, b: 4, xr: '0 to 10 hours', xs: [3, 5, 6, 8], xx: 20, ux: 'hour', uy: 'points', fy: 'score' },
        { y: 'price of an apartment ($k)', x: 'size (m²)', a: 15, b: 2, xr: '30 to 120 m²', xs: [50, 60, 80, 100], xx: 300, ux: 'm²', uy: '$k', fy: 'price' },
        { y: 'salary ($k per year)', x: 'years of experience', a: 20, b: 3, xr: '0 to 15 years', xs: [2, 5, 8, 10], xx: 50, ux: 'year', uy: '$k', fy: 'salary' }
      ]);
      if (v === 0) {
        var x0 = pick(C.xs);
        var actual = C.a + C.b * x0 + pick([-8, -5, 4, 7]);
        var res = actual - (C.a + C.b * x0);
        out.stmt = p('A regression is fitted to data in which ' + C.x + ' ranges from ' + C.xr + '. It gives <b>ŷ = ' + C.a + ' + ' + C.b + 'x</b>, where y = ' + C.y + ' and x = ' + C.x + '.');
        out.parts = [
          mc('Which statement about the slope is best?', [
            'Each additional ' + C.ux + ' is associated with ' + C.b + ' more ' + C.uy + ' of y, on average.',
            'Each additional ' + C.ux + ' causes ' + C.b + ' more ' + C.uy + ' of y for every individual.',
            'y is ' + C.b + ' times as large as x.',
            'y rises by ' + C.b + '% for each additional ' + C.ux + '.'], 0, 'Slope: change in the average y per unit of x (association).'),
          num('Predict y for x = ' + x0 + '.', F(C.a + C.b * x0), 'Plug x into the line.'),
          num('One observation has x = ' + x0 + ' and y = ' + actual + '. What is its residual (observed y minus the predicted ŷ)?', F(res), 'Residual = observed − predicted.'),
          num('Predict y for x = ' + C.xx + '.', F(C.a + C.b * C.xx), 'Plug in. Then ask yourself if it makes sense.'),
          mc('Is the prediction for x = ' + C.xx + ' reliable?', ['No: x = ' + C.xx + ' is far outside the range of the data (extrapolation).', 'Yes: the line holds for every x.'], 0, 'Predictions only make sense within the range of the data.')
        ];
        out.sol = steps([
          'The slope is ' + C.b + ': comparing two groups that differ by one ' + C.ux + ' of x, the group with more x has on average ' + C.b + ' more ' + C.uy + '. This is a statement about averages and association, not about what happens to one person if we changed x.',
          'ŷ(' + x0 + ') = ' + C.a + ' + ' + C.b + '·' + x0 + ' = <b>' + (C.a + C.b * x0) + '</b>. Residual = ' + actual + ' − ' + (C.a + C.b * x0) + ' = <b>' + res + '</b> (' + (res > 0 ? 'above' : 'below') + ' the line).',
          'ŷ(' + C.xx + ') = ' + C.a + ' + ' + C.b + '·' + C.xx + ' = <b>' + (C.a + C.b * C.xx) + '</b>. The data only cover ' + C.xr + ', so this is extrapolation. The line may not keep going (for instance, a score cannot exceed the maximum).'
        ]);
      } else if (v === 1) {
        var ch = pick([
          { n: 'x is re-measured in minutes instead of hours', ok: C.x.indexOf('hours') >= 0, cx: F(60), cy: F(1) },
          { n: 'y is divided by 10 (y′ = y/10)', ok: true, cx: F(1), cy: F(1, 10) },
          { n: 'x is re-measured in tens (x′ = x/10)', ok: true, cx: F(1, 10), cy: F(1) },
          { n: 'y is doubled (y′ = 2y)', ok: true, cx: F(1), cy: F(2) },
          { n: 'x′ = x + 5 (everybody’s x is shifted by 5)', ok: true, cx: F(1), cy: F(1), shift: 5 }
        ].filter(function (t) { return t.ok; }));
        var nb1 = div(mul(F(C.b), ch.cy), ch.cx), nb0 = mul(F(C.a), ch.cy);
        if (ch.shift) nb0 = F(C.a - C.b * ch.shift);
        out.stmt = p('A regression gives ŷ = ' + C.a + ' + ' + C.b + 'x with y = ' + C.y + ', x = ' + C.x + '. Now the data are re-expressed: <b>' + ch.n + '</b>. The line is re-estimated on the new data.');
        out.parts = [
          num('The re-estimated line is ŷ = b₀′ + b₁′·(new x). What is the new slope b₁′?', nb1, ch.shift ? 'A shift of x does not change the slope.' : 'The slope scales by (factor of y)/(factor of x).'),
          num('What is the new intercept b₀′?', nb0, ch.shift ? 'New intercept = old line evaluated at x′ = 0, i.e. x = −5.' : 'The intercept scales with y only.')
        ];
        out.sol = steps([
          ch.shift ? 'With x′ = x + 5 we have x = x′ − 5, so ŷ = ' + C.a + ' + ' + C.b + '(x′ − 5) = ' + (C.a - C.b * 5) + ' + ' + C.b + 'x′. Slope unchanged (' + C.b + '), intercept becomes <b>' + (C.a - C.b * 5) + '</b>.' :
            'Write the line in the new units. If x′ = c<sub>x</sub>x and y′ = c<sub>y</sub>y, then y′ = c<sub>y</sub>(' + C.a + ' + ' + C.b + 'x) = ' + fs(nb0) + ' + ' + fs(mul(F(C.b), ch.cy)) + 'x = ' + fs(nb0) + ' + ' + fs(nb1) + 'x′ with c<sub>x</sub> = ' + fs(ch.cx) + ', c<sub>y</sub> = ' + fs(ch.cy) + '.',
          'New slope = <b>' + fd(nb1) + '</b>, new intercept = <b>' + fd(nb0) + '</b>. Check: the new line describes the same relation in different units.'
        ]);
      } else if (v === 2) {
        var Cm = pick([
          { y: 'price ($k)', x1: 'size (m²)', x2: 'distance to the city centre (km)', a: 40, b1: 3, b2: -2, s1: 'size', s2: 'distance', x1v: 60, x2v: 5, u1: 'm²', u2: 'km', simple: 'a larger flat is also, on average, further from the centre' },
          { y: 'exam score', x1: 'study hours', x2: 'hours of sleep', a: 30, b1: 4, b2: 3, s1: 'study hours', s2: 'sleep', x1v: 6, x2v: 7, u1: 'hour', u2: 'hour', simple: 'students who study more also sleep differently' },
          { y: 'salary ($k)', x1: 'years of experience', x2: 'years of education', a: 5, b1: 2, b2: 3, s1: 'experience', s2: 'education', x1v: 5, x2v: 16, u1: 'year', u2: 'year', simple: 'people with more experience tend to have different education' }
        ]);
        var pred = Cm.a + Cm.b1 * Cm.x1v + Cm.b2 * Cm.x2v;
        out.stmt = p('A multiple regression of <b>' + Cm.y + '</b> on <b>' + Cm.x1 + '</b> and <b>' + Cm.x2 + '</b> gives <b>ŷ = ' + Cm.a + (Cm.b1 < 0 ? ' − ' : ' + ') + Math.abs(Cm.b1) + ' x₁' + (Cm.b2 < 0 ? ' − ' : ' + ') + Math.abs(Cm.b2) + ' x₂</b>, with x₁ = ' + Cm.x1 + ', x₂ = ' + Cm.x2 + '.');
        out.parts = [
          num('Predict y when x₁ = ' + Cm.x1v + ' and x₂ = ' + Cm.x2v + '.', F(pred), 'Plug both values into the equation.'),
          num('Two observations have the same x₂, but the first has x₁ larger by 4. By how much do their predicted y differ?', F(4 * Cm.b1), 'The coefficient of x₁ times 4; x₂ is held fixed.'),
          num('Two observations have the same x₁, but x₂ is larger by 2 for the first. By how much do their predicted y differ (first minus second)?', F(2 * Cm.b2), 'The coefficient of x₂ times 2.'),
          mc('The coefficient of x₁ (' + Cm.b1 + ') means:', [
            'the average difference in y between observations that differ by one unit of x₁ and have the same x₂.',
            'the change in y when x₁ rises by one unit and x₂ falls to zero.',
            'the change in y caused by x₁, and x₂ is irrelevant.',
            'the correlation between y and x₁.'], 0, '"Holding x₂ fixed" (comparing observations with the same x₂).')
        ];
        out.sol = steps([
          'ŷ = ' + Cm.a + ' + (' + Cm.b1 + ')(' + Cm.x1v + ') + (' + Cm.b2 + ')(' + Cm.x2v + ') = <b>' + pred + '</b>.',
          'Same x₂, x₁ differs by 4: difference = ' + Cm.b1 + '·4 = <b>' + (4 * Cm.b1) + '</b>.',
          'Same x₁, x₂ differs by 2: difference = ' + Cm.b2 + '·2 = <b>' + (2 * Cm.b2) + '</b>.',
          'Each coefficient is interpreted <b>holding the other variables fixed</b>. That is why the slope on x₁ in a simple regression of y on x₁ alone can differ from ' + Cm.b1 + ': when x₂ is left out, the slope also picks up the part of x₂’s effect that moves with x₁ (' + Cm.simple + ').'
        ]);
      } else {
        var cases = [
          { s: 'A regression of fire damage ($k) on the number of fire fighters sent to the fire has a <b>positive</b> slope.', ok: 'Bigger fires cause both more damage and more fire fighters.', w: ['Sending fire fighters causes more damage.', 'Fire fighters should be removed.'] },
          { s: 'A regression of ice-cream sales on daily number of sunburns has a <b>positive</b> slope.', ok: 'Hot, sunny weather drives both.', w: ['Ice cream causes sunburn.', 'Sunburn makes people buy ice cream.'] },
          { s: 'Students who attend the extra tutoring session score <b>10 points higher</b> on average (slope of a dummy regression).', ok: 'Motivated students may both attend and score higher, so the 10 points need not be the effect of tutoring.', w: ['Tutoring raises every student’s score by exactly 10 points.', 'Tutoring has no effect.'] },
          { s: 'Cities with more police officers per capita have <b>higher</b> crime rates (positive slope).', ok: 'Cities with more crime hire more police.', w: ['Police officers cause crime.', 'Crime has no relation to policing.'] }];
        var cs = pick(cases);
        out.stmt = p(cs.s) + p('A classmate concludes that the explanatory variable <i>causes</i> the change in y.');
        out.parts = [mc('Which comment is most sensible?', [cs.ok].concat(cs.w), 0, 'Regression shows association; a third factor can drive both variables, or causation can run the other way.')];
        out.sol = p('<b>Answer:</b> ' + cs.ok) + p('A regression coefficient describes how the average of y differs across values of x. It is not by itself a causal effect: a third variable may drive both, or causation may run in the opposite direction. Multiple regression can help by <i>holding other variables fixed</i>, but only for variables that are in the data.');
      }
      return out;
    }
  });
})();
