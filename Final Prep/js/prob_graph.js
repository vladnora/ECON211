/* Problem generators, part 3: reading histograms and scatter plots. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, fs = H.fs, fd = H.fd, fv = H.fv, num = H.num, mc = H.mc, AB = H.AB, p = H.p, steps = H.steps;
  var r1 = function (x) { return String(Math.round(x * 10) / 10); };

  var HC = [
    { name: 'exam scores', lo: 0, step: 10, label: 'exam score' },
    { name: 'daily commute times of students (minutes)', lo: 0, step: 10, label: 'minutes' },
    { name: 'monthly phone bills of students ($)', lo: 0, step: 10, label: 'bill ($)' }
  ];
  function pairFig(cA, cB, c, ymax, showCounts) {
    var common = { lo: c.lo, step: c.step, ymax: ymax, xlabel: c.label, showCounts: showCounts, tickEvery: 2 };
    return H.row(H.hist(cA, Object.assign({ title: 'Histogram A', color: '#2b6cb0' }, common)), H.hist(cB, Object.assign({ title: 'Histogram B', color: '#dd6b20' }, common)));
  }
  function ymaxOf() { var m = 0; for (var i = 0; i < arguments.length; i++) m = Math.max(m, Math.max.apply(null, arguments[i])); return Math.ceil((m + 1) / 5) * 5; }
  function larger(a, b, tol) { return Math.abs(a - b) <= tol ? 'Equal' : (a > b ? 'A' : 'B'); }

  /* ---------------------------------------------------------- histograms: compare two */
  P.reg('hist2', {
    title: 'Comparing two histograms', section: 5, est: 75,
    topic: 'Which histogram has the larger mean, median, variance? How shifts and rescaling show up.',
    variants: ['Same center, different spread', 'Same spread, different center', 'One is a transformation of the other'],
    gen: function (v) {
      var c = pick(HC), n = pick([40, 60]), cA, cB, parts = [], sol, extra = '';
      if (v === 0) {
        var mu = pick([40, 50, 60]), sdN = pick([7, 8]), sdW = pick([16, 18]), swap = Math.random() < .5;
        var nar = H.normCounts(mu, sdN, n, c.lo, c.step, 10), wid = H.normCounts(mu, sdW, n, c.lo, c.step, 10);
        cA = swap ? wid : nar; cB = swap ? nar : wid;
        var sA = H.hstats(cA, c.lo, c.step), sB = H.hstats(cB, c.lo, c.step);
        parts = [AB('Which histogram has the larger mean?', larger(sA.mean, sB.mean, 1.5), 'Both are symmetric around ' + mu + '.'),
          AB('Which histogram has the larger median?', larger(sA.median, sB.median, 1.5), 'Both are symmetric around ' + mu + '.'),
          AB('Which histogram has the larger variance?', larger(sA.var, sB.var, 1), 'The more spread-out histogram has the larger variance.'),
          AB('Which histogram has the larger standard deviation?', larger(sA.sd, sB.sd, .3), 'Standard deviation is the square root of the variance.'),
          AB('Which has the larger range?', larger(sA.range, sB.range, 0.1), 'Compare the extreme non-empty bins.')];
        sol = steps(['Both histograms are symmetric around the same center (about ' + mu + '), so their means and medians are equal.', 'A has mean ≈ ' + r1(sA.mean) + ', sd ≈ ' + r1(sA.sd) + '; B has mean ≈ ' + r1(sB.mean) + ', sd ≈ ' + r1(sB.sd) + ' (computed from bin midpoints).', 'The histogram with bars spread further from the center has the larger variance, standard deviation and range. Spread tells us nothing about the level.']);
      } else if (v === 1) {
        var sd = pick([8, 9]), d = pick([10, 20, 30]), muA = pick([25, 30, 35]), swp = Math.random() < .5;
        var c1 = H.normCounts(muA, sd, n, c.lo, c.step, 10), c2 = H.normCounts(muA + d, sd, n, c.lo, c.step, 10);
        cA = swp ? c2 : c1; cB = swp ? c1 : c2;
        var sA2 = H.hstats(cA, c.lo, c.step), sB2 = H.hstats(cB, c.lo, c.step);
        parts = [AB('Which histogram has the larger mean?', larger(sA2.mean, sB2.mean, 1), 'B is A moved to the right (or A is B moved).'),
          AB('Which histogram has the larger median?', larger(sA2.median, sB2.median, 1), 'The median moves with the shift.'),
          AB('Which histogram has the larger variance?', larger(sA2.var, sB2.var, 1), 'The two have the same shape, so the same spread.'),
          AB('Which has the larger standard deviation?', larger(sA2.sd, sB2.sd, .3), 'Same shape, same spread.')];
        sol = steps(['The two histograms have exactly the same shape; one is the other shifted by ' + d + ' units. Shifting changes where the data sit (mean and median) but not how spread out they are.', 'Mean of A ≈ ' + r1(sA2.mean) + ', of B ≈ ' + r1(sB2.mean) + '. Standard deviations: ' + r1(sA2.sd) + ' and ' + r1(sB2.sd) + '.']);
      } else {
        var mu0 = pick([15, 20, 25]), sd0 = pick([5, 6]), mode = pick(['scale', 'shift']);
        cA = H.normCounts(mu0, sd0, n, c.lo, c.step, 10);
        if (mode === 'scale') cB = H.normCounts(2 * mu0, 2 * sd0, n, c.lo, c.step, 10); else cB = H.normCounts(mu0 + 30, sd0, n, c.lo, c.step, 10);
        var what = mode === 'scale' ? 'Histogram B shows the same data as A after <b>every value is multiplied by 2</b>.' : 'Histogram B shows the same data as A after <b>30 is added to every value</b>.';
        var oA = ['Same as A', 'A + 30', '2 × A', '4 × A'];
        var ans = mode === 'scale' ? { mean: 2, med: 2, vr: 3, sd: 2 } : { mean: 1, med: 1, vr: 0, sd: 0 };
        parts = [mc('The mean of B equals:', oA, ans.mean, mode === 'scale' ? 'The mean is multiplied by 2.' : 'The mean increases by 30.', true),
          mc('The median of B equals:', oA, ans.med, mode === 'scale' ? 'The median is multiplied by 2.' : 'The median increases by 30.', true),
          mc('The variance of B equals:', oA, ans.vr, mode === 'scale' ? 'The variance is multiplied by 2² = 4.' : 'Shifting does not change variance.', true),
          mc('The standard deviation of B equals:', oA, ans.sd, mode === 'scale' ? 'The standard deviation is multiplied by 2.' : 'Shifting does not change the spread.', true)];
        extra = what;
        sol = mode === 'scale' ?
          steps(['Multiplying all values by c = 2 stretches the histogram: B is twice as far from 0 and twice as wide.', 'Mean and median are multiplied by 2; the standard deviation is multiplied by |c| = 2; the variance is multiplied by c² = <b>4</b>.']) :
          steps(['Adding a constant moves every bar to the right by the same amount: B is A shifted by 30.', 'Mean and median increase by 30. Distances between observations do not change, so variance, standard deviation and range are <b>unchanged</b>.']);
      }
      return { stmt: p('Two histograms of ' + c.name + ', drawn on the same scale.' + (extra ? ' ' + extra : '')) + pairFig(cA, cB, c, ymaxOf(cA, cB)), parts: parts, sol: sol };
    }
  });

  /* ---------------------------------------------------------- histograms: shapes */
  function gammaCounts(n, bins, shape, scale, lo, step) {
    var w = []; for (var i = 0; i < bins; i++) { var m = lo + (i + .5) * step; w.push(Math.pow(m / scale, shape - 1) * Math.exp(-m / scale)); } return H.roundTo(w, n);
  }
  P.reg('hist1', {
    title: 'Reading the shape of a histogram', section: 5, est: 75,
    topic: 'Skewness and the order of mean, median and mode; bimodal data; reading bin counts.',
    variants: ['Right-skewed', 'Left-skewed', 'Two peaks', 'Reading bin counts'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v <= 1) {
        var n = pick([40, 60]), right = v === 0, c;
        c = gammaCounts(n, 10, pick([2, 2.5]), pick([10, 12]), 0, 10);
        if (!right) c = c.slice().reverse();
        var lab = right ? { nm: 'monthly income of young workers ($k)', lo: 0 } : { nm: 'scores on a very easy exam (%)', lo: 0 };
        var s = H.hstats(c, 0, 10), mode = s.modeMid;
        var vals = { mean: s.mean, median: s.median, mode: mode };
        var ord = Object.keys(vals).sort(function (a, b) { return vals[a] - vals[b]; });
        out.stmt = p('Histogram of ' + lab.nm + ' for ' + n + ' people.') + H.hist(c, { lo: 0, step: 10, ymax: ymaxOf(c), xlabel: lab.nm.indexOf('$') >= 0 ? 'income ($k)' : 'score (%)', w: 460, h: 230, tickEvery: 1 });
        var Ordinal = ['smallest', 'middle', 'largest'];
        out.parts = [
          mc('Which is the <b>largest</b> of mean, median and mode?', ['mean', 'median', 'mode'], ['mean', 'median', 'mode'].indexOf(ord[2]), right ? 'The long right tail pulls the mean up.' : 'Here the long tail is on the left, which pulls the mean down.', true),
          mc('Which is the <b>smallest</b> of mean, median and mode?', ['mean', 'median', 'mode'], ['mean', 'median', 'mode'].indexOf(ord[0]), right ? 'Mode (the peak) is the smallest in a right-skewed histogram.' : 'The mean is dragged furthest into the long left tail.', true),
          mc('One more person is added with a very extreme value in the long tail. Which of the three changes <b>most</b>?', ['mean', 'median', 'mode'], 0, 'The mean uses every value; the median and mode barely move.', true),
          mc('The histogram is:', ['skewed to the right (long right tail)', 'skewed to the left (long left tail)', 'symmetric'], right ? 0 : 1, 'The direction of the long tail names the skew.', true)
        ];
        out.sol = steps([right ? 'The bulk of the data is on the left, with a long tail to the right: <b>right-skewed</b>. The peak (mode) is on the left, the mean is pulled to the right by the tail, and the median lies between them: mode &lt; median &lt; mean.' : 'The bulk is on the right with a long tail to the left: <b>left-skewed</b>. The ordering reverses: mean &lt; median &lt; mode.', 'From the bars: mode ≈ ' + r1(mode) + ', median ≈ ' + r1(s.median) + ', mean ≈ ' + r1(s.mean) + '.', 'An extreme value changes the mean by (value − mean)/n, but changes the median by at most one position and does not change the mode. The mean is the statistic sensitive to outliers.']);
      } else if (v === 2) {
        var cfg = pick([
          { nm: 'heights of 100 adults (cm)', lo: 150, step: 4, m1: 162, m2: 180, sd: 3.5, g1: 'women', g2: 'men', xl: 'height (cm)' },
          { nm: 'the number of hours per week that 100 students study', lo: 0, step: 3, m1: 6, m2: 21, sd: 2.5, g1: 'students on a light schedule', g2: 'students on a heavy schedule', xl: 'hours' }]);
        var a = H.normCounts(cfg.m1, cfg.sd, 50, cfg.lo, cfg.step, 10), b = H.normCounts(cfg.m2, cfg.sd, 50, cfg.lo, cfg.step, 10), cc = a.map(function (t, i) { return t + b[i]; });
        var st = H.hstats(cc, cfg.lo, cfg.step), midx = Math.round((cfg.m1 + cfg.m2) / 2);
        out.stmt = p('Histogram of ' + cfg.nm + '.') + H.hist(cc, { lo: cfg.lo, step: cfg.step, ymax: ymaxOf(cc), xlabel: cfg.xl, w: 460, h: 230, tickEvery: 2 });
        out.parts = [
          mc('Roughly where do the mean and the median lie?', ['Near the left peak', 'In the gap between the two peaks', 'Near the right peak'], 1, 'The two halves balance in the middle.', true),
          mc('Is the mean a typical value for these data?', ['No: almost nobody is near it.', 'Yes: it is the center of the data.'], 0, 'A summary can sit where there is no data.', true),
          mc('What is the most plausible explanation for two peaks?', ['Two different groups are mixed together.', 'A mistake in the data.', 'A single homogeneous population.'], 0, 'Look at the groups separately.', true)
        ];
        out.sol = steps(['The histogram has two peaks (bimodal). The mean (≈ ' + r1(st.mean) + ') is in the gap where there is hardly any data; the median is also in the gap.', 'Two peaks usually mean two groups were pooled (' + cfg.g1 + ' and ' + cfg.g2 + '). Compute summaries separately for each group before interpreting a single mean.']);
      } else {
        var k = pick([[2, 6, 8, 4], [3, 5, 9, 3], [1, 7, 7, 5]]), tot = k.reduce(function (x, y) { return x + y; }, 0), step = 10;
        var lbl = pick([{ nm: 'daily steps (thousands) of ' + tot + ' students', xl: 'thousand steps' }, { nm: 'minutes ' + tot + ' students spent on a quiz', xl: 'minutes' }]);
        var mids = [5, 15, 25, 35], mean = H.sumF(k.map(function (c, i) { return F(c * mids[i]); })); mean = H.div(mean, F(tot));
        var cum = 0, medBin = 0; k.forEach(function (c, i) { cum += c; if (!medBin && cum >= tot / 2) medBin = i + 1; });
        var below20 = F(k[0] + k[1], tot), ci = ri(0, 3);
        out.stmt = p('Histogram of ' + lbl.nm + ', with the count shown above each bar (bins of width 10, starting at 0).') + H.hist(k, { lo: 0, step: 10, ymax: Math.max.apply(null, k) + 2, xlabel: lbl.xl, w: 400, h: 230, showCounts: true, tickEvery: 1, ystep: 2 });
        out.parts = [
          num('How many students are in the bin ' + (ci * 10) + '–' + (ci * 10 + 10) + '?', F(k[ci]), 'Read the bar.'),
          num('What share of the students (as a fraction) are below 20?', below20, 'Add the first two bars and divide by ' + tot + '.'),
          mc('Which bin contains the median?', ['0–10', '10–20', '20–30', '30–40'], medBin - 1, 'Find where the cumulative count reaches half of ' + tot + '.', true),
          num('Estimate the mean using the midpoints (5, 15, 25, 35) of the bins.', mean, 'Weighted average of midpoints with the counts as weights.')
        ];
        out.sol = steps(['Counts per bin: ' + k.join(', ') + ' (total ' + tot + ').', 'Below 20: (' + k[0] + ' + ' + k[1] + ')/' + tot + ' = <b>' + fd(below20) + '</b>.', 'Cumulative counts: ' + k.map(function (c, i) { return k.slice(0, i + 1).reduce(function (a, b) { return a + b; }, 0); }).join(', ') + '. Half of ' + tot + ' is ' + tot / 2 + ', reached in the bin <b>' + ((medBin - 1) * 10) + '–' + (medBin * 10) + '</b>.', 'Mean ≈ (' + k.map(function (c, i) { return c + '·' + mids[i]; }).join(' + ') + ')/' + tot + ' = <b>' + fd(mean) + '</b>. It is only an approximation because we treat each student in a bin as sitting at the midpoint.']);
      }
      return out;
    }
  });

  /* ---------------------------------------------------------- scatter plots */
  function corrCloud(n, r) { var u = H.zvec(n), w = H.zvec(n, [u]), s = Math.sqrt(1 - r * r); return { x: u, y: u.map(function (t, i) { return r * t + s * w[i]; }) }; }
  function toPts(c, cx, sx, cy, sy) { return c.x.map(function (t, i) { return [cx + sx * t, cy + sy * c.y[i]]; }); }
  var R = function (pts) { return H.fcorr(pts.map(function (q) { return q[0]; }), pts.map(function (q) { return q[1]; })); };
  var SL = function (pts) { return H.fslope(pts.map(function (q) { return q[0]; }), pts.map(function (q) { return q[1]; })); };
  var SQ = { xr: [0, 100], yr: [0, 100], w: 250, h: 220 };
  function small(pts, title) { return H.scatter(pts, { xr: [0, 100], yr: [0, 100], w: 250, h: 220, title: title }); }

  P.reg('scat1', {
    title: 'Reading scatter plots: sign and strength', section: 5, est: 75,
    topic: 'Sign and size of correlation, the sign of the OLS slope, and nonlinear relationships.',
    variants: ['Rank four plots', 'A curved relationship', 'Same line, different fit'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var n = 30, specs = H.shuffle([['strong +', .93], ['weak +', .45], ['strong −', -.9], ['none', 0]]), labs = ['(a)', '(b)', '(c)', '(d)'];
        var plots = specs.map(function (s) { var c = corrCloud(n, s[1]); return toPts(c, 50, 16, 50, 16); });
        var rs = plots.map(R), sl = plots.map(SL);
        var idxMax = rs.indexOf(Math.max.apply(null, rs)), idxMin = rs.indexOf(Math.min.apply(null, rs)), idxZero = rs.map(Math.abs).indexOf(Math.min.apply(null, rs.map(Math.abs)));
        var negs = sl.map(function (s, i) { return s < -.15 ? i : -1; }).filter(function (i) { return i >= 0; });
        out.stmt = p('Four scatter plots, each with 30 points on the same axes. The correlation r lies between −1 and 1: its sign gives the direction of the relationship and its size shows how tightly the points follow a straight line.') + H.row(small(plots[0], labs[0]), small(plots[1], labs[1]), small(plots[2], labs[2]), small(plots[3], labs[3]));
        var L = ['(a)', '(b)', '(c)', '(d)'];
        out.parts = [
          mc('Which plot has the <b>largest</b> correlation r?', L, idxMax, 'Tight upward band.', true),
          mc('Which plot has the <b>smallest</b> (most negative) correlation?', L, idxMin, 'Tight downward band.', true),
          mc('Which plot has r closest to 0?', L, idxZero, 'A shapeless cloud.', true),
          mc('In which plot does the least squares (OLS) line have a negative slope?', L, negs[0], 'The slope has the sign of the correlation.', true)
        ];
        out.sol = steps(['The sign of r (and of the OLS slope) tells if the cloud goes up or down. The size of r tells how tightly the points hug a line: |r| near 1 for a tight band, near 0 for a shapeless cloud.', 'Sample correlations here: ' + L.map(function (l, i) { return l + ' r ≈ ' + r1(rs[i] * 100) / 100; }).join(', ') + '.', 'The slope b₁ = r·s<sub>y</sub>/s<sub>x</sub> has the sign of r.']);
      } else if (v === 1) {
        var m = 40, xs = [], ys = [], rr;
        do {
          xs = Array.from({ length: m }, function (_, i) { return 5 + 90 * i / (m - 1); }); var sg = pick([1, -1]);
          ys = xs.map(function (t) { return 50 + sg * (-0.015 * Math.pow(t - 50, 2) + 20) + 4 * H.randn(); });
          rr = H.fcorr(xs, ys);
        } while (Math.abs(rr) > .12 || Math.min.apply(null, ys) < 3 || Math.max.apply(null, ys) > 97);
        var pts = xs.map(function (t, i) { return [t, ys[i]]; });
        out.stmt = p('A scatter plot of 40 observations.') + H.scatter(pts, { xr: [0, 100], yr: [0, 100], w: 380, h: 250, xlabel: 'x', ylabel: 'y' });
        out.parts = [
          mc('The correlation r is closest to:', ['−1', '0', '+1'], 1, 'The relationship is curved, not linear.', true),
          mc('Does that mean x and y are unrelated?', ['No: there is a clear (curved) relationship; r only measures linear association.', 'Yes: r = 0 means no relationship of any kind.'], 0, 'Correlation measures only linear association.', true),
          mc('What is the OLS slope of y on x (approximately)?', ['A large positive number', 'About 0', 'A large negative number'], 1, 'Slope = r · s_y/s_x ≈ 0.', true)
        ];
        out.sol = steps(['The points follow a U (or inverted U) shape. On the left half y goes one way, on the right half the other way, and the two halves cancel in the covariance. So r ≈ ' + r1(rr * 100) / 100 + ' and the best straight line is almost flat.', 'A correlation near 0 only says there is no <i>linear</i> relationship. Always look at the plot.']);
      } else {
        var n2 = 24, u = H.zvec(n2), e = H.zvec(n2, [u]), b = pick([1, 2, 3]), a = pick([10, 20, 30]), sx = 18, cx = 50;
        var xv = u.map(function (t) { return cx + sx * t; }), s1 = pick([2, 3]), s2 = pick([10, 12]);
        var mk = function (se) { return xv.map(function (t, i) { return [t, a + b * (t - cx) + 0 + se * e[i] + 0]; }); };
        var y0 = function (arr) { return arr; };
        // y = a + b (x - cx) + noise, shift to keep the line intercept: line in x is a - b cx + b x
        var Pt1 = mk(s1), Pt2 = mk(s2);
        var aa = a - b * cx;
        var ymin = Math.min(0, Math.min.apply(null, Pt1.concat(Pt2).map(function (q) { return q[1]; })) - 5), ymax = Math.max.apply(null, Pt1.concat(Pt2).map(function (q) { return q[1]; })) + 5;
        var yr = [Math.floor(ymin / 10) * 10, Math.ceil(ymax / 10) * 10];
        var swap = Math.random() < .5, PA = swap ? Pt2 : Pt1, PB = swap ? Pt1 : Pt2;
        var lineAB = { a: aa, b: b };
        var f = function (pts, t) { return H.scatter(pts, { xr: [0, 100], yr: yr, w: 330, h: 250, title: t, line: lineAB, xlabel: 'x', ylabel: 'y' }); };
        out.stmt = p('Two scatter plots with the same x-values. The orange line is the OLS line; it is <b>the same line</b> in both plots.') + H.row(f(PA, 'Plot A'), f(PB, 'Plot B'));
        var tightA = (swap ? s2 : s1) < (swap ? s1 : s2);
        out.parts = [
          AB('Which plot has the larger correlation r?', tightA ? 'A' : 'B', 'Points closer to the line mean a stronger linear association.'),
          AB('Which plot has the larger sum of squared residuals? (A residual is the vertical distance from a point to the line, with a sign.)', tightA ? 'B' : 'A', 'Points further from the line.'),
          AB('Which plot has the larger OLS slope?', 'Equal', 'Same line, same slope.'),
          AB('Which plot has the larger sample covariance of x and y?', 'Equal', 's_xy = slope × s_x², and x is the same.')
        ];
        out.sol = steps(['Both plots have the same OLS line, so the same slope b₁, and since the x-values are identical, the same s<sub>x</sub>². Therefore s<sub>xy</sub> = b₁ s<sub>x</sub>² is the same.', 'The plot whose points lie closer to the line has smaller residuals, a smaller Σe² and a larger correlation.', '<b>Slope</b> says how steeply y changes with x; <b>correlation</b> says how tightly the points follow the line. They are different things.']);
        out.meta = { r1: R(Pt1), r2: R(Pt2), s1: SL(Pt1), s2: SL(Pt2) };
      }
      return out;
    }
  });

  P.reg('scat2', {
    title: 'Scatter plots: lines and outliers', section: 5, est: 90,
    topic: 'Reading a fitted line, residual signs, and the pull of an outlier on the OLS line.',
    variants: ['Read the fitted line', 'Add an outlier'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var cfg = pick([{ a: 40, b: 5 }, { a: 30, b: 5 }, { a: 50, b: 3 }, { a: 20, b: 6 }, { a: 90, b: -4 }, { a: 80, b: -5 }]);
        var n = 16, u = H.zvec(n), e = H.zvec(n, [u]), cx = 5, sx = 2.4;
        var xv = u.map(function (t) { return cx + sx * t; }), se = 5;
        var ok = xv.every(function (t) { return t > .3 && t < 9.7; });
        var pts = xv.map(function (t, i) { return [t, cfg.a + cfg.b * t + se * e[i]]; });
        var ymax = Math.max(100, Math.ceil(Math.max.apply(null, pts.map(function (q) { return q[1]; })) / 10 + .3) * 10);
        if (!ok || Math.min.apply(null, pts.map(function (q) { return q[1]; })) < 0 || ymax > 110) return P.G.scat2.gen(0);
        var hl = 0; pts.forEach(function (q, i) { if (Math.abs(q[1] - cfg.a - cfg.b * q[0]) > Math.abs(pts[hl][1] - cfg.a - cfg.b * pts[hl][0])) hl = i; }); var hx = pts[hl][0], res = pts[hl][1] - (cfg.a + cfg.b * hx);
        if (Math.abs(res) < 7) return P.G.scat2.gen(0);
        var x0 = pick([2, 4, 6, 8]), ctx = cfg.b > 0 ? ['hours of study', 'score'] : ['hours of gaming', 'GPA points × 20'];
        out.stmt = p('Scatter plot of y against x for 16 observations, with the OLS line (orange). Grid lines are at every unit of x and every 10 units of y. One point is marked with a red “M”.') +
          H.scatter(pts, { xr: [0, 10], yr: [0, ymax], grid: [1, 10], w: 460, h: 300, line: { a: cfg.a, b: cfg.b }, labels: pts.map(function (_, i) { return i === hl ? 'M' : ''; }), colors: pts.map(function (_, i) { return i === hl ? '#c53030' : '#2b6cb0'; }), radii: pts.map(function (_, i) { return i === hl ? 5.5 : 3.6; }), xlabel: 'x', ylabel: 'y' });
        out.parts = [
          num('Read the intercept b₀ (the value of the line at x = 0) from the graph.', F(cfg.a), 'Where the orange line meets the y-axis.'),
          num('Estimate the slope b₁ from the graph: how much does the line rise (or fall) per unit of x?', F(cfg.b), 'Use two points on the line, e.g. at x = 0 and x = 4.'),
          num('Use the line to predict y at x = ' + x0 + '.', F(cfg.a + cfg.b * x0), 'Read off the line at x = ' + x0 + '.'),
          mc('The marked point M lies ' + (res > 0 ? 'above' : 'below') + ' the line. Its residual (the observed y minus the y on the line) is:', ['positive', 'negative', 'zero'], res > 0 ? 0 : 1, 'Residual = observed − predicted: positive when the point is above the line.', true),
          mc('The line is guaranteed to pass through which point?', ['(0, 0)', '(<span class="xbar low">x</span>, ȳ), the point whose coordinates are the means of x and of y', '(largest x, largest y)'], 1, 'b₀ = ȳ − b₁<span class="xbar low">x</span>.', true)
        ];
        out.sol = steps(['Intercept: the line crosses the y-axis at <b>' + cfg.a + '</b>.', 'Slope: between x = 0 (y = ' + cfg.a + ') and x = 4 (y = ' + (cfg.a + 4 * cfg.b) + ') the line changes by ' + (4 * cfg.b) + ' over 4 units, so b₁ = <b>' + cfg.b + '</b>.', 'Prediction at x = ' + x0 + ': ' + cfg.a + ' + ' + cfg.b + '·' + x0 + ' = <b>' + (cfg.a + cfg.b * x0) + '</b>.', 'Point M is ' + (res > 0 ? 'above' : 'below') + ' the line, so its residual (observed − fitted) is ' + (res > 0 ? 'positive' : 'negative') + '.', 'The OLS line always passes through (<span class="xbar low">x</span>, ȳ).']);
      } else {
        var base, pts2, after, kind, tries = 0, lab;
        var types = [
          { n: 'far to the right of all other points and well below the trend', f: function (c) { return [c.mx + 3.2 * c.sx, c.my - 3 * c.sy]; } },
          { n: 'far to the right of all other points and well above the trend', f: function (c) { return [c.mx + 3.2 * c.sx, c.my + 3 * c.sy]; } },
          { n: 'far to the left of all other points and well above the trend', f: function (c) { return [c.mx - 3.2 * c.sx, c.my + 3 * c.sy]; } },
          { n: 'at the middle of the x-values, but far above the trend', f: function (c) { return [c.mx, c.my + 3 * c.sy]; } }
        ];
        var t = pick(types), res_;
        var guard = 0;
        while (guard++ < 3000) {
          var cl = corrCloud(14, .8); base = toPts(cl, 50, 13, 50, 13);
          var ctx2 = { mx: 50, my: 50, sx: 13, sy: 13 }, extra = t.f(ctx2);
          if (extra[0] > 97 || extra[0] < 3 || extra[1] > 98 || extra[1] < 2) { continue; }
          after = base.concat([extra]);
          var s0 = SL(base), s1 = SL(after), r0 = R(base), r1_ = R(after);
          res_ = { s0: s0, s1: s1, r0: r0, r1: r1_ };
          var rel = Math.abs(s1 - s0) / s0, dr = Math.abs(r1_ - r0);
          if ((rel < .03 || rel > .08) && (dr < .015 || dr > .04)) break;
        }
        var dS = res_.s1 - res_.s0, relS = Math.abs(dS) / res_.s0, dR = res_.r1 - res_.r0;
        var sAns = relS < .03 ? 2 : dS > 0 ? 0 : 1, rAns = Math.abs(dR) < .015 ? 2 : dR > 0 ? 0 : 1;
        var fig = function (ptsX, line, title) { return H.scatter(ptsX, { xr: [0, 100], yr: [0, 100], w: 340, h: 260, title: title, colors: ptsX.map(function (_, i) { return i === 14 ? '#c53030' : '#2b6cb0'; }), radii: ptsX.map(function (_, i) { return i === 14 ? 6 : 3.6; }) }); };
        var b1b = SL(base), a1b = fmeanOf(base, 1) - b1b * fmeanOf(base, 0), b1a = SL(after), a1a = fmeanOf(after, 1) - b1a * fmeanOf(after, 0);
        out.stmt = p('Left: a scatter plot of 14 points. Right: the same 14 points plus one additional point (red), which lies <b>' + t.n + '</b>. Think about the OLS line, the straight line that best fits the points by minimizing the sum of squared residuals (residual = observed y minus the y on the line).') + H.row(fig(base, null, 'Before'), fig(after, null, 'After'));
        var ch = ['becomes larger (steeper)', 'becomes smaller (flatter)', 'stays about the same'];
        out.parts = [
          mc('Compare the slope of the OLS line fitted to all 15 points with the slope of the OLS line fitted to the original 14 points. The slope:', ch, sAns, 'A point far out in x pulls the line towards it; a point at the middle of x barely tilts it.', true),
          mc('Compare the correlation r computed from all 15 points with the correlation of the original 14 points. The correlation:', ['becomes larger', 'becomes smaller', 'stays about the same'], rAns, 'A point far from the trend (relative to the cloud) weakens linear association; a far point that lines up with the trend can strengthen it.', true),
          mc('A different line is chosen to minimize the sum of <i>absolute</i> residuals instead of squared ones. Compared with that line, the OLS line reacts to an outlier:', ['more strongly, because squaring gives big residuals a large weight', 'less strongly', 'in exactly the same way'], 0, 'Squared deviations give outliers a strong pull.', true)
        ];
        out.sol = steps(['Slope before ≈ ' + r1(res_.s0 * 100) / 100 + ', after ≈ ' + r1(res_.s1 * 100) / 100 + '. Correlation before ≈ ' + r1(res_.r0 * 100) / 100 + ', after ≈ ' + r1(res_.r1 * 100) / 100 + '.', 'The OLS line minimizes <i>squared</i> deviations, so a far-away point has a big effect on the fit. How the slope changes depends on <b>where</b> the point is: far out in x it has leverage and can tilt the line a lot (towards itself); at the middle of x it moves the line up or down but hardly tilts it.']);
        out.meta = res_;
      }
      return out;
    }
  });
  function fmeanOf(pts, k) { return pts.reduce(function (s, q) { return s + q[k]; }, 0) / pts.length; }
})();
