# Эмуляция реального телефона: visualViewport меньше layout viewport (панель браузера 60px сверху), iPhone 13 / Pixel 7 landscape.
import sys,asyncio
from playwright.async_api import async_playwright
url,tag,audit=sys.argv[1],sys.argv[2],sys.argv[3]=='1'
FAKE="""(()=>{const TB=%d;const vv={get width(){return innerWidth},get height(){return innerHeight-TB},offsetTop:TB,offsetLeft:0,pageTop:TB,scale:1,addEventListener(){},removeEventListener(){}};Object.defineProperty(window,'visualViewport',{get:()=>vv})})()"""
async def main():
  bad=[];shots=[]
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for dev in ['iPhone 13 landscape','Pixel 7 landscape']:
      for tb in (0,60):
        d=dict(p.devices[dev]);d.pop('default_browser_type',None)
        ctx=await b.new_context(**d);await ctx.add_init_script(FAKE%tb)
        pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(url);await pg.wait_for_timeout(1500)
        r=await pg.evaluate("(()=>{const r=C.getBoundingClientRect();return{t:r.top,h:r.height,w:r.width,ih:innerHeight,iw:innerWidth,W,H,OY,S,sy:scrollY}})()")
        if abs(r['t']-tb)>1 or abs(r['h']-(r['ih']-tb))>1 or r['sy']!=0:bad.append(f'{dev} tb{tb} canvas {r}')
        await pg.evaluate("G.fast=1;G.mute=1;SV.open=5;SV.stars=[3,2,1,1,0]")
        scenes=['title','intro','map','l1','l2','l3','l4','l5','fin']+[f'secret{i}' for i in range(1,5)]+[f'end{i}' for i in range(1,6)]
        for sc in scenes:
          if sc.startswith('secret'):js=f"talk=null;go('secret',{sc[-1]})"
          elif sc.startswith('end'):js=f"talk=null;go('l{sc[-1]}');setTimeout(()=>{{talk=null;const L=G.LV();L.done=true;L.doneT=T;L.stars=2}},600)"
          else:js=f"talk=null;go('{sc}')"
          await pg.evaluate(js);await pg.wait_for_timeout(1400);await pg.evaluate("talk=null")
          if audit:
            A=await pg.evaluate("new Promise(r=>{G.auditReq=1;requestAnimationFrame(()=>requestAnimationFrame(()=>r(G._aud)))})")
            hf=A.get('hf') or []
            for i in range(len(hf)):
              for j in range(i+1,len(hf)):
                a,c2=hf[i]['b'],hf[j]['b']
                if min(a[2],c2[2])-max(a[0],c2[0])>-2:bad.append(f"{dev} tb{tb} {sc}: heroes touch {hf[i]['n']}/{hf[j]['n']}")
            for k in ('t','c'):
              for q in A[k]:
                x0,y0,x1,y1=q['b']
                if y0<-1 or x0<-1 or x1>r['W']+1 or y1>r['H']+1:bad.append(f"{dev} tb{tb} {sc}: {q.get('t',q.get('n'))} cut {[round(v) for v in q['b']]}")
          fn=f'shots/tb_{tag}_{dev.split()[0]}_{tb}_{sc}.png';await pg.screenshot(path=fn);shots.append(fn)
        bad+=[f'{dev} JSERR {e}' for e in errs];await ctx.close()
    await b.close()
  print('shots',len(shots),'FLAGS',len(bad));[print(' ',x) for x in bad[:30]]
asyncio.run(main())
