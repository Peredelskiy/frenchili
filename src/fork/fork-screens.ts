/**
 * <fork-start> and <fork-complete> — the two full-player states.
 *
 * Start: the first frame, the lesson's kicker and title in display type, a
 * red Start button and "≈ 2 min · 2 checkpoints". The control bar is already
 * there beneath it.
 *
 * Complete: cream all over. "Course complete", a red block with the score,
 * Replay and Next lesson, and on wide players the whole route with the parts
 * named and timed.
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement } from './icons';
import { lastInputWasKeyboard, restoreFocus } from './modality';
import { t } from './scenario';

export class ForkStartElement extends ForkElement {
  static readonly tagName = 'fork-start';

  #kicker: HTMLElement | null = null;
  #title: HTMLElement | null = null;
  #meta: HTMLElement | null = null;
  #button: HTMLButtonElement | null = null;
  #buttonLabel: HTMLElement | null = null;
  #abort: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    if (!this.#title) {
      this.#kicker = h('span', { class: 'fork-kicker fork-start-kicker' });
      this.#title = h('h2', { class: 'fork-display fork-start-title' });
      this.#meta = h('span', { class: 'fork-kicker fork-start-meta' });
      this.#buttonLabel = h('span', {});
      this.#button = h('button', { class: 'fork-start-button', type: 'button' }, iconElement('play', 'fork-start-play'), this.#buttonLabel);
      this.replaceChildren(
        h('div', { class: 'fork-start-head' }, this.#kicker, this.#title),
        h('div', { class: 'fork-start-actions' }, this.#button, this.#meta),
      );
    }
    this.#button!.addEventListener(
      'click',
      () => {
        this.engine?.start();
        restoreFocus(this);
      },
      { signal: this.#abort.signal },
    );
    this.hidden = true;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state?.scenario || !state.stats) return;
    const open = state.phase === 'idle';
    this.hidden = !open;
    this.toggleAttribute('data-open', open);
    if (!open) return;
    const labels = engine.labels;
    const minutes = Math.max(1, Math.round(state.stats.mainDuration / 60));
    const checkpoints = state.stats.questions.length;
    this.#kicker!.textContent = state.scenario.kicker ?? '';
    this.#kicker!.hidden = !state.scenario.kicker;
    this.#title!.textContent = state.scenario.title;
    this.#meta!.textContent = t(checkpoints === 1 ? labels.lengthOne : labels.lengthMany, { minutes, checkpoints });
    this.#buttonLabel!.textContent = labels.start;
  }
}

export class ForkCompleteElement extends ForkElement {
  static readonly tagName = 'fork-complete';

  #kicker: HTMLElement | null = null;
  #heading: HTMLElement | null = null;
  #scoreLabel: HTMLElement | null = null;
  #score: HTMLElement | null = null;
  #replay: HTMLButtonElement | null = null;
  #replayLabel: HTMLElement | null = null;
  #next: HTMLAnchorElement | null = null;
  #nextLabel: HTMLElement | null = null;
  #abort: AbortController | null = null;
  #open = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    if (!this.#heading) {
      this.#kicker = h('span', { class: 'fork-kicker fork-complete-kicker' });
      this.#heading = h('h2', { class: 'fork-display fork-complete-title', id: 'fork-complete-title' });
      this.#scoreLabel = h('span', { class: 'fork-complete-score-label' });
      this.#score = h('span', { class: 'fork-complete-score' });
      this.#replayLabel = h('span', {});
      this.#replay = h('button', { class: 'fork-complete-replay fork-action', type: 'button', 'data-tone': 'ink' }, iconElement('replay', '', 2.5), this.#replayLabel);
      this.#nextLabel = h('span', {});
      this.#next = h('a', { class: 'fork-complete-next fork-action', 'data-tone': 'mustard', href: '#' }, iconElement('play'), this.#nextLabel);
      this.replaceChildren(
        h(
          'div',
          { class: 'fork-complete-surface', role: 'region', 'aria-labelledby': 'fork-complete-title' },
          h('div', { class: 'fork-complete-head' }, this.#kicker, this.#heading),
          h('div', { class: 'fork-complete-block' }, this.#scoreLabel, this.#score),
          h('div', { class: 'fork-complete-actions' }, this.#replay, this.#next),
          h('fork-route-map', { size: 'expanded', class: 'fork-complete-line' }),
        ),
      );
    }
    this.#replay!.addEventListener('click', () => this.engine?.replay(), { signal: this.#abort.signal });
    this.hidden = true;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state?.scenario) return;
    const open = state.phase === 'complete';
    if (open && !this.#open) {
      const { correct, total } = engine.score;
      const labels = engine.labels;
      this.#kicker!.textContent = state.scenario.name;
      this.#heading!.textContent = labels.complete;
      this.#scoreLabel!.textContent = labels.correct;
      this.#score!.textContent = `${correct}/${total}`;
      this.#score!.setAttribute('aria-label', t(labels.score, { correct, total }));
      this.#replayLabel!.textContent = labels.replay;
      const next = state.scenario.nextLesson;
      this.#next!.hidden = !next;
      if (next) {
        this.#next!.href = next.href;
        this.#nextLabel!.textContent = labels.nextLesson;
        this.#next!.setAttribute('aria-label', `${labels.nextLesson}: ${next.title}`);
      }
      if (lastInputWasKeyboard()) requestAnimationFrame(() => this.#replay?.focus({ preventScroll: true }));
    }
    if (open !== this.#open) {
      this.#open = open;
      this.hidden = !open;
      this.toggleAttribute('data-open', open);
    }
  }
}

if (!customElements.get(ForkStartElement.tagName)) customElements.define(ForkStartElement.tagName, ForkStartElement);
if (!customElements.get(ForkCompleteElement.tagName)) customElements.define(ForkCompleteElement.tagName, ForkCompleteElement);

declare global {
  interface HTMLElementTagNameMap {
    'fork-start': ForkStartElement;
    'fork-complete': ForkCompleteElement;
  }
}
