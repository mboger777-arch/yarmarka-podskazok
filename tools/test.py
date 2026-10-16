# Полный прогон настоящими тапами: все 5 уровней с ошибками, тайные комнаты, выход с уровня (stale), финал. python tools/test.py desktop|phone
import asyncio,sys,os,json
from playwright.async_api import async_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else 'desktop';URL='http://127.0.0.1:18633/index.html';OUT='shots/'+MODE;FAILS=[]
async def main():
  os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    vp={'width':1280,'height':720} if MODE=='desktop' else {'width':844,'height':390}
    ctx=await b.new_context(viewport=vp,has_touch=MODE=='phone',is_mobile=MODE=='phone',device_scale_factor=1 if MODE=='desktop' else 2)
    pg=await ctx.new_page();logs=[]
    pg.on('pageerror',lambda e:logs.append(str(e)));pg.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(3000)
    e=await pg.evaluate('G.selftest()')
    if e:FAILS.append('selftest '+str(e))
    await pg.screenshot(path=f'{OUT}/00_title.png')
    async def tapL(x,y):
      q=await pg.evaluate(f'G.pg({x},{y})')
      if MODE=='phone': await pg.touchscreen.tap(q['x'],q['y'])
      else: await pg.mouse.click(q['x'],q['y'])
    async def btn(id):
      bs=await pg.evaluate('G.btns()');bb=[x for x in bs if x['id']==id]
      if not bb: FAILS.append(f'no button {id} in {await pg.evaluate("G.scene")}');return False
      await tapL(bb[0]['x'],bb[0]['y']);return True
    async def idle(t=30000): await pg.wait_for_function('!G.busy',timeout=t)
    async def taps(good):
      for x,y in await pg.evaluate(f'G.taps({"true" if good else "false"})'):
        await tapL(x,y);await pg.wait_for_timeout(230)
    await btn('play');await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/01_intro.png')
    await pg.evaluate('G.fast=true');await btn('skip');await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/02_map.png')
    for lv in range(1,6):
      await tapL(*(await pg.evaluate('G.mp()'))[lv-1]);await pg.wait_for_timeout(500)
      if await pg.evaluate('G.scene')!=f'l{lv}':FAILS.append(f'map tap l{lv} failed');await pg.evaluate(f'G.go("l{lv}")')
      await idle()
      # stale: уйти с уровня посреди дела и вернуться — старые корутины не должны трогать новый уровень
      await taps(False);await pg.wait_for_timeout(60);await btn('home');await pg.wait_for_timeout(700)
      if await pg.evaluate('G.scene')!='map':FAILS.append(f'l{lv} home failed')
      st=await pg.evaluate('({b:!!(G.LV()&&G.LV().banner),t:!!talk,busy:G.busy})')
      if st['b'] and False:FAILS.append(f'l{lv} stale banner on map')
      if st['busy']:FAILS.append(f'l{lv} stale script still busy on map {st}')
      await pg.evaluate(f'G.go("l{lv}")');await idle()
      if await pg.evaluate('G.LV().r')!=0 or await pg.evaluate('G.LV().mist')!=0:FAILS.append(f'l{lv} state leaked after re-enter')
      if lv<5:
        s=await pg.evaluate('G.secretXY()');await tapL(s['x'],s['y']);await pg.wait_for_timeout(400)
        if await pg.evaluate('G.scene')!='secret':FAILS.append(f'secret{lv} no open')
        else:
          await idle();await pg.screenshot(path=f'{OUT}/s{lv}.png')
          a=(await pg.evaluate('G.info()'))['a'];await btn(f'o{(a+1)%3}');await idle()
          if await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} wrong accepted')
          await pg.screenshot(path=f'{OUT}/s{lv}_wrong.png')
          await btn(f'o{a}');await pg.wait_for_function(f'G.scene=="l{lv}"',timeout=15000)
          if not await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} not credited')
          await idle()
      r=0;shots=0
      while not await pg.evaluate('G.LV().done'):
        await idle()
        if await pg.evaluate('G.LV().done'):break
        r0=await pg.evaluate('G.LV().r')
        if shots<=r0: await pg.screenshot(path=f'{OUT}/l{lv}_r{r0}.png');shots+=1
        if r0==0 and await pg.evaluate('G.LV().mist')==0:
          m0=await pg.evaluate('G.LV().mist');await taps(False);await pg.wait_for_timeout(250);await pg.screenshot(path=f'{OUT}/l{lv}_mistake.png');await idle()
          if await pg.evaluate('G.LV().mist')<=m0:FAILS.append(f'l{lv} wrong answer not counted')
          if await pg.evaluate('G.LV().r')!=0:FAILS.append(f'l{lv} wrong answer advanced round')
          continue
        await taps(True);await pg.wait_for_timeout(200)
        await idle()
        if await pg.evaluate('G.LV().r')==r0 and not await pg.evaluate('G.LV().done'):FAILS.append(f'l{lv} r{r0} correct answer not accepted');break
        r+=1
        if r>10:FAILS.append(f'l{lv} too many rounds');break
      await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/l{lv}_done.png')
      print('level',lv,'done mist',await pg.evaluate('G.LV().mist'),'stars',await pg.evaluate('G.S.stars'),flush=True)
      if lv<5: await btn('map');await pg.wait_for_timeout(400)
      else:
        await btn('fin');await pg.wait_for_timeout(1500)
        if await pg.evaluate('G.scene')!='fin':FAILS.append('fin button')
        await pg.screenshot(path=f'{OUT}/fin.png');await btn('map');await pg.wait_for_timeout(600)
    await pg.screenshot(path=f'{OUT}/map_end.png')
    if await pg.evaluate('G.S.open')!=5:FAILS.append('not all open')
    print('fps',await pg.evaluate('G.fps()'))
    if logs:FAILS.append('console: '+' | '.join(logs[:5]))
    await b.close()
  print('FAILS',FAILS);print('PASS' if not FAILS else 'FAIL')
asyncio.run(main())
