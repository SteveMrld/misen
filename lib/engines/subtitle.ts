// ═══════════════════════════════════════════
// MISEN V7 — Subtitle Engine
// Génère des sous-titres SRT depuis les dialogues
// ═══════════════════════════════════════════

export interface SubtitleEntry {
  index: number;
  startTime: number; // en secondes
  endTime: number;
  text: string;
  character?: string;
}

export interface SubtitleResult {
  entries: SubtitleEntry[];
  srt: string;
  totalDuration: number;
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

export function generateSubtitles(plans: any[], scenes: any[]): SubtitleResult {
  const entries: SubtitleEntry[] = [];
  let currentTime = 0;
  let index = 1;

  for (const plan of plans) {
    const duration = plan.estimatedDuration || 4;

    // Cherche le dialogue dans la scène correspondante
    const sceneIndex = plan.sceneIndex || 0;
    const scene = scenes[sceneIndex];

    if (plan.hasDialogue || scene?.dialogue) {
      const dialogueLines = extractDialogue(scene?.rawText || '', plan);

      for (const line of dialogueLines) {
        const lineDuration = Math.max(1.5, Math.min(duration, line.text.length * 0.06));
        entries.push({
          index,
          startTime: currentTime,
          endTime: currentTime + lineDuration,
          text: line.text,
          character: line.character,
        });
        index++;
        currentTime += lineDuration + 0.3; // petite pause entre répliques
      }

      // Si pas de dialogue extrait mais plan a du dialogue
      if (dialogueLines.length === 0 && plan.hasDialogue) {
        const text = plan.dialogueText || '';
        if (text.trim()) {
          entries.push({
            index,
            startTime: currentTime,
            endTime: currentTime + duration * 0.8,
            text: text.trim(),
          });
          index++;
        }
      }
    }

    currentTime += duration;
  }

  // Génère le SRT
  const srt = entries.map(e =>
    `${e.index}\n${formatSrtTime(e.startTime)} --> ${formatSrtTime(e.endTime)}\n${e.character ? `[${e.character}] ` : ''}${e.text}\n`
  ).join('\n');

  return {
    entries,
    srt,
    totalDuration: currentTime,
  };
}

function extractDialogue(rawText: string, plan: any): { character: string; text: string }[] {
  const lines: { character: string; text: string }[] = [];
  if (!rawText) return lines;

  const dialogueRegex = /^([A-ZÀÂÉÈÊËÏÎÔÙÛÇ][A-ZÀÂÉÈÊËÏÎÔÙÛÇ\s-]+)\s*(?:\(.*?\))?\s*\n([\s\S]*?)(?=\n[A-ZÀÂÉÈÊËÏÎÔÙÛÇ][A-ZÀÂÉÈÊËÏÎÔÙÛÇ\s-]+\s*(?:\(.*?\))?\s*\n|\n\n|$)/gm;

  let match;
  while ((match = dialogueRegex.exec(rawText)) !== null) {
    const character = match[1].trim();
    const text = match[2].trim().replace(/\n/g, ' ');
    if (text && character.length < 30) {
      lines.push({ character, text });
    }
  }

  return lines;
}

export function generateVTT(subtitles: SubtitleResult): string {
  let vtt = 'WEBVTT\n\n';
  for (const e of subtitles.entries) {
    const start = formatSrtTime(e.startTime).replace(',', '.');
    const end = formatSrtTime(e.endTime).replace(',', '.');
    vtt += `${e.index}\n${start} --> ${end}\n${e.character ? `<v ${e.character}>` : ''}${e.text}\n\n`;
  }
  return vtt;
}
