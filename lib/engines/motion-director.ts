/**
 * MISEN — Engine 16: Motion Director
 * @description Builds per-shot motion plans for subjects and camera.
 * Generates motion paths, easing curves, and subject bindings that
 * can be injected into prompts or used by motion-brush-capable models
 * (Kling, Runway, etc.).
 * 
 * Think of it as a virtual choreographer: "the character walks left to right,
 * the camera dollies forward, slow ease-in at start."
 */

// Types are string-based for flexibility with grammar engine output

export interface MotionPoint {
  x: number;  // 0-1 normalized (left to right)
  y: number;  // 0-1 normalized (top to bottom)
}

export interface MotionPath {
  id: string;
  kind: 'linear' | 'arc' | 'bezier';
  points: MotionPoint[];
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  startSec: number;
  endSec: number;
}

export interface SubjectMotion {
  subjectId: string;    // e.g. "personnage_1", "objet_principal"
  pathId: string;       // references a MotionPath
  scale?: { start: number; end: number }; // zoom factor 0.5-2.0
}

export interface MotionPlan {
  shotId: string;
  cameraPaths: MotionPath[];
  subjectPaths: MotionPath[];
  subjectBindings: SubjectMotion[];
  promptTokens: string;  // Ready to inject into prompt
}

interface MotionInput {
  shotType: string;      // ShotType or extended
  cameraMove: string;    // CameraMove or extended from grammar
  emotion: string;
  intensity: number;
  duration: number;
  personnages: string[];
  hasDialogue: boolean;
}

// Camera motion patterns mapped to cinematic movements
const CAMERA_PATTERNS: Record<string, { points: MotionPoint[]; kind: MotionPath['kind'] }> = {
  'fixe': { points: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }], kind: 'linear' },
  'travelling': { points: [{ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }], kind: 'linear' },
  'dolly_in': { points: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.48 }], kind: 'linear' },
  'dolly_out': { points: [{ x: 0.5, y: 0.48 }, { x: 0.5, y: 0.52 }], kind: 'linear' },
  'pan_gauche': { points: [{ x: 0.6, y: 0.5 }, { x: 0.4, y: 0.5 }], kind: 'linear' },
  'pan_droite': { points: [{ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }], kind: 'linear' },
  'tilt_haut': { points: [{ x: 0.5, y: 0.6 }, { x: 0.5, y: 0.4 }], kind: 'linear' },
  'tilt_bas': { points: [{ x: 0.5, y: 0.4 }, { x: 0.5, y: 0.6 }], kind: 'linear' },
  'steadicam': { points: [{ x: 0.45, y: 0.52 }, { x: 0.55, y: 0.48 }], kind: 'bezier' },
  'handheld': { points: [{ x: 0.48, y: 0.51 }, { x: 0.52, y: 0.49 }, { x: 0.49, y: 0.51 }], kind: 'bezier' },
  'grue': { points: [{ x: 0.5, y: 0.7 }, { x: 0.5, y: 0.3 }], kind: 'arc' },
  'drone': { points: [{ x: 0.3, y: 0.7 }, { x: 0.7, y: 0.3 }], kind: 'arc' },
  'arc': { points: [{ x: 0.3, y: 0.5 }, { x: 0.5, y: 0.4 }, { x: 0.7, y: 0.5 }], kind: 'arc' },
  'vertigo': { points: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.45 }], kind: 'linear' },
  'zoom_in': { points: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }], kind: 'linear' },
  'zoom_out': { points: [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }], kind: 'linear' },
};

// Easing based on emotion
const EASING_MAP: Record<string, MotionPath['easing']> = {
  'tension': 'easeIn',
  'peur': 'easeIn',
  'amour': 'easeInOut',
  'tristesse': 'easeOut',
  'nostalgie': 'easeInOut',
  'joie': 'easeOut',
  'determination': 'linear',
  'mystere': 'easeInOut',
  'neutre': 'easeInOut',
};

/**
 * Build a motion plan for a shot.
 */
export function motionDirector(input: MotionInput): MotionPlan {
  const duration = Math.max(1, input.duration);
  const easing = EASING_MAP[input.emotion] || 'easeInOut';

  // ─── Camera path ───
  const camPattern = CAMERA_PATTERNS[input.cameraMove] || CAMERA_PATTERNS.fixe;
  const cameraPath: MotionPath = {
    id: `cam_${input.cameraMove}`,
    kind: camPattern.kind,
    points: camPattern.points,
    easing,
    startSec: 0,
    endSec: duration,
  };

  // ─── Subject paths ───
  const subjectPaths: MotionPath[] = [];
  const subjectBindings: SubjectMotion[] = [];

  if (input.personnages.length > 0) {
    // Primary character: subtle movement based on emotion
    const primaryPath: MotionPath = {
      id: 'subject_primary',
      kind: 'bezier',
      points: getSubjectMotion(input.emotion, input.hasDialogue),
      easing,
      startSec: 0,
      endSec: duration,
    };
    subjectPaths.push(primaryPath);
    subjectBindings.push({
      subjectId: input.personnages[0],
      pathId: primaryPath.id,
    });

    // Secondary character (if dialogue, slight counter-motion)
    if (input.personnages.length > 1 && input.hasDialogue) {
      const secondaryPath: MotionPath = {
        id: 'subject_secondary',
        kind: 'linear',
        points: [{ x: 0.65, y: 0.55 }, { x: 0.63, y: 0.55 }],
        easing: 'easeInOut',
        startSec: 0,
        endSec: duration,
      };
      subjectPaths.push(secondaryPath);
      subjectBindings.push({
        subjectId: input.personnages[1],
        pathId: secondaryPath.id,
      });
    }
  }

  // ─── Prompt tokens ───
  const tokens = buildMotionTokens(input, cameraPath, subjectPaths);

  return {
    shotId: `motion_plan`,
    cameraPaths: [cameraPath],
    subjectPaths,
    subjectBindings,
    promptTokens: tokens,
  };
}

function getSubjectMotion(emotion: string, hasDialogue: boolean): MotionPoint[] {
  if (hasDialogue) {
    // Subtle head/body movement during dialogue
    return [{ x: 0.4, y: 0.5 }, { x: 0.42, y: 0.49 }];
  }

  switch (emotion) {
    case 'tension':
      return [{ x: 0.5, y: 0.5 }, { x: 0.48, y: 0.48 }]; // Retreat
    case 'determination':
      return [{ x: 0.4, y: 0.55 }, { x: 0.55, y: 0.5 }]; // Forward motion
    case 'tristesse':
      return [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.52 }]; // Sinking
    case 'joie':
      return [{ x: 0.45, y: 0.55 }, { x: 0.55, y: 0.5 }]; // Rising
    case 'amour':
      return [{ x: 0.35, y: 0.5 }, { x: 0.45, y: 0.5 }]; // Approaching
    default:
      return [{ x: 0.5, y: 0.5 }, { x: 0.51, y: 0.5 }]; // Minimal
  }
}

function buildMotionTokens(
  input: MotionInput,
  cameraPath: MotionPath,
  subjectPaths: MotionPath[]
): string {
  const tokens: string[] = [];

  // Camera motion description
  if (input.cameraMove !== 'fixe') {
    const speed = input.intensity > 70 ? 'fast' : input.intensity > 40 ? 'medium' : 'slow';
    tokens.push(`${speed} ${input.cameraMove.replace('_', ' ')} camera movement`);
  } else {
    tokens.push('static camera, locked-off tripod');
  }

  // Easing description
  if (cameraPath.easing === 'easeIn') tokens.push('accelerating movement');
  if (cameraPath.easing === 'easeOut') tokens.push('decelerating to stillness');
  if (cameraPath.easing === 'easeInOut') tokens.push('smooth organic movement');

  // Subject motion
  if (subjectPaths.length > 0 && input.personnages.length > 0) {
    if (input.hasDialogue) {
      tokens.push('subtle character gestures during dialogue');
    } else {
      tokens.push(`${input.personnages[0]} in motion`);
    }
  }

  // Zoom tokens
  if (input.cameraMove === 'zoom_in') tokens.push('slow zoom in, increasing intimacy');
  if (input.cameraMove === 'zoom_out') tokens.push('slow zoom out, revealing context');
  if (input.cameraMove === 'vertigo') tokens.push('vertigo effect, dolly zoom, Hitchcock');

  return tokens.join(', ');
}
