// MISEN V7 — MEDIA BANK (Pexels + Music + Image AI)

export interface MediaResult {
  id: string; type: 'image' | 'video'; url: string; thumbnail: string;
  width: number; height: number; source: string; photographer?: string; duration?: number;
}

export async function searchPexelsImages(query: string, apiKey: string, n = 8): Promise<MediaResult[]> {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${n}&orientation=landscape`, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error('Erreur Pexels');
  const d = await res.json();
  return (d.photos || []).map((p: any) => ({ id: `px-${p.id}`, type: 'image' as const, url: p.src?.large, thumbnail: p.src?.small, width: p.width, height: p.height, source: 'Pexels', photographer: p.photographer }));
}

export async function searchPexelsVideos(query: string, apiKey: string, n = 6): Promise<MediaResult[]> {
  const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${n}`, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error('Erreur Pexels Videos');
  const d = await res.json();
  return (d.videos || []).map((v: any) => { const f = v.video_files?.[0]; return { id: `pv-${v.id}`, type: 'video' as const, url: f?.link || '', thumbnail: v.image, width: f?.width || 1920, height: f?.height || 1080, source: 'Pexels', photographer: v.user?.name, duration: v.duration }; });
}

export function buildSearchQueries(scenes: any[]): { idx: number; query: string }[] {
  return scenes.map((s: any, i: number) => {
    const h = s.heading || '';
    const loc = h.replace(/^(INT\.|EXT\.)\s*/i, '').replace(/\s*[-–]\s*(JOUR|NUIT|MATIN|SOIR).*/i, '').trim();
    const time = h.match(/NUIT/i) ? 'night' : h.match(/MATIN/i) ? 'morning' : '';
    return { idx: i, query: `${loc} ${time} cinematic`.trim() };
  });
}

export const MUSIC_PROVIDERS = [
  { id: 'suno', name: 'Suno v4', type: 'generative', url: 'https://suno.com', desc: 'IA générative — morceaux originaux depuis un prompt' },
  { id: 'udio', name: 'Udio', type: 'generative', url: 'https://udio.com', desc: 'Génération musicale avec contrôle du style' },
  { id: 'epidemic', name: 'Epidemic Sound', type: 'library', url: 'https://epidemicsound.com', desc: '40 000+ morceaux libres de droits' },
  { id: 'artlist', name: 'Artlist', type: 'library', url: 'https://artlist.io', desc: 'Musique + SFX pour la production vidéo' },
  { id: 'mubert', name: 'Mubert', type: 'generative', url: 'https://mubert.com', desc: 'Musique générative en temps réel' },
];

export const IMAGE_AI_PROVIDERS = [
  { id: 'dalle', name: 'DALL-E 3', cost: '$0.04/img', desc: 'Storyboards et concept art haute qualité' },
  { id: 'midjourney', name: 'Midjourney v6.1', cost: '$0.05/img', desc: 'Direction artistique cinématique' },
  { id: 'flux', name: 'Flux Pro 1.1', cost: '$0.03/img', desc: 'Photoréalisme et rapidité' },
  { id: 'sdxl', name: 'Stable Diffusion XL', cost: '$0.01/img', desc: 'Open source, contrôle total' },
];
