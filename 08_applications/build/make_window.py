# raw_*.json -> win.json: last 50 complete weekly closes (40 history + 10 game rounds), ending week of 2026-10-12
import json,datetime
out={}
for k in ['TSLA','BTC','GOLD','SPX','KZT']:
    res=json.load(open(f'raw_{k}.json'))['chart']['result'][0]
    rows=[(datetime.date.fromtimestamp(t).isoformat(),v) for t,v in zip(res['timestamp'],res['indicators']['quote'][0]['close']) if v is not None]
    out[k]=[r for r in rows if r[0]<'2026-10-19'][-50:]
json.dump(out,open('win.json','w'))
