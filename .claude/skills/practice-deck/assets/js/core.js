/* Core helpers: random numbers, exact fractions, statistics, HTML and SVG builders. */
(function () {
  'use strict';
  var P = globalThis.P = globalThis.P || {};
  var MINUS = '−';

  /* ---------- random ---------- */
  var ri = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sample(a, k) { return shuffle(a).slice(0, k); }
  function randn() { var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- exact fractions ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { if (d === undefined) d = 1; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g }; }
  var add = function (a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); };
  var sub = function (a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); };
  var mul = function (a, b) { return F(a.n * b.n, a.d * b.d); };
  var div = function (a, b) { return F(a.n * b.d, a.d * b.n); };
  var fv = function (f) { return f.n / f.d; };
  var toF = function (a) { return a.map(function (v) { return typeof v === 'number' ? F(v) : v; }); };
  var sumF = function (a) { return toF(a).reduce(function (s, v) { return add(s, v); }, F(0)); };
  function fs(f) { var s = f.d === 1 ? String(Math.abs(f.n)) : Math.abs(f.n) + '/' + f.d; return (f.n < 0 ? MINUS : '') + s; }
  function terminating(d) { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; }
  function dc(f, k) { if (k === undefined) k = 3; var x = fv(f), m = Math.pow(10, k); var s = String(Math.round(Math.abs(x) * m) / m); return (x < 0 && Math.round(Math.abs(x) * m) !== 0 ? MINUS : '') + s; }
  function fd(f, k) { if (f.d === 1) return fs(f); return fs(f) + (terminating(f.d) ? ' = ' : ' ≈ ') + dc(f, k || 3); }
  var neg = function (f) { return F(-f.n, f.d); };
  var absF = function (f) { return F(Math.abs(f.n), f.d); };

  /* ---------- statistics (exact) ---------- */
  function mean(a) { a = toF(a); return div(sumF(a), F(a.length)); }
  function ss(a) { var m = mean(a); return sumF(toF(a).map(function (v) { var d = sub(v, m); return mul(d, d); })); }
  function sxy(x, y) { var mx = mean(x), my = mean(y); var X = toF(x), Y = toF(y); return sumF(X.map(function (v, i) { return mul(sub(v, mx), sub(Y[i], my)); })); }
  function median(a) { var s = toF(a).slice().sort(function (p, q) { return fv(p) - fv(q); }); var n = s.length; return n % 2 ? s[(n - 1) / 2] : div(add(s[n / 2 - 1], s[n / 2]), F(2)); }
  function modes(a) { var c = {}; a.forEach(function (v) { c[v] = (c[v] || 0) + 1; }); var mx = 0; for (var k in c) mx = Math.max(mx, c[k]); var out = []; for (var k2 in c) if (c[k2] === mx) out.push(+k2); return { vals: out.sort(function (p, q) { return p - q; }), count: mx }; }
  function ols(x, y) {
    var xb = mean(x), yb = mean(y), Sxx = ss(x), Sxy = sxy(x, y), Syy = ss(y);
    var b1 = div(Sxy, Sxx), b0 = sub(yb, mul(b1, xb));
    var X = toF(x), Y = toF(y);
    var fit = X.map(function (v) { return add(b0, mul(b1, v)); });
    var res = Y.map(function (v, i) { return sub(v, fit[i]); });
    return { xb: xb, yb: yb, Sxx: Sxx, Sxy: Sxy, Syy: Syy, b1: b1, b0: b0, fit: fit, res: res,
      sse: sumF(res.map(function (e) { return mul(e, e); })), sad: sumF(res.map(absF)), n: x.length };
  }
  function lineStats(x, y, b0, b1) { /* residuals for any line */
    var X = toF(x), Y = toF(y);
    var res = Y.map(function (v, i) { return sub(v, add(b0, mul(b1, X[i]))); });
    return { res: res, sum: sumF(res), sumx: sumF(res.map(function (e, i) { return mul(e, X[i]); })),
      sse: sumF(res.map(function (e) { return mul(e, e); })), sad: sumF(res.map(absF)) };
  }

  /* ---------- float helpers for figures ---------- */
  var fmean = function (a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; };
  function fcorr(x, y) { var mx = fmean(x), my = fmean(y), a = 0, b = 0, c = 0; for (var i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) * (x[i] - mx); c += (y[i] - my) * (y[i] - my); } return a / Math.sqrt(b * c); }
  function fslope(x, y) { var mx = fmean(x), my = fmean(y), a = 0, b = 0; for (var i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) * (x[i] - mx); } return a / b; }
  function zvec(n, avoid) { /* mean 0, sum of squares n, orthogonal to the vectors in avoid */
    var v = []; for (var i = 0; i < n; i++) v.push(randn());
    var m = fmean(v); v = v.map(function (t) { return t - m; });
    (avoid || []).forEach(function (u) { var d = 0; for (var i = 0; i < n; i++) d += v[i] * u[i]; d /= n; v = v.map(function (t, i) { return t - d * u[i]; }); });
    var s = Math.sqrt(v.reduce(function (q, t) { return q + t * t; }, 0) / n); return v.map(function (t) { return t / s; });
  }
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  var Phi = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  function roundTo(w, n) { /* largest-remainder rounding of weights to integers summing to n */
    var tot = w.reduce(function (s, v) { return s + v; }, 0); var raw = w.map(function (v) { return v / tot * n; });
    var fl = raw.map(Math.floor); var left = n - fl.reduce(function (s, v) { return s + v; }, 0);
    var ord = raw.map(function (v, i) { return [v - Math.floor(v), i]; }).sort(function (a, b) { return b[0] - a[0]; });
    for (var k = 0; k < left; k++) fl[ord[k][1]]++; return fl;
  }
  function normCounts(mu, sd, n, lo, step, bins) {
    var w = []; for (var i = 0; i < bins; i++) { var a = lo + i * step, b = a + step; w.push(Phi((b - mu) / sd) - Phi((a - mu) / sd)); }
    return roundTo(w, n);
  }
  function hstats(c, lo, step) { /* approximate statistics from a histogram using bin midpoints */
    var n = c.reduce(function (s, v) { return s + v; }, 0), m = 0, i;
    for (i = 0; i < c.length; i++) m += c[i] * (lo + (i + .5) * step); m /= n;
    var v = 0; for (i = 0; i < c.length; i++) v += c[i] * Math.pow(lo + (i + .5) * step - m, 2); v /= n;
    var cum = 0, mb = 0; for (i = 0; i < c.length; i++) { cum += c[i]; if (cum >= n / 2) { mb = i; break; } }
    var lowN = 0; for (i = 0; i < mb; i++) lowN += c[i];
    var med = lo + mb * step + (n / 2 - lowN) / c[mb] * step;
    var mx = 0, mi = 0; for (i = 0; i < c.length; i++) if (c[i] > mx) { mx = c[i]; mi = i; }
    var first = c.findIndex(function (t) { return t > 0; }), last = c.length - 1 - c.slice().reverse().findIndex(function (t) { return t > 0; });
    return { n: n, mean: m, sd: Math.sqrt(v), var: v, median: med, medBin: mb, modeMid: lo + (mi + .5) * step, range: (last - first + 1) * step };
  }

  /* ---------- html builders ---------- */
  function tbl(head, rows, cls) {
    return '<table class="t ' + (cls || '') + '"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  var p = function (s) { return '<p>' + s + '</p>'; };
  function steps(a) { return '<ol class="steps">' + a.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  var sub_ = function (s) { return '<sub>' + s + '</sub>'; };
  var sup_ = function (s) { return '<sup>' + s + '</sup>'; };
  function num(p_, f, ex, o) { var r = { p: p_, num: f, a: fd(f), ex: ex || '' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function mc(p_, opts, correct, ex, fixed) {
    var idx = opts.map(function (_, i) { return i; }); if (!fixed) idx = shuffle(idx);
    var o = idx.map(function (i) { return opts[i]; }); var ci = idx.indexOf(correct);
    return { p: p_, opts: o, ci: ci, a: opts[correct], ex: ex || '' };
  }
  var AB = function (p_, correct, ex) { return mc(p_, ['A', 'B', 'Equal'], correct === 'A' ? 0 : correct === 'B' ? 1 : 2, ex, true); };

  /* ---------- svg builders ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function svg(w, h, inner, cls) { return '<svg class="fig ' + (cls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="' + NS + '">' + inner + '</svg>'; }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" fill="' + (o.fill || '#52606d') + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.bold ? ' font-weight="700"' : '') + '>' + s + '</text>'; }
  function hist(counts, o) {
    var W = o.w || 330, H = o.h || 220, L = 38, B = 38, T = o.title ? 28 : 12, Rr = 10;
    var bins = counts.length, bw = (W - L - Rr) / bins, ymax = o.ymax || Math.max.apply(null, counts) + 1;
    var s = '', i;
    if (o.title) s += tx(W / 2, 18, o.title, { size: 16, bold: true, fill: '#1b3a5c' });
    var yt = o.ystep || (ymax > 24 ? 10 : ymax > 12 ? 5 : 2);
    for (var t = 0; t <= ymax; t += yt) { var y = T + (H - T - B) * (1 - t / ymax); s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" stroke="#e4e7eb"/>' + tx(L - 5, y + 4, t, { anchor: 'end', size: 13 }); }
    for (i = 0; i < bins; i++) {
      var bh = (H - T - B) * counts[i] / ymax;
      s += '<rect x="' + (L + i * bw + 1) + '" y="' + (H - B - bh) + '" width="' + (bw - 2) + '" height="' + bh + '" fill="' + (o.color || '#2b6cb0') + '" opacity=".88"/>';
      if (o.showCounts && counts[i]) s += tx(L + (i + .5) * bw, H - B - bh - 4, counts[i], { size: 14, fill: '#1f2933', bold: true });
    }
    s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="#52606d"/>';
    for (i = 0; i <= bins; i++) { if (o.tickEvery && i % o.tickEvery) continue; s += tx(L + i * bw, H - B + 15, o.lo + i * o.step, { size: 13 }); }
    if (o.xlabel) s += tx((L + W - Rr) / 2, H - 6, o.xlabel, { size: 14 });
    return svg(W, H, s, 'hist');
  }
  function scatter(pts, o) {
    var W = o.w || 330, H = o.h || 250, L = 40, B = 34, T = o.title ? 28 : 10, Rr = 12;
    var xr = o.xr, yr = o.yr, s = '', i;
    var X = function (v) { return L + (W - L - Rr) * (v - xr[0]) / (xr[1] - xr[0]); };
    var Y = function (v) { return H - B - (H - T - B) * (v - yr[0]) / (yr[1] - yr[0]); };
    if (o.title) s += tx(W / 2, 18, o.title, { size: 16, bold: true, fill: '#1b3a5c' });
    if (o.grid) {
      for (var gx = xr[0]; gx <= xr[1] + 1e-9; gx += o.grid[0]) s += '<line x1="' + X(gx) + '" x2="' + X(gx) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#e4e7eb"/>' + tx(X(gx), H - B + 15, gx, { size: 11 });
      for (var gy = yr[0]; gy <= yr[1] + 1e-9; gy += o.grid[1]) s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(gy) + '" y2="' + Y(gy) + '" stroke="#e4e7eb"/>' + tx(L - 5, Y(gy) + 4, gy, { anchor: 'end', size: 13 });
    }
    s += '<rect x="' + L + '" y="' + T + '" width="' + (W - L - Rr) + '" height="' + (H - T - B) + '" fill="none" stroke="#52606d"/>';
    if (o.line) s += '<line x1="' + X(xr[0]) + '" y1="' + Y(o.line.a + o.line.b * xr[0]) + '" x2="' + X(xr[1]) + '" y2="' + Y(o.line.a + o.line.b * xr[1]) + '" stroke="#dd6b20" stroke-width="2.5"/>';
    pts.forEach(function (q, k) {
      var col = (o.colors && o.colors[k]) || '#2b6cb0', r = (o.radii && o.radii[k]) || 3.6;
      s += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="' + r + '" fill="' + col + '" opacity=".85"/>';
      if (o.labels && o.labels[k]) s += tx(X(q[0]) + 9, Y(q[1]) - 7, o.labels[k], { size: 14, bold: true, fill: '#c53030' });
    });
    if (o.xlabel) s += tx((L + W - Rr) / 2, H - 4, o.xlabel, { size: 14 });
    if (o.ylabel) s += '<text transform="translate(12 ' + ((T + H - B) / 2) + ') rotate(-90)" font-size="12" fill="#52606d" text-anchor="middle">' + o.ylabel + '</text>';
    return svg(W, H, s, 'scatter');
  }
  function row() { return '<div class="figrow">' + Array.prototype.join.call(arguments, '') + '</div>'; }

  /* ---------- registry ---------- */
  P.G = P.G || {}; P.order = P.order || [];
  P.reg = function (id, def) { def.id = id; if (def.note) { var g0 = def.gen; def.gen = function (v) { var o = g0(v); o.stmt += P.h.NOTE; return o; }; } P.G[id] = def; P.order.push(id); };
  P.h = { ri: ri, pick: pick, shuffle: shuffle, sample: sample, randn: randn, F: F, add: add, sub: sub, mul: mul, div: div, fv: fv, fs: fs, fd: fd, dc: dc, neg: neg, absF: absF,
    mean: mean, ss: ss, sxy: sxy, median: median, modes: modes, ols: ols, lineStats: lineStats, fcorr: fcorr, fslope: fslope, fmean: fmean, zvec: zvec,
    normCounts: normCounts, hstats: hstats, roundTo: roundTo, tbl: tbl, p: p, steps: steps, num: num, mc: mc, AB: AB, svg: svg, tx: tx, hist: hist, scatter: scatter, row: row,
    sumF: sumF, toF: toF, MINUS: MINUS, sub_: sub_, sup_: sup_ };
})();
