import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://demo.indus.nois.vn';
const ORG = /nois|New Ocean/i;
const EMAIL = 'admin@nois.vn';
const PASS = 'Sm@rt!123';
fs.mkdirSync('shots', { recursive: true });

function dumpInteractives(page) {
  return page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const info = (e) => {
      const r = e.getBoundingClientRect();
      return {
        tag: e.tagName.toLowerCase(),
        id: e.id || '',
        aria: e.getAttribute('aria-label') || '',
        role: e.getAttribute('role') || '',
        cls: (e.className && e.className.toString ? e.className.toString() : '').slice(0, 50),
        text: (e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 45),
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      };
    };
    const clickables = [...document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],mat-select,.mat-expansion-panel-header,input,textarea')]
      .filter(vis).map(info).filter(x => x.text || x.aria || x.tag === 'input' || x.tag === 'textarea');
    return { url: location.href, title: document.title, clickables: clickables.slice(0, 80) };
  });
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

async function login() {
  await page.goto(BASE + '/sign-in?redirectURL=%2Fportal', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  // org select (mat-select)
  const orgSel = page.locator('mat-select').first();
  if (await orgSel.count()) {
    await orgSel.click();
    await page.waitForTimeout(800);
    const opt = page.locator('mat-option, .mat-mdc-option', { hasText: ORG }).first();
    if (await opt.count()) { await opt.click(); } else {
      await page.locator('mat-option, .mat-mdc-option').first().click(); // fallback: first org
    }
    await page.waitForTimeout(500);
  }
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASS);
  await page.screenshot({ path: 'shots/02-filled.png' });
  await page.locator('button', { hasText: /ĐĂNG NHẬP/i }).first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'shots/03-afterlogin.png' });
  console.log('after login url:', page.url());
}

try {
  await login();
  await ctx.storageState({ path: 'auth.json' });
  console.log('✓ saved auth.json');

  console.log('→ goto report-hub');
  await page.goto(BASE + '/dxmpm/pages/report-hub', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'shots/04-reporthub.png', fullPage: false });
  const d = await dumpInteractives(page);
  console.log(JSON.stringify(d, null, 2));
} catch (e) {
  console.log('ERROR:', e.message);
  await page.screenshot({ path: 'shots/zz-error.png' }).catch(() => {});
} finally {
  await browser.close();
}
