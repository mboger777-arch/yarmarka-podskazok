# python tools/shot.py out.png "js-before" waitms [w h]
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();w=int(sys.argv[4]) if len(sys.argv)>4 else 1280;h=int(sys.argv[5]) if len(sys.argv)>5 else 720
    pg=await b.new_page(viewport={'width':w,'height':h});pg.on('pageerror',lambda e:print('ERR',e))
    await pg.goto('http://127.0.0.1:18601/index.html');await pg.evaluate('localStorage.clear()');await pg.wait_for_timeout(1200)
    await pg.evaluate(sys.argv[2]);await pg.wait_for_timeout(int(sys.argv[3]));await pg.screenshot(path=sys.argv[1]);await b.close()
asyncio.run(main())
