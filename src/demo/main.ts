// Fonts ship with the demo (no third-party font service): Anton for display, DM Sans for text.
import '@fontsource/anton/latin-400.css';
import '@fontsource/anton/latin-ext-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-500-italic.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
// The Glass theme is set in Inter.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@videojs/html/media/mux-video';
import '../fork';
import { COURSE_LESSONS, lessonFromUrl, renderLesson } from './lessons';

const lesson = lessonFromUrl();

// Page chrome for this lesson.
document.title = `Leçon ${lesson.number} · ${lesson.title} — Frenchili`;
document.getElementById('progress')!.setAttribute('aria-label', `Lesson ${lesson.number} of ${COURSE_LESSONS}`);
document.getElementById('progress-fill')!.style.width = `${Math.round((lesson.number / COURSE_LESSONS) * 100)}%`;
document.getElementById('progress-label')!.textContent = `${lesson.number} / ${COURSE_LESSONS}`;

const main = document.getElementById('lesson')!;
main.innerHTML = renderLesson(lesson);

// Captions ship inside the bundle (this host won't serve .vtt files). iPhone Safari won't
// load a <track> from a data: URL, so the cues go straight onto the video instead — the
// standard TextTrack API, the same everywhere. (A real site just uses <track src="….vtt">.)
const video = main.querySelector<HTMLVideoElement>('mux-video, video')!;
addCaptions(video, lesson.captions);

function addCaptions(target: HTMLVideoElement, vtt: string): void {
  const track = target.addTextTrack('captions', 'English', 'en') as TextTrack | undefined;
  // <mux-video> attaches its inner video a moment later; try again once it has.
  if (!track) {
    target.addEventListener('loadstart', () => addCaptions(target, vtt), { once: true });
    return;
  }
  const time = (stamp: string) => {
    const parts = stamp.trim().split(':').map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  };
  for (const block of vtt.replace(/\r/g, '').split(/\n{2,}/)) {
    const lines = block.split('\n');
    const at = lines.findIndex((line) => line.includes('-->'));
    if (at === -1) continue;
    const [start, end] = lines[at].split('-->').map((s) => s.trim().split(/\s+/)[0]);
    const text = lines.slice(at + 1).join('\n').trim();
    if (text) track.addCue(new VTTCue(time(start), time(end), text));
  }
  track.mode = 'hidden'; // off until the learner turns captions on
}

const stage = document.getElementById('stage')!;
const log = document.getElementById('log')!;
const skin = document.querySelector('fork-skin')!;

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-width]')) {
  button.addEventListener('click', () => {
    stage.style.setProperty('--demo-width', `${button.dataset.width}px`);
    for (const other of document.querySelectorAll<HTMLButtonElement>('[data-width]')) {
      other.setAttribute('aria-pressed', String(other === button));
    }
  });
}

// Theme: Affiche (default) or Glass. ?theme=glass in the address opens the lesson in Glass.
const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme]');
const setTheme = (theme: string, updateUrl: boolean) => {
  if (theme) skin.setAttribute('theme', theme);
  else skin.removeAttribute('theme');
  // The page follows: Glass turns Frenchili into a plain corporate product page.
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  for (const button of themeButtons) button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  if (updateUrl) {
    const url = new URL(location.href);
    if (theme) url.searchParams.set('theme', theme);
    else url.searchParams.delete('theme');
    try {
      history.replaceState(null, '', url);
    } catch {
      // Some hosts (a sandboxed preview) don't allow it; the switch still works.
    }
  }
};
for (const button of themeButtons) button.addEventListener('click', () => setTheme(button.dataset.theme ?? '', true));
setTheme(new URLSearchParams(location.search).get('theme') === 'glass' ? 'glass' : '', false);

// Moving to another lesson keeps the chosen theme.
document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="lesson="]');
  const theme = skin.getAttribute('theme');
  if (!link || !theme) return;
  const url = new URL(link.href, location.href);
  url.searchParams.set('theme', theme);
  link.href = url.toString();
}, true);

document.getElementById('reduced-motion')!.addEventListener('change', (event) => {
  skin.toggleAttribute('reduced-motion', (event.target as HTMLInputElement).checked);
});

document.getElementById('reset')!.addEventListener('click', () => {
  skin.engine?.replay();
});

const append = (text: string) => {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
  log.prepend(item);
  while (log.children.length > 12) log.lastElementChild?.remove();
};

let lastPhase = '';
skin.addEventListener('fork-change', (event) => {
  const state = (event as CustomEvent).detail;
  if (state.phase !== lastPhase) {
    lastPhase = state.phase;
    append(`phase → ${state.phase}${state.segmentId ? ` (${state.segmentId})` : ''}`);
  }
});
skin.addEventListener('fork-answer', (event) => {
  const { questionId, optionId, correct } = (event as CustomEvent).detail;
  append(`answer ${questionId} = ${optionId} (${correct ? 'right' : 'not quite'})`);
});
skin.addEventListener('fork-complete', (event) => {
  const { route } = (event as CustomEvent).detail;
  append(`complete · route ${route.join(' → ')}`);
});
