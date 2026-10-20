#!/bin/bash
# Downloads weekly closes from Yahoo Finance's chart endpoint: raw_<KEY>.json (2y) and raw5_<KEY>.json (5y). Pulled 2026-10-20.
# Then: python3 make_window.py && python3 gen.py
# Weekly bars are dated by week start (Monday); the in-progress week is dropped in make_window.py.
for p in "TSLA:TSLA" "BTC:BTC-USD" "GOLD:GC%3DF" "SPX:%5EGSPC" "KZT:KZT%3DX"; do
  curl -s -A "Mozilla/5.0" "https://query1.finance.yahoo.com/v8/finance/chart/${p#*:}?range=2y&interval=1wk" -o raw_${p%%:*}.json
  curl -s -A "Mozilla/5.0" "https://query1.finance.yahoo.com/v8/finance/chart/${p#*:}?range=5y&interval=1wk" -o raw5_${p%%:*}.json
done
