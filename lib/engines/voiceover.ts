// ═══════════════════════════════════════════
// MISEN V7 — Voiceover Engine
// Text-to-Speech pour narration et dialogues
// ═══════════════════════════════════════════

export interface VoiceoverSegment {
  index: number;
  text: string;
  character?: string;
  startTime: number;
  duration: number;
  voice: string;
}

export interface VoiceoverConfig {
  narratorVoice: string;
  characterVoices: Record<string, string>;
  speed: number;      // 0.5 - 2.0
  provider: 'browser' | 'elevenlabs' | 'openai';
}

export const DEFAULT_VOICES = {
  narrator_fr_m: { id: 'narrator_fr_m', label: 'Narrateur (Homme)', lang: 'fr-FR' },
  narrator_fr_f: { id: 'narrator_fr_f', label: 'Narratrice (Femme)', lang: 'fr-FR' },
  narrator_en_m: { id: 'narrator_en_m', label: 'Narrator (Male)', lang: 'en-US' },
  narrator_en_f: { id: 'narrator_en_f', label: 'Narrator (Female)', lang: 'en-US' },
} as const;

export function buildVoiceoverSegments(
  plans: any[],
  scenes: any[],
  config: Partial<VoiceoverConfig> = {}
): VoiceoverSegment[] {
  const segments: VoiceoverSegment[] = [];
  let currentTime = 0;
  let index = 0;

  for (const plan of plans) {
    const duration = plan.estimatedDuration || 4;
    const sceneIndex = plan.sceneIndex || 0;
    const scene = scenes[sceneIndex];

    // Narration (description de scène)
    if (scene?.description && !plan.hasDialogue) {
      segments.push({
        index: index++,
        text: scene.description.slice(0, 200),
        startTime: currentTime,
        duration: duration * 0.8,
        voice: config.narratorVoice || 'narrator_fr_m',
      });
    }

    // Dialogues
    if (plan.hasDialogue && scene?.rawText) {
      const dialogues = extractDialoguesForVoiceover(scene.rawText);
      const timePerLine = duration / Math.max(dialogues.length, 1);

      for (const d of dialogues) {
        const voice = config.characterVoices?.[d.character] || config.narratorVoice || 'narrator_fr_m';
        segments.push({
          index: index++,
          text: d.text,
          character: d.character,
          startTime: currentTime,
          duration: timePerLine * 0.9,
          voice,
        });
        currentTime += timePerLine;
      }
    }

    currentTime += duration;
  }

  return segments;
}

function extractDialoguesForVoiceover(rawText: string): { character: string; text: string }[] {
  const results: { character: string; text: string }[] = [];
  const regex = /^([A-ZÀÂÉÈÊËÏÎÔÙÛÇ][A-ZÀÂÉÈÊËÏÎÔÙÛÇ\s-]+)\s*\n([\s\S]*?)(?=\n[A-ZÀÂÉÈÊËÏÎÔÙÛÇ]|\n\n|$)/gm;

  let match;
  while ((match = regex.exec(rawText)) !== null) {
    const character = match[1].trim();
    const text = match[2].trim().replace(/\n/g, ' ');
    if (text && character.length < 30) {
      results.push({ character, text });
    }
  }

  return results;
}

// ─── Appel API OpenAI TTS ───
export async function generateTTSOpenAI(
  text: string,
  apiKey: string,
  voice: string = 'alloy'
): Promise<ArrayBuffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice,
      response_format: 'mp3',
    }),
  });

  if (!res.ok) throw new Error('Erreur TTS OpenAI');
  return res.arrayBuffer();
}

// ─── Appel API ElevenLabs TTS ───
export async function generateTTSElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string = '21m00Tcm4TlvDq8ikWAM'
): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) throw new Error('Erreur TTS ElevenLabs');
  return res.arrayBuffer();
}
