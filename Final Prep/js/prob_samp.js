/* Problem generators, part 2: random sampling, bias, size-biased sampling, true/false. */
(function () {
  'use strict';
  var P = globalThis.P, H = P.h;
  var ri = H.ri, pick = H.pick, F = H.F, fs = H.fs, fd = H.fd, fv = H.fv, mul = H.mul, sub = H.sub, add = H.add, div = H.div;
  var num = H.num, mc = H.mc, p = H.p, steps = H.steps, tbl = H.tbl, M = H.MINUS;
  function pr(f) { return fd(f, 4); }

  /* =========================================================== 8. finite population */
  P.reg('finite', {
    title: 'Drawing without replacement', section: 3, est: 120,
    topic: 'In a small population draws are dependent; in a large one they are almost independent.',
    variants: ['Two draws from a small group', 'Three draws, a committee', 'A large population'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var N = pick([10, 12, 14, 15]), g = ri(4, N - 4);
        var pg = F(g, N), p2 = F(g - 1, N - 1), both = mul(pg, p2), indep = mul(pg, pg);
        out.stmt = p('A group has <b>' + N + '</b> students, <b>' + g + '</b> of them girls. Two students are drawn at random, one after the other, <b>without replacement</b>.');
        out.parts = [
          num('P(the first student is a girl)', pg, 'Girls over total.'),
          num('P(the second is a girl | the first was a girl)', p2, 'One girl and one student are gone.'),
          num('P(both are girls)', both, 'Multiply the two probabilities.'),
          num('P(the second student is a girl), not knowing the first.', pg, 'By symmetry the second draw is as likely to be a girl as the first.'),
          num('If the draws were independent (with replacement), P(both are girls) would be?', indep, 'Square of P(girl).')
        ];
        out.sol = steps([
          'First draw: ' + g + '/' + N + ' = ' + fd(pg) + '.',
          'After a girl leaves: ' + (g - 1) + ' girls among ' + (N - 1) + ' students, so ' + fd(p2) + '. This differs from P(first girl): <b>the draws are dependent</b>.',
          'P(both) = ' + fs(pg) + ' · ' + fs(p2) + ' = <b>' + fd(both) + '</b>.',
          'Unconditionally, the second draw is equally likely to be any student, so P(second is a girl) = <b>' + fd(pg) + '</b>, the same as the first draw (although conditional on the first it differs).',
          'With independent draws: (' + fs(pg) + ')² = <b>' + fd(indep) + '</b>. The two answers differ because the population is small.'
        ]);
      } else if (v === 1) {
        var N2 = pick([8, 10, 12]), e = ri(4, N2 - 3);
        var a1 = F(e, N2), a2 = F(e - 1, N2 - 1), a3 = F(e - 2, N2 - 2), all3 = mul(mul(a1, a2), a3);
        var none = mul(mul(F(N2 - e, N2), F(N2 - e - 1, N2 - 1)), F(N2 - e - 2, N2 - 2));
        out.stmt = p('A club has <b>' + N2 + '</b> members, <b>' + e + '</b> of them economics majors. A committee of 3 is chosen at random, one member at a time, without replacement.');
        out.parts = [
          num('P(all three are economics majors)', all3, 'Multiply P(first) · P(second | first) · P(third | first two).'),
          num('P(none is an economics major)', none, 'Same idea with the non-econ members.'),
          num('P(the third is econ | the first two were econ)', a3, 'Two econs are gone.'),
          num('P(the third member chosen is econ), not knowing the first two.', a1, 'By symmetry it equals the first draw.')
        ];
        out.sol = steps([
          'P(all econ) = ' + e + '/' + N2 + ' · ' + (e - 1) + '/' + (N2 - 1) + ' · ' + (e - 2) + '/' + (N2 - 2) + ' = <b>' + fd(all3) + '</b>.',
          'P(none econ) = ' + (N2 - e) + '/' + N2 + ' · ' + (N2 - e - 1) + '/' + (N2 - 1) + ' · ' + (N2 - e - 2) + '/' + (N2 - 2) + ' = <b>' + fd(none) + '</b>.',
          'P(third econ | first two econ) = ' + (e - 2) + '/' + (N2 - 2) + ' = <b>' + fd(a3) + '</b>.',
          'Without information about the first two, every member is equally likely to be the third: ' + e + '/' + N2 + ' = <b>' + fd(a1) + '</b>.',
          'If the draws were independent, the first answer would be (' + fs(a1) + ')³ = ' + fd(mul(mul(a1, a1), a1)) + ' — not the same, because the population is small.'
        ]);
      } else {
        var cfg = pick([{ N: 1200, g: 700 }, { N: 5000, g: 2000 }, { N: 2000, g: 1200 }, { N: 120, g: 70 }]);
        var q1 = F(cfg.g, cfg.N), q2 = F(cfg.g - 1, cfg.N - 1), diffpp = mul(sub(q1, q2), F(100));
        out.stmt = p('A population of <b>' + cfg.N + '</b> people contains <b>' + cfg.g + '</b> who support a proposal. Two people are drawn at random without replacement.');
        out.parts = [
          num('P(first supports) as a decimal.', q1, 'Supporters over total.'),
          num('P(second supports | first supports) as a decimal.', q2, 'One supporter and one person are gone.'),
          num('By how many percentage points do the two probabilities differ? (first minus second)', diffpp, 'Subtract and multiply by 100.'),
          mc('Can we reasonably treat the two draws as independent here?', cfg.N <= 120 ? ['Not really: the population is small, the difference matters.', 'Yes: the probabilities are almost the same.'] : ['Yes: the probabilities are almost the same.', 'No: the draws are dependent, so every formula is wrong.'], cfg.N <= 120 ? 0 : 0, cfg.N <= 120 ? 'With N = 120 the gap is a few hundredths: still small, but visible; for N in the thousands it is negligible.' : 'The gap is negligible, so we treat the draws as independent.')
        ];
        out.sol = steps([
          'P(first) = ' + cfg.g + '/' + cfg.N + ' = ' + fd(q1, 4) + '.',
          'P(second | first) = ' + (cfg.g - 1) + '/' + (cfg.N - 1) + ' = ' + fd(q2, 4) + '.',
          'Difference = <b>' + dc(diffpp) + '</b> percentage points.',
          'When the population is large, one draw barely changes what is left. We call such a population effectively infinite and treat the draws as <b>independent</b> (i.i.d.). In a small group (N = 12) the gap is much larger.'
        ].map(function (s) { return s; }));
        if (cfg.N <= 120) { out.parts[3] = mc('Can we reasonably treat the two draws as independent here?', ['Roughly yes: the gap is small, though not zero.', 'No: the draws are strongly dependent.'], 0, 'The gap is about ' + dc(diffpp, 2) + ' pp.'); }
      }
      function dc(f, k) { return H.dc(f, k === undefined ? 3 : k); }
      return out;
    }
  });

  /* =========================================================== 9. population as a distribution */
  P.reg('popdist', {
    title: 'The population is a distribution', section: 3, est: 120,
    topic: 'i.i.d. draws, Bernoulli populations, ex ante vs ex post, and what breaks when sampling is not random.',
    variants: ['i.i.d. Bernoulli draws', 'A non-random sample', 'Random variable or number?'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var pp = pick([F(1, 10), F(1, 5), F(3, 10), F(2, 5), F(1, 4)]), q = sub(F(1), pp);
        var TR = pick([['own a car', 'owns a car'], ['have a part-time job', 'has a part-time job'], ['live off campus', 'lives off campus'], ['commute by bus', 'commutes by bus']]), trait = TR[0], traitS = TR[1];
        var three = mul(F(3), mul(pp, mul(q, q))), atl = sub(F(1), mul(q, mul(q, q)));
        out.stmt = p('<b>' + (fv(pp) * 100) + '%</b> of all students at a university ' + trait + '. We pick 3 students at random from the whole university. The university is so large that draws are independent. Let X<sub>i</sub> = 1 if the i-th student ' + traitS + ', and 0 otherwise.');
        out.parts = [
          num('Each Xᵢ is Bernoulli(p), meaning Xᵢ = 1 with probability p and Xᵢ = 0 otherwise. What is p?', pp, 'p is the population proportion.', { noquiz: true }),
          num('Find E[Xᵢ].', pp, 'For a Bernoulli variable, the mean is p.'),
          num('Find Var(Xᵢ).', mul(pp, q), 'Var = p(1 − p).'),
          num('Find the probability that exactly one of the 3 students ' + traitS + '.', three, 'Three ways to choose which one; independent draws.'),
          num('Find the probability that at least one of the 3 does.', atl, 'Use the complement: none.')
        ];
        out.sol = steps([
          'The population is a Bernoulli distribution: X = 1 with probability p = ' + fs(pp) + '. Because the draws are random from a very large population, X<sub>1</sub>, X<sub>2</sub>, X<sub>3</sub> are <b>i.i.d.</b>: independent, each with this distribution.',
          'E[X] = p = ' + fs(pp) + '; Var(X) = p(1−p) = ' + fs(pp) + '·' + fs(q) + ' = ' + fd(mul(pp, q)) + '.',
          'Exactly one: 3 · p · (1−p)² = 3·' + fs(pp) + '·(' + fs(q) + ')² = <b>' + fd(three) + '</b>.',
          'At least one: 1 − (1−p)³ = 1 − (' + fs(q) + ')³ = <b>' + fd(atl) + '</b>.'
        ]);
      } else if (v === 1) {
        var pt = pick([F(1, 5), F(3, 10), F(2, 5)]), qb = pick([F(9, 10), F(4, 5), F(3, 4)]);
        out.stmt = p('<b>' + (fv(pt) * 100) + '%</b> of all students at a university own a car. To estimate this proportion, a researcher picks 3 students <b>in the staff parking lot</b>, where <b>' + (fv(qb) * 100) + '%</b> of the students present own a car.');
        out.parts = [
          num('What is E[Xᵢ] for each student actually sampled?', qb, 'They come from the parking lot, not the university.'),
          mc('Are the Xᵢ draws from the population distribution?', ['No: the sample is not random.', 'Yes: any three students are a random sample.'], 0, 'Selection depends on the characteristic we study.'),
          num('If the researcher samples 1000 students this way, what value will the sample proportion be close to?', qb, 'The sample proportion settles near the proportion in the group that is actually sampled.'),
          mc('Does a larger sample fix the problem?', ['No: the error is not due to chance, and it does not shrink with n.', 'Yes: a large n removes any error.'], 0, 'More data from a biased process only gives a more precise wrong answer.')
        ];
        out.sol = steps([
          'A sample is random only if each member of the population has the same chance of selection and selection does not depend on the characteristic we study. Here owning a car makes a student more likely to be in the parking lot.',
          'The X<sub>i</sub> are Bernoulli(' + fs(qb) + '), <b>not</b> Bernoulli(' + fs(pt) + '). Every probability computed from the population distribution is wrong for this sample.',
          'As n grows, the sample proportion settles near ' + fs(qb) + ', not near ' + fs(pt) + '. This is <b>non-sampling error</b>: more data does not fix it.'
        ]);
      } else {
        var bank = [
          ['p, the true proportion of girls in the population', 'Number'],
          ['μ, the population mean', 'Number'],
          ['<span class="xbar">X</span>, the sample mean <i>before</i> the sample is drawn', 'Random variable'],
          ['<span class="xbar low">x</span> = 0.6, the sample mean <i>after</i> the sample is drawn', 'Number'],
          ['X₃, the third observation <i>before</i> sampling', 'Random variable'],
          ['x₃ = 1, the recorded third observation', 'Number'],
          ['s², the sample variance before the data are collected', 'Random variable']
        ];
        var items = H.sample(bank, 4);
        out.stmt = p('We take a random sample from a population. For each quantity say whether it is a <b>random variable</b> (not yet known, it varies from sample to sample) or a <b>number</b> (fixed).');
        out.parts = items.map(function (t) { return mc(t[0], ['Random variable', 'Number'], t[1] === 'Random variable' ? 0 : 1, 'Before the sample: random. After the sample, or for population parameters: fixed numbers.', true); });
        out.sol = steps(items.map(function (t) { return t[0] + ' → <b>' + t[1] + '</b>.'; }).concat(['We reason <b>ex ante</b>: before sampling, the observations X₁,…,Xₙ are random variables, and so is every statistic computed from them. After sampling they are numbers x₁,…,xₙ. Population parameters such as p or μ are always fixed numbers.']));
      }
      return out;
    }
  });

  /* =========================================================== 10. classify the error */
  var SC = [
    { t: 'An email survey about sleep is sent to all students at a university. Only <b>8%</b> reply.', pop: 'all students at the university', kind: 'Voluntary response / non-response', ns: true, dir: 'Unclear, but respondents are unrepresentative (typically people with strong views)' },
    { t: 'A <b>random</b> sample of 50 students has mean GPA 3.2; the true mean is 3.3.', pop: 'all students', kind: 'Sampling error (chance)', ns: false, dir: 'Could be either way (chance)' },
    { t: 'To estimate the average weekly exercise of adults, researchers survey members of a gym.', pop: 'all adults', kind: 'Selection bias', ns: true, dir: 'Overestimates' },
    { t: 'A database of mutual funds lists only funds that still exist today. The average past return is 11%.', pop: 'all funds that existed', kind: 'Survivorship bias', ns: true, dir: 'Overestimates' },
    { t: '"Old buildings were built better than new ones."', pop: 'all buildings from that era', kind: 'Survivorship bias', ns: true, dir: 'Overestimates the quality of old buildings' },
    { t: 'To estimate average study hours, a student interviews people leaving the library at 11 pm.', pop: 'all students', kind: 'Selection bias', ns: true, dir: 'Overestimates' },
    { t: 'A <b>random</b> sample of 400 voters finds 52% support a candidate; the true figure is 50%.', pop: 'all voters', kind: 'Sampling error (chance)', ns: false, dir: 'Could be either way (chance)' },
    { t: 'A phone survey calls only landline numbers to estimate how many hours per day people spend online.', pop: 'all people', kind: 'Coverage bias', ns: true, dir: 'Underestimates (landline users skew older)' },
    { t: 'Course satisfaction is measured with a form filled in by students who finished the course. Those who dropped out do not fill it in.', pop: 'all students who enrolled', kind: 'Survivorship bias', ns: true, dir: 'Overestimates satisfaction' },
    { t: 'To estimate the average number of children per family, a researcher asks randomly chosen <b>children</b> how many siblings they have, and adds 1.', pop: 'all families with at least one child', kind: 'Size bias', ns: true, dir: 'Overestimates (big families are over-represented)' },
    { t: 'A <b>random</b> sample of 30 students has mean height 171 cm; the true mean is 172 cm.', pop: 'all students', kind: 'Sampling error (chance)', ns: false, dir: 'Could be either way (chance)' },
    { t: 'An online poll about a TV show is open to anyone; viewers who love or hate it are the ones who vote.', pop: 'all viewers', kind: 'Voluntary response / non-response', ns: true, dir: 'Unclear, extreme opinions are over-represented' }
  ];
  var KINDS = ['Sampling error (chance)', 'Voluntary response / non-response', 'Selection bias', 'Survivorship bias', 'Coverage bias', 'Size bias'];
  P.reg('errors', {
    title: 'Sampling error vs non-sampling error', section: 4, est: 75,
    topic: 'Classifying problems with a sample: chance error, selection, survivorship, size bias.',
    variants: ['Classify one scenario', 'Name the bias', 'Which of two is flawed?'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var s = pick(SC);
        out.stmt = p(s.t);
        out.parts = [
          mc('What kind of error is the main issue?', ['Sampling error (due to chance)', 'Non-sampling error (the sample is not truly random)'], s.ns ? 1 : 0, s.ns ? 'The sample is not representative of the population.' : 'The sample is random; the gap is due to chance.', true),
          mc('Would a much larger sample (of the same kind) solve the problem?', ['Yes: the error shrinks as n grows.', 'No: more of the same data does not fix it.'], s.ns ? 1 : 0, s.ns ? 'Non-sampling error does not shrink with n.' : 'Sampling error shrinks as n grows.', true),
          mc('Which direction does the estimate lean?', ['It overestimates', 'It underestimates', 'No systematic direction (chance, or unclear)'], /^Overest/.test(s.dir) ? 0 : /^Underest/.test(s.dir) ? 1 : 2, s.dir + '.', true)
        ];
        out.sol = steps(['<b>Population:</b> ' + s.pop + '.', '<b>Diagnosis:</b> ' + s.kind + '. ' + (s.ns ? 'The way the data were collected makes the sample unrepresentative (non-sampling error).' : 'The sample is random: its statistic differs from the population value only by chance (sampling error).'), '<b>More data?</b> ' + (s.ns ? 'No. A bigger sample collected the same way is just as biased; the bias does not average out.' : 'Yes. Sampling error shrinks as n grows.'), '<b>Direction:</b> ' + s.dir + '.']);
      } else if (v === 1) {
        var s2 = pick(SC.filter(function (z) { return z.ns; }));
        out.stmt = p(s2.t);
        out.parts = [mc('Which problem does this scenario illustrate?', KINDS, KINDS.indexOf(s2.kind), s2.kind + '.', false)];
        out.sol = steps(['<b>' + s2.kind + '.</b> Population: ' + s2.pop + '.', 'Quick guide: <i>voluntary response</i> — only people who choose to answer; <i>selection bias</i> — the way people are found makes them atypical; <i>survivorship bias</i> — we only see the ones that made it; <i>coverage bias</i> — part of the population cannot be reached; <i>size bias</i> — big groups have more chances to be picked; <i>sampling error</i> — only chance.']);
      } else {
        var a = pick(SC.filter(function (z) { return z.ns; })), b = pick(SC.filter(function (z) { return !z.ns; })), first = Math.random() < .5;
        var A = first ? a : b, B = first ? b : a;
        out.stmt = p('<b>Scenario A.</b> ' + A.t) + p('<b>Scenario B.</b> ' + B.t);
        out.parts = [
          mc('Which scenario suffers from non-sampling error?', ['A', 'B', 'Both'], first ? 0 : 1, 'Only one has a non-random sample.', true),
          mc('In which scenario does a larger n help?', ['A', 'B', 'Both'], first ? 1 : 0, 'Sampling error shrinks with n; non-sampling error does not.', true)
        ];
        out.sol = steps(['A: ' + A.kind + ' → ' + (A.ns ? 'non-sampling' : 'sampling') + ' error.', 'B: ' + B.kind + ' → ' + (B.ns ? 'non-sampling' : 'sampling') + ' error.', 'Only the scenario with <b>sampling</b> error improves with a bigger sample.']);
      }
      return out;
    }
  });

  /* =========================================================== 11. survivorship */
  P.reg('survive', {
    title: 'Survivorship bias with numbers', section: 4, est: 180,
    topic: 'Compute what the surviving sample shows, compare with the full population, and decide what the survivors hide.',
    variants: ['Bombers', 'Mutual funds', 'Habits of successful firms'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var per = pick([100, 200]), names = H.sample(['engine', 'cockpit', 'fuselage', 'wings', 'tail', 'fuel tank'], 4);
        var sv = H.shuffle([F(1, 10), F(3, 10), F(4, 5), F(9, 10)]);
        var ret = sv.map(function (s) { return mul(s, F(per)); }), tot = H.sumF(ret);
        var minI = sv.reduce(function (b, s, i) { return fv(s) < fv(sv[b]) ? i : b; }, 0);
        out.stmt = p(4 * per + ' bombers each take exactly one hit, equally likely in each of four sections (' + per + ' planes per section). The probability that a plane <b>survives</b> a hit and returns depends on the section: ') +
          tbl(['Section'].concat(names), [['P(returns)'].concat(sv.map(function (s) { return fs(s); }))]) +
          p('Engineers study the planes that <b>returned</b> and count the sections with hits.');
        out.parts = [
          num('How many planes hit in the ' + names[minI] + ' return?', ret[minI], 'Hits × survival probability.'),
          num('How many planes return in total?', tot, 'Add the four sections.'),
          num('Among the returning planes, what fraction have their hit in the ' + names[minI] + '?', div(ret[minI], tot), 'Returned from that section over all that returned.'),
          mc('Which section most needs armor?', names, minI, 'The section where a hit is most likely to bring the plane down.', false),
          mc('What is the name of the bias if engineers simply armor the sections with the most holes?', ['Survivorship bias', 'Sampling error', 'Coverage bias'], 0, 'We only see planes that survived.')
        ];
        out.sol = steps([
          'Returning planes per section: ' + names.map(function (n, i) { return n + ' ' + per + '·' + fs(sv[i]) + ' = ' + fs(ret[i]); }).join('; ') + '.',
          'Total returning = ' + fs(tot) + ' out of ' + (4 * per) + '.',
          'Share of returning planes with a ' + names[minI] + ' hit = ' + fs(ret[minI]) + ' / ' + fs(tot) + ' = <b>' + fd(div(ret[minI], tot)) + '</b>, while overall it was 25% of all hits.',
          'Holes on returning planes are damage a plane can <b>survive</b>. The sections with few holes among returners are where a hit is fatal → armor the <b>' + names[minI] + '</b> first. This is <b>survivorship bias</b>: the planes that did not return are missing from the sample, and that is non-sampling error (more returning planes would not fix it).'
        ]);
      } else if (v === 1) {
        var w = pick([10, 20, 30]), keep = pick([F(1, 5), F(1, 10), F(2, 5)]), Wn = 50, Ln = 50;
        var surv = mul(keep, F(Ln)), dbN = add(F(Wn), surv);
        var dbSum = sub(mul(F(Wn), F(w)), mul(surv, F(w))), dbAvg = div(dbSum, dbN);
        out.stmt = p('A fund market starts with <b>100</b> funds. 50 funds earn <b>+' + w + '%</b> and 50 funds earn <b>−' + w + '%</b> in a year, so the true average return is 0. A fund that loses money is closed with probability <b>' + fs(sub(F(1), keep)) + '</b> and disappears from the database; winners always stay.') +
          p('A researcher computes the average return over funds <b>listed in the database</b> at the end of the year.');
        out.parts = [
          num('How many funds remain in the database?', dbN, 'All 50 winners plus the surviving losers.'),
          num('What is the average return in the database (in %)?', dbAvg, 'Weighted average of +' + w + ' and −' + w + '.'),
          num('By how many percentage points does it overstate the true average return of 0%?', dbAvg, 'The true value is 0.'),
          mc('Would adding more years of data from the same database remove the bias?', ['No: closed funds are always missing.', 'Yes: more data always corrects bias.'], 0, 'Missing losers is a non-sampling error.')
        ];
        out.sol = steps([
          'Losing funds that survive: ' + fs(keep) + ' × 50 = ' + fs(surv) + '. Funds in database: 50 + ' + fs(surv) + ' = <b>' + fs(dbN) + '</b>.',
          'Average = (50·(+' + w + ') + ' + fs(surv) + '·(−' + w + ')) / ' + fs(dbN) + ' = ' + fs(dbSum) + ' / ' + fs(dbN) + ' = <b>' + fd(dbAvg) + '</b>%.',
          'The database overstates by ' + fd(dbAvg) + ' percentage points, because most losers vanished.',
          'This is survivorship bias: the missing observations are not random, they are exactly the bad outcomes.'
        ]);
      } else {
        var cfgs = [
          { h: 80, n: 20, rh: F(1, 4), rn: F(1, 4), type: 'same' },
          { h: 60, n: 40, rh: F(1, 2), rn: F(1, 2), type: 'same' },
          { h: 90, n: 10, rh: F(1, 2), rn: F(1, 2), type: 'same' },
          { h: 80, n: 20, rh: F(1, 4), rn: F(1, 2), type: 'worse' }];
        var c = pick(cfgs), sh = mul(F(c.h), c.rh), sn = mul(F(c.n), c.rn), totS = add(sh, sn);
        out.stmt = p('A business book studies <b>successful firms</b> (those still in business after 10 years) and reports: "most of them follow Habit X". The full picture of 100 firms that started:') +
          tbl(['', 'Firms', 'Survived after 10 years'], [['Followed Habit X', c.h, fs(sh)], ['Did not follow it', c.n, fs(sn)]]);
        out.parts = [
          num('What share of the surviving firms followed Habit X?', div(sh, totS), 'Survivors with the habit over all survivors.'),
          num('P(survive | followed Habit X)', c.rh, 'Survivors with the habit over firms with the habit.'),
          num('P(survive | did not follow Habit X)', c.rn, 'Same for the other group.'),
          mc('What do the numbers say about Habit X?', c.type === 'same' ? ['It has no effect on survival here, even though most survivors follow it.', 'It clearly helps survival.', 'It clearly hurts survival.'] : ['It hurts survival here, even though most survivors follow it.', 'It clearly helps survival.', 'It has no effect.'], 0, 'Compare survival rates in the two groups, not the composition of survivors.')
        ];
        out.sol = steps([
          'Survivors with the habit: ' + fs(sh) + ', without: ' + fs(sn) + '; total ' + fs(totS) + '. Share with the habit = ' + fs(sh) + '/' + fs(totS) + ' = <b>' + fd(div(sh, totS)) + '</b>.',
          'P(survive | habit) = ' + fs(sh) + '/' + c.h + ' = <b>' + fd(c.rh) + '</b>; P(survive | no habit) = ' + fs(sn) + '/' + c.n + ' = <b>' + fd(c.rn) + '</b>.',
          c.type === 'same' ? 'The survival rates are equal, so the habit makes no difference. Survivors mostly have the habit simply because <b>most firms</b> have it.' : 'The habit is followed by most firms (' + c.h + '%), so survivors mostly have it, yet the survival rate with the habit (' + fd(c.rh) + ') is lower than without (' + fd(c.rn) + ').',
          'Looking at survivors only hides the failed firms. To judge a habit we must compare <b>success rates</b> across the full group, failures included. This is survivorship bias.'
        ]);
      }
      return out;
    }
  });

  /* =========================================================== 12. regression on survivors */
  P.reg('surv_ols', {
    title: 'Regression on the survivors', section: 4, est: 210,
    topic: 'What happens to the OLS slope when observations are dropped because of their outcome.',
    variants: ['Low outcomes disappear', 'Only moderate outcomes are observed', 'Admitted applicants only (graph)'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v <= 1) {
        var x = [1, 2, 3, 4, 5], y, full, kept, ok = false, tries = 0, ko;
        while (!ok && tries++ < 4000) {
          y = x.map(function (t) { return ri(1, 10); });
          full = H.ols(x, y);
          var idx = y.map(function (_, i) { return i; }).sort(function (a, b) { return y[a] - y[b]; });
          var drop = v === 0 ? [idx[0]] : [idx[0], idx[4]];
          if (new Set(y).size < 4) continue;
          kept = x.map(function (_, i) { return i; }).filter(function (i) { return drop.indexOf(i) < 0; });
          var xs = kept.map(function (i) { return x[i]; }), ys = kept.map(function (i) { return y[i]; });
          ko = H.ols(xs, ys); out.kept = { xs: xs, ys: ys, drop: drop };
          ok = fv(full.b1) > .5 && fv(ko.b1) < fv(full.b1) - .2 && fv(ko.b1) > -.2 && (v === 1 ? true : y[idx[0]] < y[idx[1]]);
        }
        var dr = out.kept.drop, xs2 = out.kept.xs, ys2 = out.kept.ys;
        var story = pick([['startups', 'founder’s years of experience', 'profit after 3 years ($M)', 'shut down'], ['firms', 'R&D spending ($M)', 'sales growth (%)', 'closed']]);
        out.stmt = p('Five ' + story[0] + ' with <b>x</b> = ' + story[1] + ' and <b>y</b> = ' + story[2] + ':') + tbl(['x'].concat(x), [['y'].concat(y)]) +
          (v === 0 ? p('The ' + story[0].replace(/s$/, '') + ' with the <b>lowest y</b> (x = ' + x[dr[0]] + ', y = ' + y[dr[0]] + ') ' + story[3] + ' and will not appear in a later dataset.') :
            p('A later dataset only contains ' + story[0] + ' with intermediate outcomes: the ones with the <b>lowest and the highest y</b> (x = ' + x[dr[0]] + ', y = ' + y[dr[0]] + ' and x = ' + x[dr[1]] + ', y = ' + y[dr[1]] + ') are not recorded (for example, the best ones were bought out and the worst ' + story[3] + ').'));
        out.parts = [
          num('Find the OLS slope b₁ (in the line ŷ = b₀ + b₁x) using all five observations.', full.b1, 'Slope = Σ(x−<span class="xbar low">x</span>)(y−ȳ)/Σ(x−<span class="xbar low">x</span>)².'),
          num('Find the OLS slope b₁ using only the observations that remain in the later dataset.', ko.b1, 'Recompute with ' + xs2.length + ' observations.'),
          mc('Compared with the full-data slope, the slope from the remaining data is:', ['smaller (flatter)', 'larger (steeper)', 'the same'], 0, 'Removing extreme outcomes flattens the relationship.', true),
          mc('What causes the difference?', ['Survivorship / selection on the outcome: the dropped observations are not random.', 'Sampling error only.', 'A mistake in the formula.'], 0, 'The observations were dropped because of their y values.')
        ];
        out.sol = H.olsSol(x, y, full) + steps(['<b>Remaining data:</b> ' + xs2.map(function (t, i) { return '(' + t + ', ' + ys2[i] + ')'; }).join(', ') + '. <span class="xbar low">x</span> = ' + fd(ko.xb) + ', ȳ = ' + fd(ko.yb) + ', Σ(x−<span class="xbar low">x</span>)(y−ȳ) = ' + fs(ko.Sxy) + ', Σ(x−<span class="xbar low">x</span>)² = ' + fs(ko.Sxx) + ' → slope <b>' + fd(ko.b1) + '</b>.',
          'The slope fell from ' + fd(full.b1, 2) + ' to ' + fd(ko.b1, 2) + '. The dropped points were extreme outcomes that anchored the relationship; selection on the outcome flattens the line. This is <b>non-sampling error</b>: the data we see are not representative of the original population.']);
        out.meta = { full: fv(full.b1), kept: fv(ko.b1) };
      } else {
        var n = 60, xz = H.zvec(n), yz = H.zvec(n, [xz]);
        var X = xz.map(function (t) { return 50 + 15 * t; }), Y = yz.map(function (t) { return 50 + 15 * t; });
        var c0 = pick([95, 100, 105]), adm = X.map(function (_, i) { return X[i] + Y[i] > c0; });
        var ptsA = X.map(function (_, i) { return [X[i], Y[i]]; }), ptsB = ptsA.filter(function (_, i) { return adm[i]; });
        var rB = H.fcorr(ptsB.map(function (q) { return q[0]; }), ptsB.map(function (q) { return q[1]; }));
        if (rB > -.3) return P.G.surv_ols.gen(2);
        var cols = ptsA.map(function (_, i) { return adm[i] ? '#2f855a' : '#bcc6d1'; });
        var xr = [0, 100], yr = [0, 100], grid = [20, 20];
        var f1 = H.scatter(ptsA, { xr: xr, yr: yr, grid: grid, title: 'All applicants', xlabel: 'test score', ylabel: 'interview score', colors: cols, w: 340, h: 280 });
        var f2 = H.scatter(ptsB, { xr: xr, yr: yr, grid: grid, title: 'Admitted only', xlabel: 'test score', ylabel: 'interview score', colors: ptsB.map(function () { return '#2f855a'; }), w: 340, h: 280 });
        out.stmt = p('Among 60 applicants, test score x and interview score y are <b>unrelated</b> (left panel). A university admits only applicants with <b>x + y above ' + c0 + '</b> (green points). The right panel shows what the admissions office sees.') + H.row(f1, f2);
        out.parts = [
          mc('What is the correlation between x and y among all applicants?', ['About 0', 'Strongly positive', 'Strongly negative'], 0, 'No relationship was built into the applicants.', true),
          mc('What do we see among admitted applicants?', ['A negative relationship', 'A positive relationship', 'Still no relationship'], 0, 'With x + y above a cutoff, a low x must be compensated by a high y.', true),
          mc('Name the problem.', ['Selection (survivorship) bias', 'Sampling error', 'Coverage bias'], 0, 'The sample is selected on a combination of the two variables.')
        ];
        out.sol = steps(['Among all applicants the two scores are independent, so the correlation is about 0 and the OLS slope is about 0.', 'The admitted points are those above the line x + y = ' + c0 + '. A student with a low test score gets in only with a high interview score, and vice versa. Among the admitted, the sample correlation is ' + H.dc(F(Math.round(rB * 100), 100), 2) + ': negative.', 'This is <b>selection bias</b>, a form of survivorship bias: the observed sample is selected on the variables of interest, so a regression on admitted students would suggest a relationship that does not exist in the population.']);
      }
      return out;
    }
  });

  /* =========================================================== 13. size-biased */
  P.reg('sizebias', {
    title: 'Size-biased sampling', section: 4, est: 180,
    topic: 'Picking people instead of groups over-represents big groups: children per family, class size, friends of friends.',
    variants: ['Children per family', 'Class size', 'Friendship paradox'],
    gen: function (v) {
      var out = { stmt: '', parts: [], sol: '' };
      if (v === 0) {
        var cfg = pick([[50, 25, 25], [40, 40, 20], [60, 20, 20], [50, 30, 20]]), ks = pick([[1, 2, 4], [1, 2, 3], [1, 3, 4]]);
        var fam = cfg.map(function (f, i) { return F(f); }), nfam = F(100);
        var trueM = H.sumF(cfg.map(function (f, i) { return F(f * ks[i], 100); }));
        var kids = cfg.map(function (f, i) { return f * ks[i]; }), totKids = kids.reduce(function (a, b) { return a + b; }, 0);
        var shares = kids.map(function (k) { return F(k, totKids); });
        var naive = H.sumF(shares.map(function (s, i) { return mul(s, F(ks[i])); }));
        var smp = [0, ks[1] - 1, ks[2] - 1, 0]; var kk = smp.map(function (s) { return s + 1; });
        var corr = div(F(1), div(H.sumF(kk.map(function (k) { return F(1, k); })), F(4)));
        var naiveSmp = H.mean(kk);
        out.stmt = p('Among 100 families with children: ' + ks.map(function (k, i) { return '<b>' + cfg[i] + '</b> families have ' + k + ' child' + (k > 1 ? 'ren' : ''); }).join(', ') + '.');
        out.parts = [
          num('What is the true average number of children per family?', trueM, 'Weight each family size by the share of families.'),
          num('You choose a child at random. What is the probability that the child comes from a family with ' + ks[2] + ' children?', shares[2], 'Number of children in such families over all children.'),
          num('Now you pick children at random and ask each: “How many children are there in your family?” (that is, siblings + 1). What is the average answer?', naive, 'Weight each family size by the share of children.'),
          num('Four randomly chosen students report siblings ' + smp.join(', ') + '. For each student compute k = siblings + 1 (the number of children in the family), average the values 1/k over the four students, and take the reciprocal of that average. What do you get? (This corrects for big families being over-represented.)', corr, 'Compute k = siblings + 1, then the average of 1/k, then invert.'),
          mc('Why is the answer to part (c) larger than the true average in part (a)?', ['Big families have more children, so they are more likely to be picked.', 'Small families are lost.', 'Sampling error.'], 0, 'A family with k children has k chances to be picked.')
        ];
        out.sol = steps([
          'True average = ' + ks.map(function (k, i) { return k + '·' + cfg[i] + '%'; }).join(' + ') + ' = <b>' + fd(trueM) + '</b>.',
          'Children: ' + ks.map(function (k, i) { return k + '·' + cfg[i] + ' = ' + kids[i]; }).join(', ') + ' (total ' + totKids + '). A random child belongs to a ' + ks[2] + '-child family with probability ' + kids[2] + '/' + totKids + ' = <b>' + fd(shares[2]) + '</b>.',
          'Average reported = ' + ks.map(function (k, i) { return fs(shares[i]) + '·' + k; }).join(' + ') + ' = <b>' + fd(naive) + '</b>, above the true ' + fd(trueM) + '.',
          'k = ' + kk.join(', ') + ' → 1/k = ' + kk.map(function (k) { return '1/' + k; }).join(', ') + ', mean(1/k) = ' + fs(div(H.sumF(kk.map(function (k) { return F(1, k); })), F(4))) + ', so the estimate is <b>' + fd(corr) + '</b>. The naive average of k is ' + fd(naiveSmp) + '.',
          'A random sample of people is not a random sample of families: a family with k children is picked with probability proportional to k. The correction weights each person by 1/k. Note also that the survey can never reach <b>families without children</b>.'
        ]);
      } else if (v === 1) {
        var cs = pick([[10, 10, 100], [20, 20, 20, 100], [15, 15, 30, 120], [10, 30, 30, 80]]);
        var reg = H.mean(cs), tot = cs.reduce(function (a, b) { return a + b; }, 0), stud = F(cs.reduce(function (a, b) { return a + b * b; }, 0), tot);
        out.stmt = p('A department offers ' + cs.length + ' classes with enrolments <b>' + cs.join(', ') + '</b> students.');
        out.parts = [
          num('What is the average class size (the registrar’s number)?', reg, 'Add and divide by the number of classes.'),
          num('Choose a student at random and ask the size of their class. What is the average answer?', stud, 'Weight each class size by its share of students.'),
          mc('Which is larger, and why?', ['The student’s average: big classes contain more students.', 'The registrar’s average: it counts every class.', 'They are equal.'], 0, 'Size-biased sampling.')
        ];
        out.sol = steps(['Registrar: (' + cs.join(' + ') + ')/' + cs.length + ' = <b>' + fd(reg) + '</b>.', 'There are ' + tot + ' students in total. A random student is in a class of size s with probability s/' + tot + '. Average = Σ s·(s/' + tot + ') = ' + cs.map(function (s) { return s + '²'; }).join(' + ') + ' over ' + tot + ' = <b>' + fd(stud) + '</b>.', 'The student’s average is larger: students are more likely to be in big classes. This is the same logic as children per family: picking <b>people</b> over-represents <b>big groups</b>.']);
      } else {
        var star = Math.random() < .5, nn = star ? ri(4, 6) : pick([5, 6]);
        var deg = [], adj = [];
        if (star) { deg = [nn].concat(Array(nn).fill(1)); for (var i = 0; i <= nn; i++) adj.push(i === 0 ? Array.from({ length: nn }, function (_, k) { return k + 1; }) : [0]); }
        else { for (var j = 0; j < nn; j++) { var a = []; if (j > 0) a.push(j - 1); if (j < nn - 1) a.push(j + 1); adj.push(a); } deg = adj.map(function (a) { return a.length; }); }
        var N = deg.length, sumd = deg.reduce(function (a, b) { return a + b; }, 0), sumd2 = deg.reduce(function (a, b) { return a + b * b; }, 0);
        var avgDeg = F(sumd, N), friendAvg = F(sumd2, sumd);
        var cnt = adj.filter(function (a, i) { var fa = a.reduce(function (s, k) { return s + deg[k]; }, 0) / a.length; return fa > deg[i] + 1e-9; }).length;
        out.stmt = p(star ? 'A social network has one popular person (the hub) who is friends with <b>' + nn + '</b> others; each of those has only the hub as a friend.' : 'A network of <b>' + nn + '</b> people stands in a line: each person is friends with the neighbours next to them (the two at the ends have one friend, the others have two).') +
          p('The number of friends of a person is their <b>degree</b>.');
        out.parts = [
          num('What is the average number of friends per person?', avgDeg, 'Add the degrees and divide by the number of people.'),
          num('Pick one friendship (a pair of friends) at random, and then pick one of the two people in that pair at random. On average, how many friends does the person you picked have?', friendAvg, 'Sum of d² divided by sum of d.'),
          num('Take one person at a time and compute the average number of friends that <i>their friends</i> have. For how many people is this average strictly greater than their own number of friends?', F(cnt), 'Check each person.'),
          mc('Why is the average friend’s degree larger than the average degree?', ['A person with d friends appears in d friend lists, so popular people are over-represented.', 'Friends tend to be wealthier.', 'It is just chance.'], 0, 'Size-biased sampling again.')
        ];
        out.sol = steps(['Degrees: ' + deg.join(', ') + '. Sum = ' + sumd + ', N = ' + N + ', average = <b>' + fd(avgDeg) + '</b>.', 'Picking a friendship and then one of its two people selects a person with probability proportional to their degree d (they are one of the two ends of d friendships), so the expected number of friends = Σd²/Σd = ' + sumd2 + '/' + sumd + ' = <b>' + fd(friendAvg) + '</b>.', 'Person by person: ' + adj.map(function (a, i) { var fa = a.reduce(function (s, k) { return s + deg[k]; }, 0) / a.length; return 'own ' + deg[i] + ', friends avg ' + (Math.round(fa * 100) / 100); }).join('; ') + '. People whose friends average more than themselves: <b>' + cnt + '</b>.', 'Friends are picked <b>in proportion to their number of friends</b> (size-biased sampling), so on average your friends have more friends than you do.']);
      }
      return out;
    }
  });

  /* =========================================================== T/F */
  var TF1 = [
    ['The OLS line always passes through the point (<span class="xbar low">x</span>, ȳ).', true, 'b₀ = ȳ − b₁<span class="xbar low">x</span> guarantees it.'],
    ['When the model has an intercept, OLS residuals always add up to zero.', true, 'It is the first-order condition for b₀.'],
    ['Correlation changes if we measure x in different units (for example cm instead of m).', false, 'Correlation is unit-free.'],
    ['Covariance changes if we measure x in different units.', true, 'Covariance scales with the units.'],
    ['The OLS slope is zero exactly when the sample covariance is zero.', true, 'b₁ = s_xy / s_x².'],
    ['OLS chooses the line with the smallest sum of absolute residuals.', false, 'It minimizes the sum of squared residuals.'],
    ['In the formula for the sample variance we divide by n − 1.', true, 'And this is a better estimate of σ² than dividing by n.'],
    ['A single large outlier can change the mean much more than the median.', true, 'The median depends only on the order.'],
    ['A regression slope of 4.5 proves that one more hour of study causes 4.5 more points.', false, 'It shows association; confounding is possible.'],
    ['If we add a constant to every observation, the variance changes.', false, 'Variance measures spread, which does not change.'],
    ['If every observation is multiplied by 3, the variance is multiplied by 9.', true, 'Variance scales with the square.']
  ];
  var TF2 = [
    ['A larger voluntary-response sample removes non-sampling error.', false, 'More data of the same kind keeps the same bias.'],
    ['In a small finite population, draws without replacement are independent.', false, 'Each draw changes what is left.'],
    ['The sample mean is a random variable before the sample is taken.', true, 'It depends on which observations we get.'],
    ['Sampling error shrinks as the sample size grows.', true, 'Chance error averages out.'],
    ['If we pick people at random, we get a random sample of families.', false, 'Large families are over-represented (size bias).'],
    ['The units in a random sample are i.i.d. draws from the population distribution.', true, 'That is exactly why randomness matters.'],
    ['The places with no holes on returning bombers are the vulnerable ones.', true, 'Planes hit there did not return.'],
    ['On average your friends have more friends than you do.', true, 'Friends are picked in proportion to their degree.'],
    ['A non-random sample can be fixed by simply collecting many more observations in the same way.', false, 'Non-sampling error does not shrink with n.'],
    ['Studying only successful companies tells us what causes success.', false, 'Failed companies with the same habits are missing (survivorship bias).'],
    ['A random sample must be representative in every single draw.', false, 'Random sampling guarantees fair chances, not a perfect sample.']
  ];
  P.reg('tf', {
    title: 'True or false', section: 6, est: 40,
    topic: 'Quick concept checks.',
    variants: ['Data and OLS', 'Sampling and bias'],
    gen: function (v) {
      var bank = v === 0 ? TF1 : TF2, items = H.sample(bank, 5);
      return {
        stmt: p('Decide whether each statement is true or false.'),
        parts: items.map(function (t) { return mc(t[0], ['True', 'False'], t[1] ? 0 : 1, t[2], true); }),
        sol: steps(items.map(function (t) { return t[0] + ' → <b>' + (t[1] ? 'True' : 'False') + '</b>. ' + t[2]; }))
      };
    }
  });
})();
