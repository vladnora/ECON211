#!/usr/bin/env python3
"""Build blockS_slides.qmd and scripts.html from the js/ sources, then render with quarto."""
import subprocess, pathlib, sys

here = pathlib.Path(__file__).resolve().parent

slides = [
    ('stats1', 'Mean, median, mode, variance'), ('cov', 'Covariance and correlation'),
    ('ols3', 'OLS by hand: three points'), ('ols4', 'OLS by hand: four points'),
    ('best', 'Squares, first-order conditions, outliers'),
    ('interp', 'Interpreting a regression'), ('finite', 'Drawing without replacement'),
    ('popdist', 'The population is a distribution'), ('errors', 'Sampling error vs non-sampling error'),
    ('survive', 'Survivorship bias with numbers'), ('surv_ols', 'Regression on the survivors'),
    ('sizebias', 'Size-biased sampling'), ('hist2', 'Comparing two histograms'),
    ('hist1', 'Reading the shape of a histogram'), ('scat1', 'Scatter plots: sign and strength'),
    ('scat2', 'Scatter plots: lines and outliers'), ('tf', 'True or false'),
]
toc = [
    ('stats1', '1 · Statistics from data', 'Mean, median, mode, variance, covariance and correlation.'),
    ('ols3', '2 · Least squares', 'OLS by hand, squares vs absolute errors, first-order conditions, interpretation.'),
    ('finite', '3 · Random sampling', 'Draws with and without replacement, i.i.d., ex ante vs ex post.'),
    ('errors', '4 · When samples go wrong', 'Error types, survivorship bias, size-biased sampling.'),
    ('hist2', '5 · Reading graphs', 'Histograms and scatter plots: center, spread, shape, sign, outliers.'),
    ('tf', '6 · True or false', 'Quick concept checks.'),
    ('quiz', '7 · Timed quiz', 'Five random questions, a timer, answers at the end.'),
]

head = '''---
title: "Final Prep: Statistics"
subtitle: "ECON211 · Probability & Statistics · practice for Lecture 09 (Random Sampling)"
format:
  revealjs:
    theme: simple
    css: final_prep.css
    center: false
    slide-number: true
    embed-resources: true
    width: 1050
    height: 700
    margin: 0.05
    transition: fade
    transition-speed: fast
    chalkboard: false
    include-after-body: scripts.html
---

## How to use this deck {#howto}

::: {.cards .stack}
::: {.box}
<span class="tag">Practice slides</span>
Each slide is **one type of problem**. Press **New variant** to get a different version: not just new numbers, but a different structure (the variant pills show which one you have, and you can click them). Work it out on paper first.
:::
::: {.box .good}
<span class="tag">Solutions</span>
Press **Show solution** for the answers and a worked solution. It stays hidden until you ask.
:::
::: {.box .key}
<span class="tag">Quiz</span>
The last slide is a **timed quiz** of five random questions from these topics. Answers appear only after the last question, together with your time compared to a target.
:::
:::

'''

out = head + '## Contents {#contents}\n\n::: {.cards .stack .toc}\n'
for i, t, d in toc:
    out += '::: {.box}\n<a class="toc-hit" href="#/%s" title="Go to section"></a>\n<span class="tag">%s</span>\n%s\n:::\n' % (i, t, d)
out += ':::\n\n'
for i, t in slides:
    out += '## %s {#%s}\n\n<div class="prob" data-id="%s"></div>\n\n' % (t, i, i)
out += '## Timed quiz {#quiz}\n\n<div class="quiz"></div>\n'
(here / 'blockS_slides.qmd').write_text(out)

js = ''.join((here / 'js' / f).read_text() + '\n' for f in ['core.js', 'prob_stats.js', 'prob_samp.js', 'prob_graph.js', 'ui.js'])
(here / 'scripts.html').write_text('<script>\n' + js + '</script>\n')

# single-file page for headless self-tests
test = '<!doctype html><meta charset="utf-8"><pre id="o">running</pre><script>' + ''.join(
    (here / 'js' / f).read_text() + '\n' for f in ['core.js', 'prob_stats.js', 'prob_samp.js', 'prob_graph.js']) + (here / 'test_gen.js').read_text() + '</script>'
(here / 'test_inline.html').write_text(test)

if '--no-render' not in sys.argv:
    r = subprocess.run(['quarto', 'render', 'blockS_slides.qmd'], cwd=here, capture_output=True, text=True)
    print(r.stdout[-800:], r.stderr[-1500:])
