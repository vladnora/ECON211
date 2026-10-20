# raw_*.json (2y) -> win.json: last 50 complete weekly closes (40 history + 10 game rounds), ending week of 2026-10-12
# raw5_*.json (5y) -> long.json: last 261 complete weekly closes (260 weekly returns) for the histogram/stationarity slide
import json,datetime
for pre,n,outf in [('raw',50,'win.json'),('raw5',261,'long.json')]:
    out={}
    for k in ['TSLA','BTC','GOLD','SPX','KZT']:
        res=json.load(open(f'{pre}_{k}.json'))['chart']['result'][0]
        rows=[(datetime.date.fromtimestamp(t).isoformat(),v) for t,v in zip(res['timestamp'],res['indicators']['quote'][0]['close']) if v is not None]
        out[k]=[r for r in rows if r[0]<'2026-10-19'][-n:]
    json.dump(out,open(outf,'w'))
