import { getApiKey } from '@/lib/db/api-keys';
import { createClient } from '@/lib/supabase/server';

interface GenerationInput {
  analysisId: string;
  planIndex: number;
  sceneIndex: number;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  duration?: number;
}

interface GenerationResult {
  generationId: string;
  status: 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  error?: string;
}

// Map modelId to provider
function getProvider(modelId: string): string {
  const map: Record<string, string> = {
    'kling3': 'kling',
    'runway4.5': 'runway',
    'sora2': 'sora',
    'veo3.1': 'veo',
    'seedance2': 'seedance',
    'wan2.5': 'wan',
    'hailuo2.3': 'hailuo',
  };
  return map[modelId] || modelId;
}

// Appels API vers les modèles IA
async function callKling(apiKey: string, prompt: string, negativePrompt?: string): Promise<{ taskId: string }> {
  const res = await fetch('https://api.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt || '',
      cfg_scale: 0.5,
      mode: 'std',
      duration: '5',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Kling API error');
  return { taskId: data.data?.task_id || data.task_id };
}

async function callRunway(apiKey: string, prompt: string): Promise<{ taskId: string }> {
  const res = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      text_prompt: prompt,
      seconds: 4,
      seed: Math.floor(Math.random() * 999999),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Runway API error');
  return { taskId: data.uuid || data.id };
}

async function callSora(apiKey: string, prompt: string): Promise<{ taskId: string }> {
  const res = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'sora',
      prompt,
      size: '1920x1080',
      duration: 5,
      n: 1,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Sora API error');
  return { taskId: data.id };
}

async function callVeo(apiKey: string, prompt: string): Promise<{ taskId: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1:generateVideo?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: { text: prompt },
      videoConfig: { aspectRatio: '16:9', durationSeconds: 5 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Veo API error');
  return { taskId: data.name || data.id };
}

// Dispatch vers le bon modèle
async function dispatchGeneration(provider: string, apiKey: string, prompt: string, negativePrompt?: string): Promise<{ taskId: string }> {
  switch (provider) {
    case 'kling': return callKling(apiKey, prompt, negativePrompt);
    case 'runway': return callRunway(apiKey, prompt);
    case 'sora': return callSora(apiKey, prompt);
    case 'veo': return callVeo(apiKey, prompt);
    // Les autres providers suivront le même pattern
    default:
      throw new Error(`Provider ${provider} non supporté pour le moment. Kling, Runway, Sora et Veo sont disponibles.`);
  }
}

export async function startGeneration(input: GenerationInput): Promise<GenerationResult> {
  const provider = getProvider(input.modelId);
  const apiKey = await getApiKey(provider);

  if (!apiKey) {
    throw new Error(`Clé API manquante pour ${provider}. Configurez-la dans Réglages.`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Crée l'enregistrement generation
  const { data: gen, error: insertError } = await supabase
    .from('generations')
    .insert({
      analysis_id: input.analysisId,
      user_id: user.id,
      plan_index: input.planIndex,
      scene_index: input.sceneIndex,
      model_id: input.modelId,
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || null,
      status: 'processing',
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  try {
    // Appel API
    const result = await dispatchGeneration(provider, apiKey, input.prompt, input.negativePrompt);

    // Met à jour avec le taskId (on stocke dans result_url temporairement)
    await supabase
      .from('generations')
      .update({
        status: 'processing',
        result_url: `task:${result.taskId}`,
      })
      .eq('id', gen.id);

    return {
      generationId: gen.id,
      status: 'processing',
    };
  } catch (error: any) {
    // Erreur API → marque comme failed
    await supabase
      .from('generations')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', gen.id);

    return {
      generationId: gen.id,
      status: 'failed',
      error: error.message,
    };
  }
}

export async function getGenerations(analysisId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('generations')
    .select('*')
    .eq('analysis_id', analysisId)
    .eq('user_id', user.id)
    .order('plan_index', { ascending: true });

  return data || [];
}
