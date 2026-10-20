import json
W=json.load(open('win.json'))
meta=[('TSLA','Tesla','Tesla (TSLA)','$',1000,'$',2),('BTC','Bitcoin','Bitcoin (BTC-USD)','$',1000,'$',0),
('GOLD','Gold','Gold (futures)','$',1000,'$',0),('SPX','S&P 500','S&P 500 index','$',1000,'',0),('KZT','USD/KZT','USD/KZT exchange rate','₸',100000,'₸',1)]
assets=[]
for k,l,n,cur,step,pc,pd in meta:
    rows=W[k]
    assets.append(dict(key=k,label=l,name=n,cur=cur,step=step,pcur=pc,pdec=pd,dates=[r[0] for r in rows],prices=[round(r[1],4) for r in rows]))
cfg=dict(nHist=40,rounds=10,assets=assets)
t=open('tpl.html').read().replace('__CFG__',json.dumps(cfg,ensure_ascii=False))
open('../portfolio.qmd','w').write(t)
