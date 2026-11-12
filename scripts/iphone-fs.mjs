import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
const sc = JSON.parse(readFileSync('public/tu-ou-vous.json', 'utf8')).nodes;
const server = spawn('npx', ['vite', 'preview', '--port', '5177', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((r) => server.stdout.on('data', (c) => String(c).includes('5177') && r()));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
let failures = 0;
const check = (n, ok, d = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`); if (!ok) failures++; };
const noElementFullscreen = () => {
  Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get: () => false });
  Object.defineProperty(Document.prototype, 'webkitFullscreenEnabled', { get: () => false });
  Element.prototype.requestFullscreen = undefined;
  Element.prototype.webkitRequestFullscreen = undefined;
};
for (const [label, vw, vh] of [['portrait', 390, 844], ['landscape', 844, 390]]) {
  console.log(`\n== iPhone ${label} ${vw}×${vh}`);
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(noElementFullscreen);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  const phase = (p) => page.waitForFunction((p) => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === p, p, { timeout: 30000 });
  const fs = () => page.evaluate(() => document.querySelector('.fork-container').hasAttribute('data-fork-pseudo-fullscreen'));
  await page.goto('http://127.0.0.1:5177/'); await phase('idle'); await page.evaluate(() => document.fonts.ready);
  check('fallback detected', await page.evaluate(() => document.querySelector('.fork-container').hasAttribute('data-fork-fs-fallback')));
  await page.tap('.fork-start-button'); await phase('playing');
  const viaMenu = await page.evaluate(() => getComputedStyle(document.querySelector('.fork-bar-more')).display !== 'none');
  if (viaMenu) { await page.tap('.fork-more-button'); await page.waitForTimeout(200); await page.tap('.fork-menu-item[data-item="fullscreen"]'); }
  else await page.tap('.fork-bar-fullscreen');
  await page.waitForTimeout(400);
  check(`enters via ${viaMenu ? 'menu' : 'bar button'}`, await fs());
  const box = await page.evaluate(() => { const r = document.querySelector('.fork-container').getBoundingClientRect(); const s = document.querySelector('.fork-stage').getBoundingClientRect(); return { c: [Math.round(r.width), Math.round(r.height)], s: [Math.round(s.width), Math.round(s.height)], scroll: getComputedStyle(document.body).overflow }; });
  check('fills the viewport', box.c[0] === vw && box.c[1] === vh, `${box.c.join('×')}`);
  check('picture 16:9, whole', Math.abs(box.s[0] / box.s[1] - 16 / 9) < 0.02, box.s.join('×'));
  check('page scroll locked', box.scroll === 'hidden');
  await page.screenshot({ path: `/tmp/fs-${label}-playing.png` });
  await page.evaluate((x) => (document.querySelector('video').currentTime = x), sc.p1.out - 0.6); await phase('question'); await page.waitForTimeout(400);
  check('question shows inside', await fs() && await page.evaluate(() => { const q = document.querySelector('.fork-question-card').getBoundingClientRect(); return q.height > 0 && q.bottom <= innerHeight + 1; }));
  await page.screenshot({ path: `/tmp/fs-${label}-question.png` });
  await page.tap('[data-option="b"]'); await phase('transition'); await page.waitForTimeout(300);
  await page.screenshot({ path: `/tmp/fs-${label}-card.png` });
  await page.tap('.fork-route-card-block'); await phase('detour');
  check('closer look plays, still fullscreen', await fs());
  if (viaMenu) { await page.tap('.fork-more-button'); await page.waitForTimeout(200);
    check('menu says Exit fullscreen', /exit/i.test(await page.textContent('.fork-menu-item[data-item="fullscreen"]')));
    await page.tap('.fork-menu-item[data-item="fullscreen"]'); }
  else { check('bar button pressed', (await page.getAttribute('.fork-bar-fullscreen', 'aria-pressed')) === 'true'); await page.keyboard.press('Escape'); }
  await page.waitForTimeout(300);
  check(`leaves via ${viaMenu ? 'menu' : 'Esc'}`, !(await fs()) && await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'));
  // Finish the lesson in fullscreen and look at the summary.
  if (!(await fs())) { if (viaMenu) { await page.tap('.fork-more-button'); await page.waitForTimeout(200); await page.tap('.fork-menu-item[data-item="fullscreen"]'); } else await page.tap('.fork-bar-fullscreen'); await page.waitForTimeout(400); }
  await page.evaluate((x) => (document.querySelector('video').currentTime = x), sc.p1b.out - 0.5); await phase('playing');
  await page.evaluate((x) => (document.querySelector('video').currentTime = x), sc.p2.out - 0.6); await phase('question');
  await page.tap('[data-option="a"]'); await phase('transition'); await page.tap('.fork-route-card-block'); await page.waitForTimeout(500);
  await page.evaluate((x) => (document.querySelector('video').currentTime = x), sc.p2a.out - 0.3); await page.waitForFunction((x) => document.querySelector('video').currentTime >= x, sc.p3.in);
  await page.evaluate((x) => (document.querySelector('video').currentTime = x), sc.p3.out - 0.5); await phase('complete'); await page.waitForTimeout(400);
  const cb = await page.evaluate(() => { const c = document.querySelector('fork-complete').getBoundingClientRect(); const s = document.querySelector('.fork-stage').getBoundingClientRect(); const b = document.querySelector('.fork-bar').getBoundingClientRect(); return { c: [Math.round(c.width), Math.round(c.height)], top: Math.round(c.top), stageTop: Math.round(s.top), barBottom: Math.round(b.bottom), barH: Math.round(b.height) }; });
  check('summary covers picture + bar only', Math.abs(cb.top - cb.stageTop) <= 2 && Math.abs(cb.top + cb.c[1] - cb.barBottom) <= 2, JSON.stringify(cb));
  check('bar is the compact one (≤ 48 px)', cb.barH <= 48, `${cb.barH}px`);
  await page.screenshot({ path: `/tmp/fs-${label}-complete.png` });
  await ctx.close();
}
console.log(failures ? `\n${failures} failed` : '\nAll checks passed.');
await browser.close(); server.kill(); process.exit(failures ? 1 : 0);
