// ═══════════════════════════════════════════
// MISEN V7 — Export PDF Engine (pdfkit)
// Bible de Production en PDF professionnel
// ═══════════════════════════════════════════

import PDFDocument from 'pdfkit'

interface PDFExportOptions {
  projectName: string
  scriptText: string
  analysis: any
}

// Color palette matching MISEN dark theme
const C = {
  bg: '#0B0D11',
  card: '#12151B',
  border: '#1e293b',
  orange: '#f97316',
  orangeLight: '#fb923c',
  white: '#f8fafc',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  red: '#f87171',
  green: '#34d399',
  cyan: '#22d3ee',
}

const MODEL_COLORS: Record<string, string> = {
  'kling3': '#3B82F6', 'kling': '#3B82F6',
  'runway4.5': '#8B5CF6', 'runway': '#8B5CF6',
  'sora2': '#EC4899', 'sora': '#EC4899',
  'veo3.1': '#10B981', 'veo': '#10B981',
  'seedance2': '#14B8A6', 'seedance': '#14B8A6',
  'wan2.5': '#6366F1', 'wan': '#6366F1',
  'hailuo2.3': '#D946EF', 'hailuo': '#D946EF',
}

function getModelColor(modelId: string): string {
  const key = Object.keys(MODEL_COLORS).find(k => modelId?.toLowerCase().includes(k))
  return key ? MODEL_COLORS[key] : C.orange
}

export async function exportPDF(options: PDFExportOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { projectName, analysis } = options
    const a = analysis || {}
    const scenes = a.scenes || []
    const plans = a.plans || []
    const characters = a.characterBible || []
    const tension = a.tension || {}
    const continuity = a.continuity || {}

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Bible de Production — ${projectName}`,
        Author: 'MISEN V7',
        Creator: 'MISEN — Mise en Scène Numérique',
      }
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 100 // usable width (margins)
    const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

    // ─── Helper functions ───
    function checkPage(needed: number = 80) {
      if (doc.y + needed > doc.page.height - 60) {
        doc.addPage()
        doc.y = 50
      }
    }

    function drawSectionTitle(title: string) {
      checkPage(40)
      doc.fontSize(14).fillColor(C.orange).text(title, 50, doc.y)
      doc.moveTo(50, doc.y + 4).lineTo(50 + W, doc.y + 4).strokeColor(C.border).lineWidth(0.5).stroke()
      doc.moveDown(0.8)
    }

    function drawStatBox(x: number, y: number, w: number, value: string, label: string) {
      // Box background
      doc.roundedRect(x, y, w, 50, 4).fillColor(C.card).fill()
      doc.roundedRect(x, y, w, 50, 4).strokeColor(C.border).lineWidth(0.5).stroke()
      // Value
      doc.fontSize(18).fillColor(C.white).text(value, x, y + 10, { width: w, align: 'center' })
      // Label
      doc.fontSize(8).fillColor(C.textDim).text(label, x, y + 32, { width: w, align: 'center' })
    }

    // ═══════════════════════════
    // PAGE 1 — Cover
    // ═══════════════════════════

    // Background header bar
    doc.rect(0, 0, doc.page.width, 200).fill(C.card)
    doc.moveTo(0, 200).lineTo(doc.page.width, 200).strokeColor(C.border).lineWidth(0.5).stroke()

    // Title
    doc.fontSize(10).fillColor(C.orange).text('MISEN V7', 50, 60, { width: W, align: 'center' })
    doc.fontSize(26).fillColor(C.white).text(projectName, 50, 85, { width: W, align: 'center' })
    doc.fontSize(11).fillColor(C.textMuted).text('Bible de Production', 50, 125, { width: W, align: 'center' })
    doc.fontSize(9).fillColor(C.textDim).text(dateStr, 50, 145, { width: W, align: 'center' })

    // Stats row
    const statY = 220
    const statW = (W - 30) / 4
    drawStatBox(50, statY, statW, String(scenes.length), 'Scenes')
    drawStatBox(50 + statW + 10, statY, statW, String(plans.length), 'Plans')
    drawStatBox(50 + 2 * (statW + 10), statY, statW, `$${(a.costTotal || 0).toFixed(2)}`, 'Budget')
    drawStatBox(50 + 3 * (statW + 10), statY, statW, `${continuity.score || 0}%`, 'Continuite')

    doc.y = statY + 70

    // ═══════════════════════════
    // CHARACTERS
    // ═══════════════════════════
    if (characters.length > 0) {
      drawSectionTitle('Personnages')
      for (const c of characters) {
        checkPage(60)
        const startY = doc.y
        doc.roundedRect(50, startY, W, 0, 3) // placeholder, we'll size after
        doc.fontSize(11).fillColor(C.white).text(c.name || 'Inconnu', 60, startY + 8)
        if (c.apparence) {
          doc.fontSize(9).fillColor(C.textMuted).text(c.apparence, 60, doc.y + 2, { width: W - 20 })
        }
        if (c.tokens) {
          doc.fontSize(8).fillColor(C.orange).text(`Tokens : ${c.tokens}`, 60, doc.y + 2, { width: W - 20 })
        }
        const endY = doc.y + 8
        doc.roundedRect(50, startY, W, endY - startY, 3).strokeColor(C.border).lineWidth(0.5).stroke()
        doc.y = endY + 6
      }
    }

    // ═══════════════════════════
    // DRAMATURGY
    // ═══════════════════════════
    if (tension.globalArc) {
      drawSectionTitle('Dramaturgie')
      doc.fontSize(10).fillColor(C.textMuted)
        .text(`Arc global : `, 50, doc.y, { continued: true })
        .fillColor(C.white).text(tension.globalArc, { continued: true })
        .fillColor(C.textMuted).text(`  —  Tension moyenne : `, { continued: true })
        .fillColor(C.white).text(`${Math.round(tension.avgTension || 0)}/100`)
      doc.moveDown(0.8)
    }

    // ═══════════════════════════
    // PLANS
    // ═══════════════════════════
    drawSectionTitle(`Plans de production (${plans.length})`)

    for (let i = 0; i < plans.length; i++) {
      const p = plans[i]
      const prompt = p.finalPrompt || p.adaptedPrompt || p.basePrompt || '-'
      const negative = p.negativePrompt || ''

      // Estimate height needed
      const promptLines = Math.ceil(prompt.length / 80)
      const neededH = 50 + promptLines * 12 + (negative ? 16 : 0)
      checkPage(neededH)

      const startY = doc.y
      const modelColor = getModelColor(p.modelId || '')

      // Plan number
      doc.fontSize(16).fillColor(C.orange).text(String(i + 1).padStart(2, '0'), 55, startY + 4)

      // Metadata line
      const metaX = 95
      doc.fontSize(10).fillColor(C.white).text(p.shotType || 'PM', metaX, startY + 2, { continued: true })
      doc.fontSize(9).fillColor(C.textDim).text(`   ${p.cameraMove || 'fixe'}`, { continued: true })
      doc.fillColor(modelColor).text(`   ${p.modelId || '-'}`, { continued: true })
      doc.fillColor(C.textDim).text(`   ${(p.estimatedDuration || 0).toFixed(1)}s`, { continued: true })
      doc.text(`   $${(p.estimatedCost || 0).toFixed(3)}`)

      // Prompt
      doc.fontSize(9).fillColor(C.text).text(prompt, metaX, doc.y + 4, {
        width: W - 55,
        lineGap: 2,
      })

      // Negative prompt
      if (negative) {
        doc.fontSize(8).fillColor(C.red).text(`⊘ ${negative}`, metaX, doc.y + 3, { width: W - 55 })
      }

      // Separator
      const endY = doc.y + 8
      doc.moveTo(50, endY).lineTo(50 + W, endY).strokeColor(C.border).lineWidth(0.3).stroke()
      doc.y = endY + 6
    }

    // ═══════════════════════════
    // FOOTER
    // ═══════════════════════════
    checkPage(60)
    doc.moveDown(2)
    doc.moveTo(50, doc.y).lineTo(50 + W, doc.y).strokeColor(C.border).lineWidth(0.5).stroke()
    doc.moveDown(0.5)
    doc.fontSize(8).fillColor(C.textDim).text(
      `MISEN V7 — Mise en Scene Numerique — Jabrilia Editions — © ${new Date().getFullYear()} Steve Moradel`,
      50, doc.y, { width: W, align: 'center' }
    )

    doc.end()
  })
}
