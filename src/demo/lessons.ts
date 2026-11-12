/**
 * Frenchili demo lessons. One page, two lessons: `./` is Leçon 4, `./?lesson=5` is Leçon 5.
 * Everything a lesson page shows lives here; main.ts renders it.
 */
import tuOuVousVtt from './captions/tu-ou-vous.en.vtt?raw';
import bonjourOuSalutVtt from './captions/bonjour-ou-salut.en.vtt?raw';

const nbsp = ' ';

export interface Lesson {
  number: number;
  title: string;
  meta: string[];
  scenario: string;
  video: string;
  poster: string;
  /** Mux playback ID; the live site streams from Mux, the bundled build plays the file. */
  mux: string;
  /** Second of the video used for the poster frame. */
  posterTime: number;
  captions: string;
  rules: { lead: string; word: string; note: string }[];
  ruleLine: string;
  phrases: { fr: string; to: string; en: string }[];
}

export interface UnitItem {
  number: number;
  title: string;
  href?: string;
  done?: boolean;
}

export const UNIT_TITLE = 'Unit 2 · Talking to people';
export const COURSE_LESSONS = 12;

export const UNIT: UnitItem[] = [
  { number: 3, title: 'Les nombres', done: true },
  { number: 4, title: `Tu ou vous${nbsp}?`, href: './' },
  { number: 5, title: `Bonjour ou salut${nbsp}?`, href: './?lesson=5' },
  { number: 6, title: 'Au café' },
];

export const LESSONS: Record<number, Lesson> = {
  4: {
    number: 4,
    title: `Tu ou vous${nbsp}?`,
    meta: ['≈ 2 min', '2 checkpoints', 'Captions'],
    scenario: './tu-ou-vous.json',
    video: './media/tu-ou-vous.mp4',
    poster: './media/tu-ou-vous-poster.jpg',
    mux: 'y7kXZk68mEeFGVBOWiYUhmuQFDnIQMY6JQr9wYfqEGk',
    posterTime: 78.4,
    captions: tuOuVousVtt,
    rules: [
      { lead: 'One person you know well', word: 'tu', note: 'friends · family · children' },
      { lead: "One person you don’t know well", word: 'vous', note: 'strangers · older people · shops and work' },
      { lead: 'Two or more people', word: 'vous', note: 'always, whoever they are' },
    ],
    ruleLine: '<span class="fr">tu as</span> · <span class="fr">vous avez</span> — the verb follows. Not sure? Say <span class="fr">vous</span>.',
    phrases: [
      { fr: `«${nbsp}Excusez-moi, vous avez l’heure${nbsp}?${nbsp}»`, to: 'a stranger', en: 'Excuse me, do you have the time?' },
      { fr: `«${nbsp}Salut, tu as l’heure${nbsp}?${nbsp}»`, to: 'a friend', en: 'Hi, got the time?' },
      { fr: `«${nbsp}Tu veux un café${nbsp}?${nbsp}»`, to: 'one friend', en: 'Want a coffee?' },
      { fr: `«${nbsp}Vous voulez un café${nbsp}?${nbsp}»`, to: 'two friends', en: 'Do you both want a coffee?' },
    ],
  },
  5: {
    number: 5,
    title: `Bonjour ou salut${nbsp}?`,
    meta: ['≈ 1 min', '1 checkpoint', 'Captions'],
    scenario: './bonjour-ou-salut.json',
    video: './media/bonjour-ou-salut.mp4',
    poster: './media/bonjour-ou-salut-poster.jpg',
    mux: '5EJb9NG01oHEZWMB02eW7NPUU5CW02FD2zkfBza9VlI3fI',
    posterTime: 29.7,
    captions: bonjourOuSalutVtt,
    rules: [
      { lead: 'Someone you call tu', word: 'salut', note: 'friends · family · children' },
      { lead: 'Anyone at all', word: 'bonjour', note: 'strangers · neighbours · shops and work' },
      { lead: 'Not sure', word: 'bonjour', note: 'it never sounds wrong' },
    ],
    ruleLine: `<span class="fr">comment vas-tu${nbsp}?</span> · <span class="fr">comment allez-vous${nbsp}?</span> — same hello, the question gives away tu or vous.`,
    phrases: [
      { fr: `«${nbsp}Salut, ça va${nbsp}?${nbsp}»`, to: 'a friend', en: 'Hi, how’s it going?' },
      { fr: `«${nbsp}Bonjour, comment allez-vous${nbsp}?${nbsp}»`, to: 'a neighbour', en: 'Hello, how are you?' },
      { fr: `«${nbsp}Bonjour, comment vas-tu${nbsp}?${nbsp}»`, to: 'a friend', en: 'Hello, how are you?' },
      { fr: `«${nbsp}Bonjour, madame${nbsp}!${nbsp}»`, to: 'anyone', en: 'Good morning!' },
    ],
  },
};

export function lessonFromUrl(): Lesson {
  const requested = Number(new URLSearchParams(location.search).get('lesson'));
  return LESSONS[requested] ?? LESSONS[4];
}

const unitItem = (item: UnitItem, current: number): string => {
  const isCurrent = item.number === current;
  const cls = isCurrent ? 'current' : item.done ? 'done' : !item.href ? 'soon' : '';
  const inner = `<span>${item.number}</span> ${item.title}`;
  const body = item.href && !isCurrent ? `<a href="${item.href}">${inner}</a>` : inner;
  return `<li${cls ? ` class="${cls}"` : ''}${isCurrent ? ' aria-current="page"' : ''}>${body}</li>`;
};

/** The "Up next" card: a link when the next lesson exists, a quiet "coming soon" block when it doesn’t. */
const nextCard = (lesson: Lesson): string => {
  const next = UNIT.find((item) => item.number === lesson.number + 1);
  if (!next) return '';
  const nextLesson = LESSONS[next.number];
  const meta = nextLesson ? nextLesson.meta[0] : 'Coming soon';
  // Built like the player’s route-card block: big triangle, spaced kicker, Anton title.
  const triangle = `<svg class="next-card-triangle" viewBox="0 0 45 55" fill="currentColor" aria-hidden="true"><path d="M0 0l45 27.5L0 55z"/></svg>`;
  const text = `<span class="next-card-text">
        <span class="next-card-kicker">Leçon ${next.number} · ${meta}</span>
        <span class="next-card-title">${next.title}</span>
      </span>`;
  const content = next.href ? triangle + text : text;
  return next.href
    ? `<a class="next-card" href="${next.href}">${content}</a>`
    : `<div class="next-card next-card-soon">${content}</div>`;
};

/**
 * Mux streams on the live site. Builds made with VITE_MEDIA=file (the claude.ai page, whose
 * security policy allows no outside media) and local test runs play the bundled MP4 instead.
 */
export function useMux(lesson: Lesson): boolean {
  if (!lesson.mux) return false;
  const forced = new URLSearchParams(location.search).get('media');
  if (forced) return forced === 'mux';
  if (import.meta.env.VITE_MEDIA === 'file') return false;
  return !['localhost', '127.0.0.1'].includes(location.hostname);
}

function media(lesson: Lesson): { tag: string; poster: string } {
  if (useMux(lesson)) {
    return {
      tag: `<mux-video playback-id="${lesson.mux}" playsinline preload="metadata" crossorigin="anonymous"></mux-video>`,
      poster: `https://image.mux.com/${lesson.mux}/thumbnail.webp?time=${lesson.posterTime}&amp;width=1600`,
    };
  }
  return { tag: `<video src="${lesson.video}" playsinline preload="metadata" crossorigin="anonymous"></video>`, poster: lesson.poster };
}

export function renderLesson(lesson: Lesson): string {
  const m = media(lesson);
  return `
  <h1 class="visually-hidden">${lesson.title}</h1>

  <div class="player" id="stage">
    <video-player>
      <fork-skin scenario-src="${lesson.scenario}" poster="${m.poster}">
        ${m.tag}
      </fork-skin>
    </video-player>
  </div>

  <div class="columns">
    <section class="col" aria-labelledby="rules-title">
      <h2 class="section-title" id="rules-title">In this lesson</h2>
      <ol class="rules">
        ${lesson.rules
          .map(
            (rule, i) => `<li>
          <span class="rules-number">${i + 1}</span>
          <div><strong>${rule.lead}</strong> → <span class="fr">${rule.word}</span><span class="rules-note">${rule.note}</span></div>
        </li>`,
          )
          .join('')}
      </ol>
      <p class="rule-line">${lesson.ruleLine}</p>

      <h2 class="section-title" id="phrases-title">Key phrases</h2>
      <table class="phrases" aria-labelledby="phrases-title">
        <thead><tr><th scope="col">French</th><th scope="col">Say it to</th><th scope="col">English</th></tr></thead>
        <tbody>
          ${lesson.phrases.map((p) => `<tr><td class="fr" lang="fr">${p.fr}</td><td>${p.to}</td><td>${p.en}</td></tr>`).join('')}
        </tbody>
      </table>
    </section>

    <aside class="col col-side">
      <section aria-labelledby="unit-title">
        <h2 class="section-title" id="unit-title">${UNIT_TITLE}</h2>
        <ol class="unit">${UNIT.map((item) => unitItem(item, lesson.number)).join('')}</ol>
      </section>
      <section aria-labelledby="next-title">
        <h2 class="section-title" id="next-title">Up next</h2>
        ${nextCard(lesson)}
      </section>

    </aside>
  </div>`;
}
