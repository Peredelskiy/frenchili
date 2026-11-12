/**
 * Base class for fork-* UI components: finds the engine, re-renders on every
 * `fork-change`, and cleans up on disconnect.
 */
import { UIElement } from '@videojs/html';
import { findEngine, type ForkScenarioElement, type ForkState } from './fork-scenario';

export abstract class ForkElement extends UIElement {
  protected engine: ForkScenarioElement | null = null;
  #engineAbort: AbortController | null = null;
  #retry: number | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#attach();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#engineAbort?.abort();
    this.#engineAbort = null;
    this.engine = null;
    if (this.#retry) cancelAnimationFrame(this.#retry);
    this.#retry = null;
  }

  #attach(): void {
    const engine = findEngine(this);
    if (!engine) {
      // The engine may register after this element; look again next frame.
      this.#retry = requestAnimationFrame(() => this.#attach());
      return;
    }
    this.engine = engine;
    this.#engineAbort = new AbortController();
    const { signal } = this.#engineAbort;
    engine.addEventListener('fork-change', () => this.requestUpdate(), { signal });
    engine.addEventListener('fork-tick', () => this.requestUpdate(), { signal });
    this.requestUpdate();
  }

  protected get forkState(): ForkState | null {
    return this.engine?.state ?? null;
  }
}

/** Build an element with attributes and children in one call. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | null | undefined> = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    element.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    element.append(child);
  }
  return element;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | null | undefined> = {},
  ...children: (Node | null | undefined)[]
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    element.setAttribute(key, String(value));
  }
  for (const child of children) if (child) element.append(child);
  return element;
}
