/**
 * MISEN — Engine 17: World Model
 * @description Builds a scene graph per shot — entities (characters, props,
 * environment), their spatial relationships, and continuity constraints.
 * 
 * Enriches Character Bible + Continuity Tracker with structured world state.
 * The output generates "world tokens" injected into prompts to enforce
 * spatial and temporal coherence across shots.
 */

export interface Entity {
  id: string;
  kind: 'character' | 'prop' | 'environment' | 'light';
  label: string;
  attributes: Record<string, string>;
  position?: { x: number; y: number; depth: 'foreground' | 'midground' | 'background' };
}

export interface Relation {
  from: string;   // entity id
  to: string;     // entity id
  type: 'faces' | 'beside' | 'behind' | 'above' | 'interacts_with' | 'illuminates';
}

export interface ContinuityConstraint {
  entityId: string;
  rule: string;   // e.g. "same_costume", "same_lighting", "same_position_relative"
  source: string;  // which previous shot established this
}

export interface WorldState {
  sceneId: string;
  shotId: string;
  entities: Entity[];
  relations: Relation[];
  continuityConstraints: ContinuityConstraint[];
  environmentTokens: string;  // Injected into prompt
  spatialTokens: string;      // Injected into prompt
  promptTokens: string;       // Combined tokens ready for injection
}

interface WorldModelInput {
  sceneIndex: number;
  planIndex: number;
  personnages: string[];
  emotion: string;
  shotType: string;
  lighting: string;
  description: string;
  previousWorldState?: WorldState;  // For continuity
}

/**
 * Build a world state for a shot.
 */
export function buildWorldModel(input: WorldModelInput): WorldState {
  const entities: Entity[] = [];
  const relations: Relation[] = [];
  const constraints: ContinuityConstraint[] = [];

  // ─── Characters ───
  input.personnages.forEach((name, i) => {
    const position = getCharacterPosition(i, input.personnages.length, input.shotType);
    entities.push({
      id: `char_${i}`,
      kind: 'character',
      label: name,
      attributes: {
        role: i === 0 ? 'protagonist' : 'supporting',
        emotion: input.emotion,
      },
      position,
    });

    // Continuity from previous shot
    if (input.previousWorldState) {
      const prevChar = input.previousWorldState.entities.find(
        e => e.kind === 'character' && e.label === name
      );
      if (prevChar) {
        constraints.push({
          entityId: `char_${i}`,
          rule: 'same_costume',
          source: `scene_${input.sceneIndex}_plan_${input.planIndex - 1}`,
        });
        constraints.push({
          entityId: `char_${i}`,
          rule: 'same_lighting_direction',
          source: `scene_${input.sceneIndex}_plan_${input.planIndex - 1}`,
        });
      }
    }
  });

  // ─── Character relations ───
  if (input.personnages.length >= 2) {
    const hasDialogue = input.description.toLowerCase().includes('dialogue') ||
      input.description.includes('dit') || input.description.includes('says');

    if (hasDialogue) {
      relations.push({ from: 'char_0', to: 'char_1', type: 'faces' });
    } else {
      relations.push({ from: 'char_0', to: 'char_1', type: 'beside' });
    }
  }

  // ─── Environment ───
  const envTokens = extractEnvironment(input.description);
  entities.push({
    id: 'env_main',
    kind: 'environment',
    label: envTokens.setting,
    attributes: {
      timeOfDay: envTokens.timeOfDay,
      weather: envTokens.weather,
      mood: input.emotion,
    },
  });

  // ─── Light source ───
  entities.push({
    id: 'light_key',
    kind: 'light',
    label: getLightLabel(input.lighting, input.emotion),
    attributes: {
      type: input.lighting,
      direction: getLightDirection(input.shotType),
      intensity: String(input.emotion === 'tension' ? 'high_contrast' : 'balanced'),
    },
  });

  // Light illuminates characters
  input.personnages.forEach((_, i) => {
    relations.push({ from: 'light_key', to: `char_${i}`, type: 'illuminates' });
  });

  // ─── Build prompt tokens ───
  const environmentTokens = buildEnvironmentTokens(entities, envTokens);
  const spatialTokens = buildSpatialTokens(entities, relations);
  const continuityTokens = buildContinuityTokens(constraints);

  const allTokens = [environmentTokens, spatialTokens, continuityTokens]
    .filter(Boolean)
    .join(', ');

  return {
    sceneId: `scene_${input.sceneIndex}`,
    shotId: `plan_${input.planIndex}`,
    entities,
    relations,
    continuityConstraints: constraints,
    environmentTokens,
    spatialTokens,
    promptTokens: allTokens,
  };
}

// ─── Helpers ───

function getCharacterPosition(
  index: number,
  total: number,
  shotType: string
): Entity['position'] {
  if (total === 1) {
    return { x: 0.5, y: 0.5, depth: 'midground' };
  }
  // Two characters: rule of thirds
  if (total === 2) {
    return index === 0
      ? { x: 0.33, y: 0.5, depth: 'midground' }
      : { x: 0.67, y: 0.5, depth: 'midground' };
  }
  // Group: spread across frame
  const step = 0.8 / (total - 1);
  return { x: 0.1 + step * index, y: 0.5, depth: 'midground' };
}

function extractEnvironment(description: string): {
  setting: string;
  timeOfDay: string;
  weather: string;
} {
  const d = description.toLowerCase();

  const setting =
    d.includes('désert') || d.includes('desert') ? 'desert landscape' :
    d.includes('forêt') || d.includes('forest') ? 'dense forest' :
    d.includes('ville') || d.includes('city') || d.includes('rue') ? 'urban street' :
    d.includes('bureau') || d.includes('office') ? 'modern office interior' :
    d.includes('salon') || d.includes('room') ? 'interior room' :
    d.includes('mer') || d.includes('ocean') || d.includes('plage') ? 'ocean coastline' :
    d.includes('montagne') || d.includes('mountain') ? 'mountain landscape' :
    d.includes('nuit') || d.includes('night') ? 'night scene' :
    'cinematic setting';

  const timeOfDay =
    d.includes('aube') || d.includes('dawn') ? 'dawn' :
    d.includes('matin') || d.includes('morning') ? 'morning' :
    d.includes('midi') || d.includes('noon') ? 'midday' :
    d.includes('coucher') || d.includes('sunset') ? 'golden hour' :
    d.includes('crépuscule') || d.includes('dusk') ? 'dusk' :
    d.includes('nuit') || d.includes('night') ? 'night' :
    'day';

  const weather =
    d.includes('pluie') || d.includes('rain') ? 'rain' :
    d.includes('neige') || d.includes('snow') ? 'snow' :
    d.includes('brume') || d.includes('fog') || d.includes('brouillard') ? 'fog' :
    d.includes('vent') || d.includes('wind') ? 'windy' :
    'clear';

  return { setting, timeOfDay, weather };
}

function getLightLabel(lighting: string, emotion: string): string {
  const map: Record<string, string> = {
    'naturel': 'natural ambient light',
    'studio': 'three-point studio lighting',
    'nuit': 'practical night lighting, moonlight',
    'clair-obscur': 'chiaroscuro, Caravaggio-style',
    'contre-jour': 'backlit silhouette, rim light',
    'doré': 'warm golden hour light',
    'froid': 'cool blue ambient light',
    'néon': 'neon-lit, cyberpunk glow',
  };
  return map[lighting] || 'cinematic lighting';
}

function getLightDirection(shotType: string): string {
  if (['GP', 'TGP', 'PR'].includes(shotType)) return 'three-quarter key light, subtle fill';
  if (['PE', 'PG'].includes(shotType)) return 'ambient, wide coverage';
  return 'balanced key and fill';
}

function buildEnvironmentTokens(entities: Entity[], env: any): string {
  const envEntity = entities.find(e => e.kind === 'environment');
  if (!envEntity) return '';

  const tokens: string[] = [envEntity.label];
  if (env.timeOfDay !== 'day') tokens.push(env.timeOfDay + ' light');
  if (env.weather !== 'clear') tokens.push(env.weather);

  return tokens.join(', ');
}

function buildSpatialTokens(entities: Entity[], relations: Relation[]): string {
  const tokens: string[] = [];

  // Character positions
  const chars = entities.filter(e => e.kind === 'character');
  if (chars.length === 1) {
    tokens.push(`${chars[0].label} center frame`);
  } else if (chars.length === 2) {
    const rel = relations.find(r => r.from === 'char_0' && r.to === 'char_1');
    if (rel?.type === 'faces') {
      tokens.push(`${chars[0].label} and ${chars[1].label} facing each other, rule of thirds`);
    } else {
      tokens.push(`${chars[0].label} and ${chars[1].label} side by side`);
    }
  }

  // Light description
  const light = entities.find(e => e.kind === 'light');
  if (light) tokens.push(light.label);

  return tokens.join(', ');
}

function buildContinuityTokens(constraints: ContinuityConstraint[]): string {
  if (constraints.length === 0) return '';

  const tokens: string[] = [];
  const hasCostume = constraints.some(c => c.rule === 'same_costume');
  const hasLighting = constraints.some(c => c.rule === 'same_lighting_direction');

  if (hasCostume) tokens.push('consistent wardrobe from previous shot');
  if (hasLighting) tokens.push('matching lighting direction');

  return tokens.join(', ');
}
