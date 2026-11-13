/**
 * Fullscreen where the browser won't put an element fullscreen (iPhone Safari).
 *
 * iPhone only lets a page send the bare <video> to Apple's native player, which
 * drops the skin — no questions, no route cards, no route line. The lesson needs
 * them, so there the player fills the viewport inside the page instead (the same
 * fallback Plyr uses): a fixed layer over everything, picture 16:9 above the bar,
 * safe areas respected, page scroll locked. Exit with the same button or Esc.
 */

const ATTR = 'data-fork-pseudo-fullscreen';

/** True when the browser can put an element (not just a <video>) fullscreen. */
export function canElementFullscreen(): boolean {
  const d = document as Document & { webkitFullscreenEnabled?: boolean };
  return Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

export function isPseudoFullscreen(container: Element | null | undefined): boolean {
  return Boolean(container?.hasAttribute(ATTR));
}

const escapeHandlers = new WeakMap<HTMLElement, (event: KeyboardEvent) => void>();
const sizers = new WeakMap<HTMLElement, () => void>();

/**
 * Size the picture in script: the largest 16:9 that fits above the bar, inside the
 * safe areas. iOS web views don't reliably resolve dvh/env() inside calc(), so CSS
 * alone can stretch the stage instead of keeping it 16:9.
 */
function fitStage(container: HTMLElement): void {
  const cs = getComputedStyle(container);
  const px = (v: string) => parseFloat(v) || 0;
  const bar = container.querySelector<HTMLElement>('.fork-bar');
  const width = container.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
  // A bar laid over the picture (the glass theme) takes no height of its own.
  const barHeight = bar && getComputedStyle(bar).position !== 'absolute' ? bar.offsetHeight : 0;
  const height = container.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom) - barHeight;
  const stage = Math.max(0, Math.floor(Math.min(width, (height * 16) / 9)));
  container.style.setProperty('--fork-fs-stage-width', `${stage}px`);
  container.style.setProperty('--fork-fs-stage-height', `${Math.round((stage * 9) / 16)}px`);
}

/** Keep the picture fitted while the player is fullscreen (real or in-page). */
export function startFitting(container: HTMLElement): void {
  if (sizers.has(container)) return;
  const fit = () => fitStage(container);
  sizers.set(container, fit);
  fit();
  requestAnimationFrame(fit);
  setTimeout(fit, 300); // iOS settles the viewport after rotating / entering fullscreen
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
}

export function stopFitting(container: HTMLElement): void {
  const fit = sizers.get(container);
  if (fit) {
    window.removeEventListener('resize', fit);
    window.visualViewport?.removeEventListener('resize', fit);
    window.removeEventListener('orientationchange', fit);
    sizers.delete(container);
  }
  container.style.removeProperty('--fork-fs-stage-width');
  container.style.removeProperty('--fork-fs-stage-height');
}

export function setPseudoFullscreen(container: HTMLElement, on: boolean): void {
  if (isPseudoFullscreen(container) === on) return;
  container.toggleAttribute(ATTR, on);
  document.documentElement.toggleAttribute(ATTR, on);
  // Esc leaves, wherever focus is. Menus, sheets and the question stop their own Esc first.
  if (on) {
    startFitting(container);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setPseudoFullscreen(container, false);
    };
    escapeHandlers.set(container, onKey);
    document.addEventListener('keydown', onKey);
  } else {
    stopFitting(container);
    const onKey = escapeHandlers.get(container);
    if (onKey) document.removeEventListener('keydown', onKey);
    escapeHandlers.delete(container);
  }
  container.dispatchEvent(new CustomEvent('fork-fullscreen-change', { bubbles: true, composed: true, detail: { fullscreen: on } }));
}

export function togglePseudoFullscreen(container: HTMLElement): void {
  setPseudoFullscreen(container, !isPseudoFullscreen(container));
}
