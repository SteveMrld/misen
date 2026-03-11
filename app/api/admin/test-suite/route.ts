import { NextRequest, NextResponse } from 'next/server';
import { TEST_SCRIPTS, type TestScript } from '@/lib/test/test-scripts';
import { evaluateProject, type PanelReport } from '@/lib/test/expert-panel';
import { runPipeline } from '@/lib/engines/pipeline';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export interface TestSuiteReport {
  generatedAt: string
  version: string
  totalScripts: number
  completed: number
  failed: number
  avgConsensusScore: number
  avgGrade: string
  readyForProduction: number
  genreBreakdown: Record<string, { count: number; avgScore: number; avgGrade: string }>
  complexityBreakdown: Record<string, { count: number; avgScore: number }>
  engineCoverage: Record<string, number>
  topProjects: { title: string; genre: string; score: number; grade: string }[]
  criticalIssuesGlobal: string[]
  reports: PanelReport[]
  errors: string[]
  duration: number
}

/**
 * GET /api/admin/test-suite?secret=XXX
 *   Full run: all 50 scripts
 *   &genre=pub_luxe  â filter by genre
 *   &limit=5         â limit number of scripts
 *   &id=pub-parfum-01 â single script
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'AccÃ¨s refusÃ©' }, { status: 403 });
  }

  const genreFilter = request.nextUrl.searchParams.get('genre');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const idParam = request.nextUrl.searchParams.get('id');
  const limit = limitParam ? parseInt(limitParam) : 50;

  let scripts = [...TEST_SCRIPTS];
  if (idParam) {
    scripts = scripts.filter(s => s.id === idParam);
  } else if (genreFilter) {
    scripts = scripts.filter(s => s.genre === genreFilter);
  }
  scripts = scripts.slice(0, limit);

  if (scripts.length === 0) {
    return NextResponse.json({ error: 'Aucun script trouvÃ©' }, { status: 404 });
  }

  const startTime = Date.now();
  const reports: PanelReport[] = [];
  const errors: string[] = [];
  const engineCoverage: Record<string, number> = {};

  for (const script of scripts) {
    try {
      // Run full pipeline
      const analysis = runPipeline(script.script, {
        stylePreset: script.genre === 'pub_luxe' ? 'cinematique' : script.genre === 'documentaire' ? 'documentaire' : 'cinematique',
      });

      // Track engine coverage
      for (const engine of script.testFocus) {
        engineCoverage[engine] = (engineCoverage[engine] || 0) + 1;
      }

      // Run expert panel
      const report = evaluateProject(
        { ...analysis, id: script.id, title: script.title },
        script.script,
        script.genre
      );

      reports.push(report);
    } catch (e: any) {
      errors.push(`${script.id} (${script.title}): ${e.message}`);
    }
  }

  const duration = Date.now() - startTime;

  // Compute aggregates
  const completed = reports.length;
  const failed = errors.length;
  const scores = reports.map(r => r.consensusScore);
  const avgConsensusScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const avgGrade = avgConsensusScore >= 85 ? 'A' : avgConsensusScore >= 70 ? 'B' : avgConsensusScore >= 55 ? 'C' : avgConsensusScore >= 40 ? 'D' : 'F';
  const readyForProduction = reports.filter(r => r.readyForProduction).length;

  // Genre breakdown
  const genreBreakdown: Record<string, { count: number; avgScore: number; avgGrade: string }> = {};
  for (const report of reports) {
    if (!genreBreakdown[report.genre]) {
      genreBreakdown[report.genre] = { count: 0, avgScore: 0, avgGrade: '' };
    }
    genreBreakdown[report.genre].count++;
    genreBreakdown[report.genre].avgScore += report.consensusScore;
  }
  for (const genre of Object.keys(genreBreakdown)) {
    genreBreakdown[genre].avgScore = Math.round(genreBreakdown[genre].avgScore / genreBreakdown[genre].count);
    const gs = genreBreakdown[genre].avgScore;
    genreBreakdown[genre].avgGrade = gs >= 85 ? 'A' : gs >= 70 ? 'B' : gs >= 55 ? 'C' : gs >= 40 ? 'D' : 'F';
  }

  // Complexity breakdown
  const complexityBreakdown: Record<string, { count: number; avgScore: number }> = {};
  for (let i = 0; i < reports.length; i++) {
    const script = scripts[i];
    if (!script) continue;
    const c = script.complexity;
    if (!complexityBreakdown[c]) complexityBreakdown[c] = { count: 0, avgScore: 0 };
    complexityBreakdown[c].count++;
    complexityBreakdown[c].avgScore += reports[i].consensusScore;
  }
  for (const c of Object.keys(complexityBreakdown)) {
    complexityBreakdown[c].avgScore = Math.round(complexityBreakdown[c].avgScore / complexityBreakdown[c].count);
  }

  // Top projects
  const topProjects = reports
    .sort((a, b) => b.consensusScore - a.consensusScore)
    .slice(0, 10)
    .map(r => ({ title: r.projectTitle, genre: r.genre, score: r.consensusScore, grade: r.consensusGrade }));

  // Global critical issues
  const issueCounts: Record<string, number> = {};
  reports.forEach(r => r.criticalIssues.forEach(i => { issueCounts[i] = (issueCounts[i] || 0) + 1 }));
  const criticalIssuesGlobal = Object.entries(issueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([issue, count]) => `${issue} (${count} projets)`);

  const result: TestSuiteReport = {
    generatedAt: new Date().toISOString(),
    version: 'V14.6',
    totalScripts: scripts.length,
    completed,
    failed,
    avgConsensusScore,
    avgGrade,
    readyForProduction,
    genreBreakdown,
    complexityBreakdown,
    engineCoverage,
    topProjects,
    criticalIssuesGlobal,
    reports,
    errors,
    duration,
  };

  return NextResponse.json(result);
}
