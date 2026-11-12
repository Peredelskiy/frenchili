/**
 * Fork icon set, Affiche style: 24-px grid, filled shapes for play/pause/more,
 * 2.5-px strokes for the rest. Geometry taken from the design boards.
 */
export type IconName =
  | 'play'
  | 'pause'
  | 'replay'
  | 'check'
  | 'plus'
  | 'cross'
  | 'lock'
  | 'volume'
  | 'volume-off'
  | 'captions'
  | 'parts'
  | 'fullscreen-enter'
  | 'fullscreen-exit'
  | 'more'
  | 'triangle';

interface IconSpec {
  body: string;
  /** `fill` icons use currentColor fills; `stroke` icons use 2.5-px currentColor strokes. */
  mode: 'fill' | 'stroke';
  viewBox?: string;
}

const icons: Record<IconName, IconSpec> = {
  play: { mode: 'fill', body: '<path d="M7 4l13 8-13 8z"/>' },
  pause: { mode: 'fill', body: '<path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/>' },
  replay: { mode: 'stroke', body: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/>' },
  check: { mode: 'stroke', body: '<path d="M4 12.5l5 5L20 6.5"/>' },
  plus: { mode: 'stroke', body: '<path d="M12 3v18M3 12h18"/>' },
  cross: { mode: 'stroke', body: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>' },
  lock: { mode: 'stroke', body: '<path d="M6 11h12v9H6z"/><path d="M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11"/>' },
  volume: { mode: 'stroke', body: '<path d="M4 9.5h3l5-4v13l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7"/>' },
  'volume-off': { mode: 'stroke', body: '<path d="M4 9.5h3l5-4v13l-5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>' },
  captions: { mode: 'stroke', body: '<path d="M3 6h18v12H3z"/><path stroke-width="2" d="M10.5 10.3a2 2 0 1 0 0 3.4M17 10.3a2 2 0 1 0 0 3.4"/>' },
  parts: { mode: 'stroke', body: '<path d="M4 6h16M4 12h16M4 18h16"/>' },
  'fullscreen-enter': { mode: 'stroke', body: '<path d="M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4"/>' },
  'fullscreen-exit': { mode: 'stroke', body: '<path d="M8 5v4H4M20 9h-4V5M16 19v-4h4M4 15h4v4"/>' },
  more: { mode: 'fill', body: '<path d="M3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4z"/>' },
  triangle: { mode: 'fill', body: '<path d="M0 0l45 27.5L0 55z"/>', viewBox: '0 0 45 55' },
};

export function icon(name: IconName, className = '', strokeWidth = 2.5): string {
  const spec = icons[name];
  const paint =
    spec.mode === 'fill'
      ? 'fill="currentColor"'
      : `fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" stroke-linejoin="miter"`;
  return `<svg class="fork-icon ${className}" data-icon="${name}" viewBox="${spec.viewBox ?? '0 0 24 24'}" ${paint} aria-hidden="true" focusable="false">${spec.body}</svg>`;
}

/** Same as `icon`, as a live element. */
export function iconElement(name: IconName, className = '', strokeWidth = 2.5): SVGSVGElement {
  const template = document.createElement('template');
  template.innerHTML = icon(name, className, strokeWidth);
  return template.content.firstElementChild as SVGSVGElement;
}
