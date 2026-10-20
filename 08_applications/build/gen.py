import json
meta=[('TSLA','Tesla','Tesla (TSLA)','$',1000,'$',2),('BTC','Bitcoin','Bitcoin (BTC-USD)','$',1000,'$',0),
('GOLD','Gold','Gold (futures)','$',1000,'$',0),('SPX','S&P 500','S&P 500 index','$',1000,'',0),('KZT','USD/KZT','USD/KZT exchange rate','₸',100000,'₸',1)]
def build(src,**extra):
    W=json.load(open(src));assets=[]
    for k,l,n,cur,step,pc,pd in meta:
        rows=W[k]
        assets.append(dict(key=k,label=l,name=n,cur=cur,step=step,pcur=pc,pdec=pd,dates=[r[0] for r in rows],prices=[round(r[1],4) for r in rows]))
    return dict(assets=assets,**extra)
t1=open('tpl.html').read().replace('__CFG__',json.dumps(build('win.json',nHist=40,rounds=10),ensure_ascii=False))
t2=open('tpl2.html').read().replace('__CFG__',json.dumps(build('long.json'),ensure_ascii=False))
open('../applications.qmd','w').write(t1+'\n---\n\n'+t2)
