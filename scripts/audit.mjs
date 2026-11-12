/**
 * Accessibility and interaction audit of the Fork skin in headless Chrome,
 * on «Tu ou vous ?». axe-core in each state, tab order, the locked seek, the
 * line as a slider, Esc / click on the route card, the parts panel, the more
 * menu, reduced motion. Usage: node scripts/audit.mjs [--width 1200|360]
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const width = Number(args[args.indexOf('--width') + 1] || 1200);
const mobile = width < 720;
const shots = new URL('./shots/', import.meta.url).pathname;
mkdirSync(shots, { recursive: true });
const server = spawn('npx', ['vite', '--port', '5173', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((r) => server.stdout.on('data', (c) => String(c).includes('5173') && r()));

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: Math.max(width + 48, 480), height: 1100 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await page.goto('http://127.0.0.1:5173/');
// Width presets are hidden on narrow screens; press the button from script.
await page.evaluate((w) => document.querySelector(`[data-width="${w}"]`).click(), width);
// The player sits under the lesson heading: bring it to the top of the viewport.
await page.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' }));

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const phase = () => page.evaluate(() => document.querySelector('.fork-container')?.getAttribute('data-fork-phase'));
const waitPhase = (p) => page.waitForFunction((p) => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === p, p, { timeout: 60000 });
const setTime = (t) => page.evaluate((t) => (document.querySelector('video').currentTime = t), t);
const time = () => page.evaluate(() => document.querySelector('video').currentTime);
const axe = async (state) => {
  const results = await new AxeBuilder({ page }).include('#stage').analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  check(`axe (${state})`, serious.length === 0, serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`).join(' | '));
  for (const v of results.violations.filter((v) => !serious.includes(v))) console.log(`  note (${v.impact}) ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

await waitPhase('idle');
await axe('idle');
{
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  check('axe (whole page)', serious.length === 0, serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`).join(' | '));
  for (const v of results.violations.filter((v) => !serious.includes(v))) console.log(`  note (${v.impact}) ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

// Keyboard start.
// Start from the lesson heading, the last thing before the player.
await page.evaluate(() => document.querySelector('h1').setAttribute('tabindex', '-1'));
await page.focus('h1');
await page.keyboard.press('Tab'); // the player container
await page.keyboard.press('Tab');
check('idle: second tab stop is Start', await page.evaluate(() => document.activeElement?.classList.contains('fork-start-button')), await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 60)));
await page.keyboard.press('Enter');
await waitPhase('playing');
await page.waitForTimeout(300);
check('playing: focus on play button after keyboard start', await page.evaluate(() => document.activeElement?.classList.contains('fork-bar-play')), await page.evaluate(() => document.activeElement?.tagName));
check('time reads lesson total 1:40', (await page.textContent('.fork-time-total')) === '1:40', await page.textContent('.fork-time-total'));

// Locked seek: a click at the far right of the line is refused and the checkpoint shows the lock plaque.
const line = await page.locator('.fork-bar-line').boundingBox();
const before = await time();
if (process.env.DEBUG) console.log('hit', JSON.stringify(line), await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.outerHTML.slice(0, 120), [line.x + line.width - 6, line.y + line.height / 2]));
await page.mouse.click(line.x + line.width - 6, line.y + line.height / 2);
await page.waitForTimeout(300);
check('locked seek refused', (await time()) < before + 3, `t=${(await time()).toFixed(1)}`);
check('locked seek shows the plaque on the checkpoint', await page.evaluate(() => Boolean(document.querySelector('.fork-line-station[data-locked-hint]'))));
await page.screenshot({ path: `${shots}audit-${width}-locked.png`, clip: await page.locator('.fork-container').boundingBox() });

// Slider keys.
await page.focus('.fork-bar-line');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
check('line ArrowRight seeks +5 s', (await time()) >= before + 4, `t=${(await time()).toFixed(1)}`);
check('line aria-valuetext names the part', (await page.getAttribute('.fork-bar-line', 'aria-valuetext'))?.includes('Two words for you'), await page.getAttribute('.fork-bar-line', 'aria-valuetext'));
await axe('playing');

// Parts panel (desktop button / mobile menu).
if (!mobile) {
  await page.click('fork-parts-button');
  await page.waitForTimeout(250);
  check('parts panel opens', await page.evaluate(() => !document.querySelector('fork-parts').hidden));
  check('parts panel: focus inside', await page.evaluate(() => Boolean(document.activeElement?.closest('fork-parts'))));
  await axe('parts');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  check('parts panel: Esc closes and returns focus', await page.evaluate(() => document.querySelector('fork-parts').hidden && document.activeElement?.tagName === 'FORK-PARTS-BUTTON'), await page.evaluate(() => document.activeElement?.tagName));
} else {
  await page.click('.fork-more-button');
  await page.waitForTimeout(200);
  check('more menu opens with focus on first item', await page.evaluate(() => document.activeElement?.getAttribute('role')?.startsWith('menuitem')));
  await axe('menu');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  check('more menu: Esc closes and returns focus', await page.evaluate(() => document.querySelector('.fork-menu').hidden && document.activeElement?.classList.contains('fork-more-button')));
}

// Checkpoint 1.
await setTime(38.8);
await waitPhase('question');
await page.waitForTimeout(300);
await axe('question');
check('question: dialog is modal', (await page.getAttribute('.fork-question-card', 'aria-modal')) === 'true');
check('question: focus on first answer', await page.evaluate(() => document.activeElement?.getAttribute('role') === 'radio'));
for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
check('question: Tab stays inside', await page.evaluate(() => Boolean(document.activeElement?.closest('fork-question'))));
await page.keyboard.press('Space');
await page.waitForTimeout(100);
// Space on a focused answer answers it (that is the design); the video must still be paused.
check('question: video stays paused', await page.evaluate(() => document.querySelector('video').paused));
check('question: answer coloured at once', await page.evaluate(() => Boolean(document.querySelector('.fork-question-option[data-verdict]'))));
await waitPhase('transition');
await page.waitForTimeout(200);
await axe('transition');
check('transition: block is a button', await page.evaluate(() => document.querySelector('.fork-route-card-block')?.tagName === 'BUTTON'));
await page.waitForTimeout(3000);
check('transition: card waits for the learner', (await phase()) === 'transition');
check('transition: video paused under the card', await page.evaluate(() => document.querySelector('video').paused));
check('transition: focus on the card button', await page.evaluate(() => document.activeElement?.classList.contains('fork-route-card-block')));
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
const after = await phase();
check('transition: Esc goes on', after === 'playing' || after === 'detour', after);

// Reduced motion flag.
await page.check('#reduced-motion');
await page.waitForTimeout(100);
check('reduced motion flag reaches container', await page.evaluate(() => document.querySelector('.fork-container').hasAttribute('data-fork-reduced-motion')));
await page.uncheck('#reduced-motion');

// Finish: checkpoint 2 wrong → closer look, badge, B key.
await setTime(111.8);
await waitPhase('question');
await page.waitForTimeout(250);
await page.keyboard.press('2');
await waitPhase('transition');
await page.click('.fork-route-card-block');
await waitPhase('detour');
await page.waitForTimeout(300);
check('closer look: badge visible', await page.evaluate(() => !document.querySelector('fork-detour-badge').hidden));
check('time total grew to 2:18 (1:40 + 0:08 confirmation + 0:30 closer look)', (await page.textContent('.fork-time-total')) === '2:18', await page.textContent('.fork-time-total'));
await axe('closer look');
await setTime(140);
await page.waitForTimeout(300);
await page.focus('.fork-container');
await page.keyboard.press('b');
await page.waitForTimeout(250);
check('closer look: B returns to the lesson', ['merge', 'playing'].includes(await phase()) && (await time()) >= 151, `${await phase()} t=${(await time()).toFixed(1)}`);
await setTime(175.4);
await waitPhase('complete');
await page.waitForTimeout(300);
await axe('complete');
check('complete: score reads 1/2', (await page.textContent('.fork-complete-score')) === '1/2', await page.textContent('.fork-complete-score'));
await page.click('.fork-complete-replay');
await waitPhase('playing');
check('replay restarts', (await time()) < 2 && (await page.textContent('.fork-time-total')) === '1:40', `t=${(await time()).toFixed(1)} total=${await page.textContent('.fork-time-total')}`);

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
await browser.close();
server.kill();
process.exit(failures === 0 ? 0 : 1);
