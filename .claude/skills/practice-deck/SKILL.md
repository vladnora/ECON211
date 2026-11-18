---
name: practice-deck
description: Build an interactive ECON211 practice deck (reveal.js, one self-contained HTML) for a lecture block: one problem type per slide, a "New variant" button with structurally different variants, an on-demand worked solution, and a timed 5-question quiz. Use when the professor asks for practice problems, a final-prep block, or a problem set for a lecture or topic, to be posted on GitHub. Not for graded exams (use econ211-exams).
---

# Practice deck builder

Reusable engine plus a fixed process. The engine is in `assets/`; the problems are written fresh for every lecture. The first deck built with this (Block S, Statistics, Lecture 09) lives in `Final Prep/`; `assets/js/example_problems.js` is a worked example of the generator style.

## Process (do not skip the chat stage)

1. **Frame.** Read the lecture's slides (`NN_name/*_slides.qmd`) and strip code/script/svg blocks to see the actual content. Then ask once: which topics, which to exclude, preferred problem types (computation by hand, interpretation, word problems about collection methods/bias, reading graphs), whether the quiz should cover everything. Offer defaults. Note the exact notation the lecture uses.
2. **Draft in chat.** Post the proposed problem list: ID, topic, sub-variants, parts, short answer key. Keep numbers small enough for no-calculator work. Let the professor cut and edit item by item ("drop D and E", "drop completely"). Apply every edit before writing code; do not renumber until build.
3. **Write generators** in `Final Prep/js/prob_<topic>.js` (see `references/generator_contract.md`). Copy `assets/` into the new block folder first (`js/core.js`, `js/ui.js`, `final_prep.css`, `test_gen.js`, `build.py`, `deck.json`).
4. **Verify by code.** Exact fractions for every numeric answer. Run the headless self-test (below) with several hundred draws per variant. Add independent checks for anything not trivially exact (e.g. compare OLS against a float implementation, check that a claimed "slope is smaller" is true in every draw).
5. **Build and look.** `python3 build.py`, open the deck, step through each slide: new variant, solution, figures, quiz run-through to the results screen.
6. **Wording pass.** Dump one instance of every variant as plain text and reread each question as a student would (see rules). Fix, rebuild, rerun the self-test.
7. **Publish only after approval.** Copy the rendered HTML to `docs/<Name>.html`, add a card to `docs/index.html`, commit sources (not generated files), push when told to.

## Running things without Node

There is no `node` on this machine. Serve the block folder with `mcp__Claude_Browser__preview_start` (needs `.claude/launch.json`; template in `assets/launch.json`, serving `python3 -m http.server 8765 --directory "Final Prep"`), then open `test_inline.html?n=300` in the built-in browser and read `#o` with `javascript_tool` (slice the text; long output is saved to a file). `file://` pages render as inert snapshots, so scripts do not run there. Do not start servers from Bash. Never launch the Claude app binary to get a Node runtime.

## Rules that came out of review

- **Self-sufficient wording.** Every question must be answerable from its own text. Define notation where it first appears (ŷ, residual = observed y minus predicted ŷ, s_xy, r, Bernoulli(p)). Do not use symbols the lecture did not use (the letter e for residuals was rejected). Say what to compute, not just a symbol ("add up the four residuals", not "Σe").
- **Variants differ in structure, not only numbers.** Different data structure (list vs frequency table), different method (deviation formula vs normal equations), different context type (bombers vs funds vs firms), different figure. Pills name the variant.
- **No trend line when the question is about how a line moves.** Describe the OLS line in words; draw lines only when the task is to read one.
- **Figures must show the answer by eye.** Choose parameters so differences are obvious (reject draws in ambiguous bands). Same axes for compared plots.
- **Fix wrong or mismatched questions, not the key.** If wording and answer disagree, rewrite the question to match the intended concept.
- **Keep removed items removed.** When the professor drops a problem, delete its generator, slide and contents entry.
- **Quiz parts.** Mark trivial or zero-valued parts `noquiz: true`. Each quizzable part must be self-contained (stem + part text suffice).
- **Concise slides.** Slide titles at most about 40 characters; the deck CSS forces one line.
- Notation and course conventions: see the `econ211-exams` skill's `references/notation.md` if available.

## Files in `assets/`

| File | Role |
|---|---|
| `js/core.js` | random helpers, exact fractions, stats (`mean`, `ss`, `sxy`, `median`, `modes`, `ols`, `lineStats`), `hist`/`scatter` SVG builders, `num`/`mc`/`AB` part builders, `P.reg` registry (supports `note: true` to append `H.NOTE`) |
| `js/ui.js` | practice slides (chips, New variant, Show solution) and the timed quiz (timer, results, target time from each problem's `est` seconds) |
| `js/example_problems.js` | worked examples of generators (needs an `H.NOTE`; keep or replace) |
| `final_prep.css` | deck look shared with the lecture decks, plus practice and quiz styling |
| `test_gen.js` | self-test run in a browser page |
| `build.py`, `deck.json` | generic builder; edit `deck.json` per block |
| `launch.json` | preview-server config; copy to `.claude/launch.json` and change `--directory` to the block folder |

Copy `assets/*` to the new block folder, rename `example_problems.js` or write a new `prob_<topic>.js`, edit `deck.json`, then `python3 build.py` (add `--no-render` to only refresh `test_inline.html`).
