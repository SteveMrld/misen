import { createClient } from '@/lib/supabase/server';

export interface ApiKey {
  id: string;
  user_id: string;
  provider: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

// Providers supportés
export const AI_PROVIDERS = [
  { id: 'kling', name: 'Kling 3.0', placeholder: 'sk-kling-...', docsUrl: 'https://docs.qingque.cn' },
  { id: 'runway', name: 'Runway Gen-4.5', placeholder: 'rw_...', docsUrl: 'https://docs.runwayml.com' },
  { id: 'sora', name: 'Sora 2', placeholder: 'sk-sora-...', docsUrl: 'https://platform.openai.com' },
  { id: 'veo', name: 'Veo 3.1', placeholder: 'AIza...', docsUrl: 'https://cloud.google.com/vertex-ai' },
  { id: 'seedance', name: 'Seedance 2.0', placeholder: 'sd-...', docsUrl: 'https://docs.seedance.ai' },
  { id: 'wan', name: 'Wan 2.5', placeholder: 'wan-...', docsUrl: 'https://docs.wan.ai' },
  { id: 'hailuo', name: 'Hailuo 2.3', placeholder: 'hl-...', docsUrl: 'https://docs.hailuo.ai' },
] as const;

export type ProviderId = typeof AI_PROVIDERS[number]['id'];

// Masquer la clé pour l'affichage
function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export async function getApiKeys(): Promise<{ provider: string; masked: string; hasKey: boolean }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return AI_PROVIDERS.map(p => ({ provider: p.id, masked: '', hasKey: false }));

  const { data } = await supabase
    .from('api_keys')
    .select('provider, api_key')
    .eq('user_id', user.id);

  const keys = new Map((data || []).map((k: any) => [k.provider, k.api_key]));

  return AI_PROVIDERS.map(p => ({
    provider: p.id,
    masked: keys.has(p.id) ? maskKey(keys.get(p.id)!) : '',
    hasKey: keys.has(p.id),
  }));
}

export async function getApiKey(provider: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .single();

  return data?.api_key || null;
}

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Upsert
  const { error } = await supabase
    .from('api_keys')
    .upsert({
      user_id: user.id,
      provider,
      api_key: apiKey,
    }, { onConflict: 'user_id,provider' });

  if (error) throw new Error(error.message);
}

export async function deleteApiKey(provider: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider);

  if (error) throw new Error(error.message);
}
