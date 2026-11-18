#!/usr/bin/env python3
"""Generic builder for an interactive practice deck.

Reads deck.json next to this file, writes <name>.qmd + scripts.html + test_inline.html,
and renders the deck with quarto (embed-resources, one self-contained HTML file).

deck.json:
{
  "name": "blockX_slides",                 # output file stem
  "title": "Final Prep: Topic",
  "subtitle": "ECON211 ... practice for Lecture NN",
  "css": "final_prep.css",
  "problem_files": ["prob_a.js", "prob_b.js"],   # in js/, loaded after core.js, before ui.js
  "slides": [["id", "Slide title (max ~40 chars)"], ...],   # ids must match P.reg ids, in slide order
  "toc": [["first_slide_id", "1 · Section", "one-line description"], ..., ["quiz", "N · Timed quiz", "..."]],
  "howto": true
}

Usage: python3 build.py [--no-render]
"""
import json, pathlib, subprocess, sys

here = pathlib.Path(__file__).resolve().parent
cfg = json.loads((here / 'deck.json').read_text())

HOWTO = '''## How to use this deck {#howto}

::: {.cards .stack}
::: {.box}
<span class="tag">Practice slides</span>
Each slide is **one type of problem**. Press **New variant** to get a different version: not just new numbers, but a different structure (the pills show which one you have, and you can click them). Work it out on paper first.
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

head = '''---
title: "%s"
subtitle: "%s"
format:
  revealjs:
    theme: simple
    css: %s
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

''' % (cfg['title'], cfg['subtitle'], cfg.get('css', 'final_prep.css'))

out = head + (HOWTO if cfg.get('howto', True) else '')
out += '## Contents {#contents}\n\n::: {.cards .stack .toc}\n'
for i, t, d in cfg['toc']:
    out += '::: {.box}\n<a class="toc-hit" href="#/%s" title="Go to section"></a>\n<span class="tag">%s</span>\n%s\n:::\n' % (i, t, d)
out += ':::\n\n'
for i, t in cfg['slides']:
    out += '## %s {#%s}\n\n<div class="prob" data-id="%s"></div>\n\n' % (t, i, i)
out += '## Timed quiz {#quiz}\n\n<div class="quiz"></div>\n'
(here / (cfg['name'] + '.qmd')).write_text(out)

files = ['core.js'] + cfg['problem_files']
js = ''.join((here / 'js' / f).read_text() + '\n' for f in files + ['ui.js'])
(here / 'scripts.html').write_text('<script>\n' + js + '</script>\n')

# single-file page for headless self-tests (no ui.js, no document-dependent code)
test = '<!doctype html><meta charset="utf-8"><pre id="o">running</pre><script>' + ''.join(
    (here / 'js' / f).read_text() + '\n' for f in files) + (here / 'test_gen.js').read_text() + '</script>'
(here / 'test_inline.html').write_text(test)

if '--no-render' not in sys.argv:
    r = subprocess.run(['quarto', 'render', cfg['name'] + '.qmd'], cwd=here, capture_output=True, text=True)
    print(r.stdout[-400:], r.stderr[-1200:])
