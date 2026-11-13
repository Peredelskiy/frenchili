/**
 * End-to-end run of the Fork skin in headless Chrome on «Tu ou vous ?»:
 * start → checkpoint 1 (wrong → closer look → back to the lesson) →
 * checkpoint 2 (right → confirmation) → complete. Prints seek latencies and
 * the phase log, and saves screenshots to scripts/shots/.
 * Usage: node scripts/e2e.mjs [--width 360|720|1200] [--keyboard]
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const width = Number(args[args.indexOf('--width') + 1] || 1200);
const keyboard = args.includes('--keyboard');
const shots = new URL('./shots/', import.meta.url).pathname;
mkdirSync(shots, { recursive: true });

const server = spawn('npx', ['vite', '--port', '5173', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((resolve) => server.stdout.on('data', (chunk) => String(chunk).includes('5173') && resolve()));

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: Math.max(width + 48, 480), height: 1000 }, deviceScaleFactor: Number(process.env.DPR ?? 1) });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE', m.text());
});

await page.goto(`http://127.0.0.1:5173/${process.env.THEME ? `?theme=${process.env.THEME}` : ''}`);
await page.evaluate((w) => document.querySelector(`[data-width="${w}"]`).click(), width);
await page.evaluate(() => {
  const video = document.querySelector('video');
  window.__seeks = [];
  let started = 0;
  video.addEventListener('seeking', () => (started = performance.now()));
  video.addEventListener('seeked', () => window.__seeks.push({ to: video.currentTime.toFixed(2), ms: Math.round(performance.now() - started) }));
});

const phase = () => page.evaluate(() => document.querySelector('.fork-container')?.getAttribute('data-fork-phase'));
const waitPhase = async (p, timeout = 90000) => {
  await page.waitForFunction((p) => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === p, p, { timeout });
  console.log(`phase: ${p}`);
};
const shot = async (name) => {
  await page.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' }));
  const box = await page.locator('.fork-container').boundingBox();
  await page.screenshot({ path: `${shots}${process.env.THEME ? `${process.env.THEME}-` : ''}${width}-${name}.png`, clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
};
const setTime = (t) => page.evaluate((t) => (document.querySelector('video').currentTime = t), t);
const time = () => page.evaluate(() => document.querySelector('video').currentTime);

await waitPhase('idle');
await page.waitForTimeout(300);
await shot('1-idle');

if (keyboard) {
  await page.focus('.fork-start-button');
  await page.keyboard.press('Enter');
} else {
  await page.click('.fork-start-button');
}
await waitPhase('playing');
await page.waitForTimeout(600);
await shot('2-playing');

// Pause by click on the picture (gesture), screenshot, resume.
if (!keyboard) {
  const stage = await page.locator('.fork-stage').boundingBox();
  await page.mouse.click(stage.x + stage.width / 2, stage.y + stage.height * 0.3);
  await page.waitForTimeout(300);
  await shot('2b-paused');
  await page.click('.fork-paused-button');
  await page.waitForTimeout(200);
}

// Towards checkpoint 1.
await setTime(38.8);
await waitPhase('question');
await page.waitForTimeout(300);
await shot('3-question');
console.log('question: video paused =', await page.evaluate(() => document.querySelector('video').paused), '| time', (await time()).toFixed(2));

// Wrong answer → closer look.
if (keyboard) await page.keyboard.press('2');
else await page.click('[data-option="b"]');
await page.waitForTimeout(250);
await shot('3b-answered');
await waitPhase('transition');
await page.waitForTimeout(300);
await shot('4-transition');
await page.waitForTimeout(2500);
console.log('card still up after 2.8 s (waits for the learner):', (await phase()) === 'transition', '| video paused:', await page.evaluate(() => document.querySelector('video').paused));
await page.click('.fork-route-card-block');
await waitPhase('detour');
await page.waitForTimeout(700);
console.log('closer look at', (await time()).toFixed(2));
await shot('5-closer-look');
await setTime(66);
await page.waitForTimeout(400);
await shot('5b-closer-look-skip');
await setTime(77.4);
await waitPhase('merge');
await page.waitForTimeout(150);
await shot('6-merge');
await waitPhase('playing');

// Lesson parts panel. (A bar that hides while playing comes back on mouse movement.)
const wake = async () => {
  const box = await page.locator('.fork-stage').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 10);
  await page.waitForTimeout(150);
};
await wake();
if (width >= 720) {
  await page.click('fork-parts-button');
  await page.waitForTimeout(300);
  await shot('2c-parts');
  await page.keyboard.press('Escape');
} else {
  await page.click('.fork-more-button');
  await page.waitForTimeout(200);
  await shot('2c-menu');
  await page.click('[data-item="parts"]');
  await page.waitForTimeout(300);
  await shot('2d-parts');
  await page.keyboard.press('Escape');
}

// Checkpoint 2: right answer → confirmation.
await setTime(111.8);
await waitPhase('question');
await page.waitForTimeout(300);
if (keyboard) {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
} else {
  await page.click('[data-option="a"]');
}
await waitPhase('transition');
await page.waitForTimeout(300);
await shot('4b-transition-right');
await page.click('.fork-route-card-block');
await waitPhase('playing');
await page.waitForTimeout(400);
console.log('confirmation at', (await time()).toFixed(2));
await setTime(120.6);
await page.waitForTimeout(900);
console.log('after confirmation → time (expect ≥151):', (await time()).toFixed(2));
await setTime(175.4);
await waitPhase('complete');
await page.waitForTimeout(400);
await shot('7-complete');

console.log('seeks:', await page.evaluate(() => JSON.stringify(window.__seeks)));
console.log('log:', await page.evaluate(() => Array.from(document.querySelectorAll('#log li')).map((li) => li.textContent.split(' — ')[1]).reverse().join(' | ')));

await browser.close();
server.kill();
process.exit(0);
