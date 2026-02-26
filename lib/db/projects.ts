import { createClient } from '@/lib/supabase/server';
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectExport } from '@/types/database';

// ============================================
// PROJECTS CRUD
// ============================================

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description || null,
      script_text: input.script_text || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

// ============================================
// ANALYSES CRUD
// ============================================

export async function getAnalyses(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('version', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getLatestAnalysis(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function saveAnalysis(projectId: string, result: Record<string, any>, stylePreset: string = 'cinematique') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      project_id: projectId,
      user_id: user.id,
      result,
      style_preset: stylePreset,
      scenes_count: result.scenes?.length || 0,
      plans_count: result.plans?.length || 0,
      cost_total: result.costTotal || 0,
      continuity_score: result.continuity?.score || 100,
      compliance_level: result.compliance?.level || 'OK',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Met à jour le projet
  await supabase
    .from('projects')
    .update({
      status: 'analyzing',
      scenes_count: result.scenes?.length || 0,
    })
    .eq('id', projectId)
    .eq('user_id', user.id);

  return data;
}

// ============================================
// EXPORT / IMPORT JSON
// ============================================

export async function exportProject(projectId: string): Promise<ProjectExport> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Projet introuvable');

  const analyses = await getAnalyses(projectId);

  return {
    version: '7.0',
    exported_at: new Date().toISOString(),
    project: {
      name: project.name,
      description: project.description,
      script_text: project.script_text,
      status: project.status,
    },
    analyses: analyses.map((a: any) => ({
      version: a.version,
      result: a.result,
      style_preset: a.style_preset,
      scenes_count: a.scenes_count,
      plans_count: a.plans_count,
      cost_total: a.cost_total,
      continuity_score: a.continuity_score,
      compliance_level: a.compliance_level,
      created_at: a.created_at,
    })),
  };
}

export async function importProject(data: ProjectExport): Promise<Project> {
  if (data.version !== '7.0') throw new Error('Version incompatible');

  const project = await createProject({
    name: `${data.project.name} (import)`,
    description: data.project.description || undefined,
    script_text: data.project.script_text || undefined,
  });

  // Réimporte chaque analyse
  for (const analysis of data.analyses) {
    await saveAnalysis(project.id, analysis.result, analysis.style_preset);
  }

  return project;
}
