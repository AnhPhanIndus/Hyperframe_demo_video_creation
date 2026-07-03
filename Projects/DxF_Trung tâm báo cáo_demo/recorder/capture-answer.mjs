import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://demo.indus.nois.vn';
const QUESTION = 'phân tích báo cáo hoạt động máy';
fs.mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true, storageState: 'auth.json' });
const page = await ctx.newPage();

const rightPanelText = () => page.evaluate(() => {
  // grab visible text of the chat column (right side, x>1200)
  let best = '', bestArea = 0;
  for (const e of document.querySelectorAll('div,section,main')) {
    const r = e.getBoundingClientRect();
    if (r.x > 1180 && r.width > 250 && r.height > 400) {
      const area = r.width * r.height;
      if (area > bestArea) { bestArea = area; best = e.innerText || ''; }
    }
  }
  return best.trim();
});

try {
  await page.goto(BASE + '/dxmpm/pages/report-hub', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.getByText('Báo cáo Hoạt động Máy', { exact: false }).first().click();
  await page.waitForTimeout(2000);
  await page.getByText(/14\/06/).first().click();
  await page.waitForTimeout(6000);
  console.log('dashboard ready');

  // find the chat input
  let input = page.getByPlaceholder(/Hỏi về báo cáo/i).first();
  if (!(await input.count())) input = page.locator('textarea, input[type=text]').last();
  await input.click();
  await input.fill(QUESTION);
  await page.screenshot({ path: 'shots/07-typed.png' });
  await input.press('Enter');
  console.log('question sent, waiting for agent...');

  const before = await rightPanelText();
  let last = '', stableSince = Date.now(), t0 = Date.now();
  const MAX = 300000, STABLE = 25000;
  while (Date.now() - t0 < MAX) {
    await page.waitForTimeout(4000);
    const now = await rightPanelText();
    const grew = now.length - before.length;
    if (now !== last) {
      last = now; stableSince = Date.now();
      const tail = now.replace(/\s+/g, ' ').slice(-140);
      process.stdout.write(`  …${Math.round((Date.now()-t0)/1000)}s len=${now.length} (+${grew})  «…${tail}»\n`);
      await page.screenshot({ path: 'shots/progress.png' }).catch(() => {});
    }
    // done: a substantial answer that has been stable for STABLE ms
    if (grew > 400 && Date.now() - stableSince > STABLE) { console.log('response stabilized'); break; }
  }
  await page.screenshot({ path: 'shots/08-answer.png' });
  const finalText = await rightPanelText();
  fs.writeFileSync('answer.txt', finalText, 'utf8');
  console.log('\n===== ANSWER (saved answer.txt) =====\n');
  console.log(finalText.slice(0, 4000));
} catch (e) {
  console.log('ERROR:', e.message);
  await page.screenshot({ path: 'shots/zz-error3.png' }).catch(() => {});
} finally {
  await browser.close();
}
