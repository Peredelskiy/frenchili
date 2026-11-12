/**
 * <fork-question> — the checkpoint card.
 *
 * Opens when the engine parks on a fork. Three answers in numbered rows; a
 * click, a digit or Enter on the focused row answers at once — no Confirm.
 * The chosen row is coloured for a moment (mustard with a check, red with a
 * plus) before the route card takes over. Focus is trapped inside until an
 * answer is given: the lesson cannot be skipped past a checkpoint.
 */
import type { PropertyValues } from '@videojs/html';
import { ForkElement, h } from './fork-element';
import { iconElement } from './icons';
import { lastInputWasKeyboard, restoreFocus } from './modality';
import { t, type QuestionNode } from './scenario';

/** How long the coloured row stays before the transition starts. */
export const ANSWER_HOLD_MS = 700;

let dialogCounter = 0;

export class ForkQuestionElement extends ForkElement {
  static readonly tagName = 'fork-question';

  #dialog: HTMLElement | null = null;
  #kicker: HTMLElement | null = null;
  #prompt: HTMLElement | null = null;
  #group: HTMLElement | null = null;
  #renderedQuestion: string | null = null;
  #open = false;
  #answering = false;
  #abort: AbortController | null = null;
  #holdTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    if (!this.#dialog) {
      const id = `fork-question-${++dialogCounter}`;
      this.#kicker = h('span', { class: 'fork-question-kicker fork-kicker', id: `${id}-kicker` });
      this.#prompt = h('p', { class: 'fork-question-prompt', id: `${id}-prompt` });
      this.#group = h('div', { class: 'fork-question-options', role: 'radiogroup', 'aria-labelledby': `${id}-prompt` });
      this.#dialog = h(
        'div',
        { class: 'fork-question-card', role: 'dialog', 'aria-modal': 'true', tabindex: '-1', 'aria-labelledby': `${id}-kicker`, 'aria-describedby': `${id}-prompt` },
        h('div', { class: 'fork-question-head' }, this.#kicker, this.#prompt),
        this.#group,
      );
      this.replaceChildren(this.#dialog);
    }
    this.hidden = true;
    this.addEventListener('keydown', this.#onKeydown, { signal });
    this.#group!.addEventListener('click', this.#onOptionClick, { signal });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#abort = null;
    if (this.#holdTimer) clearTimeout(this.#holdTimer);
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const engine = this.engine;
    const state = engine?.state;
    if (!engine || !state) return;

    const question = engine.currentQuestion;
    const open = state.phase === 'question' && Boolean(question);

    if (open && question && this.#renderedQuestion !== question.id) this.#render(question);
    if (open !== this.#open) {
      this.#open = open;
      this.hidden = !open;
      this.toggleAttribute('data-open', open);
      if (open) this.#focusIn();
      else this.#focusOut();
      if (!open) {
        this.#answering = false;
        this.#renderedQuestion = null;
      }
    }
  }

  #render(question: QuestionNode): void {
    const engine = this.engine!;
    const stats = engine.state.stats;
    const index = stats?.questions.findIndex((q) => q.id === question.id) ?? -1;
    const total = stats?.questions.length ?? 0;
    this.#renderedQuestion = question.id;
    this.#answering = false;
    this.#kicker!.textContent = question.title ?? t(engine.labels.checkpoint, { index: index + 1, total });
    this.#prompt!.textContent = question.prompt;
    this.#group!.replaceChildren(
      ...question.options.map((option, i) =>
        h(
          'div',
          { class: 'fork-question-row' },
          h('span', { class: 'fork-question-number', 'aria-hidden': 'true' }, String(i + 1)),
          h(
            'button',
            { class: 'fork-question-option', type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: i === 0 ? '0' : '-1', 'data-option': option.id },
            h('span', { class: 'fork-question-option-label' }, option.label),
          ),
        ),
      ),
    );
    this.setAttribute('data-answered', 'false');
  }

  #radios(): HTMLButtonElement[] {
    return Array.from(this.#group?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
  }

  #focusRadio(index: number): void {
    const radios = this.#radios();
    const radio = radios[(index + radios.length) % radios.length];
    if (!radio) return;
    for (const r of radios) r.tabIndex = r === radio ? 0 : -1;
    radio.focus();
  }

  /** Answer: colour the row, hold, then hand over to the engine. */
  #choose(optionId: string): void {
    const engine = this.engine;
    const question = engine?.currentQuestion;
    if (!engine || !question || this.#answering) return;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) return;
    this.#answering = true;
    const labels = engine.labels;
    for (const radio of this.#radios()) {
      const chosen = radio.dataset.option === optionId;
      radio.setAttribute('aria-checked', String(chosen));
      radio.setAttribute('aria-disabled', 'true');
      if (chosen) {
        radio.setAttribute('data-verdict', option.correct ? 'right' : 'wrong');
        const mark = iconElement(option.correct ? 'check' : 'plus', 'fork-question-mark', 5);
        mark.setAttribute('role', 'img');
        mark.setAttribute('aria-label', option.correct ? labels.right : labels.wrong);
        mark.removeAttribute('aria-hidden');
        radio.append(mark);
      }
    }
    this.setAttribute('data-answered', 'true');
    if (this.#holdTimer) clearTimeout(this.#holdTimer);
    const hold = engine.state.reducedMotion ? ANSWER_HOLD_MS : ANSWER_HOLD_MS;
    this.#holdTimer = setTimeout(() => {
      this.#holdTimer = null;
      engine.answer(optionId);
    }, hold);
  }

  #onOptionClick = (event: Event): void => {
    const radio = (event.target as Element).closest<HTMLButtonElement>('[role="radio"]');
    if (!radio || this.#answering) return;
    this.#choose(radio.dataset.option!);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    // Nothing leaks to the player's hotkeys while the card is open.
    event.stopPropagation();
    if (this.#answering) {
      event.preventDefault();
      return;
    }
    const radios = this.#radios();
    const focused = radios.findIndex((r) => r === document.activeElement);
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.#focusRadio(focused + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.#focusRadio(focused - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.#focusRadio(0);
        break;
      case 'End':
        event.preventDefault();
        this.#focusRadio(radios.length - 1);
        break;
      case 'Enter':
      case ' ': {
        const radio = (event.target as Element).closest<HTMLButtonElement>('[role="radio"]');
        event.preventDefault();
        if (radio) this.#choose(radio.dataset.option!);
        break;
      }
      case 'Tab':
        this.#trapTab(event);
        break;
      default: {
        const digit = Number.parseInt(event.key, 10);
        if (digit >= 1 && digit <= radios.length) {
          event.preventDefault();
          this.#focusRadio(digit - 1);
          this.#choose(radios[digit - 1].dataset.option!);
        }
      }
    }
  };

  #trapTab(event: KeyboardEvent): void {
    const radios = this.#radios();
    if (radios.length === 0) return;
    // One tab stop: the radiogroup. Tab and Shift+Tab stay on the focused row.
    event.preventDefault();
    const focused = radios.findIndex((r) => r === document.activeElement);
    this.#focusRadio(focused === -1 ? 0 : focused);
  }

  #focusIn(): void {
    // Keyboard users land on the first answer. Touch and mouse users get the card itself:
    // still inside the dialog for assistive tech, but no ring on an answer they didn't pick
    // (iOS shows the ring after any scripted focus).
    requestAnimationFrame(() => {
      if (lastInputWasKeyboard()) this.#focusRadio(0);
      else this.querySelector<HTMLElement>('.fork-question-card')?.focus({ preventScroll: true });
    });
  }

  #focusOut(): void {
    restoreFocus(this);
  }
}

if (!customElements.get(ForkQuestionElement.tagName)) {
  customElements.define(ForkQuestionElement.tagName, ForkQuestionElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'fork-question': ForkQuestionElement;
  }
}
