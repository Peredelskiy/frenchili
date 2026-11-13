/**
 * <fork-skin> — the packaged skin: one element that lays out every part.
 *
 *   <video-player>
 *     <fork-skin scenario-src="/lesson.json" poster="/poster.jpg">
 *       <video src="lesson.mp4" playsinline>
 *         <track kind="captions" src="lesson.en.vtt" srclang="en" label="English" />
 *       </video>
 *     </fork-skin>
 *   </video-player>
 *
 * The media element (and an optional inline scenario script) are moved into
 * the generated layout: a stage with the picture and everything that sits on
 * it, the question card, and the control bar under the picture. Everything
 * else is stamped from the template below, so a site needs no markup beyond
 * this.
 */
import { icon } from './icons';
import { canElementFullscreen, isPseudoFullscreen, startFitting, stopFitting, togglePseudoFullscreen } from './pseudo-fullscreen';

let uid = 0;

/** A bar control plus its tooltip; label and shortcut are filled by Video.js from its translations and the registered hotkeys. */
function control(tag: string, className: string, parts: string, extra = ''): string {
  const id = `fork-tip-${++uid}`;
  return `<${tag} class="fork-control ${className}" commandfor="${id}" ${extra}>${parts}</${tag}>
<media-tooltip id="${id}" side="top" class="fork-tooltip"><media-tooltip-label></media-tooltip-label><media-tooltip-shortcut class="fork-tooltip-shortcut"></media-tooltip-shortcut></media-tooltip>`;
}

export function forkSkinTemplate(): string {
  return `
<media-container class="fork-container">
 <div class="fork-frame">
  <div class="fork-stage">
    <div class="fork-media" data-fork-media></div>
    <media-poster class="fork-poster"><img alt="" decoding="async" class="fork-poster-image"></media-poster>

    <fork-scenario></fork-scenario>

    <div class="fork-paused">
      <media-play-button class="fork-paused-button">${icon('play')}</media-play-button>
    </div>

    <media-buffering-indicator class="fork-loading">
      <span class="fork-loading-squares" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="fork-loading-label fork-kicker" data-fork-label="loading"></span>
    </media-buffering-indicator>

    <fork-detour-badge class="fork-badge"></fork-detour-badge>
    <fork-route-card></fork-route-card>
    <fork-parts></fork-parts>
    <fork-start></fork-start>

    <media-error-dialog class="fork-error">
      <media-dialog-backdrop class="fork-error-backdrop"></media-dialog-backdrop>
      <media-dialog-popup class="fork-error-card fork-card">
        <div class="fork-card-body">
          <div class="fork-card-title fork-error-title" data-fork-label="errorTitle"></div>
          <p class="fork-card-text fork-error-text" data-fork-label="errorText"></p>
        </div>
        <media-dialog-close class="fork-card-block fork-error-retry" data-tone="red">
          ${icon('triangle', 'fork-card-triangle')}
          <span class="fork-card-block-text"><span class="fork-kicker" data-fork-label="name"></span><span class="fork-card-block-title" data-fork-label="retry"></span></span>
        </media-dialog-close>
      </media-dialog-popup>
    </media-error-dialog>
  </div>

  <fork-question></fork-question>

  <media-controls>
    <media-controls-content class="fork-bar">
      <media-tooltip-group delay="600" close-delay="100">
        ${control('media-play-button', 'fork-bar-play', icon('play', 'fork-icon-play') + icon('pause', 'fork-icon-pause'))}
        <fork-time class="fork-bar-time"></fork-time>
        <fork-route-map class="fork-bar-line"></fork-route-map>
        <div class="fork-bar-actions">
          <div class="fork-volume">
            <media-mute-button class="fork-control fork-bar-mute" commandfor="fork-volume-popup">${icon('volume', 'fork-icon-volume') + icon('volume-off', 'fork-icon-volume-off')}</media-mute-button>
            <media-volume-popover id="fork-volume-popup" class="fork-volume-popover" open-on-hover delay="150" close-delay="250" side="top">
              <fork-volume-steps class="fork-volume-steps"></fork-volume-steps>
            </media-volume-popover>
          </div>
          ${control('media-captions-button', 'fork-bar-captions', icon('captions'))}
          <fork-parts-button class="fork-control fork-bar-parts">${icon('parts')}</fork-parts-button>
          ${control('media-fullscreen-button', 'fork-bar-fullscreen', icon('fullscreen-enter', 'fork-icon-fullscreen-enter') + icon('fullscreen-exit', 'fork-icon-fullscreen-exit'))}
        </div>
        <fork-more class="fork-bar-more"></fork-more>
      </media-tooltip-group>
    </media-controls-content>
  </media-controls>

  <fork-complete></fork-complete>
 </div>

  <media-hotkey keys="Space" action="togglePaused"></media-hotkey>
  <media-hotkey keys="k" action="togglePaused"></media-hotkey>
  <media-hotkey keys="m" action="toggleMuted"></media-hotkey>
  <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
  <media-hotkey keys="c" action="toggleSubtitles"></media-hotkey>
  <media-hotkey keys="ArrowLeft" action="seekStep" value="-5"></media-hotkey>
  <media-hotkey keys="ArrowRight" action="seekStep" value="5"></media-hotkey>
  <media-hotkey keys="j" action="seekStep" value="-10"></media-hotkey>
  <media-hotkey keys="l" action="seekStep" value="10"></media-hotkey>
  <media-hotkey keys="ArrowUp" action="volumeStep" value="0.2"></media-hotkey>
  <media-hotkey keys="ArrowDown" action="volumeStep" value="-0.2"></media-hotkey>

  <media-status-announcer></media-status-announcer>
</media-container>`;
}

export class ForkSkinElement extends HTMLElement {
  static readonly tagName = 'fork-skin';
  static readonly observedAttributes = ['scenario-src', 'reduced-motion', 'autostart', 'poster', 'auto-continue', 'theme'];

  #built = false;

  connectedCallback(): void {
    if (this.#built) return;
    this.#built = true;

    const media = Array.from(this.children).filter((child) => child.tagName !== 'SCRIPT');
    const scenarioScript = this.querySelector<HTMLScriptElement>('script[type="application/json"]');

    const template = document.createElement('template');
    template.innerHTML = forkSkinTemplate();
    const fragment = template.content;

    const slot = fragment.querySelector('[data-fork-media]')!;
    for (const element of media) slot.before(element);
    slot.remove();

    const engine = fragment.querySelector('fork-scenario')!;
    if (scenarioScript) engine.append(scenarioScript);
    this.#syncEngineAttributes(engine);
    this.#syncPoster(fragment);

    this.replaceChildren(fragment);
    this.#syncTheme();

    // The error dialog speaks the card's own words ("No video. Check your connection…"),
    // never the media error string (e.g. "PipelineStatus::DEMUXER_ERROR…").
    const popup = this.querySelector('.fork-error-card');
    if (popup) {
      const n = ++uid;
      const title = popup.querySelector('.fork-error-title')!;
      const text = popup.querySelector('.fork-error-text')!;
      title.id = `fork-error-title-${n}`;
      text.id = `fork-error-text-${n}`;
      const point = () => {
        if (popup.getAttribute('aria-labelledby') !== title.id) popup.setAttribute('aria-labelledby', title.id);
        if (popup.getAttribute('aria-describedby') !== text.id) popup.setAttribute('aria-describedby', text.id);
      };
      point();
      new MutationObserver(point).observe(popup, { attributes: true, attributeFilter: ['aria-labelledby', 'aria-describedby', 'data-open'] });
    }

    // No element fullscreen here (iPhone): the bar's fullscreen button and F fill the
    // viewport inside the page instead, so the lesson keeps its questions and cards.
    const container = this.querySelector<HTMLElement>('.fork-container');
    // Real fullscreen: fit the picture in script too (some iOS web views mis-resolve dvh).
    if (container) {
      const onFullscreen = () => {
        const d = document as Document & { webkitFullscreenElement?: Element | null };
        const element = document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
        if (element && (element === container || element.contains(container))) startFitting(container);
        else if (!isPseudoFullscreen(container)) stopFitting(container);
      };
      document.addEventListener('fullscreenchange', onFullscreen);
      document.addEventListener('webkitfullscreenchange', onFullscreen);
    }
    if (container && !canElementFullscreen()) {
      container.setAttribute('data-fork-fs-fallback', '');
      const native = container.querySelector('media-fullscreen-button.fork-bar-fullscreen');
      if (native) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fork-control fork-bar-fullscreen';
        button.innerHTML = native.innerHTML;
        native.replaceWith(button);
        const sync = () => {
          const on = isPseudoFullscreen(container);
          button.toggleAttribute('data-fullscreen', on);
          const labels = container.querySelector('fork-scenario') as { labels?: { fullscreen: string; exitFullscreen: string } } | null;
          button.setAttribute('aria-label', on ? labels?.labels?.exitFullscreen ?? 'Exit fullscreen' : labels?.labels?.fullscreen ?? 'Fullscreen');
          button.setAttribute('aria-pressed', String(on));
        };
        button.addEventListener('click', () => togglePseudoFullscreen(container));
        container.addEventListener('fork-fullscreen-change', sync);
        container.addEventListener('fork-change', sync, { once: true });
        sync();
      }
      // F toggles; Esc to leave is handled in pseudo-fullscreen.ts.
      this.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'f' && event.key !== 'F') return;
          const target = event.target as Element;
          if (target.closest('input, textarea, [contenteditable], fork-question')) return;
          event.stopImmediatePropagation();
          event.preventDefault();
          togglePseudoFullscreen(container);
        },
        { capture: true },
      );
    }

    // Tap on the picture: play / pause. Only while the lesson is actually running,
    // and never from a control, a card or the parts panel.
    const stage = this.querySelector<HTMLElement>('.fork-stage');
    stage?.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target.closest('button, a, [role="button"], [role="dialog"], [role="menu"], fork-parts, fork-route-card, fork-start, media-dialog-popup')) return;
      const phase = this.querySelector('media-container')?.getAttribute('data-fork-phase');
      if (phase !== 'playing' && phase !== 'detour' && phase !== 'merge') return;
      this.querySelector<HTMLElement>('.fork-bar-play')?.click();
    });
  }

  attributeChangedCallback(): void {
    const engine = this.querySelector('fork-scenario');
    if (engine) this.#syncEngineAttributes(engine);
    if (this.#built) {
      this.#syncPoster(this);
      this.#syncTheme();
    }
  }

  /** `theme="glass"` switches the look (see theme-glass.css); no attribute is the Affiche look. */
  #syncTheme(): void {
    const container = this.querySelector<HTMLElement>('.fork-container');
    if (!container) return;
    const theme = this.getAttribute('theme');
    if (theme) container.setAttribute('data-fork-theme', theme);
    else container.removeAttribute('data-fork-theme');
  }

  /** `poster` on <fork-skin> fills the skin's poster image (shown until the lesson starts). */
  #syncPoster(root: ParentNode): void {
    const image = root.querySelector<HTMLImageElement>('.fork-poster-image');
    if (!image) return;
    const poster = this.getAttribute('poster');
    if (poster) image.src = poster;
    else image.removeAttribute('src');
  }

  #syncEngineAttributes(engine: Element): void {
    const src = this.getAttribute('scenario-src');
    if (src) engine.setAttribute('src', src);
    else engine.removeAttribute('src');
    engine.toggleAttribute('reduced-motion', this.hasAttribute('reduced-motion'));
    engine.toggleAttribute('autostart', this.hasAttribute('autostart'));
    const autoContinue = this.getAttribute('auto-continue');
    if (autoContinue) engine.setAttribute('auto-continue', autoContinue);
    else engine.removeAttribute('auto-continue');
  }

  /** The engine, for integrations: `skin.engine?.addEventListener('fork-answer', …)`. */
  get engine() {
    return this.querySelector('fork-scenario');
  }
}

if (!customElements.get(ForkSkinElement.tagName)) {
  customElements.define(ForkSkinElement.tagName, ForkSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-skin': ForkSkinElement;
  }
}
