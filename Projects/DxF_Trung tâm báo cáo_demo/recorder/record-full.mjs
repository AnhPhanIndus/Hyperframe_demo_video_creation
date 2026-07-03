import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://demo.indus.nois.vn';
const QUESTION = 'phân tích báo cáo hoạt động máy';
const VW = 1920, VH = 1080;
fs.mkdirSync('video', { recursive: true });
fs.mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  ignoreHTTPSErrors: true,
  storageState: 'auth.json',
  recordVideo: { dir: 'video', size: { width: VW, height: VH } },
});

// visible fake cursor that follows real Playwright mouse events
await ctx.addInitScript(() => {
  const ensure = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 14.8 L11.4 21.3 L14 20.2 L11.2 13.9 L18 13.6 Z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    (document.body || document.documentElement).appendChild(c);
  };
  const move = (e) => { const c = document.getElementById('__cur'); if (c) c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; };
  document.addEventListener('mousemove', move, true);
  document.addEventListener('DOMContentLoaded', ensure);
  const iv = setInterval(ensure, 400);
  setTimeout(() => clearInterval(iv), 8000);
  ensure();
});

const page = await ctx.newPage();
const t0 = Date.now();
const phases = [];
const mark = (name) => { const t = Date.now() - t0; phases.push({ name, ms: t }); console.log(`[phase] ${name} @ ${(t/1000).toFixed(1)}s`); };

async function glideTo(locator) {
  const box = await locator.boundingBox();
  if (!box) return null;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 30 });
  await page.waitForTimeout(350);
  return { x, y };
}
async function glideClick(locator) {
  await glideTo(locator);
  await locator.click({ timeout: 15000 });
  await page.waitForTimeout(500);
}
const rightText = () => page.evaluate(() => {
  let best = '', a = 0;
  for (const e of document.querySelectorAll('div,section,main')) {
    const r = e.getBoundingClientRect();
    if (r.x > 1400 && r.width > 250 && r.height > 400) { const ar = r.width * r.height; if (ar > a) { a = ar; best = e.innerText || ''; } }
  }
  return best.trim();
});

try {
  await page.goto(BASE + '/dxmpm/pages/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);
  mark('home');

  await glideClick(page.locator('a', { hasText: 'Trung tâm Báo cáo' }).first());
  await page.waitForTimeout(4500);
  mark('reporthub');

  await glideClick(page.getByText('Báo cáo Hoạt động Máy', { exact: false }).first());
  await page.waitForTimeout(2200);
  mark('expanded');

  await glideClick(page.getByText(/14\/06/).first());
  await page.waitForTimeout(6000);
  mark('dashboard');

  // (optional) glide across the KPI cards for a beat of B-roll
  await page.mouse.move(780, 320, { steps: 25 }); await page.waitForTimeout(500);
  await page.mouse.move(1050, 320, { steps: 25 }); await page.waitForTimeout(600);

  // ask the agent
  let input = page.getByPlaceholder(/Hỏi về báo cáo/i).first();
  if (!(await input.count())) input = page.locator('textarea, input[type=text]').last();
  await glideTo(input);
  await input.click();
  await page.waitForTimeout(400);
  await page.keyboard.type(QUESTION, { delay: 55 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/rec-typed.png' });
  mark('typed');
  await page.keyboard.press('Enter');
  mark('sent');

  // wait for the answer (record the processing; will be sped up in post)
  const before = (await rightText()).length;
  let last = '', stableSince = Date.now(), answerFirstMs = null;
  const WMAX = 260000, STABLE = 22000;
  const wt0 = Date.now();
  while (Date.now() - wt0 < WMAX) {
    await page.waitForTimeout(3000);
    const now = await rightText();
    if (now !== last) {
      last = now; stableSince = Date.now();
      if (answerFirstMs === null && now.length - before > 350) { answerFirstMs = Date.now() - t0; mark('answer_start'); }
    }
    if (now.length - before > 400 && Date.now() - stableSince > STABLE) break;
  }
  mark('answer_stable');
  await page.screenshot({ path: 'shots/rec-answer.png' });

  // scroll the answer slowly (simulate reading)
  await page.mouse.move(1680, 520, { steps: 20 });
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 260); await page.waitForTimeout(700); }
  mark('scrolled');
  await page.waitForTimeout(800);
} catch (e) {
  console.log('ERROR:', e.message);
  await page.screenshot({ path: 'shots/zz-recerror.png' }).catch(() => {});
} finally {
  await ctx.close(); // flushes the video file
  await browser.close();
}

fs.writeFileSync('phases.json', JSON.stringify(phases, null, 2));
console.log('phases:', JSON.stringify(phases));
const vids = fs.readdirSync('video').filter(f => f.endsWith('.webm'));
console.log('video files:', vids);
