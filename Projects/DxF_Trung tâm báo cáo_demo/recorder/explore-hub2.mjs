import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://demo.indus.nois.vn';
fs.mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true, storageState: 'auth.json' });
const page = await ctx.newPage();

const dumpText = (page, re) => page.evaluate((reSrc) => {
  const rx = new RegExp(reSrc, 'i');
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const out = [];
  for (const e of document.querySelectorAll('*')) {
    const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
    if (t && t.length < 40 && rx.test(t) && vis(e) && e.children.length <= 2) {
      const r = e.getBoundingClientRect();
      out.push({ tag: e.tagName.toLowerCase(), cls: (e.className.toString ? e.className.toString() : '').slice(0, 40), text: t, box: [Math.round(r.x), Math.round(r.y)] });
    }
  }
  // dedupe by text
  const seen = new Set();
  return out.filter(o => { if (seen.has(o.text)) return false; seen.add(o.text); return true; }).slice(0, 40);
}, re);

try {
  await page.goto(BASE + '/dxmpm/pages/report-hub', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  console.log('→ expand "Báo cáo Hoạt động Máy"');
  await page.getByText('Báo cáo Hoạt động Máy', { exact: false }).first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shots/05-expanded.png' });

  console.log('dated entries visible:');
  console.log(JSON.stringify(await dumpText(page, '\\d{2}/06'), null, 2));

  // try to click 14/06
  const target = page.getByText(/14\/06/).first();
  if (await target.count()) {
    console.log('→ click 14/06');
    await target.click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'shots/06-dashboard.png' });
    console.log('dashboard loaded, url:', page.url());
  } else {
    console.log('!! no 14/06 entry found — dumping all /06 done above');
  }

  // dump chat panel controls (top-right area)
  const chat = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.x > 1150; };
    return [...document.querySelectorAll('button,mat-icon,[role=button],textarea,input,.mat-icon')]
      .filter(vis)
      .map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.className.toString ? e.className.toString() : '').slice(0, 45), aria: e.getAttribute('aria-label') || '', text: (e.innerText || e.value || '').trim().slice(0, 30), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; })
      .slice(0, 40);
  });
  console.log('CHAT AREA CONTROLS:');
  console.log(JSON.stringify(chat, null, 2));
} catch (e) {
  console.log('ERROR:', e.message);
  await page.screenshot({ path: 'shots/zz-error2.png' }).catch(() => {});
} finally {
  await browser.close();
}
