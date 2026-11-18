# Generator contract

Each problem type is registered once:

```js
P.reg('ols3', {
  title: 'OLS by hand: three points',        // slide title and quiz label
  section: 2,                                 // for your own grouping
  est: 210,                                   // seconds a good student needs (quiz target time)
  topic: 'One sentence shown under the slide title.',
  variants: ['Deviation formulas', 'Normal equations from sums', 'Story with prediction'],
  note: true,                                 // optional: append H.NOTE (notation box) to every statement
  gen: function (v) {                         // v = variant index
    var out = { stmt: '<p>...</p>', parts: [...], sol: '<ol class="steps">...</ol>' };
    out.meta = { x: x, y: y, b0: ..., b1: ... };   // optional, lets test_gen.js cross-check OLS
    return out;
  }
});
```

## Parts

- Numeric: `H.num(promptHtml, fraction, shortExplanation, { noquiz: true })`. The answer is an exact fraction `H.F(n, d)`; the display adds a decimal automatically.
- Multiple choice: `H.mc(prompt, options, correctIndex, explanation, fixedOrder)`; shuffled unless `fixedOrder` is true. `H.AB(prompt, 'A'|'B'|'Equal', explanation)` for two-figure comparisons.
- A part needs a `num` or `opts` to be used in the quiz; the quiz shows `stmt` plus that one part, so each part must read correctly on its own.

## Helpers (`P.h`)

`ri`, `pick`, `shuffle`, `sample`; fractions `F add sub mul div fv fs fd neg absF`; stats `mean ss sxy median modes ols lineStats`; histograms `normCounts hstats roundTo hist`; scatter `zvec scatter fcorr fslope`; HTML `tbl steps p row`; `H.olsSol(x, y, o)` returns a standard worked OLS solution.

## Design patterns that worked

- Choose data with nice answers by rejection sampling inside the generator (`do { ... } while (!condition)`), with a guard counter on any loop that might not terminate. An unguarded loop freezes the browser tab.
- For scatter plots with a prescribed fit, build `x` and a noise vector orthogonal to `{1, x}` (`H.zvec(n, [u])`) so the OLS line is exactly the intended one.
- For histograms, use `normCounts`/gamma weights with largest-remainder rounding; derive "which is larger" answers from `hstats` with a tolerance, and make "Equal" cases exact by symmetry or identical shape.
- For comparisons ("slope after dropping the outlier is smaller"), compute both sides in the generator and reject draws where the claim is not clearly true.
- Solutions: numbered steps, each naming the formula or fact used; include the data table for OLS.

## Self-test (`test_gen.js`)

Runs every variant `n` times (URL `?n=300`) and fails on: missing fields, `NaN`/`undefined` in text, non-finite numbers, duplicate or inconsistent MC options, parts without answers, OLS meta mismatches. Output: one line per problem and `ALL OK`.
