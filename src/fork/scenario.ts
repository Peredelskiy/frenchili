/**
 * Fork scenario model.
 *
 * A scenario is a directed graph of two node kinds: segments (ranges of one
 * media file) and questions (forks). Edges are `next` ids. Nothing in here
 * touches the DOM or the player, so the model can be validated and unit
 * tested on its own, and the same JSON can drive other front-ends.
 */

export type SegmentKind = 'main' | 'confirm' | 'detour';

export interface SegmentNode {
  type: 'segment';
  id: string;
  kind: SegmentKind;
  title: string;
  /** Start time in seconds within the media file (inclusive). */
  in: number;
  /** End time in seconds within the media file (exclusive). */
  out: number;
  /** Next node id, or "complete". */
  next: string;
  /** For detours: the main-line node the detour returns to (usually equals `next`). */
  returnsTo?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  correct?: boolean;
  /** Node id this option leads to. */
  next: string;
  /** One line shown on the route card after choosing this option. */
  feedback?: string;
}

export interface QuestionNode {
  type: 'question';
  id: string;
  prompt: string;
  options: QuestionOption[];
  /** Optional short name used on the map and in announcements, e.g. "Checkpoint 1". */
  title?: string;
}

export type ScenarioNode = SegmentNode | QuestionNode;

/**
 * Every word the skin shows. A course sets the ones it wants in its own
 * language; the rest fall back to these English defaults. `{placeholders}`
 * are filled by the skin.
 */
export interface ScenarioLabels {
  /** Start screen: "≈ {minutes} min · {checkpoints} checkpoints". */
  start: string;
  lengthOne: string;
  lengthMany: string;
  /** Question kicker when a question has no title. */
  checkpoint: string;
  confirm: string;
  continue: string;
  /** Verdicts on the route card. */
  right: string;
  wrong: string;
  /** Route card direction kickers; the target's title and length are shown beside them. */
  next: string;
  closerLook: string;
  finishing: string;
  /** Paused overlay and loading / error screens. */
  continueLabel: string;
  loading: string;
  errorTitle: string;
  errorText: string;
  retry: string;
  /** Seek plaque on a locked checkpoint (long and short forms). */
  lockedCheckpoint: string;
  lockedCheckpointShort: string;
  /** Lesson parts panel and mobile menu. */
  parts: string;
  watched: string;
  nowPlaying: string;
  lockedPart: string;
  more: string;
  soundOff: string;
  soundOn: string;
  captions: string;
  fullscreen: string;
  exitFullscreen: string;
  volume: string;
  /** Direction line on the route card and the route map's name for extra material. */
  closerLookBadge: string;
  closerLookRemaining: string;
  skipCloserLook: string;
  /** Toast when the learner rejoins the lesson. */
  resumed: string;
  /** Clock and map. */
  step: string;
  closerLookStep: string;
  locked: string;
  answered: string;
  mapLabel: string;
  /** Complete screen. */
  complete: string;
  correct: string;
  nextLesson: string;
  score: string;
  elapsed: string;
  closerLooksNone: string;
  closerLooksOne: string;
  closerLooksMany: string;
  reviewTitle: string;
  replay: string;
}

export const DEFAULT_LABELS: ScenarioLabels = {
  start: 'Start',
  lengthOne: '≈ {minutes} min · 1 checkpoint',
  lengthMany: '≈ {minutes} min · {checkpoints} checkpoints',
  checkpoint: 'Checkpoint {index} of {total}',
  confirm: 'Confirm',
  continue: 'Continue',
  right: 'Right',
  wrong: 'Not quite',
  next: 'Next',
  closerLook: 'Let’s take a closer look',
  finishing: 'Finishing up',
  continueLabel: 'Continue',
  loading: 'Loading',
  errorTitle: 'No video',
  errorText: 'Check your connection and try again.',
  retry: 'Try again',
  lockedCheckpoint: 'Answer the checkpoint to go on',
  lockedCheckpointShort: 'Answer to go on',
  parts: 'Lesson parts',
  watched: 'Watched',
  nowPlaying: 'Now playing',
  lockedPart: 'Locked',
  more: 'More actions',
  soundOff: 'Sound off',
  soundOn: 'Sound on',
  captions: 'Captions',
  fullscreen: 'Full screen',
  exitFullscreen: 'Exit full screen',
  volume: 'Volume',
  closerLookBadge: 'A closer look',
  closerLookRemaining: 'back to the lesson in {time}',
  skipCloserLook: 'Got it, continue',
  resumed: 'Back to the lesson',
  step: 'Step {index} of {total}',
  closerLookStep: 'A closer look',
  locked: 'locked',
  answered: 'answered',
  mapLabel: 'Course route',
  complete: 'Course complete',
  correct: 'Correct',
  nextLesson: 'Next lesson',
  score: '{correct} of {total} correct',
  elapsed: '{time} on the course',
  closerLooksNone: 'No extra explanations needed',
  closerLooksOne: '1 closer look',
  closerLooksMany: '{count} closer looks',
  reviewTitle: 'Watch again',
  replay: 'Replay',
};

/** Fill `{placeholders}` in a label. */
export function t(label: string, values: Record<string, string | number> = {}): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export interface NextLesson {
  title: string;
  href: string;
}

export interface Scenario {
  version: 1;
  /** The lesson's own title, as it reads on the start screen: "Tu ou vous ?". */
  title: string;
  /** Small line above the title: "Leçon 4 · French A1". */
  kicker?: string;
  /** Full name for the summary and error screens: "Leçon 4 · Tu ou vous ?". Defaults to the title. */
  name: string;
  start: string;
  nodes: Record<string, ScenarioNode>;
  labels: ScenarioLabels;
  nextLesson?: NextLesson;
}

export interface ScenarioStats {
  /** Main-line segments in order, including the merge points after questions. */
  mainLine: SegmentNode[];
  questions: QuestionNode[];
  mainDuration: number;
  longestDuration: number;
}

export const COMPLETE = 'complete';

export function isSegment(node: ScenarioNode | undefined): node is SegmentNode {
  return node?.type === 'segment';
}

export function isQuestion(node: ScenarioNode | undefined): node is QuestionNode {
  return node?.type === 'question';
}

/** Parse and validate scenario JSON. Throws a readable error on the first problem found. */
export function parseScenario(input: unknown): Scenario {
  if (!input || typeof input !== 'object') throw new Error('Scenario must be an object');
  const raw = input as Partial<Scenario>;
  if (raw.version !== 1) throw new Error('Scenario version must be 1');
  if (typeof raw.title !== 'string') throw new Error('Scenario needs a title');
  if (typeof raw.start !== 'string') throw new Error('Scenario needs a start node id');
  if (!raw.nodes || typeof raw.nodes !== 'object') throw new Error('Scenario needs nodes');

  const nodes: Record<string, ScenarioNode> = {};
  for (const [id, value] of Object.entries(raw.nodes)) {
    const node = { ...(value as object), id } as ScenarioNode;
    if (node.type === 'segment') {
      if (typeof node.in !== 'number' || typeof node.out !== 'number' || node.out <= node.in) {
        throw new Error(`Segment "${id}" needs numeric in < out`);
      }
      if (!['main', 'confirm', 'detour'].includes(node.kind)) throw new Error(`Segment "${id}" has unknown kind`);
      if (typeof node.next !== 'string') throw new Error(`Segment "${id}" needs next`);
      if (typeof node.title !== 'string') node.title = id;
    } else if (node.type === 'question') {
      if (typeof node.prompt !== 'string') throw new Error(`Question "${id}" needs a prompt`);
      if (!Array.isArray(node.options) || node.options.length < 2) throw new Error(`Question "${id}" needs at least two options`);
      for (const option of node.options) {
        if (typeof option.id !== 'string' || typeof option.label !== 'string' || typeof option.next !== 'string') {
          throw new Error(`Question "${id}" has a malformed option`);
        }
      }
    } else {
      throw new Error(`Node "${id}" has unknown type`);
    }
    nodes[id] = node;
  }

  for (const node of Object.values(nodes)) {
    const targets = node.type === 'segment' ? [node.next] : node.options.map((o) => o.next);
    for (const target of targets) {
      if (target !== COMPLETE && !nodes[target]) throw new Error(`Node "${node.id}" points to missing node "${target}"`);
    }
  }
  if (!nodes[raw.start]) throw new Error(`Start node "${raw.start}" does not exist`);

  const labels: ScenarioLabels = { ...DEFAULT_LABELS };
  if (raw.labels && typeof raw.labels === 'object') {
    for (const [key, value] of Object.entries(raw.labels)) {
      if (key in labels && typeof value === 'string') (labels as unknown as Record<string, string>)[key] = value;
    }
  }

  const next = raw.nextLesson;
  const nextLesson =
    next && typeof next === 'object' && typeof next.title === 'string' && typeof next.href === 'string' ? { title: next.title, href: next.href } : undefined;

  return {
    version: 1,
    title: raw.title,
    kicker: typeof raw.kicker === 'string' ? raw.kicker : undefined,
    name: typeof raw.name === 'string' ? raw.name : raw.title,
    start: raw.start,
    nodes,
    labels,
    nextLesson,
  };
}

/**
 * Walk the main line: from start, follow `next`; at a question take the first
 * correct option (or the first option). This is the "ideal" route the map draws
 * before the learner has answered anything.
 */
export function walkMainLine(scenario: Scenario): ScenarioNode[] {
  const path: ScenarioNode[] = [];
  const seen = new Set<string>();
  let id: string | undefined = scenario.start;
  while (id && id !== COMPLETE && !seen.has(id)) {
    seen.add(id);
    const node: ScenarioNode = scenario.nodes[id];
    if (!node) break;
    path.push(node);
    if (node.type === 'segment') {
      id = node.next;
    } else {
      const best: QuestionOption = node.options.find((o) => o.correct) ?? node.options[0];
      let nextId: string = best.next;
      // Skip "confirm" segments on the ideal line: they are a branch, drawn above the line when taken.
      let hop: ScenarioNode | undefined = scenario.nodes[nextId];
      while (hop && hop.type === 'segment' && hop.kind === 'confirm') {
        nextId = hop.next;
        hop = scenario.nodes[nextId];
      }
      id = nextId;
    }
  }
  return path;
}

export function scenarioStats(scenario: Scenario): ScenarioStats {
  const line = walkMainLine(scenario);
  const mainLine = line.filter(isSegment);
  const questions = line.filter(isQuestion);
  const mainDuration = mainLine.reduce((sum, s) => sum + (s.out - s.in), 0);
  const longestDuration = Object.values(scenario.nodes)
    .filter(isSegment)
    .reduce((sum, s) => sum + (s.out - s.in), 0);
  return { mainLine, questions, mainDuration, longestDuration };
}

/** The segment whose range contains `time`, if any. */
export function segmentAt(scenario: Scenario, time: number): SegmentNode | undefined {
  for (const node of Object.values(scenario.nodes)) {
    if (node.type === 'segment' && time >= node.in && time < node.out) return node;
  }
  return undefined;
}

/** The option of `question` that leads to `nodeId`, if any. */
export function optionLeadingTo(question: QuestionNode, nodeId: string): QuestionOption | undefined {
  return question.options.find((o) => o.next === nodeId);
}

/** The question that owns a branch segment (confirm/detour), searched by option targets. */
export function questionForBranch(scenario: Scenario, branchId: string): QuestionNode | undefined {
  for (const node of Object.values(scenario.nodes)) {
    if (node.type === 'question' && node.options.some((o) => o.next === branchId)) return node;
  }
  return undefined;
}

/** Follow a branch forward until it rejoins a main-line node; returns the main-line node id. */
export function mergePointOf(scenario: Scenario, branchId: string, mainIds: Set<string>): string {
  const seen = new Set<string>();
  let id = branchId;
  while (id && id !== COMPLETE && !seen.has(id)) {
    seen.add(id);
    const node = scenario.nodes[id];
    if (!node) break;
    if (mainIds.has(id)) return id;
    if (node.type === 'segment') id = node.returnsTo ?? node.next;
    else return id;
  }
  return id;
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
