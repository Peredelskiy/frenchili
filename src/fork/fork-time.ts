/**
 * <fork-time> — lesson time along the travelled route: "1:00 / 1:48".
 * The total is the route as it stands and grows when extra material is
 * inserted (1:48 → 2:18); the elapsed part counts the parts before the
 * current one plus the position within it.
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { formatTime } from './scenario';

export class ForkTimeElement extends ForkElement {
  static readonly tagName = 'fork-time';

  #elapsed: HTMLElement | null = null;
  #total: HTMLElement | null = null;
  #lastTotal = -1;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.#elapsed) {
      this.#elapsed = h('span', { class: 'fork-time-elapsed' });
      this.#total = h('span', { class: 'fork-time-total' });
      this.replaceChildren(this.#elapsed, h('span', { class: 'fork-time-separator', 'aria-hidden': 'true' }, ' / '), this.#total);
    }
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    if (!engine?.state.scenario || !this.#elapsed || !this.#total) return;
    const { elapsed, total } = engine.routeTime;
    this.#elapsed.textContent = formatTime(elapsed);
    this.#total.textContent = formatTime(total);
    if (this.#lastTotal !== -1 && Math.round(total) !== Math.round(this.#lastTotal)) {
      // The route just grew (or shrank on replay): let the total flip visibly.
      this.#total.removeAttribute('data-changed');
      void this.#total.offsetWidth;
      this.#total.setAttribute('data-changed', '');
    }
    this.#lastTotal = total;
    this.setAttribute('aria-label', `${formatTime(elapsed)} of ${formatTime(total)}`);
  }
}

if (!customElements.get(ForkTimeElement.tagName)) {
  customElements.define(ForkTimeElement.tagName, ForkTimeElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-time': ForkTimeElement;
  }
}
