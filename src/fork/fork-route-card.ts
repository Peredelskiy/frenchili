/**
 * <fork-route-card> — the transition as a designed moment.
 *
 * After an answer the card covers the seek: the verdict in display type, one
 * line of feedback, and a coloured block saying where the lesson goes next —
 * mustard "Next · At the café · 0:35" or red "Let's take a closer look · One
 * or many? · 0:30". The block is a button: a click (or Enter / Esc) goes on at
 * once, otherwise the lesson continues by itself after a moment. The first
 * frame of the next part is already under the card.
 *
 * The same element, folded to a toast in the top-left corner, marks the
 * return to the lesson after extra material: the part's number in red and
 * "Back to the lesson · To remember".
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement } from './icons';
import { formatTime } from './scenario';
import { lastInputWasKeyboard } from './modality';

type CardMode = 'hidden' | 'card' | 'toast';

export class ForkRouteCardElement extends ForkElement {
  static readonly tagName = 'fork-route-card';

  #card: HTMLElement | null = null;
  #verdict: HTMLElement | null = null;
  #feedback: HTMLElement | null = null;
  #block: HTMLButtonElement | null = null;
  #blockKicker: HTMLElement | null = null;
  #blockTitle: HTMLElement | null = null;
  #blockTime: HTMLElement | null = null;
  #toast: HTMLElement | null = null;
  #toastNumber: HTMLElement | null = null;
  #toastKicker: HTMLElement | null = null;
  #toastTitle: HTMLElement | null = null;
  #mode: CardMode = 'hidden';
  #abort: AbortController | null = null;
  #keyAbort: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    if (!this.#card) {
      this.#verdict = h('div', { class: 'fork-card-title fork-route-card-verdict' });
      this.#feedback = h('p', { class: 'fork-card-text fork-route-card-feedback' });
      this.#blockKicker = h('span', { class: 'fork-kicker' });
      this.#blockTitle = h('span', { class: 'fork-card-block-title' });
      this.#blockTime = h('span', { class: 'fork-card-block-time' });
      this.#block = h(
        'button',
        { class: 'fork-card-block fork-route-card-block', type: 'button' },
        iconElement('triangle', 'fork-card-triangle'),
        h('span', { class: 'fork-card-block-text' }, this.#blockKicker, this.#blockTitle),
        this.#blockTime,
      );
      this.#card = h(
        'div',
        { class: 'fork-card fork-route-card-card', role: 'status' },
        h('div', { class: 'fork-card-body' }, this.#verdict, this.#feedback),
        this.#block,
      );
      this.#toastNumber = h('span', { class: 'fork-toast-number' });
      this.#toastKicker = h('span', { class: 'fork-kicker' });
      this.#toastTitle = h('span', { class: 'fork-toast-title' });
      this.#toast = h('div', { class: 'fork-toast', role: 'status' }, this.#toastNumber, h('span', { class: 'fork-toast-text' }, this.#toastKicker, this.#toastTitle));
      this.replaceChildren(this.#card, this.#toast);
    }
    this.#block!.addEventListener('click', () => this.engine?.skipTransition(), { signal: this.#abort.signal });
    this.hidden = true;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
    this.#keyAbort?.abort();
    this.#keyAbort = null;
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state) return;

    const mode: CardMode = state.phase === 'transition' ? 'card' : state.phase === 'merge' ? 'toast' : 'hidden';
    const labels = engine.labels;

    if (mode === 'card' && state.transition) {
      const tr = state.transition;
      this.#verdict!.textContent = tr.correct ? labels.right : labels.wrong;
      this.#feedback!.textContent = tr.feedback;
      this.#feedback!.hidden = !tr.feedback;
      const closer = tr.targetKind === 'detour';
      this.#blockKicker!.textContent = closer ? labels.closerLook : tr.targetKind === 'complete' ? labels.finishing : labels.next;
      this.#blockTitle!.textContent = tr.targetTitle;
      this.#blockTime!.textContent = tr.targetDuration ? formatTime(tr.targetDuration) : '';
      this.#block!.setAttribute('data-tone', closer ? 'red' : 'mustard');
      this.setAttribute('data-verdict', tr.correct ? 'right' : 'wrong');
    } else if (mode === 'toast') {
      const segment = engine.currentSegment;
      const index = engine.state.stats?.mainLine.findIndex((s) => s.id === segment?.id) ?? -1;
      this.#toastNumber!.textContent = index >= 0 ? String(index + 1) : '';
      this.#toastKicker!.textContent = labels.resumed;
      this.#toastTitle!.textContent = segment?.title ?? '';
    }

    if (mode !== this.#mode) {
      this.#mode = mode;
      this.hidden = mode === 'hidden';
      this.setAttribute('data-mode', mode);
      this.#card!.hidden = mode !== 'card';
      this.#toast!.hidden = mode !== 'toast';
      if (mode === 'card') {
        this.#listenForSkip();
        // The card waits for the learner. Keyboard users land on its button; pointer and touch users
        // keep focus on the player surface, so no ring appears on a phone and Space still continues.
        requestAnimationFrame(() => {
          if (lastInputWasKeyboard()) this.#block?.focus({ preventScroll: true });
          else (this.closest<HTMLElement>('media-container') ?? this.#block)?.focus({ preventScroll: true });
        });
      } else this.#stopListening();
    }
  }

  #listenForSkip(): void {
    this.#stopListening();
    const container = this.closest('media-container') ?? this.parentElement;
    if (!container) return;
    this.#keyAbort = new AbortController();
    container.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          this.engine?.skipTransition();
        }
      },
      { signal: this.#keyAbort.signal, capture: true },
    );
  }

  #stopListening(): void {
    this.#keyAbort?.abort();
    this.#keyAbort = null;
  }
}

if (!customElements.get(ForkRouteCardElement.tagName)) {
  customElements.define(ForkRouteCardElement.tagName, ForkRouteCardElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-route-card': ForkRouteCardElement;
  }
}
