# Аудит «ноги на земле»: для каждого экрана и 5 размеров — ступни на нарисованной линии земли (±6px экрана),
# пропорции спрайта = родные (±1%), персонажи не налезают друг на друга, ступни видны на экране.
import asyncio,os
from playwright.async_api import async_playwright
import json
VPS=[(740,360,1),(844,390,1),(932,430,1),(1280,720,0),(1440,900,0)]
PAD=json.load(open('tools/sprite_pads.json'))  # прозрачная полоска под ступнями (доля высоты), считается tools: rbvenv
def chk(D,tag):
  F=[];S=D['S'];v=D['v'];it=D['items']
  if not it:return F,0
  for c in it:
    feet=c['feet']-PAD.get(c['n'],0)*c['h']
    d=min(abs(feet-g) for g in c['gls'])*S
    if d>6:F.append(f'{tag}: {c["n"]} feet off ground by {d:.1f}px')
    r=(c['w']/c['h'])/c['nr']
    if abs(r-1)>.01:F.append(f'{tag}: {c["n"]} aspect off {r:.3f}')
    if feet>v['y0']+v['h']+1:F.append(f'{tag}: {c["n"]} feet below screen')
  for i in range(len(it)):
    for j in range(i+1,len(it)):
      a,b=it[i],it[j]
      if abs(a['x']-b['x'])<(a['w']+b['w'])*.4 and min(a['feet'],b['feet'])-max(a['feet']-a['h'],b['feet']-b['h'])>0:F.append(f'{tag}: {a["n"]}/{b["n"]} overlap')
  return F,len(it)
async def main():
  F=[];n=0
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H,m in VPS:
      ctx=await b.new_context(viewport={'width':W,'height':H},is_mobile=bool(m),has_touch=bool(m),device_scale_factor=1)
      pg=await ctx.new_page();pg.on('pageerror',lambda e:F.append('JSERR '+str(e)))
      await pg.goto('http://127.0.0.1:18633/index.html');await pg.wait_for_timeout(1500)
      await pg.evaluate("G.fast=1;G.mute=1;SV.open=5;SV.stars=[3,2,1,0,0]")
      async def snap(tag):
        nonlocal n
        for t in range(3):
          D=await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(G.gnd()))))")
          f,k=chk(D,f'{W}x{H} {tag}');n+=k;F.extend(f);await pg.wait_for_timeout(350)
      for sc in ['title','map','intro','l1','l2','l3','l4','l5','fin']:
        await pg.evaluate(f"talk=null;G.go('{sc}')");await pg.wait_for_timeout(1200)
        if sc[0]=='l':
          for r in range(3):
            await pg.evaluate(f"talk=null;LV.r={r};LV.def.setR&&LV.def.setR(LV)");await pg.wait_for_timeout(300);await snap(f'{sc} r{r}')
          await pg.evaluate("talk=null;LV.done=true");await pg.wait_for_timeout(200);await snap(sc+' end')
        else:await snap(sc)
      for s in range(1,5):
        await pg.evaluate(f"talk=null;go('secret',{s})");await pg.wait_for_timeout(500);await snap(f'secret{s}')
      await ctx.close()
    await b.close()
  open('shots/ground_audit.log','w').write('\n'.join(F))
  print('characters checked',n,'FLAGS',len(F))
asyncio.run(main())
