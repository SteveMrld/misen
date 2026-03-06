/**
 * MISEN — Engine 15: Camera Physics
 * @description Cinema-grade camera directives that enrich the prompt
 * with real-world photographic parameters. Makes MISEN "think like a DP".
 * 
 * Adds to each plan: sensor, lens, aperture, ISO, shutter, rig, focus.
 * These are injected into the prompt as cinematic tokens.
 */

// Types are string-based for flexibility with grammar engine output

export interface CameraPhysicsResult {
  sensor: 'super35' | 'fullFrame' | 'largeFormat';
  lens: string;          // e.g. "35mm", "85mm", "24mm"
  aperture: number;      // f-stop: 1.4, 2.0, 2.8, 4.0, 5.6
  iso: number;           // 100, 200, 400, 800
  shutterAngle: number;  // 180° standard cinema, 90° for staccato, 360° for dreamy
  fps: number;           // 24 standard, 48 for smoothness, 120 for slow-mo
  rig: 'tripod' | 'dolly' | 'steadicam' | 'handheld' | 'crane' | 'drone' | 'gimbal';
  focusMode: 'deep' | 'shallow' | 'rack' | 'split';
  filmStock: string;     // Cinematic reference: "Kodak 5219", "ARRI LogC", etc.
  // Token string ready to inject into prompts
  promptTokens: string;
}

interface CameraPhysicsInput {
  shotType: string;
  cameraMove: string;
  emotion: string;
  intensity: number;
  lighting: string;
  hasDialogue: boolean;
  isSlowMotion?: boolean;
}

// Import not needed - using string comparisons


// Lens selection based on shot type (cinematographer's instinct)
const LENS_MAP: Record<string, string> = {
  'PG': '14mm',   // Plan général → ultra wide
  'PE': '24mm',   // Plan d'ensemble → wide
  'PD': '28mm',   // Plan de demi-ensemble
  'PA': '35mm',   // Plan américain → standard cinema
  'PM': '50mm',   // Plan moyen → nifty fifty
  'PR': '65mm',   // Plan rapproché
  'GP': '85mm',   // Gros plan → portrait
  'TGP': '100mm', // Très gros plan → macro feel
  'INSERT': '100mm',
};

// Aperture based on emotion (shallow DoF = intimacy, deep = context)
const APERTURE_MAP: Record<string, number> = {
  'tension': 2.0,
  'peur': 2.0,
  'amour': 1.4,
  'tristesse': 1.8,
  'nostalgie': 2.0,
  'joie': 2.8,
  'determination': 2.8,
  'mystere': 1.8,
  'neutre': 4.0,
};

// Rig based on camera movement
const RIG_MAP: Record<string, CameraPhysicsResult['rig']> = {
  'fixe': 'tripod',
  'travelling': 'dolly',
  'dolly_in': 'dolly',
  'dolly_out': 'dolly',
  'pan_gauche': 'tripod',
  'pan_droite': 'tripod',
  'tilt_haut': 'tripod',
  'tilt_bas': 'tripod',
  'steadicam': 'steadicam',
  'handheld': 'handheld',
  'grue': 'crane',
  'drone': 'drone',
  'gimbal': 'gimbal',
  'zoom_in': 'tripod',
  'zoom_out': 'tripod',
  'arc': 'steadicam',
  'vertigo': 'dolly',
};

// Film stock references for mood
const FILM_STOCK_MAP: Record<string, string> = {
  'tension': 'Kodak 5219 500T — gritty, underexposed',
  'peur': 'Kodak 5219 500T — high contrast, desaturated',
  'amour': 'Kodak 5207 250D — warm, soft, golden',
  'tristesse': 'Fuji Eterna 8573 — muted, cool undertones',
  'nostalgie': 'Kodak 5203 50D — vintage, fine grain, warm',
  'joie': 'Kodak 5207 250D — vibrant, saturated daylight',
  'determination': 'ARRI LogC4 — clean, contrasty, modern',
  'mystere': 'Kodak 5219 500T — deep shadows, teal-orange',
  'neutre': 'ARRI LogC4 — neutral, versatile',
};

/**
 * Compute cinema-grade camera physics for a shot.
 * Returns specs + a prompt token string ready for injection.
 */
export function cameraPhysics(input: CameraPhysicsInput): CameraPhysicsResult {
  const lens = LENS_MAP[input.shotType] || '50mm';
  const aperture = APERTURE_MAP[input.emotion] || 4.0;
  const rig = RIG_MAP[input.cameraMove] || 'tripod';
  const filmStock = FILM_STOCK_MAP[input.emotion] || FILM_STOCK_MAP.neutre;

  // Sensor: large format for wide/establishing, super35 for intimate
  const sensor: CameraPhysicsResult['sensor'] =
    ['PG', 'PE', 'PD'].includes(input.shotType) ? 'largeFormat' : 'fullFrame';

  // ISO: low for clean, higher for handheld/night
  const iso = input.lighting === 'low-key' || input.lighting === 'clair-obscur' ? 800
    : rig === 'handheld' ? 400
    : 200;

  // Shutter angle: 180° standard, 90° for staccato/action, 360° for dreamy
  const shutterAngle = input.emotion === 'tension' && input.intensity > 70 ? 90
    : input.emotion === 'amour' || input.emotion === 'nostalgie' ? 270
    : 180;

  // FPS: 24 standard cinema, 48 for dialogue clarity, 120 for slow-mo
  const fps = input.isSlowMotion ? 120
    : input.hasDialogue ? 24
    : input.emotion === 'tension' ? 24
    : 24;

  // Focus mode
  const focusMode: CameraPhysicsResult['focusMode'] =
    aperture <= 1.8 ? 'shallow'
    : input.hasDialogue && (input.shotType === 'PR' || input.shotType === 'GP') ? 'rack'
    : ['PG', 'PE'].includes(input.shotType) ? 'deep'
    : 'shallow';

  // Build prompt tokens (cinematic language that AI models understand)
  const tokens: string[] = [];
  tokens.push(`shot on ${sensor === 'largeFormat' ? 'ARRI Alexa 65' : sensor === 'fullFrame' ? 'ARRI Alexa 35' : 'RED Komodo'}`);
  tokens.push(`${lens} lens`);
  tokens.push(`f/${aperture}`);
  if (focusMode === 'shallow') tokens.push('shallow depth of field, bokeh');
  if (focusMode === 'rack') tokens.push('rack focus between characters');
  if (focusMode === 'deep') tokens.push('deep focus, everything sharp');
  if (shutterAngle === 90) tokens.push('high shutter speed, staccato motion');
  if (shutterAngle === 270) tokens.push('soft motion blur, dreamy feel');
  if (fps === 120) tokens.push('slow motion 120fps');
  if (rig === 'handheld') tokens.push('handheld camera, organic movement');
  if (rig === 'steadicam') tokens.push('steadicam, smooth floating camera');
  if (rig === 'crane') tokens.push('crane shot, sweeping vertical movement');
  if (rig === 'drone') tokens.push('aerial drone shot');
  tokens.push(filmStock.split('—')[0].trim());

  return {
    sensor,
    lens,
    aperture,
    iso,
    shutterAngle,
    fps,
    rig,
    focusMode,
    filmStock,
    promptTokens: tokens.join(', '),
  };
}
