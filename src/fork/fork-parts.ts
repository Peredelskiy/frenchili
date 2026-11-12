/**
 * <fork-parts> — the lesson's parts, as the route stands.
 *
 * Desktop: a panel down the right of the picture, one coloured block per
 * part. Narrow players: a sheet above the bar, opened from the "more" menu.
 * Watched parts are buttons that jump to their start; parts not reached yet
 * are locked. Extra material appears in the list only once an answer led
 * there, numbered "+" and always in red.
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement } from './icons';
import { formatTime } from './scenario';

export class ForkPartsElement extends ForkElement {
  static readonly tagName = 'fork-parts';

  #nav: HTMLElement | null = null;
  #open = false;
  #abort: AbortController | null = null;
  #opener: HTMLElement | null = null;
  #rowsKey = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    if (!this.#nav) {
      this.#nav = h('nav', { class: 'fork-parts-list' });
      this.replaceChildren(this.#nav);
    }
    this.hidden = true;
    this.#nav!.addEventListener(
      'click',
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>('[data-seek]');
        if (!button || button.disabled) return;
        this.engine?.seekTo(Number(button.dataset.seek));
        if (this.#isSheet()) this.close();
      },
      { signal },
    );
    this.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      },
      { signal },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  get open(): boolean {
    return this.#open;
  }

  #isSheet(): boolean {
    return getComputedStyle(this).getPropertyValue('--fork-parts-mode').trim() === 'sheet';
  }

  toggle(): void {
    if (this.#open) this.close();
    else this.openPanel();
  }

  openPanel(): void {
    this.#opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.#open = true;
    this.hidden = false;
    this.toggleAttribute('data-open', true);
    this.#notifyButton();
    this.requestUpdate();
    requestAnimationFrame(() => this.#nav?.querySelector<HTMLElement>('[aria-current="true"], button:not(:disabled)')?.focus());
  }

  close(): void {
    if (!this.#open) return;
    this.#open = false;
    this.hidden = true;
    this.toggleAttribute('data-open', false);
    this.#notifyButton();
    const fallback = this.closest('media-container')?.querySelector<HTMLElement>('fork-parts-button, .fork-more-button');
    (this.#opener?.isConnected ? this.#opener : fallback)?.focus();
    this.#opener = null;
  }

  #notifyButton(): void {
    this.closest('media-container')?.querySelector('fork-parts-button')?.requestUpdate();
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state?.scenario || !state.stats || !this.#nav) return;
    const labels = engine.labels;
    this.#nav.setAttribute('aria-label', labels.parts);

    // Closed states close the panel: a question, the transition, the summary.
    if (this.#open && (state.phase === 'question' || state.phase === 'transition' || state.phase === 'complete' || state.phase === 'idle')) {
      this.close();
      return;
    }

    const mainIds = new Set(state.stats.mainLine.map((s) => s.id));
    const current = engine.currentSegment;
    const rowsKey = engine.routeSegments.map((s) => `${s.id}:${state.visited.has(s.id) ? 'v' : ''}${current?.id === s.id ? 'c' : ''}`).join(',');
    if (rowsKey === this.#rowsKey) return;
    this.#rowsKey = rowsKey;
    let number = 0;
    const rows = engine.routeSegments
      .filter((s) => s.kind !== 'confirm')
      .map((segment) => {
        const isMain = mainIds.has(segment.id);
        if (isMain) number++;
        const watched = state.visited.has(segment.id);
        const isCurrent = current?.id === segment.id;
        const locked = !watched && !isCurrent;
        const status: 'current' | 'watched' | 'locked' = isCurrent ? 'current' : watched ? 'watched' : 'locked';
        const icon = status === 'current' ? iconElement('play', 'fork-parts-icon') : status === 'watched' ? iconElement('check', 'fork-parts-icon', 3) : iconElement('lock', 'fork-parts-icon', 2.5);
        icon.setAttribute('role', 'img');
        icon.removeAttribute('aria-hidden');
        icon.setAttribute('aria-label', status === 'current' ? labels.nowPlaying : status === 'watched' ? labels.watched : labels.lockedPart);
        return h(
          'button',
          {
            class: 'fork-parts-row',
            type: 'button',
            'data-seek': String(segment.in),
            'data-status': status,
            'data-kind': segment.kind,
            'aria-current': isCurrent ? 'true' : null,
            disabled: locked,
            title: `${segment.title} · ${formatTime(segment.out - segment.in)}`,
          },
          h('span', { class: 'fork-parts-number', 'aria-hidden': 'true' }, isMain ? String(number) : '+'),
          h('span', { class: 'fork-parts-title' }, segment.title),
          icon,
        );
      });
    this.#nav.replaceChildren(...rows);
  }
}

if (!customElements.get(ForkPartsElement.tagName)) customElements.define(ForkPartsElement.tagName, ForkPartsElement);

declare global {
  interface HTMLElementTagNameMap {
    'fork-parts': ForkPartsElement;
  }
}
