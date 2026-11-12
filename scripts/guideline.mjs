/**
 * Contra × Video.js skins challenge — minimum requirements and accessibility tips, one check each.
 *   Essential controls: play/pause, seek bar, time, volume/mute, fullscreen (+ captions)
 *   Responsive: 1200, 720, 360 player sizes; nothing overflows, controls stay usable
 *   Keyboard: every control reachable and operable; menus exit with Esc; focus visible
 *   Tips: tap targets ≥ 44 px on a phone, legible over a white frame, reduced motion, loading/error states
 * Also: keyboard seek (L, →) never jumps over an unanswered checkpoint.
 * Usage: node scripts/guideline.mjs   (serves dist/ with vite preview)
 */
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';

const sc = JSON.parse(readFileSync('public/tu-ou-vous.json', 'utf8')).nodes;
const shots = new URL('./shots/', import.meta.url).pathname;
mkdirSync(shots, { recursive: true });

// A white clip: the worst case for anything cream over the picture.
const bright = 'dist/media/bright.mp4';
if (!existsSync(bright)) {
  execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-y', '-f', 'lavfi', '-i', 'color=c=white:s=1280x720:d=6', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', bright]);
}

const server = spawn('npx', ['vite', 'preview', '--port', '5176', '--host', '127.0.0.1', '--strictPort'], { stdio: 'pipe' });
await new Promise((r) => server.stdout.on('data', (c) => String(c).includes('5176') && r()));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--autoplay-policy=no-user-gesture-required'] });

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== '' ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

async function open(width, mobile = false) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { viewport: { width, height: 1000 } },
  );
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  await page.goto('http://127.0.0.1:5176/');
  await page.waitForFunction(() => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === 'idle');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' }));
  return { page, ctx };
}
const phaseOf = (page) => page.evaluate(() => document.querySelector('.fork-container').getAttribute('data-fork-phase'));
const waitPhase = (page, p) => page.waitForFunction((p) => document.querySelector('.fork-container').getAttribute('data-fork-phase') === p, p, { timeout: 20000 });
const video = (page, f) => page.evaluate(f);
const t = (page, x) => page.evaluate((x) => (document.querySelector('video').currentTime = x), x);

// ---------------- Desktop 1200 ----------------
{
  console.log('\n== Desktop (1200)');
  const { page, ctx } = await open(1260);
  await page.click('.fork-start-button');
  await waitPhase(page, 'playing');

  // Play / pause: bar button, Space, K.
  await page.click('.fork-bar-play');
  check('play/pause: bar button pauses', await video(page, () => document.querySelector('video').paused));
  await page.click('.fork-bar-play');
  check('play/pause: bar button plays', !(await video(page, () => document.querySelector('video').paused)));
  await page.focus('.fork-bar-play');
  await page.keyboard.press('k');
  check('play/pause: K pauses', await video(page, () => document.querySelector('video').paused));
  await page.keyboard.press('k');
  check('play/pause: K plays', !(await video(page, () => document.querySelector('video').paused)));

  // Time moves.
  const timeA = await page.textContent('.fork-bar-time');
  await page.waitForTimeout(1600);
  const timeB = await page.textContent('.fork-bar-time');
  check('time: display advances while playing', timeA !== timeB, `${timeA.trim()} → ${timeB.trim()}`);

  // Seek bar: pointer and keys.
  await t(page, 5);
  await page.waitForTimeout(200);
  const line = await page.locator('.fork-bar .fork-line').boundingBox();
  await page.mouse.click(line.x + line.width * 0.15, line.y + line.height / 2);
  await page.waitForTimeout(300);
  const afterClick = await video(page, () => document.querySelector('video').currentTime);
  check('seek: click on the line jumps', afterClick > 10, afterClick.toFixed(1));
  await page.focus('.fork-bar-line');
  const beforeKey = await video(page, () => document.querySelector('video').currentTime);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const afterKey = await video(page, () => document.querySelector('video').currentTime);
  check('seek: → on the line moves +5 s', afterKey - beforeKey > 4 && afterKey - beforeKey < 6.5, `${beforeKey.toFixed(1)} → ${afterKey.toFixed(1)}`);

  // Keyboard seek must not jump the checkpoint.
  await t(page, sc.p1.out - 3);
  await page.waitForTimeout(300);
  await page.focus('.fork-bar-play');
  await page.keyboard.press('l');
  await page.waitForTimeout(1200);
  const held = await video(page, () => document.querySelector('video').currentTime);
  check('seek: L (+10 s) stops at the unanswered checkpoint', (await phaseOf(page)) === 'question' && held < sc.p1.out + 0.2, `phase ${await phaseOf(page)}, t=${held.toFixed(1)}`);
  if ((await phaseOf(page)) === 'question') {
    await page.click('[data-option="a"]');
    await waitPhase(page, 'transition');
    await page.keyboard.press('Enter');
    await waitPhase(page, 'playing');
  }

  // Volume / mute.
  await page.focus('.fork-bar-play');
  await page.keyboard.press('m');
  check('mute: M mutes', await video(page, () => document.querySelector('video').muted));
  await page.keyboard.press('m');
  check('mute: M unmutes', !(await video(page, () => document.querySelector('video').muted)));
  await page.click('.fork-bar-mute');
  check('mute: bar button mutes', await video(page, () => document.querySelector('video').muted));
  await page.click('.fork-bar-mute');
  const v0 = await video(page, () => document.querySelector('video').volume);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  const v1 = await video(page, () => document.querySelector('video').volume);
  check('volume: ↓ lowers the volume', v1 < v0, `${v0} → ${v1.toFixed(2)}`);
  await page.hover('.fork-bar-mute');
  await page.waitForTimeout(500);
  const popoverOpen = await page.evaluate(() => {
    const p = document.querySelector('.fork-volume-popover');
    return p && getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0;
  });
  check('volume: steps open over the mute button', popoverOpen);
  if (popoverOpen) {
    await page.click('.fork-volume-step[data-level="2"]');
    const v2 = await video(page, () => document.querySelector('video').volume);
    check('volume: a step sets the level', Math.abs(v2 - 0.4) < 0.05, v2.toFixed(2));
  }

  // Captions.
  await page.click('.fork-bar-captions');
  await page.waitForTimeout(200);
  check('captions: button shows them', await video(page, () => [...document.querySelector('video').textTracks].some((tr) => tr.mode === 'showing')));
  await page.focus('.fork-bar-play');
  await page.keyboard.press('c');
  await page.waitForTimeout(200);
  check('captions: C hides them', !(await video(page, () => [...document.querySelector('video').textTracks].some((tr) => tr.mode === 'showing'))));

  // Fullscreen.
  await page.click('.fork-bar-fullscreen');
  await page.waitForTimeout(600);
  check('fullscreen: button enters', await page.evaluate(() => Boolean(document.fullscreenElement)));
  const stage = await page.locator('.fork-stage').boundingBox();
  check('fullscreen: picture stays 16:9 (no crop)', Math.abs(stage.width / stage.height - 16 / 9) < 0.02, `${Math.round(stage.width)}×${Math.round(stage.height)}`);
  await page.focus('.fork-bar-play');
  await page.keyboard.press('f');
  await page.waitForTimeout(600);
  check('fullscreen: F exits', !(await page.evaluate(() => Boolean(document.fullscreenElement))));

  // Focus visible on every bar control.
  const rings = [];
  for (const sel of ['.fork-bar-play', '.fork-bar-line', '.fork-bar-mute', '.fork-bar-captions', '.fork-bar-parts', '.fork-bar-fullscreen']) {
    await page.focus('.fork-bar-play');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.focus(sel);
    await page.keyboard.press('Shift'); // keyboard modality for :focus-visible
    rings.push(await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const cs = getComputedStyle(el);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || /0px 0px 0px [2-9]px/.test(cs.boxShadow);
      return `${sel.replace('.fork-bar-', '')}:${ring ? 'ring' : 'NONE'}`;
    }, sel));
  }
  check('focus: every bar control shows a ring', rings.every((r) => r.endsWith('ring')), rings.join(' '));
  await ctx.close();
}

// ---------------- Reduced motion (system setting) ----------------
{
  console.log('\n== Reduced motion (prefers-reduced-motion)');
  const ctx = await browser.newContext({ viewport: { width: 1260, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5176/');
  await page.waitForFunction(() => document.querySelector('.fork-container')?.getAttribute('data-fork-phase') === 'idle');
  const d = await page.evaluate(() => getComputedStyle(document.querySelector('.fork-bar')).getPropertyValue('--fork-duration-reflow').trim());
  check('reduced motion: transitions collapse', parseFloat(d) === 0.01, d);
  await ctx.close();
}

// ---------------- 720 ----------------
{
  console.log('\n== Tablet (720)');
  const { page, ctx } = await open(780);
  await page.evaluate(() => document.querySelector('[data-width="720"]').click());
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bar = document.querySelector('.fork-bar').getBoundingClientRect();
    const kids = [...document.querySelectorAll('.fork-bar .fork-control, .fork-bar-time, .fork-bar-line')].filter((e) => e.offsetParent);
    return { overflow: kids.some((k) => k.getBoundingClientRect().right > bar.right + 1), visible: kids.length, page: document.documentElement.scrollWidth <= innerWidth };
  });
  check('720: bar fits, nothing spills', !r.overflow && r.page, `${r.visible} controls`);
  await page.screenshot({ path: `${shots}guide-720.png`, clip: await page.locator('video-player').boundingBox() });
  await ctx.close();
}

// ---------------- Phone 360 (touch) ----------------
{
  console.log('\n== Phone (390 viewport, touch)');
  const { page, ctx } = await open(390, true);
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.fork-bar .fork-control, .fork-start-button')) {
      if (!el.offsetParent) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) out.push(`${el.className.split(' ').pop()} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return out;
  });
  check('tap targets: bar controls ≥ 44 px', small.length === 0, small.join(', '));
  const line = await page.evaluate(() => Math.round(document.querySelector('.fork-bar-line').getBoundingClientRect().height));
  check('tap targets: route line touch height ≥ 44 px', line >= 44, `${line}px`);
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.fork-bar'));
    return ['--fork-line-height', '--fork-station', '--fork-time-size', '--fork-rule'].map((n) => cs.getPropertyValue(n).trim()).join(' ');
  });
  check('360 sizes in force (line 4, station 14, time 14, rules 3)', tokens === '4px 14px 14px 3px', tokens);

  await page.tap('.fork-start-button');
  await waitPhase(page, 'playing');
  await page.waitForTimeout(400);
  await page.tap('.fork-stage', { position: { x: 120, y: 80 } });
  await page.waitForTimeout(300);
  check('touch: tap on the picture pauses', await video(page, () => document.querySelector('video').paused));
  await page.tap('.fork-paused-button');
  await page.waitForTimeout(300);
  check('touch: tap on the play square resumes', !(await video(page, () => document.querySelector('video').paused)));

  await page.tap('.fork-more-button');
  await page.waitForTimeout(200);
  const items = await page.evaluate(() => [...document.querySelectorAll('.fork-menu-item')].filter((e) => e.offsetParent).map((e) => `${e.dataset.item}:${Math.round(e.getBoundingClientRect().height)}`));
  check('menu: sound, captions, parts, fullscreen', ['sound', 'captions', 'parts', 'fullscreen'].every((n) => items.some((i) => i.startsWith(n))), items.join(' '));
  check('menu: items ≥ 44 px tall', items.every((i) => Number(i.split(':')[1]) >= 44));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('menu: Esc closes', await page.evaluate(() => document.querySelector('.fork-menu').hidden));

  await t(page, sc.p1.out - 0.6);
  await waitPhase(page, 'question');
  const rows = await page.evaluate(() => [...document.querySelectorAll('.fork-question-row')].map((r) => Math.round(r.getBoundingClientRect().height)));
  check('question: answer rows ≥ 44 px', rows.every((h) => h >= 44), rows.join(' '));
  await ctx.close();
}

// ---------------- Legible over a white frame ----------------
{
  console.log('\n== Over a white frame');
  const { page, ctx } = await open(1260);
  await page.evaluate(() => {
    document.querySelector('fork-skin').removeAttribute('poster');
    const v = document.querySelector('video');
    v.src = './media/bright.mp4';
  });
  await page.waitForTimeout(1200);
  const box = await page.locator('video-player').boundingBox();
  await page.screenshot({ path: `${shots}guide-white-start.png`, clip: box });
  // Sample the start screen's backdrop right next to the kicker.
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('fork-start')).backgroundColor);
  check('start screen backdrop is strong enough for small text', /0\.7[0-9]?\)/.test(bg), bg);
  await ctx.close();
}

// ---------------- Error state ----------------
{
  console.log('\n== Error');
  const { page, ctx } = await open(1260);
  await page.evaluate(() => {
    const v = document.querySelector('video');
    v.src = './media/missing.mp4';
    v.load();
  });
  await page.waitForTimeout(1500);
  const err = await page.evaluate(() => {
    const p = document.querySelector('.fork-error-card');
    const r = p.getBoundingClientRect();
    const name = (id) => document.getElementById(p.getAttribute(id) || '')?.textContent.trim() ?? '';
    return { visible: p.hasAttribute('data-open') && r.height > 0, label: name('aria-labelledby'), desc: name('aria-describedby') };
  });
  check('error: card shows when the video fails', err.visible);
  check('error: announced in plain words', err.label === 'No video' && !/Pipeline|Demuxer|FFmpeg/i.test(err.desc), `${err.label} — ${err.desc}`);
  await page.screenshot({ path: `${shots}guide-error.png`, clip: await page.locator('video-player').boundingBox() });
  await page.focus('.fork-error-retry').catch(() => {});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  check('error: Try again closes the card (keyboard)', !(await page.evaluate(() => document.querySelector('.fork-error-card').hasAttribute('data-open'))));
  await ctx.close();
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
await browser.close();
server.kill();
process.exit(failures ? 1 : 0);
