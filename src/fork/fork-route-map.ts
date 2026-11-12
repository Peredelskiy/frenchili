/**
 * <fork-route-map> — the route line.
 *
 * Replaces the time slider. Parts of the lesson are stretches of one line,
 * sized by their length; checkpoints are circles on it; a terminus bar ends
 * it. Nothing is coloured in at the start: what has been watched is solid,
 * what has not is dots. When an answer sends the learner through extra
 * material, that part is inserted into the line after the checkpoint and the
 * line re-flows (the route got longer); it is red while it plays and joins
 * the solid line once watched. Unvisited branches are never drawn, so the
 * line does not give away which answers are wrong.
 *
 * It is a slider: arrows and Home/End move within the part, PageUp/PageDown
 * between watched parts, and the pointer scrubs within the watched route.
 * Seeking forward past an unanswered checkpoint is refused with a plaque on
 * that checkpoint.
 */
import { PlayerController, playerContext, selectBuffer, type PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement } from './icons';
import { routeOrder } from './route-geometry';
import { formatTime, isQuestion, isSegment, t, type QuestionNode, type SegmentNode } from './scenario';

const SEEK_STEP = 5;
const LOCK_HINT_MS = 1600;

interface SegmentParts {
  element: HTMLElement;
  fill: HTMLElement;
  preview: HTMLElement;
  label?: HTMLElement;
}

interface StationParts {
  element: HTMLElement;
  plaque: HTMLElement;
  label?: HTMLElement;
}

export class ForkRouteMapElement extends ForkElement {
  static readonly tagName = 'fork-route-map';

  static override properties = {
    size: { type: String },
  };

  /** `bar` in the control bar (compact under 720 px by CSS), `expanded` on the summary screen with labels. */
  size: 'bar' | 'expanded' = 'bar';

  readonly #buffer = new PlayerController(this, playerContext, selectBuffer);

  #line: HTMLElement | null = null;
  #marker: HTMLElement | null = null;
  #plaque: HTMLElement | null = null;
  #terminus: HTMLElement | null = null;
  #segments = new Map<string, SegmentParts>();
  #stations = new Map<string, StationParts>();
  #orderKey = '';
  #abort: AbortController | null = null;
  #dragging = false;
  #dragTime: number | null = null;
  #lockTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    const { signal } = this.#abort;

    if (!this.#line) {
      this.#line = h('div', { class: 'fork-line' });
      this.#terminus = h('span', { class: 'fork-line-terminus', 'aria-hidden': 'true' });
      this.#marker = h('span', { class: 'fork-line-marker', 'aria-hidden': 'true' });
      this.#plaque = h('span', { class: 'fork-line-plaque', role: 'presentation', hidden: true });
      this.#marker.append(this.#plaque);
      this.replaceChildren(this.#line);
    }

    if (this.size !== 'expanded') {
      this.setAttribute('role', 'slider');
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-orientation', 'horizontal');
      this.addEventListener('keydown', this.#onKeydown, { signal });
      this.addEventListener('pointerdown', this.#onPointerDown, { signal });
      this.addEventListener('pointermove', this.#onPointerMove, { signal });
      this.addEventListener('pointerup', this.#onPointerUp, { signal });
      this.addEventListener('pointercancel', this.#onPointerUp, { signal });
      this.addEventListener('focus', () => this.#showPlaque(), { signal });
      this.addEventListener('blur', () => this.#hidePlaque(), { signal });
    } else {
      this.setAttribute('role', 'img');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
    if (this.#lockTimer) clearTimeout(this.#lockTimer);
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state?.scenario || !state.stats || !this.#line) return;

    this.setAttribute('data-size', this.size);
    this.setAttribute('aria-label', engine.labels.mapLabel);

    const order = routeOrder(state.scenario, state.visited);
    const key = [
      order.map((n) => n.id).join(','),
      [...state.visited].join(','),
      Object.entries(state.answers).map(([q, o]) => `${q}:${o}`).join(','),
      state.segmentId,
      state.questionId,
      state.phase,
    ].join('|');
    if (key !== this.#orderKey) {
      this.#orderKey = key;
      this.#sync(order);
    }
    this.#updateDynamic();
    this.#updateAria();
  }

  // ---------------------------------------------------------------- structure

  #sync(order: (SegmentNode | QuestionNode)[]): void {
    const engine = this.engine!;
    const state = engine.state;
    const labels = engine.labels;
    const line = this.#line!;
    const mainIds = new Set(state.stats!.mainLine.map((s) => s.id));
    const current = engine.currentSegment;
    const present = new Set(order.map((n) => n.id));

    for (const [id, parts] of this.#segments) {
      if (!present.has(id)) {
        parts.element.remove();
        this.#segments.delete(id);
      }
    }
    for (const [id, parts] of this.#stations) {
      if (!present.has(id)) {
        parts.element.remove();
        this.#stations.delete(id);
      }
    }

    const children: HTMLElement[] = [];
    let mainIndex = 0;
    let stationIndex = 0;
    const freshlyInserted: HTMLElement[] = [];

    for (const node of order) {
      if (isSegment(node)) {
        const duration = node.out - node.in;
        const inserted = !mainIds.has(node.id);
        const visited = state.visited.has(node.id);
        const isCurrent = current?.id === node.id;
        if (mainIds.has(node.id)) mainIndex++;
        let parts = this.#segments.get(node.id);
        if (!parts) {
          const fill = h('span', { class: 'fork-line-fill' });
          const preview = h('span', { class: 'fork-line-preview', hidden: true });
          const element = h('span', { class: 'fork-line-segment', 'data-id': node.id }, fill, preview);
          parts = { element, fill, preview };
          this.#segments.set(node.id, parts);
          if (inserted) {
            element.style.flexGrow = '0';
            freshlyInserted.push(element);
          }
        }
        const { element } = parts;
        element.setAttribute('data-kind', node.kind);
        element.toggleAttribute('data-inserted', inserted);
        element.toggleAttribute('data-watched', visited && !isCurrent);
        element.toggleAttribute('data-current', isCurrent);
        element.toggleAttribute('data-locked', !visited && !isCurrent);
        // Parts are as long as they last, on the bar and on the summary map alike. On the map
        // a confirmation folds into its checkpoint (CSS hides it), so only named parts share the line.
        const grow = this.size === 'expanded' && node.kind === 'confirm' ? 0 : duration;
        if (this.size === 'expanded') element.removeAttribute('title');
        else element.title = `${node.title} · ${formatTime(duration)}`;
        if (!freshlyInserted.includes(element)) element.style.flexGrow = String(grow);
        element.dataset.grow = String(grow);

        if (this.size === 'expanded' && node.kind !== 'confirm') {
          if (!parts.label) {
            parts.label = h('span', { class: 'fork-line-label' });
            element.append(parts.label);
          }
          const number = inserted ? '+' : String(mainIndex);
          parts.label.replaceChildren(
            h('span', { class: 'fork-line-label-title' }, node.title),
            h('span', { class: 'fork-line-label-duration fork-kicker' }, formatTime(duration)),
          );
        }
        children.push(element);
      } else if (isQuestion(node)) {
        stationIndex++;
        const answerId = state.answers[node.id];
        const option = answerId ? node.options.find((o) => o.id === answerId) : undefined;
        let parts = this.#stations.get(node.id);
        if (!parts) {
          const plaque = h('span', { class: 'fork-line-plaque fork-line-plaque-lock', role: 'presentation', hidden: true });
          const element = h('span', { class: 'fork-line-station', 'data-id': node.id }, plaque);
          parts = { element, plaque };
          this.#stations.set(node.id, parts);
        }
        const { element, plaque } = parts;
        const label = node.title ?? t(labels.checkpoint, { index: stationIndex, total: state.stats!.questions.length });
        element.toggleAttribute('data-answered', Boolean(option));
        element.toggleAttribute('data-right', Boolean(option?.correct));
        element.toggleAttribute('data-wrong', Boolean(option && !option.correct));
        element.toggleAttribute('data-current', state.questionId === node.id);
        element.title = option ? `${label} · ${labels.answered}` : label;
        element.querySelector('.fork-icon')?.remove();
        // On the bar a wrong answer reads as "material added" (+); on the summary map it reads as the verdict (×).
        const wrongIcon = this.size === 'expanded' ? 'cross' : 'plus';
        if (option) element.prepend(iconElement(option.correct ? 'check' : wrongIcon, 'fork-line-station-icon', option.correct ? 4 : 5));
        plaque.replaceChildren(
          iconElement('lock', 'fork-line-plaque-icon', 2.5),
          h('span', { class: 'fork-line-plaque-long' }, labels.lockedCheckpoint),
          h('span', { class: 'fork-line-plaque-short' }, labels.lockedCheckpointShort),
        );
        if (this.size === 'expanded') {
          // No caption under the circle on the map: the icon says it, the name goes to assistive tech.
          element.setAttribute('role', 'img');
          element.setAttribute('aria-label', option ? `${label.replace(/ of \d+$/, '')}: ${option.correct ? labels.right : labels.wrong}` : label);
          element.removeAttribute('title');
        }
        children.push(element);
      }
    }

    // On the map, a part that follows a checkpoint starts its label at the circle's left edge.
    if (this.size === 'expanded') {
      let afterStation = false;
      for (const child of children) {
        if (child.classList.contains('fork-line-station')) afterStation = true;
        else if (child.getAttribute('data-kind') !== 'confirm') {
          child.toggleAttribute('data-after-station', afterStation);
          afterStation = false;
        }
      }
    }
    children.push(this.#terminus!);
    line.replaceChildren(...children);
    // Five or more named parts on the summary map: smaller labels, so each still fits its share.
    if (this.size === 'expanded') {
      const named = children.filter((c) => c.classList.contains('fork-line-segment') && c.getAttribute('data-kind') !== 'confirm');
      this.toggleAttribute('data-many', named.length >= 5);
    }
    // The marker rides inside the current segment.
    this.#placeMarker();

    // Inserted parts grow out of their checkpoint on the next frame, so the transition runs.
    if (freshlyInserted.length) {
      requestAnimationFrame(() => {
        for (const element of freshlyInserted) element.style.flexGrow = element.dataset.grow ?? '1';
      });
    }
  }

  #placeMarker(): void {
    const engine = this.engine;
    const segment = engine?.currentSegment;
    if (!engine || !segment || !this.#marker) return;
    const parts = this.#segments.get(segment.id);
    if (parts && this.#marker.parentElement !== parts.element) parts.element.append(this.#marker);
  }

  // ---------------------------------------------------------------- dynamic

  #updateDynamic(): void {
    const engine = this.engine;
    const segment = engine?.currentSegment;
    if (!engine || !segment || !this.#marker) return;
    this.#placeMarker();
    const duration = segment.out - segment.in;
    const time = this.#dragTime ?? engine.currentTime;
    const progress = Math.min(1, Math.max(0, (engine.currentTime - segment.in) / duration));
    const parts = this.#segments.get(segment.id);
    if (parts) {
      parts.fill.style.width = `${progress * 100}%`;
      if (this.#dragTime !== null) {
        const target = Math.min(1, Math.max(0, (this.#dragTime - segment.in) / duration));
        const lo = Math.min(progress, target);
        const hi = Math.max(progress, target);
        parts.preview.style.left = `${lo * 100}%`;
        parts.preview.style.width = `${(hi - lo) * 100}%`;
        parts.preview.hidden = false;
        this.#marker.style.left = `${target * 100}%`;
      } else {
        parts.preview.hidden = true;
        this.#marker.style.left = `${progress * 100}%`;
      }
    }
    this.#marker.toggleAttribute('data-dragging', this.#dragTime !== null);
    if (this.#plaque && !this.#plaque.hidden) this.#plaque.textContent = this.#plaqueText(time);
    // Hidden in the idle and complete states, where there is no position to show.
    this.#marker.toggleAttribute('hidden', engine.state.phase === 'complete');
  }

  #plaqueText(time: number): string {
    const engine = this.engine!;
    const segment = engine.currentSegment!;
    const local = Math.max(0, time - segment.in);
    const { elapsed } = engine.routeTime;
    const lessonTime = elapsed - Math.max(0, engine.currentTime - segment.in) + local;
    return `${formatTime(lessonTime)} · ${segment.title}`;
  }

  #updateAria(): void {
    const engine = this.engine!;
    const segment = engine.currentSegment;
    if (!segment || this.size === 'expanded') return;
    const { elapsed, total } = engine.routeTime;
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(Math.round(total)));
    this.setAttribute('aria-valuenow', String(Math.round(elapsed)));
    const where = segment.kind === 'detour' ? `${engine.labels.closerLookBadge}: ${segment.title}` : segment.title;
    this.setAttribute('aria-valuetext', `${formatTime(elapsed)}, ${where}`);
  }

  // ---------------------------------------------------------------- seeking

  /** Time for a pointer position along the line, reading the rendered segment boxes. */
  #timeAtX(clientX: number): number | null {
    const segments = Array.from(this.#line!.querySelectorAll<HTMLElement>('.fork-line-segment'));
    if (!segments.length) return null;
    const engine = this.engine!;
    let before: { node: SegmentNode; rect: DOMRect } | null = null;
    for (const element of segments) {
      const node = engine.state.scenario!.nodes[element.dataset.id!];
      if (!isSegment(node)) continue;
      const rect = element.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        return node.in + ((clientX - rect.left) / Math.max(1, rect.width)) * (node.out - node.in);
      }
      if (clientX < rect.left) return before ? before.node.out : node.in;
      before = { node, rect };
    }
    return before ? before.node.out : null;
  }

  #attemptSeek(time: number): void {
    const engine = this.engine!;
    if (engine.seekTo(time)) return;
    // Locked: point at the checkpoint in the way.
    const station = this.#nextUnansweredStation();
    if (!station) return;
    station.element.setAttribute('data-locked-hint', '');
    station.plaque.hidden = false;
    if (this.#lockTimer) clearTimeout(this.#lockTimer);
    this.#lockTimer = setTimeout(() => {
      station.element.removeAttribute('data-locked-hint');
      station.plaque.hidden = true;
    }, LOCK_HINT_MS);
    engine.announce(engine.labels.lockedCheckpoint);
  }

  #nextUnansweredStation(): StationParts | undefined {
    const engine = this.engine!;
    for (const [id, parts] of this.#stations) {
      if (!engine.state.answers[id]) return parts;
    }
    return undefined;
  }

  #onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const engine = this.engine;
    if (!engine || !engine.currentSegment) return;
    const phase = engine.state.phase;
    if (phase === 'idle' || phase === 'complete') return;
    event.preventDefault();
    this.#dragging = true;
    this.setPointerCapture(event.pointerId);
    this.#scrub(event);
  };

  #onPointerMove = (event: PointerEvent): void => {
    if (this.#dragging) this.#scrub(event);
  };

  #onPointerUp = (event: PointerEvent): void => {
    if (!this.#dragging) return;
    this.#dragging = false;
    if (this.hasPointerCapture(event.pointerId)) this.releasePointerCapture(event.pointerId);
    const time = this.#dragTime;
    this.#dragTime = null;
    this.#hidePlaque();
    if (time !== null) this.#attemptSeek(time);
    this.requestUpdate();
  };

  #scrub(event: PointerEvent): void {
    const engine = this.engine!;
    const segment = engine.currentSegment!;
    const time = this.#timeAtX(event.clientX);
    if (time === null) return;
    if (engine.isUnlocked(time)) {
      // Within the current part the marker follows the pointer; elsewhere the seek commits on release.
      const inCurrent = time >= segment.in && time <= segment.out;
      this.#dragTime = inCurrent ? time : null;
      if (!inCurrent) {
        this.#attemptSeek(time);
        return;
      }
      this.#showPlaque(time);
    } else {
      this.#dragTime = null;
      this.#attemptSeek(time);
    }
    this.requestUpdate();
  }

  #showPlaque(time?: number): void {
    if (!this.#plaque || !this.engine?.currentSegment) return;
    this.#plaque.textContent = this.#plaqueText(time ?? this.engine.currentTime);
    this.#plaque.hidden = false;
  }

  #hidePlaque(): void {
    if (this.#plaque) this.#plaque.hidden = true;
  }

  #onKeydown = (event: KeyboardEvent): void => {
    const engine = this.engine;
    const segment = engine?.currentSegment;
    if (!engine || !segment) return;
    const time = engine.currentTime;
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.#attemptSeek(Math.max(segment.in, time - SEEK_STEP));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.#attemptSeek(Math.min(segment.out, time + SEEK_STEP));
        break;
      case 'Home':
        this.#attemptSeek(segment.in);
        break;
      case 'End':
        this.#attemptSeek(segment.out);
        break;
      case 'PageUp':
        this.#stepSegment(-1);
        break;
      case 'PageDown':
        this.#stepSegment(1);
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      this.#showPlaque();
    }
  };

  #stepSegment(direction: 1 | -1): void {
    const engine = this.engine!;
    const watched = engine.routeSegments.filter((s) => engine.state.visited.has(s.id));
    const index = watched.findIndex((s) => s.id === engine.state.segmentId);
    const target = watched[index + direction];
    if (target) this.#attemptSeek(target.in);
    else if (direction === 1) this.#attemptSeek(engine.currentSegment!.out + 1);
  }
}

if (!customElements.get(ForkRouteMapElement.tagName)) {
  customElements.define(ForkRouteMapElement.tagName, ForkRouteMapElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-route-map': ForkRouteMapElement;
  }
}
