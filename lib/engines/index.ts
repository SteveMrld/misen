/**
 * MISEN V7 — Barrel export pour les 13 moteurs
 * Import unique : import { intentEngine, tensionCurve, ... } from '@/lib/engines'
 */

// Engine 1: Intent Engine
export { intentEngine } from './intent';
export type { IntentOptions } from './intent';

// Engine 2: Cinematic Grammar
export { cinematicGrammar } from './grammar';

// Engine 3: Tension Curve
export { tensionCurve } from './tension';

// Engine 4: Contextual Prompt
export { contextualPrompt } from './contextual-prompt';

// Engine 5: Rec Engine V2
export { recEngineV2 } from './rec-engine';

// Engine 6: Memory Engine V2
export { memoryEngineV2 } from './memory-engine';

// Engine 7: Compliance Engine
export { complianceCheck } from './compliance';

// Engine 8: Character Bible
export { buildCharacterBible } from './character-bible';

// Engine 9: Style Bible
export { buildStyleBible } from './style-bible';

// Engine 10: Consistency Inject
export { consistencyInject } from './consistency-inject';

// Engine 11: Model Syntax Adapter
export { modelSyntaxAdapter } from './model-syntax';

// Engine 12: Negative Prompt Engine
export { negativePromptEngine } from './negative-prompt';

// Engine 13: Continuity Tracker
export { continuityTracker } from './continuity-tracker';
