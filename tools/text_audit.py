# Автоаудит текста: рамка каждого текста vs рамка его нарисованного контейнера, попарные наложения, герои, выход за экран.
import sys,asyncio,json
from playwright.async_api import async_playwright
VPS=[(740,360,1),(844,390,1),(932,430,1),(1280,720,0),(1440,900,0)]
import os
if os.environ.get("VPS"):VPS=[v for v in VPS if f"{v[0]}x{v[1]}" in os.environ["VPS"].split(",")]
PAD={'clues':(.09,.16,.16),'stmt':(.06,.07,.25),'table':(.08,.09,.09),'plank':(.08,.14,.14),'scroll':(.09,.16,.16),'frame':(.08,.09,.09),'bubble':(.06,.07,.25),'coinbtn':(.15,.15,.15),'cell':(.06,.06,.06)}
def inter(a,b):return max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
def area(a):return (a[2]-a[0])*(a[3]-a[1])
def inside(a,b,e=1):return a[0]>=b[0]-e and a[1]>=b[1]-e and a[2]<=b[2]+e and a[3]<=b[3]+e
HARDC={'compass','coinbtn','plank','scroll','sign','plaque','pryanik','gframe','clues','table','stmt'}
BTNTXT=set()
def TOPHARD(t):return False
def check(A,W,H,tag):
  F=[];T=A['t'];C=A['c'];Hs=A['h']
  for t in T:
    b=t['b'];cx,cy=(b[0]+b[2])/2,(b[1]+b[3])/2
    if b[0]<-1 or b[1]<-1 or b[2]>W+1 or b[3]>H+1:F.append(f'{tag}: "{t["t"]}" off-screen {b}')
    cs=[c for c in C if c['b'][0]<=cx<=c['b'][2] and c['b'][1]<=cy<=c['b'][3]]
    if t.get('bub'):
      cs2=[c for c in cs if c['n'] in('bubble','banner')]
      cs=cs2 or cs
    else:cs=[c for c in cs if c['n'] not in('bubble','banner')]  # текст поля под непрозрачным облачком не «внутри» облачка
    if cs:
      c=min(cs,key=lambda c:area(c['b']));cb=c['b'];w,h=cb[2]-cb[0],cb[3]-cb[1];px,pt,pb=PAD.get(c['n'],(.06,.08,.08))
      PX=max(4,min(w*px,h*.55));inn=c.get('in') or [cb[0]+PX,cb[1]+h*pt,cb[2]-PX,cb[3]-h*pb]
      if not inside(b,inn):F.append(f'{tag}: "{t["t"]}" overflows {c["n"]} txt={[round(v) for v in b]} inner={[round(v) for v in inn]}')
      t['c']=id(c)
    else:t['c']=None
    for hh in Hs:
      hb=hh['b'];hd=[hb[0],hb[1],hb[2],hb[1]+(hb[3]-hb[1])*.42]
      if inter(b,hd if t.get('bub') else hb)>0.04*area(b):F.append(f'{tag}: "{t["t"]}" overlaps hero {hh["n"]}'+(' head' if t.get('bub') else ''))
  for c in C+Hs:
    b=c['b']
    if b[0]<-1 or b[1]<-1 or b[2]>W+1 or (b[3]>H+1 and c in C):F.append(f'{tag}: object {c["n"]} clipped by screen {[round(v) for v in b]}')
  HF=A.get('hf') or []
  for i in range(len(HF)):
    for j in range(i+1,len(HF)):
      a,b=HF[i]['b'],HF[j]['b']
      if min(a[2],b[2])-max(a[0],b[0])>-2 and min(a[3],b[3])-max(a[1],b[1])>0:F.append(f'{tag}: heroes touch {HF[i]["n"]}/{HF[j]["n"]}')
  for i in range(len(T)):
    for j in range(i+1,len(T)):
      if bool(T[i].get('bub'))!=bool(T[j].get('bub')) and not (TOPHARD(T[i]) or TOPHARD(T[j])):continue  # облачко/плашка непрозрачны и рисуются поверх игрового поля
      if inter(T[i]['b'],T[j]['b'])>4:F.append(f'{tag}: text overlap "{T[i]["t"]}" / "{T[j]["t"]}"')
  for i in range(len(C)):
    for j in range(i+1,len(C)):
      a,b=C[i]['b'],C[j]['b']
      ns={C[i]['n'],C[j]['n']}
      if ns&{'bubble','banner'} and not ns&HARDC and ns!={'bubble','banner'}:continue
      if inter(a,b)>0.02*min(area(a),area(b)) and not inside(a,b,2) and not inside(b,a,2):
        # containers that hold text only
        F.append(f'{tag}: box overlap {C[i]["n"]}/{C[j]["n"]} {[round(v) for v in a]} {[round(v) for v in b]}')
  for c in C:
    for hh in Hs:
      if c['n'] not in('bubble','compass') and inter(c['b'],hh['b'])>0.06*area(c['b']):F.append(f'{tag}: {c["n"]} {[round(v) for v in c["b"]]} covered by hero {hh["n"]}')
  return F
AUD="new Promise(r=>{G.auditReq=1;requestAnimationFrame(()=>requestAnimationFrame(()=>r(G._aud)))})"
async def main():
  allF=[];n=0
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H,m in VPS:
      ctx=await b.new_context(viewport={'width':W,'height':H},is_mobile=bool(m),has_touch=bool(m),device_scale_factor=2 if m else 1)
      pg=await ctx.new_page();pg.on('pageerror',lambda e:allF.append('JSERR '+str(e)+' '+str(e.stack)[:300]))
      await pg.goto('http://127.0.0.1:18633/index.html');await pg.wait_for_timeout(1500)
      await pg.evaluate("G.fast=1;G.mute=1;SV.open=5;SV.stars=[3,2,1,0,0]")
      async def snap(tag):
        nonlocal n;A=await pg.evaluate(AUD);n+=len(A['t']);allF.extend(check(A,W,H,f'{W}x{H} {tag}'))
      await pg.evaluate("talk=null;G.go('title')");await pg.wait_for_timeout(600);await snap('title')
      await pg.evaluate("talk=null;G.go('map')");await pg.wait_for_timeout(600);await pg.evaluate("talk=null");await snap('map')
      scenes=['intro','l1','l2','l3','l4','l5','fin']
      for sc in scenes:
        await pg.evaluate(f"talk=null;G.go('{sc}')");await pg.wait_for_timeout(2500)
        await pg.evaluate("talk=null");await snap(sc)
        if sc.startswith('l'):
          await pg.evaluate("LV&&LV.def&&LV.def.hint&&(G.busy=false,LV.def.hint(LV))");await pg.wait_for_timeout(300);await pg.evaluate("talk=null");await snap(sc+' hint')
        keys=await pg.evaluate("Object.keys(LINES).filter(k=>cast.some(c=>c.n===LINES[k].who))")
        if sc.startswith('l'):keys=[k for k in keys if k.startswith(sc) or k in('ok','no','win','pick','l2w','l5end')]
        for k in keys:
          await pg.evaluate(f"talk={{who:LINES['{k}'].who,text:LINES['{k}'].t,k:'{k}',t0:T-2}};G._hold='{k}'")
          A=await pg.evaluate("new Promise(r=>{talk={who:LINES[G._hold].who,text:LINES[G._hold].t,k:G._hold,t0:T-2};G.auditReq=1;requestAnimationFrame(()=>r(G._aud))})")
          A['t']=[t for t in A['t']];n+=len(A['t']);ff=check(A,W,H,f'{W}x{H} {sc} say:{k}');allF.extend(ff)
          if ff and os.environ.get('ASHOT'):await pg.screenshot(path=f'/tmp/ex/as_{W}_{sc}_{k}.png');open(f'/tmp/ex/as_{W}_{sc}_{k}.json','w').write(json.dumps(A))
        if sc.startswith('l'):
          for bt in {'l1':['Подсказка 2 не сходится. Поменяй жильцов местами.'],'l3':['Подсказка 2 не сходится. Поменяй дежурных местами.'],'l2':['Если лжёт Мишутка, то Тимоша честный — и тогда лжёт ещё и Соня. Лжецов двое — так нельзя!','Пирожок съел Мишутка: «это не я» — неправда, а Тимоша и Соня сказали правду.'],'l4':['Если смесь в коробке «жёлуди», то в коробке «шишки» — только жёлуди. Но наклейки все неверные!','В коробке «шишки и жёлуди» может лежать смесь, а может — что-то одно. Один предмет не скажет всего!']}.get(sc,[]):
            for k in {'l2':['l2w','ok'],'l4':['no','ok']}.get(sc,['no']):  # реплики, которые реально звучат вместе с плашкой
              A=await pg.evaluate("new Promise(r=>{LV.banner={t:%s,bad:true,t0:T-2};talk={who:LINES['%s'].who,text:LINES['%s'].t,k:'%s',t0:T-2};requestAnimationFrame(()=>requestAnimationFrame(()=>{talk={who:LINES['%s'].who,text:LINES['%s'].t,k:'%s',t0:T-2};G.auditReq=1;requestAnimationFrame(()=>r(G._aud))}))})"%(json.dumps(bt),k,k,k,k,k,k))
              n+=len(A['t']);ff=check(A,W,H,f'{W}x{H} {sc} banner+say:{k}');allF.extend(ff)
              if ff and os.environ.get('ASHOT'):await pg.screenshot(path=f'/tmp/ex/ab_{W}_{sc}_{k}_{len(bt)}.png')
            await pg.evaluate("LV.banner=null")
        if sc.startswith('l'):
          await pg.evaluate("talk=null;LV.done=true");await pg.wait_for_timeout(200);await snap(sc+' end')
      await pg.evaluate("talk=null;go('secret',1)");await pg.wait_for_timeout(800);await pg.evaluate("talk=null");await snap('secret')
      await ctx.close()
    await b.close()
  open('shots/text_audit.log','w').write('\n'.join(allF))
  print('texts checked',n,'FLAGS',len(allF))
  from collections import Counter
  
asyncio.run(main())
