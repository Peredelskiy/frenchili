import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '5174', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe', cwd: '/home/claude/fork' });
await new Promise((r) => server.stdout.on('data', (c) => String(c).includes('5174') && r()));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `/tmp/page-${w}.png`, fullPage: true });
  await page.screenshot({ path: `/tmp/page-${w}-fold.png` });
  console.log(w, 'errors:', errors, 'scrollW', await page.evaluate(() => document.documentElement.scrollWidth));
}
await browser.close(); server.kill(); process.exit(0);
