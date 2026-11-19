/* Deck UI: practice slides (new variant / solution) and the timed quiz. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  var P = globalThis.P, H = P.h;
  var LET = 'abcdefghijklmnopqrstuvwxyz';
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function stopKeys(node) { node.addEventListener('keydown', function (e) { e.stopPropagation(); }); }

  /* ---------- optional table (def.table): opens in a new browser tab ---------- */
  var TAB_CSS = 'body{font-family:"Source Sans Pro",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2933;margin:18px auto;max-width:1000px;padding:0 16px}h1{font-size:22px;color:#1b3a5c;margin:0 0 10px}.cols{display:flex;gap:22px;align-items:flex-start}.info{flex:0 0 310px;font-size:15px;line-height:1.4}.info p{margin:0 0 10px}table.t{border-collapse:collapse;font-size:13.5px}table.t th{background:#1b3a5c;color:#fff;padding:2px 8px;position:sticky;top:0}table.t td{padding:2px 8px;border-bottom:1px solid #e1e8ef;text-align:center;font-variant-numeric:tabular-nums}table.t td:first-child{background:#eef4fb}@media(max-width:760px){.cols{flex-direction:column}.info{flex:none}}';
  function tablePop() {
    if (!H.tableHTML) return;
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>Standard Normal table</title><style>' + TAB_CSS + '</style></head><body><h1>Standard Normal table: Φ(z) = P(Z ≤ z)</h1><div class="cols"><div class="info">' + H.TABLE_INFO + '</div><div>' + H.tableHTML() + '</div></div></body></html>';
    var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    var w = window.open(url, '_blank');
    if (!w) alert('Your browser blocked the new tab. Allow pop-ups for this page and press the button again.');
  }
  function tableBtn() { var b = el('button', 'act ghost', 'Φ table'); b.addEventListener('click', tablePop); return b; }

  /* ---------- practice slides ---------- */
  function partsHTML(parts) {
    return '<ol class="parts" type="a">' + parts.map(function (q) {
      var o = q.opts ? '<div class="opts">' + q.opts.map(function (t) { return '<span class="opt">' + t + '</span>'; }).join('') + '</div>' : '';
      return '<li>' + q.p + o + '</li>'; }).join('') + '</ol>';
  }
  function answersHTML(parts) {
    return '<div class="ans"><span class="ans-h">Answers</span>' + parts.map(function (q, i) { return '<span class="ans-i">(' + LET[i] + ') <b>' + q.a + '</b></span>'; }).join('') + '</div>';
  }
  function build(host) {
    var id = host.getAttribute('data-id'), def = P.G[id], st = { v: Math.floor(Math.random() * def.variants.length), solOpen: false };
    host.innerHTML = '';
    var top = el('div', 'pr-top', '<span class="pr-topic">' + def.topic + '</span>');
    var chips = el('div', 'chips');
    var body = el('div', 'pr-body'), sol = el('div', 'pr-sol'), btns = el('div', 'pr-btns');
    var bNew = el('button', 'act', 'New variant'), bSol = el('button', 'act ghost', 'Show solution');
    btns.appendChild(bNew); btns.appendChild(bSol); if (def.table) btns.appendChild(tableBtn());
    var scroll = el('div', 'pr-scroll'); scroll.appendChild(body); scroll.appendChild(sol);
    host.appendChild(top); host.appendChild(chips); host.appendChild(btns); host.appendChild(scroll);
    var cur = null;
    function drawChips() {
      chips.innerHTML = '';
      def.variants.forEach(function (n, i) {
        var c = el('button', 'chip' + (i === st.v ? ' on' : ''), (i + 1) + '. ' + n);
        c.addEventListener('click', function () { st.v = i; gen(); });
        chips.appendChild(c);
      });
    }
    function gen() {
      cur = def.gen(st.v); st.solOpen = false;
      body.innerHTML = cur.stmt + partsHTML(cur.parts);
      sol.innerHTML = answersHTML(cur.parts) + '<div class="sol-h">Worked solution</div>' + cur.sol;
      sol.style.display = 'none'; bSol.textContent = 'Show solution'; drawChips();
    }
    bNew.addEventListener('click', function () { st.v = (st.v + 1) % def.variants.length; gen(); });
    bSol.addEventListener('click', function () { st.solOpen = !st.solOpen; sol.style.display = st.solOpen ? 'block' : 'none'; bSol.textContent = st.solOpen ? 'Hide solution' : 'Show solution'; if (st.solOpen) sol.scrollIntoView({ block: 'nearest' }); });
    gen();
  }

  /* ---------- quiz ---------- */
  function parseNum(s) {
    s = String(s).replace(/−/g, '-').replace(/,/g, '.').replace(/%/g, '').replace(/\s+/g, '').replace(/^≈/, '');
    if (!s) return NaN;
    var m = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/); if (m) return parseFloat(m[1]) / parseFloat(m[2]);
    return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }
  function makeQuiz(k) {
    var ids = H.sample(P.order.filter(function (i) { return P.G[i].quiz !== false; }), k), items = [];
    ids.forEach(function (id) {
      var def = P.G[id], v = H.ri(0, def.variants.length - 1), g = def.gen(v);
      var cand = g.parts.filter(function (q) { return (q.num || q.opts) && !q.noquiz; });
      var q = H.pick(cand), only = q;
      items.push({ id: id, title: def.title, est: def.est, stmt: id === 'tf' ? '<p>True or false?</p>' : g.stmt, q: q, sol: g.sol, user: null });
    });
    return items;
  }
  function fmtTime(s) { s = Math.round(s); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  function buildQuiz(host) {
    var K = 5, timer = null, t0 = 0, items = [], idx = 0;
    function intro() {
      clearInterval(timer);
      host.innerHTML = '<div class="box key"><span class="tag">Timed quiz</span>5 questions, drawn at random from the topics in this deck. A timer starts when you press Start. Answers are shown only after you finish the last question, together with your time compared to a typical time for this set. Use pen and paper. Type numbers as fractions (3/4) or decimals (0.75). Where a table is needed, a table button is available.</div>';
      var b = el('button', 'act big', 'Start quiz'); b.addEventListener('click', start); host.appendChild(b);
    }
    function start() { items = makeQuiz(K); idx = 0; t0 = Date.now(); timer = setInterval(tick, 500); show(); }
    function tick() { var t = document.getElementById('qz-timer'); if (t) t.textContent = fmtTime((Date.now() - t0) / 1000); }
    function save() {
      var it = items[idx], q = it.q;
      if (q.opts) { var s = host.querySelector('.qopt.on'); it.user = s ? +s.getAttribute('data-i') : null; }
      else { var inp = host.querySelector('input.qin'); it.user = inp ? inp.value : ''; }
    }
    function show() {
      var it = items[idx], q = it.q;
      host.innerHTML = '';
      var head = el('div', 'qz-head', '<span>Question ' + (idx + 1) + ' of ' + K + '</span><span class="qz-time">⏱ <b id="qz-timer">' + fmtTime((Date.now() - t0) / 1000) + '</b></span>');
      var qbox = el('div', 'qz-q', it.stmt + '<p class="qz-ask"><b>' + q.p + '</b></p>');
      host.appendChild(head); host.appendChild(qbox);
      if (q.opts) {
        var w = el('div', 'qopts');
        q.opts.forEach(function (t, i) {
          var b = el('button', 'qopt' + (it.user === i ? ' on' : ''), t); b.setAttribute('data-i', i);
          b.addEventListener('click', function () { Array.prototype.forEach.call(w.children, function (c) { c.classList.remove('on'); }); b.classList.add('on'); });
          w.appendChild(b);
        });
        host.appendChild(w);
      } else {
        var inp = el('input', 'qin'); inp.type = 'text'; inp.placeholder = 'your answer, e.g. 3/4 or 0.75'; inp.value = it.user || ''; stopKeys(inp);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') next.click(); });
        host.appendChild(inp); setTimeout(function () { inp.focus(); }, 50);
      }
      var nav = el('div', 'pr-btns');
      var prev = el('button', 'act ghost', 'Back'); prev.disabled = idx === 0; prev.addEventListener('click', function () { save(); idx--; show(); });
      var next = el('button', 'act', idx === K - 1 ? 'Finish' : 'Next');
      next.addEventListener('click', function () { save(); if (idx === K - 1) finish(); else { idx++; show(); } });
      if (P.G[it.id].table) nav.appendChild(tableBtn());
      nav.appendChild(prev); nav.appendChild(next); host.appendChild(nav);
    }
    function correct(it) {
      var q = it.q;
      if (q.opts) return it.user === q.ci;
      var x = parseNum(it.user === null ? '' : it.user), c = H.fv(q.num);
      return isFinite(x) && Math.abs(x - c) <= Math.max(0.006, 0.002 * Math.abs(c));
    }
    function finish() {
      clearInterval(timer); var secs = (Date.now() - t0) / 1000;
      var est = items.reduce(function (s, it) { return s + it.est; }, 0), score = 0;
      var rows = items.map(function (it, i) {
        var ok = correct(it); if (ok) score++;
        var you = it.q.opts ? (it.user === null ? '<i>no answer</i>' : it.q.opts[it.user]) : (it.user ? it.user : '<i>no answer</i>');
        return '<div class="res ' + (ok ? 'ok' : 'bad') + '"><div class="res-h"><b>' + (i + 1) + '. ' + it.title + '</b><span>' + (ok ? '✓ correct' : '✗ incorrect') + '</span></div>' +
          '<div class="res-q">' + it.q.p + '</div>' +
          '<div class="res-a">Your answer: <b>' + you + '</b> &nbsp;|&nbsp; Correct answer: <b>' + it.q.a + '</b></div>' +
          (it.q.ex ? '<div class="res-ex">' + it.q.ex + '</div>' : '') +
          '<details><summary>Show the problem and worked solution</summary><div class="res-sol">' + it.stmt + it.sol + '</div></details></div>';
      }).join('');
      var ratio = secs / est, verdict = ratio < .6 ? 'Much faster than the target. Check that you were not rushing, and that your answers are right.' : ratio <= 1.1 ? 'On pace for a timed exam.' : ratio <= 1.5 ? 'Somewhat slower than the target. Practice the computations until they come faster.' : 'Well above the target. Redo the topics that cost you the most time.';
      host.innerHTML = '<div class="qz-score"><div><span class="big">' + score + ' / ' + K + '</span><br>correct</div>' +
        '<div><span class="big">' + fmtTime(secs) + '</span><br>your time</div><div><span class="big">' + fmtTime(est) + '</span><br>target time for this set</div></div>' +
        '<div class="box ' + (ratio <= 1.1 ? 'good' : 'key') + '"><span class="tag">Pace</span>' + verdict + ' (The target adds up a reasonable time per question for the topics drawn: about ' + Math.round(est / K / 6) / 10 + ' min each on average.)</div>' +
        '<div class="res-wrap">' + rows + '</div>';
      var again = el('button', 'act', 'Take another quiz'); again.addEventListener('click', intro); host.appendChild(again);
    }
    intro();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.prob'), build);
    Array.prototype.forEach.call(document.querySelectorAll('.quiz'), buildQuiz);
    var r = document.querySelector('.reveal'); if (r && !r.querySelector('.toc-back') && window.Reveal) {
      var a = document.createElement('a'); a.className = 'toc-back hide'; a.href = '#/contents'; a.textContent = '≡ Contents'; r.appendChild(a);
      var upd = function () { var s = Reveal.getCurrentSlide(); a.classList.toggle('hide', !s || s.id === 'contents' || Reveal.getIndices().h === 0); };
      Reveal.on('slidechanged', upd); Reveal.on('ready', upd); upd();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
