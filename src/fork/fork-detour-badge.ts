/**
 * <fork-detour-badge> — "A closer look · back to the lesson in 0:18" in the
 * top-left corner while extra material plays, with a "Got it, continue"
 * button (shortcut B) once half of it has played. On narrow players the
 * badge shortens to "A closer look · 0:18". The words come from the lesson.
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { formatTime, t } from './scenario';

export class ForkDetourBadgeElement extends ForkElement {
  static readonly tagName = 'fork-detour-badge';

  static override properties = {
    /** Fraction of the extra part after which the skip button appears (0..1). */
    backAfter: { type: Number, attribute: 'back-after' },
  };

  backAfter = 0.5;

  #label: HTMLElement | null = null;
  #remainingLong: HTMLElement | null = null;
  #remainingShort: HTMLElement | null = null;
  #button: HTMLButtonElement | null = null;
  #buttonLabel: HTMLElement | null = null;
  #abort: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    if (!this.#label) {
      this.#label = h('span', { class: 'fork-badge-label' });
      this.#remainingLong = h('span', { class: 'fork-badge-remaining fork-badge-remaining-long' });
      this.#remainingShort = h('span', { class: 'fork-badge-remaining fork-badge-remaining-short' });
      this.#buttonLabel = h('span', {});
      this.#button = h(
        'button',
        { class: 'fork-badge-button', type: 'button', hidden: true },
        this.#buttonLabel,
        h('kbd', { class: 'fork-badge-key', 'aria-hidden': 'true' }, 'B'),
      );
      this.replaceChildren(
        h('span', { class: 'fork-badge-pill fork-kicker', role: 'status' }, this.#label, this.#remainingLong, this.#remainingShort),
        this.#button,
      );
    }
    this.#button!.addEventListener('click', () => this.engine?.backToRoute(), { signal: this.#abort.signal });
    const container = this.closest('media-container') ?? this.parentElement;
    container?.addEventListener(
      'keydown',
      (event) => {
        if ((event.key === 'b' || event.key === 'B') && !this.hidden && !this.#button!.hidden) {
          event.preventDefault();
          this.engine?.backToRoute();
        }
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
    const segment = engine?.currentSegment;
    const state = engine?.state;
    if (!engine || !segment || !state) return;
    const show = segment.kind === 'detour' && (state.phase === 'detour' || state.phase === 'merge' || state.phase === 'playing');
    this.hidden = !show;
    this.toggleAttribute('data-open', show);
    if (!show) return;
    const labels = engine.labels;
    const remaining = Math.max(0, segment.out - engine.currentTime);
    const progress = 1 - remaining / (segment.out - segment.in);
    this.#label!.textContent = labels.closerLookBadge;
    this.#remainingLong!.textContent = ` · ${t(labels.closerLookRemaining, { time: formatTime(remaining) })}`;
    this.#remainingShort!.textContent = ` · ${formatTime(remaining)}`;
    this.#buttonLabel!.textContent = labels.skipCloserLook;
    const canGoBack = progress >= this.backAfter;
    this.#button!.hidden = !canGoBack;
    this.toggleAttribute('data-can-return', canGoBack);
  }
}

if (!customElements.get(ForkDetourBadgeElement.tagName)) {
  customElements.define(ForkDetourBadgeElement.tagName, ForkDetourBadgeElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-detour-badge': ForkDetourBadgeElement;
  }
}
