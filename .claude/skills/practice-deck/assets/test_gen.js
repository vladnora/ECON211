// Self-test, runs in a browser page (test.html): every generator, many times, with checks.
(function () {
  var P = globalThis.P, H = P.h, bad = 0, out = [];
  function fail(m) { bad++; if (bad < 40) out.push('FAIL ' + m); }
  function chk(id, v, o) {
    if (!o || !o.stmt || !o.parts || !o.sol) return fail(id + v + ' missing fields');
    var txt = o.stmt + o.sol + JSON.stringify(o.parts);
    var m = txt.match(/.{0,30}(NaN|undefined|Infinity|\[object).{0,30}/);
    if (m) fail(id + v + ' bad text: ' + m[0]);
    o.parts.forEach(function (q, i) {
      if (q.num) { if (!isFinite(H.fv(q.num))) fail(id + v + ' nonfinite'); }
      else if (q.opts) {
        if (!(q.ci >= 0 && q.ci < q.opts.length)) fail(id + v + ' bad ci');
        if (new Set(q.opts).size !== q.opts.length) fail(id + v + ' dup opts ' + q.opts);
        if (q.opts[q.ci] !== q.a) fail(id + v + ' a mismatch');
      } else fail(id + v + ' part ' + i + ' has no answer');
    });
    if (o.meta && o.meta.x && o.meta.b1 !== undefined) {
      var x = o.meta.x, y = o.meta.y, n = x.length, mx = x.reduce(function (a, b) { return a + b; }) / n, my = y.reduce(function (a, b) { return a + b; }) / n, a = 0, b = 0;
      x.forEach(function (t, i) { a += (t - mx) * (y[i] - my); b += (t - mx) * (t - mx); });
      if (Math.abs(a / b - o.meta.b1) > 1e-9 || Math.abs(my - a / b * mx - o.meta.b0) > 1e-9) fail(id + v + ' ols mismatch');
    }
  }
  var N = +(new URLSearchParams(location.search).get('n') || 40);
  P.order.forEach(function (id) {
    var d = P.G[id], t0 = Date.now();
    for (var v = 0; v < d.variants.length; v++) for (var k = 0; k < N; k++) { try { chk(id, v, d.gen(v)); } catch (e) { fail(id + v + ' threw ' + (e.message || e) + ' @' + ((e.stack||'').split('\n')[1]||'').replace(/data:text.*?:(\d+:\d+)\)?/, 'L$1').slice(-60)); break; } }
    out.push(id + ' ' + d.variants.length + ' variants ' + (Date.now() - t0) + 'ms'); document.getElementById('o').textContent = out.join('\n');
  });
  out.push(bad ? 'FAILURES: ' + bad : 'ALL OK');
  document.getElementById('o').textContent = out.join('\n'); document.title = 'done';
})();
