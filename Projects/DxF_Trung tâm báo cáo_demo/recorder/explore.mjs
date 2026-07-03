import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://demo.indus.nois.vn';
fs.mkdirSync('shots', { recursive: true });

function dumpInteractives(page) {
  return page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const info = (e) => ({
      tag: e.tagName.toLowerCase(),
      type: e.getAttribute('type') || '',
      id: e.id || '',
      name: e.getAttribute('name') || '',
      ph: e.getAttribute('placeholder') || '',
      aria: e.getAttribute('aria-label') || '',
      role: e.getAttribute('role') || '',
      cls: (e.className && e.className.toString ? e.className.toString() : '').slice(0, 60),
      text: (e.innerText || e.value || '').trim().slice(0, 50),
    });
    const inputs = [...document.querySelectorAll('input,select,textarea')].filter(vis).map(info);
    const clickables = [...document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem]')]
      .filter(vis).map(info).filter(x => x.text || x.aria);
    return { url: location.href, title: document.title, inputs, clickables: clickables.slice(0, 60) };
  });
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

try {
  console.log('→ goto sign-in');
  await page.goto(BASE + '/sign-in?redirectURL=%2Fportal', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'shots/01-signin.png' });
  const d = await dumpInteractives(page);
  console.log(JSON.stringify(d, null, 2));
} catch (e) {
  console.log('ERROR:', e.message);
  await page.screenshot({ path: 'shots/01-error.png' }).catch(() => {});
} finally {
  await browser.close();
}
