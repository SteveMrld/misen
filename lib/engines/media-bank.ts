// ═══════════════════════════════════════════
// MISEN V7 — Media Bank Engine
// Banques d'images et vidéos : Pexels + Pixabay
// ═══════════════════════════════════════════

export interface MediaItem {
  id: string;
  source: 'pexels' | 'pixabay';
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  previewUrl: string;
  width: number;
  height: number;
  duration?: number;
  photographer?: string;
  tags?: string[];
}

export interface MediaSearchResult {
  items: MediaItem[];
  total: number;
  query: string;
}

// ─── Pexels API ───
export async function searchPexelsImages(query: string, apiKey: string, perPage = 12): Promise<MediaItem[]> {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`, {
    headers: { 'Authorization': apiKey },
  });
  if (!res.ok) throw new Error('Erreur Pexels Images');
  const data = await res.json();
  return (data.photos || []).map((p: any) => ({
    id: `pexels-img-${p.id}`,
    source: 'pexels' as const,
    type: 'image' as const,
    url: p.src.original,
    thumbnailUrl: p.src.medium,
    previewUrl: p.src.large,
    width: p.width,
    height: p.height,
    photographer: p.photographer,
  }));
}

export async function searchPexelsVideos(query: string, apiKey: string, perPage = 8): Promise<MediaItem[]> {
  const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`, {
    headers: { 'Authorization': apiKey },
  });
  if (!res.ok) throw new Error('Erreur Pexels Videos');
  const data = await res.json();
  return (data.videos || []).map((v: any) => {
    const file = v.video_files?.find((f: any) => f.quality === 'hd') || v.video_files?.[0] || {};
    return {
      id: `pexels-vid-${v.id}`,
      source: 'pexels' as const,
      type: 'video' as const,
      url: file.link || '',
      thumbnailUrl: v.image || '',
      previewUrl: file.link || '',
      width: file.width || v.width,
      height: file.height || v.height,
      duration: v.duration,
      photographer: v.user?.name,
    };
  });
}

// ─── Pixabay API ───
export async function searchPixabayImages(query: string, apiKey: string, perPage = 12): Promise<MediaItem[]> {
  const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo&orientation=horizontal&min_width=1280`);
  if (!res.ok) throw new Error('Erreur Pixabay Images');
  const data = await res.json();
  return (data.hits || []).map((h: any) => ({
    id: `pixabay-img-${h.id}`,
    source: 'pixabay' as const,
    type: 'image' as const,
    url: h.largeImageURL,
    thumbnailUrl: h.previewURL,
    previewUrl: h.webformatURL,
    width: h.imageWidth,
    height: h.imageHeight,
    photographer: h.user,
    tags: h.tags?.split(', '),
  }));
}

export async function searchPixabayVideos(query: string, apiKey: string, perPage = 8): Promise<MediaItem[]> {
  const res = await fetch(`https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
  if (!res.ok) throw new Error('Erreur Pixabay Videos');
  const data = await res.json();
  return (data.hits || []).map((h: any) => {
    const vid = h.videos?.medium || h.videos?.small || {};
    return {
      id: `pixabay-vid-${h.id}`,
      source: 'pixabay' as const,
      type: 'video' as const,
      url: vid.url || '',
      thumbnailUrl: `https://i.vimeocdn.com/video/${h.picture_id}_640x360.jpg`,
      previewUrl: vid.url || '',
      width: vid.width || 1280,
      height: vid.height || 720,
      duration: h.duration,
      photographer: h.user,
      tags: h.tags?.split(', '),
    };
  });
}

// ─── Recherche combinée ───
export async function searchMedia(
  query: string,
  type: 'image' | 'video' | 'all',
  apiKeys: { pexels?: string; pixabay?: string }
): Promise<MediaSearchResult> {
  const promises: Promise<MediaItem[]>[] = [];

  if (type === 'image' || type === 'all') {
    if (apiKeys.pexels) promises.push(searchPexelsImages(query, apiKeys.pexels).catch(() => []));
    if (apiKeys.pixabay) promises.push(searchPixabayImages(query, apiKeys.pixabay).catch(() => []));
  }
  if (type === 'video' || type === 'all') {
    if (apiKeys.pexels) promises.push(searchPexelsVideos(query, apiKeys.pexels).catch(() => []));
    if (apiKeys.pixabay) promises.push(searchPixabayVideos(query, apiKeys.pixabay).catch(() => []));
  }

  // Fallback sans clé — utilise les URLs publiques Pexels
  if (promises.length === 0) {
    promises.push(searchPexelsFree(query, type));
  }

  const results = await Promise.all(promises);
  const items = results.flat();

  return { items, total: items.length, query };
}

// ─── Recherche Pexels gratuite (pas de clé requise pour la démo) ───
async function searchPexelsFree(query: string, type: string): Promise<MediaItem[]> {
  // Retourne des placeholders basés sur le mot-clé pour la démo
  const keywords = query.toLowerCase().split(' ');
  const suggestions = generatePlaceholders(keywords, type);
  return suggestions;
}

function generatePlaceholders(keywords: string[], type: string): MediaItem[] {
  // Génère des suggestions basées sur les mots-clés du script
  const baseItems: MediaItem[] = [];
  const sceneryMap: Record<string, string[]> = {
    'appartement': ['interior apartment morning light', 'bedroom window dawn'],
    'pont': ['bridge river city', 'pedestrian bridge urban'],
    'café': ['french cafe interior', 'coffee shop cozy'],
    'jardin': ['garden autumn leaves', 'park golden hour'],
    'rue': ['city street night', 'urban walking rain'],
    'mer': ['ocean waves cinematic', 'sea coast dramatic'],
    'forêt': ['forest fog mystical', 'dark woods path'],
    'bureau': ['modern office interior', 'desk workspace'],
    'nuit': ['city night lights', 'dark street moody'],
    'pluie': ['rain city street', 'raindrops window'],
  };

  for (const kw of keywords) {
    const matches = sceneryMap[kw];
    if (matches) {
      matches.forEach((m, i) => {
        baseItems.push({
          id: `placeholder-${kw}-${i}`,
          source: 'pexels',
          type: type === 'video' ? 'video' : 'image',
          url: `https://images.pexels.com/photos/${1000000 + i}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=1280`,
          thumbnailUrl: `https://images.pexels.com/photos/${1000000 + i}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`,
          previewUrl: `https://images.pexels.com/photos/${1000000 + i}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800`,
          width: 1280,
          height: 720,
          tags: m.split(' '),
        });
      });
    }
  }

  return baseItems.slice(0, 12);
}

// ─── Suggestion automatique de médias par scène ───
export function suggestMediaQueries(scenes: any[]): { sceneIndex: number; queries: string[] }[] {
  return scenes.map((scene: any, i: number) => {
    const queries: string[] = [];
    const heading = (scene.heading || '').toLowerCase();
    const description = (scene.rawText || scene.description || '').toLowerCase();

    // Extraire le lieu
    if (heading.includes('int.')) queries.push(extractLocation(heading) + ' interior');
    if (heading.includes('ext.')) queries.push(extractLocation(heading) + ' exterior');

    // Moment de la journée
    if (heading.includes('nuit') || heading.includes('night')) queries.push('night city cinematic');
    if (heading.includes('jour') || heading.includes('day')) queries.push('daylight golden hour');
    if (heading.includes('aube') || heading.includes('dawn')) queries.push('dawn light atmospheric');
    if (heading.includes('crépuscule') || heading.includes('dusk')) queries.push('sunset golden sky');

    // Éléments visuels
    if (description.includes('pluie') || description.includes('rain')) queries.push('rain atmospheric cinematic');
    if (description.includes('pont') || description.includes('bridge')) queries.push('bridge river city');
    if (description.includes('café')) queries.push('french cafe interior warm');

    if (queries.length === 0) queries.push('cinematic scene atmospheric');

    return { sceneIndex: i, queries: queries.slice(0, 3) };
  });
}

function extractLocation(heading: string): string {
  return heading
    .replace(/^(int\.|ext\.|int\/ext\.)\s*/i, '')
    .replace(/\s*-\s*(jour|nuit|aube|crépuscule|matin|soir|day|night|dawn|dusk).*$/i, '')
    .trim() || 'location';
}
