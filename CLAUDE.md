# slides/ — PUBLIC repo (github.com/vladnora/ECON211)

Everything committed here is public via GitHub Pages (`docs/`). Nothing private belongs in this folder: no exams, keys, bank, grades, rosters, survey/feedback data, per-student numbers. `.gitignore` is an allowlist; do not widen it. Push only via `../tools/publish.sh slides`.

## Build
- Lectures: `NN_name/*.qmd`; `master.qmd` includes modules into one continuous reference page. Web decks are wrappers (e.g. `slides/lecture_slides_web.qmd`, the inner `slides/` folder) that `{{< include ../NN_name/x.qmd >}}`.
- Rendered output for publishing goes to `docs/`; add a card to `docs/index.html`. Commit sources, not generated files.
- Practice decks: `Final Prep/` (see the `practice-deck` skill at the project root).

## Quarto / reveal.js gotchas
- Slide headers are `##`; never a stray `---` (breaks Pandoc YAML parsing).
- `{{< include >}}` runs before Pandoc; disable with a fenced raw block of unknown format (```` ```{=comment} ````), not HTML comments.
- `chalkboard: true` and `embed-resources: true` are mutually exclusive: class wrapper (chalkboard) vs web wrapper (embed).
- `$x$` does not render inside raw HTML blocks; use `<em>x</em>`.
- Callouts: `callout-note` definitions; `callout-tip title="Example N"` worked examples (numbered course-wide); `callout-caution` practice; `callout-important` big ideas; `callout-warning` strategy tips. PMFs as stem-and-dot plots.
- Widgets: vanilla JS in IIFEs; prefix every ID/class per widget; literal hex colors; seeded RNG (mulberry32); start blank; run `node --check` where node exists (it does not on this machine: use the preview server and the built-in browser, see the skill).
- Keep Python verification out of render chunks. If the Apple Silicon `rpds-py` kernel error appears: `execute: enabled: false`, or a clean venv via `QUARTO_PYTHON`.
- Style: board-first teaching; slides only for demonstrations/simulations. Every probability claim verified exactly (fractions) and by enumeration/Monte Carlo before it goes in.
