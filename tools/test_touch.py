# Настоящие тапы (hasTouch, мобильная эмуляция): каждый уровень — нарочная ошибка, исправление того же предмета, финиш;
# отмена правильной постановки; ввод не блокируется дольше 600 мс после ошибки; хит-зоны кнопок >= 56 css px.
import asyncio,os,time
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18633/index.html'
VPS=[(844,390),(667,375),(932,430)]
import os as _o
if _o.environ.get('VPS'):VPS=[tuple(map(int,v.split('x'))) for v in _o.environ['VPS'].split(',')]
async def run(b,W,H,F,R):
  tag=f'{W}x{H}';out=f'shots/touch/{tag}';os.makedirs(out,exist_ok=True)
  ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=2)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
  await pg.evaluate('G.fast=true;SV.open=5;save&&save()')
  async def tap(x,y):
    q=await pg.evaluate(f'G.pg({x},{y})');await pg.touchscreen.tap(q['x'],q['y']);await pg.wait_for_timeout(230)
  async def btn(i):
    bs=await pg.evaluate('G.btns()');bb=[x for x in bs if x['id']==i]
    if not bb:F.append(f'{tag} no btn {i}');return
    await tap(bb[0]['x'],bb[0]['y'])
  async def hitcheck(where):
    small=await pg.evaluate("UI.filter(b=>!b.dis).map(b=>({id:b.id,w:Math.max(b.w+12,56/S)*S,h:Math.max(b.h+12,56/S)*S})).filter(b=>b.w<56||b.h<56)")
    for s in small:F.append(f'{tag} {where}: button {s["id"]} hit {s["w"]:.0f}x{s["h"]:.0f}css <56')
  async def unlock_ms():
    t=time.time()
    while await pg.evaluate('G.locked()'):
      await pg.wait_for_timeout(20)
      if time.time()-t>5:break
    return (time.time()-t)*1000
  async def mistake(lv):
    m0=await pg.evaluate('G.LV().mist')
    for x,y in await pg.evaluate('G.taps(false)'):await tap(x,y)
    t=time.time()
    while await pg.evaluate('G.LV().mist')<=m0 and time.time()-t<3:await pg.wait_for_timeout(20)
    if await pg.evaluate('G.LV().mist')<=m0:F.append(f'{tag} l{lv} mistake not registered');return
    ms=await unlock_ms();R.append(f'{tag} l{lv} unlock after mistake {ms:.0f}ms')
    if ms>600:F.append(f'{tag} l{lv} input locked {ms:.0f}ms after mistake')
    if W==844:await pg.wait_for_timeout(150);await pg.screenshot(path=f'{out}/l{lv}_mistake.png')
  async def finish_round(lv):
    r0=await pg.evaluate('G.LV().r')
    for x,y in await pg.evaluate('G.taps(true)'):await tap(x,y)
    t=time.time()
    while await pg.evaluate('G.LV().r')==r0 and not await pg.evaluate('G.LV().done') and time.time()-t<20:await pg.wait_for_timeout(50)
    if await pg.evaluate('G.LV().r')==r0 and not await pg.evaluate('G.LV().done'):F.append(f'{tag} l{lv} r{r0} correct answer not accepted');return False
    return True
  for lv in ([int(x) for x in os.environ['LVS'].split(',')] if os.environ.get('LVS') else range(1,6)):
    await pg.evaluate(f'G.go("l{lv}")');await pg.wait_for_timeout(700)  # голос вступления ещё звучит — играем сразу
    await hitcheck(f'l{lv}')
    if await pg.evaluate('G.locked()'):F.append(f'{tag} l{lv} locked during intro voice')
    await mistake(lv)
    # исправить тот же предмет
    if lv in(1,3):
      P=await pg.evaluate('({who:G.LV().P.who,pos:{...G.LV().pos}})');w=[k for k in P['who'] if k in P['pos']][0]
      s=P['pos'][w];xy=await pg.evaluate(f'(()=>{{const d=G.LV().def;const[x,y]=d.slotXY({s});return[x,y+{100 if lv==1 else 92}-50]}})()')
      await tap(*xy);sel=await pg.evaluate('G.LV().sel')
      if sel!=w:F.append(f'{tag} l{lv} tap placed suspect did not select it ({sel})')
      await tap(*xy)
      if await pg.evaluate(f'G.LV().pos["{w}"]')is not None:F.append(f'{tag} l{lv} second tap did not take suspect back')
      if W==844:await pg.wait_for_timeout(150);await pg.screenshot(path=f'{out}/l{lv}_fixed.png')
    if lv==5:
      g=await pg.evaluate('G.LV().g');i,j=[(i,j) for i in range(3) for j in range(3) if g[i][j]==1][0]
      xy=await pg.evaluate(f'cellC({i},{j})');await tap(*xy)
      v1=await pg.evaluate(f'G.LV().g[{i}][{j}]');await tap(*xy);v2=await pg.evaluate(f'G.LV().g[{i}][{j}]');await tap(*xy);v3=await pg.evaluate(f'G.LV().g[{i}][{j}]')
      if (v1,v2,v3)!=(2,0,1):F.append(f'{tag} l5 cell cycle star->cross->empty->star got {(v1,v2,v3)}')
      if W==844:await pg.wait_for_timeout(150);await pg.screenshot(path=f'{out}/l5_fixed.png')
    if not await finish_round(lv):continue
    # отмена правильной постановки (раунд 2)
    if lv in(1,3) and not await pg.evaluate('G.LV().done'):
      await unlock_ms();await pg.wait_for_timeout(300)
      x,y=(await pg.evaluate('G.taps(true)'))[:2]
      await tap(*x);await tap(*y);w=await pg.evaluate('Object.keys(G.LV().pos)[0]')
      if not w:F.append(f'{tag} l{lv} correct placement failed')
      else:
        s=await pg.evaluate(f'G.LV().pos["{w}"]');xy=await pg.evaluate(f'(()=>{{const[x,y]=G.LV().def.slotXY({s});return[x,y+{100 if lv==1 else 92}-50]}})()')
        await tap(*xy);await tap(*xy)
        if await pg.evaluate(f'G.LV().pos["{w}"]')is not None:F.append(f'{tag} l{lv} undo of correct placement failed')
    if lv==5 and not await pg.evaluate('G.LV().done'):
      await unlock_ms();await pg.wait_for_timeout(300);xy=(await pg.evaluate('G.taps(true)'))[0]
      await tap(*xy);await tap(*xy);await tap(*xy)
      gg=await pg.evaluate('[G.LV().g,G.LV().r,G.locked()]')
      if any(any(r) for r in gg[0]):F.append(f'{tag} l5 undo star failed {gg} {xy}')
    n=0
    while not await pg.evaluate('G.LV().done') and n<6:
      n+=1;await unlock_ms();await pg.wait_for_timeout(200)
      if not await finish_round(lv):break
    if not await pg.evaluate('G.LV().done'):F.append(f'{tag} l{lv} not finished')
    R.append(f'{tag} l{lv} finished mist={await pg.evaluate("G.LV().mist")}')
    if lv<5:
      await pg.wait_for_timeout(400);await btn('map');await pg.wait_for_timeout(500)
      await pg.evaluate(f'SV.secret[{lv-1}]=0;go("secret",{lv})');await pg.wait_for_timeout(500);await hitcheck(f'secret{lv}')
      a=(await pg.evaluate('G.info()'))['a'];await btn(f'o{(a+1)%3}')
      ms=await unlock_ms()
      if ms>600:F.append(f'{tag} secret{lv} locked {ms:.0f}ms')
      if W==844 and lv==1:await pg.wait_for_timeout(150);await pg.screenshot(path=f'{out}/s1_mistake.png')
      await btn(f'o{a}');await pg.wait_for_timeout(300)
      if not await pg.evaluate(f'SV.secret[{lv-1}]'):F.append(f'{tag} secret{lv} correct answer after mistake not accepted')
      R.append(f'{tag} secret{lv} wrong->right ok')
  await pg.wait_for_timeout(1200);await btn('fin');await pg.wait_for_timeout(1200)
  if await pg.evaluate('G.scene')!='fin':F.append(f'{tag} finale not reached')
  await hitcheck('fin');await btn('map');await pg.wait_for_timeout(600)
  if await pg.evaluate('G.scene')!='map':F.append(f'{tag} finale map button failed')
  F.extend(f'{tag} JSERR {e}' for e in errs);await ctx.close()
async def main():
  F=[];R=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for W,H in VPS:await run(b,W,H,F,R)
    await b.close()
  print('\n'.join(R));print('FAILS',F);print('PASS' if not F else 'FAIL')
asyncio.run(main())
