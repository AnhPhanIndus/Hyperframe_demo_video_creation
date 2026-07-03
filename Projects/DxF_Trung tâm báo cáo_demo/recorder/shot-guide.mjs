import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1300, height: 950 }, deviceScaleFactor: 1 });
await p.goto('file:///C:/HyperFrames/Projects/DxF_Trung%20t%C3%A2m%20b%C3%A1o%20c%C3%A1o_demo/workflow-guide.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/guide-hero.png' });                 // above the fold
await p.evaluate(() => document.querySelector('#steps').scrollIntoView());
await p.waitForTimeout(500); await p.screenshot({ path: 'shots/guide-steps.png' });
await p.evaluate(() => document.querySelector('#gotchas').scrollIntoView());
await p.waitForTimeout(500); await p.screenshot({ path: 'shots/guide-gotchas.png' });
await b.close(); console.log('done');
