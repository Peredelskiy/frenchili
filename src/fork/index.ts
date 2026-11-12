/**
 * Fork — a branching skin for Video.js v10.
 *
 * Import this module once; it registers the Video.js UI elements the skin is
 * built from, the fork-* components and the <fork-skin> element.
 */
import '@videojs/html/video/player';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-backdrop';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-popover';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/status-announcer';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';

import './fork-scenario';
import './fork-route-map';
import './fork-time';
import './fork-question';
import './fork-route-card';
import './fork-detour-badge';
import './fork-screens';
import './fork-controls';
import './fork-parts';
import './fork-skin';

export * from './scenario';
export * from './route-geometry';
export { ForkScenarioElement, findEngine, type ForkState, type ForkPhase, type ForkTransition } from './fork-scenario';
export { ForkRouteMapElement } from './fork-route-map';
export { ForkTimeElement } from './fork-time';
export { ForkQuestionElement } from './fork-question';
export { ForkRouteCardElement } from './fork-route-card';
export { ForkDetourBadgeElement } from './fork-detour-badge';
export { ForkStartElement, ForkCompleteElement } from './fork-screens';
export { ForkVolumeStepsElement, ForkPartsButtonElement, ForkMoreElement } from './fork-controls';
export { ForkPartsElement } from './fork-parts';
export { ForkSkinElement, forkSkinTemplate } from './fork-skin';
export { icon, iconElement, type IconName } from './icons';
