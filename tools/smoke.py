import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':720});logs=[]
    pg.on('pageerror',lambda e:logs.append(str(e)));pg.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
    await pg.goto('http://127.0.0.1:18633/index.html');await pg.wait_for_timeout(3000)
    print('selftest',await pg.evaluate('G.selftest()'))
    for s in sys.argv[1:]:
      await pg.evaluate(f'G.fast=true;G.go("{s}")');await pg.wait_for_timeout(1200);await pg.screenshot(path=f'shots/smoke_{s}.png')
    print(logs[:8]);await b.close()
asyncio.run(main())
