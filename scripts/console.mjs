// Console errors, failed requests and 404s on both lessons, desktop and phone.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '5178', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((r) => server.stdout.on('data', (c) => String(c).includes('5178') && r()));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
let problems = 0;
for (const q of ['', '?lesson=5']) for (const [w, mobile] of [[1280, false], [390, true]]) {
  const ctx = await browser.newContext(mobile ? { viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && issues.push(`${m.type()}: ${m.text().slice(0, 140)}`));
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && issues.push(`${r.status()} ${r.url().replace('http://127.0.0.1:5178', '')}`));
  page.on('requestfailed', (r) => !/\.mp4/.test(r.url()) && issues.push(`failed ${r.url()}`));
  await page.goto('http://127.0.0.1:5178/' + q);
  await page.waitForFunction(() => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === 'idle', null, { timeout: 20000 });
  await page.click('.fork-start-button'); await page.waitForTimeout(1500);
  console.log(`${q || 'lesson 4'} @${w}: ${issues.length ? issues.join(' | ') : 'clean'}`);
  problems += issues.length;
  await ctx.close();
}
await browser.close(); server.kill(); process.exit(problems ? 1 : 0);
