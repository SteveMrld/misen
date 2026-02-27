// ═══════════════════════════════════════════
// MISEN V7 — Export Engine
// 6 formats : JSON, CSV, Fountain, Prompts, Bible HTML, PDF
// ═══════════════════════════════════════════

export interface ExportOptions {
  projectName: string;
  scriptText: string;
  analysis: any;
  format: 'json' | 'csv' | 'fountain' | 'prompts' | 'bible_html';
}

// ─── JSON ───
export function exportJSON(options: ExportOptions): string {
  return JSON.stringify({
    project: options.projectName,
    exportedAt: new Date().toISOString(),
    generator: 'MISEN V7',
    script: options.scriptText,
    analysis: options.analysis,
  }, null, 2);
}

// ─── CSV ───
export function exportCSV(options: ExportOptions): string {
  const plans = options.analysis?.plans || [];
  const headers = ['Plan', 'Scène', 'Type de plan', 'Mouvement caméra', 'Modèle IA', 'Durée (s)', 'Coût ($)', 'Prompt'];
  const rows = plans.map((p: any, i: number) => [
    i + 1,
    (p.sceneIndex || 0) + 1,
    p.shotType || '',
    p.cameraMove || '',
    p.modelId || '',
    (p.estimatedDuration || 0).toFixed(1),
    (p.estimatedCost || 0).toFixed(3),
    `"${(p.finalPrompt || p.basePrompt || '').replace(/"/g, '""')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// ─── Fountain ───
export function exportFountain(options: ExportOptions): string {
  const scenes = options.analysis?.scenes || [];
  let fountain = `Title: ${options.projectName}\nCredit: Analysé par MISEN V7\nAuthor: \nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

  for (const scene of scenes) {
    if (scene.heading) {
      fountain += `\n${scene.heading.toUpperCase()}\n\n`;
    }
    if (scene.rawText) {
      fountain += `${scene.rawText}\n`;
    }
  }

  return fountain;
}

// ─── Prompts (tous les prompts générés) ───
export function exportPrompts(options: ExportOptions): string {
  const plans = options.analysis?.plans || [];
  let output = `MISEN V7 — Prompts de production\nProjet : ${options.projectName}\nDate : ${new Date().toLocaleDateString('fr-FR')}\nTotal : ${plans.length} plans\n${'═'.repeat(60)}\n\n`;

  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    output += `── Plan ${i + 1} | Scène ${(p.sceneIndex || 0) + 1} | ${p.modelId || '?'} ──\n`;
    output += `Type: ${p.shotType || '-'} | Caméra: ${p.cameraMove || '-'} | Durée: ${(p.estimatedDuration || 0).toFixed(1)}s\n\n`;
    output += `[PROMPT]\n${p.finalPrompt || p.adaptedPrompt || p.basePrompt || '-'}\n\n`;
    if (p.negativePrompt) {
      output += `[NEGATIVE]\n${p.negativePrompt}\n\n`;
    }
    output += `${'─'.repeat(60)}\n\n`;
  }

  return output;
}

// ─── Bible HTML ───
export function exportBibleHTML(options: ExportOptions): string {
  const a = options.analysis || {};
  const scenes = a.scenes || [];
  const plans = a.plans || [];
  const characters = a.characterBible || [];
  const tension = a.tension || {};
  const continuity = a.continuity || {};

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bible de Production — ${options.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0B0D11; color: #e2e8f0; font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; margin-bottom: 48px; border-bottom: 1px solid #1e293b; padding-bottom: 32px; }
    .header h1 { font-size: 28px; color: #f97316; margin-bottom: 8px; }
    .header p { color: #94a3b8; font-size: 14px; }
    .section { margin-bottom: 36px; }
    .section h2 { font-size: 18px; color: #f97316; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .stat { background: #12151B; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; text-align: center; }
    .stat .value { font-size: 24px; font-weight: 700; color: #f8fafc; }
    .stat .label { font-size: 11px; color: #64748b; margin-top: 4px; }
    .character { background: #12151B; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .character .name { font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 4px; }
    .character .detail { font-size: 13px; color: #94a3b8; }
    .plan { background: #12151B; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 8px; display: grid; grid-template-columns: 60px 1fr; gap: 12px; }
    .plan .num { font-size: 20px; font-weight: 700; color: #f97316; }
    .plan .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .plan .prompt { font-size: 13px; color: #cbd5e1; margin-top: 8px; line-height: 1.5; }
    .plan .negative { font-size: 12px; color: #f87171; margin-top: 4px; font-style: italic; }
    .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #1e293b; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 ${options.projectName}</h1>
      <p>Bible de Production — Générée par MISEN V7</p>
      <p style="margin-top:4px;font-size:12px;color:#475569">${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="stats">
      <div class="stat"><div class="value">${scenes.length}</div><div class="label">Scènes</div></div>
      <div class="stat"><div class="value">${plans.length}</div><div class="label">Plans</div></div>
      <div class="stat"><div class="value">$${(a.costTotal || 0).toFixed(2)}</div><div class="label">Budget</div></div>
      <div class="stat"><div class="value">${continuity.score || 0}%</div><div class="label">Continuité</div></div>
    </div>

    ${characters.length > 0 ? `
    <div class="section">
      <h2>Personnages</h2>
      ${characters.map((c: any) => `
      <div class="character">
        <div class="name">${c.name || 'Inconnu'}</div>
        <div class="detail">${c.apparence || ''}</div>
        ${c.tokens ? `<div class="detail" style="color:#f97316;margin-top:4px">Tokens : ${c.tokens}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${tension.globalArc ? `
    <div class="section">
      <h2>Dramaturgie</h2>
      <p style="color:#94a3b8;font-size:14px">Arc global : <strong style="color:#f8fafc">${tension.globalArc}</strong> — Tension moyenne : <strong style="color:#f8fafc">${Math.round(tension.avgTension || 0)}/100</strong></p>
    </div>` : ''}

    <div class="section">
      <h2>Plans de production (${plans.length})</h2>
      ${plans.map((p: any, i: number) => `
      <div class="plan">
        <div><div class="num">${i + 1}</div></div>
        <div>
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="color:#f8fafc;font-weight:600">${p.shotType || 'PM'}</span>
            <span style="color:#64748b;font-size:12px">${p.cameraMove || 'fixe'}</span>
            <span style="color:#f97316;font-size:12px">${p.modelId || '-'}</span>
            <span style="color:#64748b;font-size:12px">${(p.estimatedDuration || 0).toFixed(1)}s</span>
            <span style="color:#64748b;font-size:12px">$${(p.estimatedCost || 0).toFixed(3)}</span>
          </div>
          <div class="prompt">${p.finalPrompt || p.adaptedPrompt || p.basePrompt || '-'}</div>
          ${p.negativePrompt ? `<div class="negative">⊘ ${p.negativePrompt}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>

    <div class="footer">
      MISEN V7 — Mise en Scène Numérique — Jabrilia Éditions<br>
      © ${new Date().getFullYear()} Steve Moradel
    </div>
  </div>
</body>
</html>`;
}

// ─── Dispatcher ───
export function generateExport(options: ExportOptions): { content: string; filename: string; mimeType: string } {
  const safeName = options.projectName.replace(/[^a-zA-Z0-9-_àâéèêëïîôùûç ]/gi, '').replace(/\s+/g, '_');
  switch (options.format) {
    case 'json':
      return { content: exportJSON(options), filename: `${safeName}_MISEN.json`, mimeType: 'application/json' };
    case 'csv':
      return { content: exportCSV(options), filename: `${safeName}_plans.csv`, mimeType: 'text/csv' };
    case 'fountain':
      return { content: exportFountain(options), filename: `${safeName}.fountain`, mimeType: 'text/plain' };
    case 'prompts':
      return { content: exportPrompts(options), filename: `${safeName}_prompts.txt`, mimeType: 'text/plain' };
    case 'bible_html':
      return { content: exportBibleHTML(options), filename: `${safeName}_bible.html`, mimeType: 'text/html' };
    default:
      return { content: exportJSON(options), filename: `${safeName}.json`, mimeType: 'application/json' };
  }
}
