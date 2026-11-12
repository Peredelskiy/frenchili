/**
 * Was the last input from the keyboard? Focus is moved programmatically only
 * for keyboard users; a mouse or touch user should not get a tooltip opening
 * on a button they never pointed at.
 */
let keyboard = false;

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', () => (keyboard = true), { capture: true, passive: true });
  window.addEventListener('pointerdown', () => (keyboard = false), { capture: true, passive: true });
}

export function lastInputWasKeyboard(): boolean {
  return keyboard;
}

/** Move focus to the play button for keyboard users, otherwise to the player surface (where hotkeys work). */
export function restoreFocus(from: Element): void {
  const container = from.closest<HTMLElement>('media-container');
  if (!container) return;
  if (lastInputWasKeyboard()) {
    (container.querySelector<HTMLElement>('.fork-bar-play') ?? container.querySelector<HTMLElement>('media-play-button') ?? container).focus({ preventScroll: true });
  } else {
    container.focus({ preventScroll: true });
  }
}
