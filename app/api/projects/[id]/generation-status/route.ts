// ============================================================================
// MISEN V14.5 — GET /api/projects/[id]/generation-status
// Polling : retourne le statut de toutes les générations d'un projet
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationStatus } from '@/lib/services/generation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const projectId = params.id;

  // Récupérer toutes les générations du projet
  const { data: generations, error } = await supabase
    .from('generations')
    .select('id, shot_id, provider, provider_job_id, status, result_url, thumbnail_url, error_message, metadata, created_at')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!generations || generations.length === 0) {
    return NextResponse.json({ generations: [], allDone: true, progress: 100 });
  }

  // Pour les jobs en attente/processing → vérifier le provider
  const pending = generations.filter(g => g.status === 'pending' || g.status === 'processing');
  const updates: Array<{ id: string; status: string; resultUrl?: string; errorMessage?: string }> = [];

  for (const gen of pending) {
    if (!gen.provider_job_id) continue;
    try {
      const statusResponse = await checkGenerationStatus(gen.provider, gen.provider_job_id);

      if (statusResponse.status !== gen.status || statusResponse.resultUrl) {
        updates.push({
          id: gen.id,
          status: statusResponse.status,
          resultUrl: statusResponse.resultUrl,
          errorMessage: statusResponse.errorMessage,
        });

        // Mise à jour en base
        await supabase
          .from('generations')
          .update({
            status: statusResponse.status,
            result_url: statusResponse.resultUrl ?? null,
            thumbnail_url: statusResponse.thumbnailUrl ?? null,
            error_message: statusResponse.errorMessage ?? null,
            ...(statusResponse.status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
          })
          .eq('id', gen.id);
      }
    } catch {
      // Ignore individual poll errors — non-blocking
    }
  }

  // Re-fetch après updates
  const { data: fresh } = await supabase
    .from('generations')
    .select('id, shot_id, status, result_url, thumbnail_url, error_message, metadata, created_at')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const all = fresh || generations;
  const done = all.filter(g => g.status === 'completed' || g.status === 'failed' || g.status === 'cancelled').length;
  const progress = all.length > 0 ? Math.round((done / all.length) * 100) : 100;
  const allDone = done === all.length;

  return NextResponse.json({
    generations: all.map(g => ({
      id: g.id,
      shotId: g.shot_id,
      status: g.status,
      resultUrl: g.result_url,
      thumbnailUrl: g.thumbnail_url,
      error: g.error_message,
      planId: g.metadata?.planId,
      cadrage: g.metadata?.cadrage,
      emotion: g.metadata?.emotion,
    })),
    total: all.length,
    done,
    progress,
    allDone,
  });
}
