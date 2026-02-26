// ============================================
// MISEN V7 — Types BDD
// ============================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  script_text: string | null;
  status: 'draft' | 'analyzing' | 'production' | 'complete';
  scenes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  project_id: string;
  user_id: string;
  version: number;
  result: Record<string, any>;
  style_preset: string;
  scenes_count: number;
  plans_count: number;
  cost_total: number;
  continuity_score: number;
  compliance_level: string;
  created_at: string;
}

export interface Generation {
  id: string;
  analysis_id: string;
  user_id: string;
  plan_index: number;
  scene_index: number;
  model_id: string;
  prompt: string;
  negative_prompt: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url: string | null;
  cost: number;
  duration_seconds: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// Types pour les formulaires
export interface CreateProjectInput {
  name: string;
  description?: string;
  script_text?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  script_text?: string;
  status?: Project['status'];
  scenes_count?: number;
}

// Type export JSON
export interface ProjectExport {
  version: '7.0';
  exported_at: string;
  project: Pick<Project, 'name' | 'description' | 'script_text' | 'status'>;
  analyses: Array<Pick<Analysis, 'version' | 'result' | 'style_preset' | 'scenes_count' | 'plans_count' | 'cost_total' | 'continuity_score' | 'compliance_level' | 'created_at'>>;
}
