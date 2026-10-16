import sys,asyncio
from playwright.async_api import async_playwright
url,out=sys.argv[1],sys.argv[2]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    reqs=[];pg.on('request',lambda r:reqs.append(r.url))
    await pg.goto(url);await pg.wait_for_timeout(2500);ok=True
    for i,(w,h) in enumerate([(390,844),(844,390),(390,844),(844,390)]):
      fsw=await pg.evaluate('!!document.fullscreenElement');st0={'fs':fsw}
      await pg.evaluate('document.fullscreenElement&&document.exitFullscreen()');await pg.wait_for_timeout(300)
      await pg.set_viewport_size({'width':w,'height':h})
      await pg.evaluate("dispatchEvent(new Event('orientationchange'))")
      await pg.wait_for_timeout(800)
      st=await pg.evaluate("({P:PORTRAIT(),W,H,cw:C.width,ch:C.height,cs:C.getBoundingClientRect().width+'x'+C.getBoundingClientRect().height,T})")
      exp=h>w;good=st['P']==exp and st['W']==w and st['H']==h and st['cw']==w*2
      if not exp:
        t0=st['T'];await pg.wait_for_timeout(400);t1=await pg.evaluate("T");good=good and t1>t0
        st['loopAdv']=round(t1-t0,2)
        await pg.evaluate("window._tp=0;C.addEventListener('pointerdown',e=>{window._tp++})");await pg.touchscreen.tap(w*0.5,h*0.62);await pg.wait_for_timeout(300);tp=await pg.evaluate("[window._tp,Math.round(PX),Math.round(PY)]");st['tap']=tp;good=good and tp[0]>0 and abs(tp[2]-0.62*720)<60
      await pg.screenshot(path=f'{out}_{i}.png');print(i,w,h,st,st0,'OK' if good else 'FAIL');ok&=good
    unv=[u for u in reqs if '/assets/' in u or '/js/' in u if '?v=' not in u]
    print('errors',errs,'unversioned',unv[:5],'versioned',sum('?v=' in u for u in reqs));print('PASS' if ok and not errs and not unv else 'FAILED')
    await b.close()
asyncio.run(main())
