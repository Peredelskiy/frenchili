/**
 * Leçon 5 «Bonjour ou salut ?» end to end, plus the hand-off from Leçon 4:
 *  1. Leçon 4 complete → "Next lesson" opens ?lesson=5 with the right page and video.
 *  2. Right answer: p1 → confirmation (38–46) → jump to "To remember" (71) → complete.
 *  3. Replay, wrong answer: p1 → closer look (46–71) plays into "To remember" → complete.
 * Usage: node scripts/e2e-lesson5.mjs [--width 360|1200]
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const width = Number(args[args.indexOf('--width') + 1] || 1200);
const shots = new URL('./shots/', import.meta.url).pathname;
mkdirSync(shots, { recursive: true });

const server = spawn('npx', ['vite', '--port', '5173', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((resolve) => server.stdout.on('data', (chunk) => String(chunk).includes('5173') && resolve()));

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: Math.max(width + 48, 480), height: 1000 } });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const waitPhase = (p, timeout = 60000) =>
  page.waitForFunction((p) => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === p, p, { timeout });
const setTime = (t) => page.evaluate((t) => (document.querySelector('video').currentTime = t), t);
const time = () => page.evaluate(() => document.querySelector('video').currentTime);
const shot = async (name) => {
  await page.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' }));
  const box = await page.locator('.fork-container').boundingBox();
  await page.screenshot({ path: `${shots}l5-${width}-${name}.png`, clip: box });
};
const prepare = async () => {
  await page.evaluate((w) => document.querySelector(`[data-width="${w}"]`).click(), width);
  await page.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' }));
};

// 1. Leçon 4 → Next lesson. (Leçon 4 cannot be scrubbed past its checkpoints, so read the link from its scenario.)
await page.goto(`http://127.0.0.1:5173/${process.env.THEME ? `?theme=${process.env.THEME}` : ''}`);
const nextHref = await page.evaluate(() => fetch('./tu-ou-vous.json').then((r) => r.json()).then((d) => d.nextLesson?.href));
check('Leçon 4 scenario links to Leçon 5', nextHref === './?lesson=5', nextHref);
await page.goto((() => { const u = new URL(nextHref, 'http://127.0.0.1:5173/'); if (process.env.THEME) u.searchParams.set('theme', process.env.THEME); return u.href; })());
await prepare();
await waitPhase('idle');
check('page title is Leçon 5', (await page.title()).startsWith('Leçon 5'), await page.title());
check('heading reads Bonjour ou salut ?', (await page.textContent('h1')).replace(/\s/g, ' ') === 'Bonjour ou salut ?');
check('progress reads 5 / 12', (await page.textContent('#progress-label')) === '5 / 12');
check('video is lesson 5', (await page.getAttribute('video', 'src')).includes('bonjour-ou-salut'));
check('captions track has cues', await page.evaluate(() => { const t = [...document.querySelector('video').textTracks].find((x) => x.kind === 'captions'); return Boolean(t && t.cues && t.cues.length > 10); }));
check('time total reads 0:58 (0:38 + 0:20; branches add when taken)', (await page.textContent('.fork-time-total')) === '0:58', await page.textContent('.fork-time-total'));
check('up next is "coming soon" (no link)', await page.evaluate(() => !document.querySelector('a.next-card') && Boolean(document.querySelector('.next-card-soon'))));
check('unit list links back to Leçon 4', await page.evaluate(() => Boolean(document.querySelector('.unit a[href="./"]'))));
await shot('1-idle');

// 2. Right answer.
await page.click('.fork-start-button');
await waitPhase('playing');
await setTime(36.8);
await waitPhase('question');
await page.waitForTimeout(300);
check('question pauses before 0:38', (await time()) < 38, (await time()).toFixed(2));
check('question prompt names Madame Morel', (await page.textContent('fork-question')).includes('Madame Morel'));
await shot('2-question');
await page.click('[data-option="a"]');
await waitPhase('transition');
await page.waitForTimeout(300);
await shot('3-right');
await page.click('.fork-route-card-block');
await waitPhase('playing');
await page.waitForTimeout(400);
const confirmAt = await time();
check('time total grew to 1:06 with the confirmation', (await page.textContent('.fork-time-total')) === '1:06', await page.textContent('.fork-time-total'));
check('confirmation plays from 0:38', confirmAt >= 38 && confirmAt < 46, confirmAt.toFixed(2));
await setTime(45.6);
await page.waitForTimeout(1000);
const afterConfirm = await time();
check('after confirmation → To remember (≥ 71)', afterConfirm >= 71 && afterConfirm < 74, afterConfirm.toFixed(2));
await setTime(90.4);
await waitPhase('complete');
await page.waitForTimeout(400);
check('score 1/1', (await page.textContent('fork-complete')).includes('1/1'));
check('no Next lesson button on the last lesson', await page.evaluate(() => {
  const a = document.querySelector('fork-complete a');
  return !a || a.hidden || getComputedStyle(a).display === 'none';
}));
await shot('4-complete-right');

// 3. Replay, wrong answer.
await page.click('.fork-complete-replay, fork-complete button');
await waitPhase('playing');
await setTime(36.8);
await waitPhase('question');
await page.click('[data-option="c"]');
await waitPhase('transition');
await page.waitForTimeout(300);
await shot('5-wrong');
await page.waitForTimeout(2500);
check('wrong-answer card waits for the learner', await page.evaluate(() => document.querySelector('.fork-container').getAttribute('data-fork-phase') === 'transition'));
await page.keyboard.press('Enter'); // focus sits on the card's button
await waitPhase('detour');
await page.waitForTimeout(600);
const detourAt = await time();
check('closer look plays from 0:46', detourAt >= 46 && detourAt < 50, detourAt.toFixed(2));
check('time total grew to 1:23 (0:38 + 0:25 + 0:20)', (await page.textContent('.fork-time-total')) === '1:23', await page.textContent('.fork-time-total'));
await shot('6-closer-look');
await setTime(70.4);
await waitPhase('merge');
await shot('7-merge');
await waitPhase('playing');
const mergeAt = await time();
check('closer look runs into To remember', mergeAt >= 71 && mergeAt < 74, mergeAt.toFixed(2));
await setTime(90.4);
await waitPhase('complete');
check('score 0/1', (await page.textContent('fork-complete')).includes('0/1'));
await shot('8-complete-wrong');

console.log(failures ? `${failures} check(s) failed.` : 'All checks passed.');
await browser.close();
server.kill();
process.exit(failures ? 1 : 0);
