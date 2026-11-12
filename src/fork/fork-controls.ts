/**
 * The skin's own bar controls:
 *
 * - <fork-volume-steps>: five steps inside the volume popover (desktop).
 * - <fork-parts-button>: toggles the lesson-parts panel (desktop bar).
 * - <fork-more>: the "more" button and its menu on narrow players — Sound,
 *   Captions, Lesson parts, Full screen.
 */
import {
  PlayerController,
  playerContext,
  selectFullscreen,
  selectTextTrack,
  selectVolume,
  UIElement,
  type PropertyValues,
} from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement, type IconName } from './icons';
import { canElementFullscreen, isPseudoFullscreen, togglePseudoFullscreen } from './pseudo-fullscreen';

const STEPS = 5;

export class ForkVolumeStepsElement extends ForkElement {
  static readonly tagName = 'fork-volume-steps';

  readonly #volume = new PlayerController(this, playerContext, selectVolume);
  #buttons: HTMLButtonElement[] = [];
  #abort: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    if (!this.#buttons.length) {
      this.setAttribute('role', 'group');
      // Drawn top to bottom, loudest first, like a level meter.
      for (let i = STEPS; i >= 1; i--) {
        const button = h('button', { class: 'fork-volume-step', type: 'button', 'data-level': String(i), 'aria-label': `${Math.round((i / STEPS) * 100)}%` });
        this.#buttons.push(button);
        this.append(button);
      }
    }
    this.addEventListener(
      'click',
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>('.fork-volume-step');
        if (!button) return;
        const level = Number(button.dataset.level) / STEPS;
        this.#volume.value?.setVolume(level);
        if (this.#volume.value?.muted) this.#volume.value.setMuted(false);
      },
      { signal: this.#abort.signal },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const volume = this.#volume.value;
    if (!volume) return;
    const level = volume.muted ? 0 : Math.round(volume.volume * STEPS);
    for (const button of this.#buttons) {
      const on = Number(button.dataset.level) <= level;
      button.toggleAttribute('data-on', on);
      button.setAttribute('aria-pressed', String(on));
    }
    const labels = this.engine?.labels;
    this.setAttribute('aria-label', `${labels?.volume ?? 'Volume'}, ${level} of ${STEPS}`);
  }
}

export class ForkPartsButtonElement extends ForkElement {
  static readonly tagName = 'fork-parts-button';

  #abort: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-pressed', 'false');
    this.addEventListener('click', () => this.toggle(), { signal: this.#abort.signal });
    this.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.toggle();
        }
      },
      { signal: this.#abort.signal },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  get panel() {
    return this.closest('media-container')?.querySelector('fork-parts') ?? null;
  }

  toggle(): void {
    this.panel?.toggle();
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const labels = this.engine?.labels;
    if (labels) this.setAttribute('aria-label', labels.parts);
    this.setAttribute('aria-pressed', String(this.panel?.open ?? false));
  }
}

interface MenuItemSpec {
  id: 'sound' | 'captions' | 'parts' | 'fullscreen';
  icon: IconName;
}

const MENU: MenuItemSpec[] = [
  { id: 'sound', icon: 'volume' },
  { id: 'captions', icon: 'captions' },
  { id: 'parts', icon: 'parts' },
  { id: 'fullscreen', icon: 'fullscreen-enter' },
];

export class ForkMoreElement extends ForkElement {
  static readonly tagName = 'fork-more';

  readonly #volume = new PlayerController(this, playerContext, selectVolume);
  readonly #fullscreen = new PlayerController(this, playerContext, selectFullscreen);
  readonly #tracks = new PlayerController(this, playerContext, selectTextTrack);

  #button: HTMLButtonElement | null = null;
  #menu: HTMLElement | null = null;
  #items = new Map<MenuItemSpec['id'], HTMLButtonElement>();
  #abort: AbortController | null = null;
  #open = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    this.closest('media-container')?.addEventListener('fork-fullscreen-change', () => this.requestUpdate(), { signal });
    if (!this.#button) {
      this.#button = h('button', { class: 'fork-control fork-more-button', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, iconElement('more'));
      this.#menu = h('div', { class: 'fork-menu', role: 'menu', hidden: true });
      for (const spec of MENU) {
        const item = h('button', { class: 'fork-menu-item', type: 'button', role: 'menuitem', 'data-item': spec.id, tabindex: '-1' }, iconElement(spec.icon, 'fork-menu-icon', 2), h('span', {}));
        this.#items.set(spec.id, item);
        this.#menu.append(item);
      }
      this.replaceChildren(this.#button, this.#menu);
    }
    this.#button!.addEventListener('click', () => (this.#open ? this.close() : this.openMenu()), { signal });
    this.#menu!.addEventListener('click', this.#onItemClick, { signal });
    this.addEventListener('keydown', this.#onKeydown, { signal });
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (this.#open && !this.contains(event.target as Node)) this.close(false);
      },
      { signal, capture: true },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
  }

  get menuOpen(): boolean {
    return this.#open;
  }

  openMenu(): void {
    this.#open = true;
    this.#menu!.hidden = false;
    this.#button!.setAttribute('aria-expanded', 'true');
    this.toggleAttribute('data-open', true);
    this.requestUpdate();
    requestAnimationFrame(() => this.#items.get('sound')?.focus());
  }

  close(returnFocus = true): void {
    if (!this.#open) return;
    this.#open = false;
    this.#menu!.hidden = true;
    this.#button!.setAttribute('aria-expanded', 'false');
    this.toggleAttribute('data-open', false);
    if (returnFocus) this.#button!.focus();
  }

  #onItemClick = (event: Event): void => {
    const item = (event.target as Element).closest<HTMLButtonElement>('[data-item]');
    if (!item) return;
    const container = this.closest('media-container');
    switch (item.dataset.item as MenuItemSpec['id']) {
      case 'sound': {
        const volume = this.#volume.value;
        if (volume) volume.setMuted(!volume.muted);
        break;
      }
      case 'captions': {
        this.#tracks.value?.toggleSubtitles();
        break;
      }
      case 'parts': {
        this.close(false);
        container?.querySelector('fork-parts')?.toggle();
        return;
      }
      case 'fullscreen': {
        if (container instanceof HTMLElement && !canElementFullscreen()) {
          togglePseudoFullscreen(container);
          break;
        }
        const fs = this.#fullscreen.value;
        if (fs) void (fs.isFullscreen ? fs.exitFullscreen() : fs.requestFullscreen());
        break;
      }
    }
    this.close();
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (!this.#open) return;
    const items = Array.from(this.#items.values());
    const index = items.findIndex((i) => i === document.activeElement);
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case 'Tab':
        this.close(false);
        break;
    }
    event.stopPropagation();
  };

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const labels = this.engine?.labels;
    if (!labels) return;
    this.#button!.setAttribute('aria-label', labels.more);
    const muted = this.#volume.value?.muted ?? false;
    const captions = this.#tracks.value?.subtitlesShowing ?? false;
    const fullscreen = (this.#fullscreen.value?.isFullscreen ?? false) || isPseudoFullscreen(this.closest('media-container'));
    const set = (id: MenuItemSpec['id'], text: string, icon: IconName, pressed?: boolean) => {
      const item = this.#items.get(id)!;
      item.querySelector('span')!.textContent = text;
      const current = item.querySelector('.fork-icon');
      if (current?.getAttribute('data-icon') !== icon) current?.replaceWith(iconElement(icon, 'fork-menu-icon', 2));
      if (pressed === undefined) item.removeAttribute('aria-checked');
      else {
        item.setAttribute('role', 'menuitemcheckbox');
        item.setAttribute('aria-checked', String(pressed));
      }
    };
    set('sound', muted ? labels.soundOn : labels.soundOff, muted ? 'volume-off' : 'volume');
    set('captions', labels.captions, 'captions', captions);
    const hasCaptions = (this.#tracks.value?.textTrackList.length ?? 0) > 0;
    this.#items.get('captions')!.hidden = !hasCaptions;
    set('parts', labels.parts, 'parts');
    set('fullscreen', fullscreen ? labels.exitFullscreen : labels.fullscreen, fullscreen ? 'fullscreen-exit' : 'fullscreen-enter');
  }
}

export type { UIElement };

for (const element of [ForkVolumeStepsElement, ForkPartsButtonElement, ForkMoreElement]) {
  if (!customElements.get(element.tagName)) customElements.define(element.tagName, element);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-volume-steps': ForkVolumeStepsElement;
    'fork-parts-button': ForkPartsButtonElement;
    'fork-more': ForkMoreElement;
  }
}
