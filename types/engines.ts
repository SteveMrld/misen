// ═══════════════════════════════════════════════════════
// MISEN V7 — Types TypeScript
// Migration V6 → V7 — Session 2
// ═══════════════════════════════════════════════════════

export type Emotion =
  | 'tension' | 'tristesse' | 'colere' | 'joie' | 'peur'
  | 'nostalgie' | 'amour' | 'mystere' | 'determination' | 'neutre';

export type DramaticPhase = 'exposition' | 'developpement' | 'climax' | 'resolution' | 'denouement';
export type ShotType = 'TGP' | 'GP' | 'PR' | 'PM' | 'PA' | 'PE' | 'PG' | 'INSERT';
export type CameraMove = 'fixe' | 'travelling' | 'panoramique' | 'dolly' | 'steadicam' | 'drone' | 'handheld' | 'crane' | 'zoom';
export type CameraAngle = 'neutre' | 'plongee' | 'contre-plongee' | 'dutch' | 'POV' | 'OTS';
export type LightingStyle = 'naturel' | 'clair-obscur' | 'high-key' | 'low-key' | 'neon' | 'golden-hour' | 'blue-hour' | 'fluorescent' | 'bougie';
export type ComplianceLevel = 'OK' | 'WARNING' | 'ERROR';
export type ContinuityAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AIModelId = 'kling3' | 'runway4.5' | 'sora2' | 'veo3.1' | 'seedance2' | 'wan2.5' | 'hailuo2.3';
export type StylePreset = 'cinematique' | 'documentaire' | 'noir' | 'onirique';
export type ScriptFormat = 'fountain' | 'plain' | 'auto';

export interface AIModelConfig {
  id: AIModelId; name: string; version: string;
  prefix: string; suffix: string; maxTokens: number;
  negativePrefix: string; speciality: string;
  resolution: number; maxDuration: number; motion: number; physics: number;
  hands: number; lipSync: number; cameraControl: number; lighting: number;
  vfx: number; consistency: number; textRendering: number; styleRange: number;
  audioGen: number; speed: number; costPer10s: number;
  supportsNegativePrompt: boolean; supportsImageToVideo: boolean;
  supportsCameraPath: boolean; maxResolution: string;
}

export interface DialogueLine { personnage: string; texte: string; didascalie?: string; }

export interface ParsedScene {
  index: number; titre: string; lieu: string; moment: string;
  type: 'INT' | 'EXT' | 'INT/EXT'; contenu: string[];
  dialogues: DialogueLine[]; personnages: string[];
  isFlashback: boolean; dureeEstimee: number;
}

export interface Plan {
  id: string; sceneIndex: number; planIndex: number;
  description: string; cadrage: ShotType; camera: CameraMove;
  angle: CameraAngle; eclairage: LightingStyle; duree: number;
  personnages: string[]; dialogue?: DialogueLine;
  emotion: Emotion; intensite: number;
  modeleRecommande: AIModelId; scoreModele: number;
  prompt: string; negativePrompt: string; tips: string[];
}

export interface SymbolDetection { symbol: string; meaning: string; occurrences: number; }
export interface RhetoricDetection { figure: string; example: string; effect: string; }

export interface IntentResult {
  dominantEmotion: Emotion; emotions: Record<Emotion, number>;
  intensity: number; symbols: SymbolDetection[];
  rhetoric: RhetoricDetection[]; subtext: string;
}

export interface GrammarResult {
  cadrage: ShotType; camera: CameraMove; angle: CameraAngle;
  eclairage: LightingStyle; rythme: 'lent' | 'modere' | 'rapide' | 'frenetique';
  duree: number; notes: string[]; regleAppliquee: string;
}

export interface TensionPoint {
  sceneIndex: number; tension: number; delta: number;
  phase: DramaticPhase; label: string;
}

export interface TensionResult {
  curve: TensionPoint[]; climax: number;
  phases: DramaticPhase[]; globalArc: string; avgTension: number;
}

export interface ContextualPromptResult {
  basePrompt: string; visualContinuity: string[];
  environmentTokens: string[]; moodTokens: string[];
  transitionNote: string;
}

export interface RecResult {
  recommended: AIModelId; scores: Record<AIModelId, number>;
  reasoning: string[]; tips: string[]; alternatives: AIModelId[];
}

export interface CharacterArc {
  personnage: string; evolution: string;
  emotionCurve: { scene: number; emotion: Emotion; intensity: number }[];
}

export interface CharacterState {
  personnage: string; derniereEmotion: Emotion;
  costume: string; blessure: string;
  position: string; accessoires: string[];
}

export interface MemoryResult { arcs: CharacterArc[]; states: Record<string, CharacterState>; }

export interface ComplianceFlag {
  type: 'violence' | 'nudite' | 'langage' | 'drogue' | 'sang' | 'arme' | 'sensible';
  severity: 'low' | 'medium' | 'high'; detail: string; scene: number;
}

export interface ComplianceResult { level: ComplianceLevel; flags: ComplianceFlag[]; score: number; }

export interface CharacterBibleEntry {
  personnage: string; description: string; apparence: string;
  costume: string; traits: string; voix: string;
  tokensUniversels: string; tokensParModele: Record<AIModelId, string>;
}

export interface StyleBibleResult {
  preset: string; palette: string; eclairage: string;
  grain: string; contraste: string;
  tokensUniversels: string; tokensParModele: Record<AIModelId, string>;
}

export interface ConsistencyInjectResult {
  enrichedPrompt: string; injectedCharacterTokens: string[];
  injectedStyleTokens: string[];
}

export interface ModelSyntaxResult {
  adaptedPrompt: string; modelId: AIModelId;
  tokensUsed: number; truncated: boolean;
}

export interface NegativePromptResult {
  negativePrompt: string; modelDefaults: string[];
  contextualTokens: string[];
}

export interface ContinuityAlert {
  type: 'MODEL_SWITCH' | 'CHAR_MODEL_SWITCH' | 'STYLE_BREAK' | 'LIGHTING_BREAK' | 'COSTUME_BREAK';
  severity: ContinuityAlertSeverity; planA: string; planB: string;
  detail: string; suggestion: string;
}

export interface ContinuityResult { alerts: ContinuityAlert[]; score: number; }

export interface ParserOptions { format: ScriptFormat; language: 'fr' | 'en'; strictMode: boolean; }
export interface ScriptStats {
  totalScenes: number; totalDialogues: number; totalMots: number;
  personnagesCount: number; dureeEstimee: number; intCount: number; extCount: number;
}
export interface ParserResult { scenes: ParsedScene[]; personnages: string[]; stats: ScriptStats; }

export interface AnalysisResult {
  scenes: ParsedScene[]; plans: Plan[]; characters: string[];
  tension: TensionResult; memory: MemoryResult;
  compliance: ComplianceResult; continuity: ContinuityResult;
  characterBible: CharacterBibleEntry[]; styleBible: StyleBibleResult;
  costTotal: number; costByModel: Record<AIModelId, number>; costByScene: number[];
}
