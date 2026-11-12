/**
 * <fork-scenario> — the branching engine.
 *
 * Renders no UI. Loads the scenario, watches the player's time, pauses at
 * forks, seeks between segments and keeps the route state that every other
 * fork-* component reads. Other components find it through `findEngine()` and
 * subscribe to `fork-change`.
 */
import {
  PlayerController,
  playerContext,
  selectControls,
  selectPlayback,
  selectTime,
  UIElement,
  type PropertyValues,
} from '@videojs/html';
import {
  COMPLETE,
  DEFAULT_LABELS,
  formatTime,
  t,
  isQuestion,
  isSegment,
  parseScenario,
  scenarioStats,
  segmentAt,
  type QuestionNode,
  type Scenario,
  type ScenarioLabels,
  type ScenarioNode,
  type ScenarioStats,
  type SegmentKind,
  type SegmentNode,
} from './scenario';
import { routeOrder } from './route-geometry';

export type ForkPhase = 'loading' | 'idle' | 'playing' | 'question' | 'transition' | 'detour' | 'merge' | 'complete';

export interface ForkTransition {
  questionId: string;
  optionId: string;
  correct: boolean;
  feedback: string;
  targetId: string;
  targetKind: SegmentKind | 'question' | 'complete';
  targetTitle: string;
  targetDuration: number;
}

export interface ForkState {
  scenario: Scenario | null;
  stats: ScenarioStats | null;
  phase: ForkPhase;
  /** Current segment id; the segment the player is on (or paused on, during a question). */
  segmentId: string | null;
  /** Current question id while phase is question or transition. */
  questionId: string | null;
  /** Visited node ids in the order they were entered. */
  route: string[];
  visited: ReadonlySet<string>;
  answers: Record<string, string>;
  transition: ForkTransition | null;
  reducedMotion: boolean;
  error: string | null;
}

/** How close to a segment's end counts as reaching it (seconds). */
const BOUNDARY_EPSILON = 0.12;
/**
 * The route card waits for the learner by default: the feedback is the lesson, so it is
 * read at the learner's pace and dismissed with the card's button (or Enter / Space / Esc).
 * `auto-continue="<ms>"` opts into a timed card instead.
 */
export const TRANSITION_MS = 0;
/** Seeks land this far after a segment's `in`, so the first frame shown belongs to the segment. */
const SEEK_LEAD = 0.04;
/** The merge toast's duration. */
export const MERGE_MS = 1500;

const reducedMotionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export class ForkScenarioElement extends UIElement {
  static readonly tagName = 'fork-scenario';

  static override properties = {
    src: { type: String },
    reducedMotion: { type: Boolean, attribute: 'reduced-motion' },
    autostart: { type: Boolean },
    autoContinue: { type: Number, attribute: 'auto-continue' },
  };

  /** URL of the scenario JSON. Alternatively, nest `<script type="application/json">`. */
  src: string | null = null;
  /** Force reduced motion (the demo page's toggle); the OS preference is honored either way. */
  reducedMotion = false;
  /** Enter `playing` as soon as the scenario loads, without an idle screen. */
  autostart = false;
  /** Milliseconds before the route card goes on by itself. 0 (default): wait for the learner. */
  autoContinue = TRANSITION_MS;

  readonly #time = new PlayerController(this, playerContext, selectTime);
  readonly #playback = new PlayerController(this, playerContext, selectPlayback);
  readonly #controls = new PlayerController(this, playerContext, selectControls);

  #state: ForkState = {
    scenario: null,
    stats: null,
    phase: 'loading',
    segmentId: null,
    questionId: null,
    route: [],
    visited: new Set(),
    answers: {},
    transition: null,
    reducedMotion: false,
    error: null,
  };

  #loadedSrc: string | null = null;
  #transitionTimer: ReturnType<typeof setTimeout> | null = null;
  #mergeTimer: ReturnType<typeof setTimeout> | null = null;
  #releaseControls: (() => void) | null = null;
  #announcer: HTMLElement | null = null;
  #disconnect: AbortController | null = null;
  #lastTime = -1;

  get state(): ForkState {
    return this.#state;
  }

  get scenario(): Scenario | null {
    return this.#state.scenario;
  }

  /** The course's words for the skin's UI, with English defaults for anything unset. */
  get labels(): ScenarioLabels {
    return this.#state.scenario?.labels ?? DEFAULT_LABELS;
  }

  get currentSegment(): SegmentNode | null {
    const { scenario, segmentId } = this.#state;
    if (!scenario || !segmentId) return null;
    const node = scenario.nodes[segmentId];
    return isSegment(node) ? node : null;
  }

  get currentQuestion(): QuestionNode | null {
    const { scenario, questionId } = this.#state;
    if (!scenario || !questionId) return null;
    const node = scenario.nodes[questionId];
    return isQuestion(node) ? node : null;
  }

  /** Current time, in seconds, within the media. */
  get currentTime(): number {
    return this.#time.value?.currentTime ?? 0;
  }

  get prefersReducedMotion(): boolean {
    return this.reducedMotion || Boolean(reducedMotionQuery?.matches);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;

    this.setAttribute('aria-hidden', 'true');

    if (!this.#announcer) {
      const announcer = document.createElement('div');
      announcer.className = 'fork-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.removeAttribute('aria-hidden');
      this.#announcer = announcer;
    }
    // The announcer must not inherit aria-hidden, so it lives next to the engine, not inside it.
    if (this.parentElement && !this.#announcer.isConnected) {
      this.parentElement.insertBefore(this.#announcer, this.nextSibling);
    }

    reducedMotionQuery?.addEventListener('change', () => this.#emit(), { signal });
    this.#load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#clearTimers();
    this.#releaseControls?.();
    this.#releaseControls = null;
    this.#announcer?.remove();
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    if (changed.has('src')) this.#load();
    if (changed.has('reducedMotion')) this.#emit();

    const time = this.#time.value;
    const playback = this.#playback.value;
    if (!time || !playback || !this.#state.scenario) return;

    const t = time.currentTime;
    if (t !== this.#lastTime || playback.paused !== this.#lastPaused) {
      this.#lastTime = t;
      this.#lastPaused = playback.paused;
      this.#tick(t, playback.paused, time.seeking);
      // Time moved: components that show position (map, clock, badge) re-render.
      this.dispatchEvent(new CustomEvent('fork-tick', { detail: t }));
    }
  }

  #lastPaused = true;

  // ---------------------------------------------------------------- loading

  async #load(): Promise<void> {
    const inline = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
    let raw: unknown;
    try {
      if (inline?.textContent?.trim()) {
        raw = JSON.parse(inline.textContent);
      } else if (this.src) {
        if (this.#loadedSrc === this.src && this.#state.scenario) return;
        this.#loadedSrc = this.src;
        const response = await fetch(this.src);
        if (!response.ok) throw new Error(`Scenario request failed: ${response.status}`);
        raw = await response.json();
      } else {
        return;
      }
      const scenario = parseScenario(raw);
      this.#state = {
        ...this.#state,
        scenario,
        stats: scenarioStats(scenario),
        phase: this.autostart ? 'playing' : 'idle',
        segmentId: scenario.start,
        questionId: null,
        route: [scenario.start],
        visited: new Set([scenario.start]),
        answers: {},
        transition: null,
        error: null,
      };
      this.#emit();
      this.requestUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.#state = { ...this.#state, error: message, phase: 'loading' };
      // A broken scenario must be loud for whoever embeds the skin, not a silent spinner.
      console.error(`[fork] ${this.src || 'inline scenario'}: ${message}`);
      this.dispatchEvent(new CustomEvent('fork-error', { bubbles: true, composed: true, detail: { message } }));
      this.#emit();
    }
  }

  // ---------------------------------------------------------------- ticking

  #tick(t: number, paused: boolean, seeking: boolean): void {
    const { scenario, phase } = this.#state;
    if (!scenario) return;

    switch (phase) {
      case 'idle': {
        if (!paused) this.#set({ phase: 'playing' });
        break;
      }
      case 'playing':
      case 'detour':
      case 'merge': {
        const segment = this.currentSegment;
        if (!segment) return;
        if (t >= segment.out - BOUNDARY_EPSILON) {
          if (!seeking) this.#leave(segment);
          return;
        }
        if (t < segment.in - 0.25) {
          // The learner scrubbed backwards into another segment.
          const target = segmentAt(scenario, t);
          if (target && this.#state.visited.has(target.id)) {
            this.#set({ segmentId: target.id, phase: target.kind === 'detour' ? 'detour' : 'playing' });
          } else {
            void this.#time.value?.seek(segment.in);
          }
        }
        break;
      }
      case 'question': {
        // Stay parked on the fork. Space, arrows or a scrub cannot leave it; only an answer can.
        const segment = this.currentSegment;
        if (!segment) return;
        if (!paused) this.#playback.value?.pause();
        if (Math.abs(t - segment.out) > 0.5 && !seeking) void this.#time.value?.seek(segment.out - BOUNDARY_EPSILON);
        break;
      }
      case 'complete': {
        if (!paused) this.replay();
        break;
      }
      case 'transition': {
        // Play pressed while the card is up (bar button, Space, K) means "go on".
        if (!paused) this.#commitTransition();
        break;
      }
      case 'loading':
        break;
    }
  }

  #leave(segment: SegmentNode): void {
    const scenario = this.#state.scenario!;
    const nextId = segment.returnsTo && segment.kind === 'detour' ? segment.returnsTo : segment.next;

    if (nextId === COMPLETE) {
      this.#playback.value?.pause();
      this.#set({ phase: 'complete', transition: null });
      this.#announce(this.#completeAnnouncement());
      this.#dispatch('fork-complete', { route: this.#state.route, answers: this.#state.answers });
      return;
    }

    const next = scenario.nodes[nextId];
    if (isQuestion(next)) {
      // Answered on an earlier pass: the checkpoint plays through along the branch already chosen.
      const answered = next.options.find((o) => o.id === this.#state.answers[next.id]);
      if (answered) {
        const target = scenario.nodes[answered.next];
        if (answered.next === COMPLETE) {
          this.#playback.value?.pause();
          this.#set({ phase: 'complete', transition: null });
        } else if (isSegment(target)) {
          this.#enter(target);
        }
        return;
      }
      this.#playback.value?.pause();
      this.#set({ phase: 'question', questionId: next.id });
      this.#pushRoute(next.id);
      const index = this.#state.stats?.questions.findIndex((q) => q.id === next.id) ?? -1;
      const total = this.#state.stats?.questions.length ?? 0;
      this.#announce(`${next.title ?? t(this.labels.checkpoint, { index: index + 1, total })}: ${next.prompt}`);
      return;
    }
    if (isSegment(next)) {
      this.#enter(next, { merge: segment.kind === 'detour' });
    }
  }

  #enter(target: SegmentNode, options: { merge?: boolean } = {}): void {
    const time = this.#time.value;
    if (time && Math.abs(time.currentTime - target.in) > 0.3) void time.seek(target.in + SEEK_LEAD);
    this.#pushRoute(target.id);
    const phase: ForkPhase = options.merge ? 'merge' : target.kind === 'detour' ? 'detour' : 'playing';
    this.#set({ segmentId: target.id, questionId: null, transition: null, phase });
    if (options.merge) {
      this.#announce(this.labels.resumed);
      this.#clearMergeTimer();
      this.#mergeTimer = setTimeout(() => {
        this.#mergeTimer = null;
        if (this.#state.phase === 'merge') this.#set({ phase: 'playing' });
      }, MERGE_MS);
    }
  }

  // ---------------------------------------------------------------- actions

  /** Start from the idle screen. */
  start(): void {
    if (this.#state.phase !== 'idle') return;
    void this.#playback.value?.play();
    this.#set({ phase: 'playing' });
  }

  /** Answer the current question. The route card shows while the seek lands. */
  answer(optionId: string): void {
    const question = this.currentQuestion;
    const scenario = this.#state.scenario;
    if (!question || !scenario || this.#state.phase !== 'question') return;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) return;

    const target = scenario.nodes[option.next];
    const targetKind: ForkTransition['targetKind'] =
      option.next === COMPLETE ? 'complete' : isSegment(target) ? target.kind : 'question';
    // A confirmation is a beat, not a destination: the card names the part that follows it.
    let shown: ScenarioNode | undefined = target;
    const seen = new Set<string>();
    while (shown && isSegment(shown) && shown.kind === 'confirm' && !seen.has(shown.id)) {
      seen.add(shown.id);
      shown = scenario.nodes[shown.next];
    }
    const transition: ForkTransition = {
      questionId: question.id,
      optionId,
      correct: Boolean(option.correct),
      feedback: option.feedback ?? '',
      targetId: option.next,
      targetKind: targetKind === 'confirm' ? 'main' : targetKind,
      targetTitle: isSegment(shown) ? shown.title : isQuestion(shown) ? (shown.title ?? 'Next checkpoint') : 'Finish',
      targetDuration: isSegment(shown) ? shown.out - shown.in : 0,
    };

    this.#set({
      phase: 'transition',
      transition,
      answers: { ...this.#state.answers, [question.id]: optionId },
    });
    this.#dispatch('fork-answer', { questionId: question.id, optionId, correct: transition.correct });

    const labels = this.labels;
    const verdict = `${transition.correct ? labels.right : labels.wrong}.`;
    const direction =
      targetKind === 'detour'
        ? t(labels.closerLook, { title: transition.targetTitle, duration: formatTime(transition.targetDuration) })
        : targetKind === 'complete'
          ? labels.finishing
          : t(labels.next, { title: transition.targetTitle });
    this.#announce(`${verdict} ${transition.feedback} ${direction}`.replace(/\s+/g, ' ').trim());

    // Seek now, under the card, so the first frame is ready when the card leaves.
    if (isSegment(target)) void this.#time.value?.seek(target.in + SEEK_LEAD);

    // The picture under the card stays paused on the first frame of what comes next.
    void this.#playback.value?.pause();
    this.#clearTransitionTimer();
    if (this.autoContinue > 0) this.#transitionTimer = setTimeout(() => this.#commitTransition(), this.autoContinue);
  }

  /** Continue past a question that was already answered on an earlier pass: no card, no re-answer. */
  continueAnswered(): void {
    const question = this.currentQuestion;
    const scenario = this.#state.scenario;
    if (!question || !scenario || this.#state.phase !== 'question') return;
    const answerId = this.#state.answers[question.id];
    const option = question.options.find((o) => o.id === answerId);
    if (!option) return;
    if (option.next === COMPLETE) {
      this.#set({ phase: 'complete', questionId: null });
      return;
    }
    const target = scenario.nodes[option.next];
    if (isQuestion(target)) {
      this.#pushRoute(target.id);
      this.#set({ phase: 'question', questionId: target.id });
      return;
    }
    if (isSegment(target)) {
      this.#enter(target);
      void this.#playback.value?.play();
    }
  }

  /** End the route card early (Esc / Enter). */
  skipTransition(): void {
    if (this.#state.phase === 'transition') this.#commitTransition();
  }

  #commitTransition(): void {
    this.#clearTransitionTimer();
    const { transition, scenario } = this.#state;
    if (!transition || !scenario || this.#state.phase !== 'transition') return;

    if (transition.targetKind === 'complete') {
      this.#set({ phase: 'complete', transition: null, questionId: null });
      this.#announce(this.#completeAnnouncement());
      this.#dispatch('fork-complete', { route: this.#state.route, answers: this.#state.answers });
      return;
    }
    const target = scenario.nodes[transition.targetId];
    if (isQuestion(target)) {
      this.#pushRoute(target.id);
      this.#set({ phase: 'question', questionId: target.id, transition: null });
      return;
    }
    if (isSegment(target)) {
      this.#enter(target);
      void this.#playback.value?.play();
    }
  }

  /** Leave a detour early and rejoin the main line. */
  backToRoute(): void {
    const segment = this.currentSegment;
    const scenario = this.#state.scenario;
    if (!segment || !scenario || segment.kind !== 'detour') return;
    const target = scenario.nodes[segment.returnsTo ?? segment.next];
    if (isSegment(target)) this.#enter(target, { merge: true });
  }

  /** Seek within the unlocked part of the course. Returns false when the time is locked. */
  seekTo(time: number): boolean {
    const scenario = this.#state.scenario;
    if (!scenario) return false;
    const target = segmentAt(scenario, time);
    if (!target) return false;
    const current = this.currentSegment;
    const allowed = this.#state.visited.has(target.id) || target.id === current?.id;
    if (!allowed) return false;
    if (this.#state.phase === 'question' || this.#state.phase === 'transition') {
      // Scrubbing back out of a fork is allowed; the fork comes back when the segment ends again.
      this.#set({ phase: target.kind === 'detour' ? 'detour' : 'playing', questionId: null, transition: null });
      this.#clearTransitionTimer();
    }
    this.#set({ segmentId: target.id, phase: target.kind === 'detour' ? 'detour' : this.#state.phase === 'merge' ? 'merge' : 'playing' });
    void this.#time.value?.seek(Math.min(time, target.out - BOUNDARY_EPSILON));
    return true;
  }

  /** Whether `time` can be seeked to right now. */
  isUnlocked(time: number): boolean {
    const scenario = this.#state.scenario;
    if (!scenario) return false;
    const target = segmentAt(scenario, time);
    return Boolean(target && (this.#state.visited.has(target.id) || target.id === this.#state.segmentId));
  }

  replay(): void {
    const scenario = this.#state.scenario;
    if (!scenario) return;
    this.#clearTimers();
    const start = scenario.nodes[scenario.start];
    this.#state = {
      ...this.#state,
      phase: 'playing',
      segmentId: scenario.start,
      questionId: null,
      route: [scenario.start],
      visited: new Set([scenario.start]),
      answers: {},
      transition: null,
    };
    if (isSegment(start)) void this.#time.value?.seek(start.in + SEEK_LEAD);
    void this.#playback.value?.play();
    this.#emit();
  }

  // ---------------------------------------------------------------- derived

  /** 1-based step index of the current main-line segment and the main-line length. */
  get step(): { index: number; total: number } {
    const stats = this.#state.stats;
    const segment = this.currentSegment;
    if (!stats || !segment) return { index: 0, total: 0 };
    const total = stats.mainLine.length;
    let index = stats.mainLine.findIndex((s) => s.id === segment.id) + 1;
    if (index === 0) {
      // On a branch: count as the step it rejoins, minus a half.
      const mainIds = new Set(stats.mainLine.map((s) => s.id));
      const merge = this.#mergePoint(segment.id, mainIds);
      index = Math.max(1, stats.mainLine.findIndex((s) => s.id === merge));
    }
    return { index, total };
  }

  #mergePoint(id: string, mainIds: Set<string>): string {
    const scenario = this.#state.scenario!;
    const seen = new Set<string>();
    let cursor = id;
    while (cursor && cursor !== COMPLETE && !seen.has(cursor)) {
      seen.add(cursor);
      if (mainIds.has(cursor)) return cursor;
      const node = scenario.nodes[cursor];
      if (!node) break;
      cursor = isSegment(node) ? (node.returnsTo ?? node.next) : (node.options.find((o) => o.correct) ?? node.options[0]).next;
    }
    return cursor;
  }

  get score(): { correct: number; total: number } {
    const stats = this.#state.stats;
    const scenario = this.#state.scenario;
    if (!stats || !scenario) return { correct: 0, total: 0 };
    let correct = 0;
    for (const question of stats.questions) {
      const answerId = this.#state.answers[question.id];
      if (answerId && question.options.find((o) => o.id === answerId)?.correct) correct++;
    }
    return { correct, total: stats.questions.length };
  }

  /** The segments the lesson consists of right now, in order: the main line plus the branches taken so far. */
  get routeSegments(): SegmentNode[] {
    const scenario = this.#state.scenario;
    if (!scenario) return [];
    return routeOrder(scenario, this.#state.visited).filter(isSegment);
  }

  /**
   * Lesson time along the travelled route: elapsed = the parts before the
   * current one plus the position within it; total = the whole route as it
   * stands, which grows when a branch is inserted.
   */
  get routeTime(): { elapsed: number; total: number } {
    const segments = this.routeSegments;
    const current = this.currentSegment;
    let elapsed = 0;
    let total = 0;
    let reached = false;
    for (const segment of segments) {
      const duration = segment.out - segment.in;
      total += duration;
      if (reached) continue;
      if (current && segment.id === current.id) {
        const parked = this.#state.phase === 'question' || this.#state.phase === 'transition';
        elapsed += parked ? duration : Math.min(duration, Math.max(0, this.currentTime - segment.in));
        reached = true;
      } else {
        elapsed += duration;
      }
    }
    if (this.#state.phase === 'complete') elapsed = total;
    if (this.#state.phase === 'idle') elapsed = 0;
    return { elapsed, total };
  }

  /** Detours the learner has taken, in route order. */
  get detoursTaken(): SegmentNode[] {
    const scenario = this.#state.scenario;
    if (!scenario) return [];
    return this.#state.route
      .map((id) => scenario.nodes[id])
      .filter((n): n is SegmentNode => isSegment(n) && n.kind === 'detour');
  }

  #completeAnnouncement(): string {
    const { correct, total } = this.score;
    return `${this.labels.complete}: ${t(this.labels.score, { correct, total })}`;
  }

  // ---------------------------------------------------------------- plumbing

  #pushRoute(id: string): void {
    if (this.#state.route[this.#state.route.length - 1] === id) return;
    const visited = new Set(this.#state.visited);
    visited.add(id);
    this.#state = { ...this.#state, route: [...this.#state.route, id], visited };
  }

  #set(patch: Partial<ForkState>): void {
    const previous = this.#state;
    this.#state = { ...previous, ...patch };
    if (previous.phase !== this.#state.phase) this.#onPhaseChange(previous.phase, this.#state.phase);
    this.#emit();
  }

  #onPhaseChange(_from: ForkPhase, to: ForkPhase): void {
    const locked = to === 'question' || to === 'transition' || to === 'complete' || to === 'idle';
    if (locked && !this.#releaseControls) {
      this.#releaseControls = this.#controls.value?.requestControlsLock() ?? null;
    } else if (!locked && this.#releaseControls) {
      this.#releaseControls();
      this.#releaseControls = null;
    }
  }

  #emit(): void {
    this.#state = { ...this.#state, reducedMotion: this.prefersReducedMotion };
    const container = this.closest('media-container') ?? this.parentElement;
    if (container) {
      container.setAttribute('data-fork-phase', this.#state.phase);
      const segment = this.currentSegment;
      if (segment) container.setAttribute('data-fork-kind', segment.kind);
      container.toggleAttribute('data-fork-reduced-motion', this.#state.reducedMotion);
      // Static words in the layout (loading, error) take the lesson's labels.
      const labels = this.labels as unknown as Record<string, string>;
      for (const element of container.querySelectorAll<HTMLElement>('[data-fork-label]')) {
        const key = element.dataset.forkLabel!;
        if (key === 'name') element.textContent = this.#state.scenario?.name ?? '';
        else if (key in labels) element.textContent = labels[key];
      }
    }
    this.#dispatch('fork-change', this.#state);
  }

  #dispatch(type: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  /** Say something through the skin's live region (used by components for refusals and hints). */
  announce(text: string): void {
    this.#announce(text);
  }

  #announce(text: string): void {
    if (!this.#announcer) return;
    // Clear first so repeated identical messages are still announced.
    this.#announcer.textContent = '';
    requestAnimationFrame(() => {
      if (this.#announcer) this.#announcer.textContent = text;
    });
  }

  #clearTransitionTimer(): void {
    if (this.#transitionTimer) clearTimeout(this.#transitionTimer);
    this.#transitionTimer = null;
  }

  #clearMergeTimer(): void {
    if (this.#mergeTimer) clearTimeout(this.#mergeTimer);
    this.#mergeTimer = null;
  }

  #clearTimers(): void {
    this.#clearTransitionTimer();
    this.#clearMergeTimer();
  }
}

/** Find the engine that governs `element`: the nearest player's `<fork-scenario>`. */
export function findEngine(element: Element): ForkScenarioElement | null {
  const scope = element.closest('video-player') ?? element.closest('media-container') ?? document;
  return scope.querySelector<ForkScenarioElement>('fork-scenario');
}

if (!customElements.get(ForkScenarioElement.tagName)) {
  customElements.define(ForkScenarioElement.tagName, ForkScenarioElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-scenario': ForkScenarioElement;
  }
}
