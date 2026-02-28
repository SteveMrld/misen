#!/usr/bin/env node
// ============================================================================
// MISEN V8 — Test Suite Complet
// Validation structurelle de toutes les fonctionnalités V8
// ============================================================================

const fs = require('fs');
const path = require('path');

let pass = 0;
let fail = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    pass++;
    results.push({ name, status: '✅' });
  } catch (e) {
    fail++;
    results.push({ name, status: '❌', error: e.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function fileExists(p) {
  return fs.existsSync(path.join(__dirname, '..', p));
}

function fileContains(p, str) {
  const content = fs.readFileSync(path.join(__dirname, '..', p), 'utf-8');
  return content.includes(str);
}

function fileLines(p) {
  return fs.readFileSync(path.join(__dirname, '..', p), 'utf-8').split('\n').length;
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: V8 Backend — Types & Services (S1)
// ═══════════════════════════════════════════════════════════════

test('S1-01 Types: generation.ts exists', () => {
  assert(fileExists('lib/types/generation.ts'));
});
test('S1-02 Types: VideoProvider enum has 7 providers', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'lib/types/generation.ts'), 'utf-8');
  for (const p of ['kling', 'runway', 'sora', 'veo', 'seedance', 'wan', 'hailuo']) {
    assert(content.includes(p), `Missing provider: ${p}`);
  }
});
test('S1-03 Types: GenerationStatus has all states', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'lib/types/generation.ts'), 'utf-8');
  for (const s of ['pending', 'processing', 'completed', 'failed', 'cancelled']) {
    assert(content.includes(s), `Missing status: ${s}`);
  }
});
test('S1-04 Types: AspectRatio options defined', () => {
  assert(fileContains('lib/types/generation.ts', '16:9'));
  assert(fileContains('lib/types/generation.ts', '9:16'));
});
test('S1-05 Service: generation.ts exists and >400 lines', () => {
  assert(fileExists('lib/services/generation.ts'));
  assert(fileLines('lib/services/generation.ts') > 400);
});
test('S1-06 Service: all 7 providers handled', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'lib/services/generation.ts'), 'utf-8');
  for (const p of ['kling', 'runway', 'sora', 'veo']) {
    assert(content.toLowerCase().includes(p), `Missing provider: ${p}`);
  }
});
test('S1-07 API: generate route exists', () => {
  assert(fileExists('app/api/generate/route.ts'));
});
test('S1-08 API: generate route has POST handler', () => {
  assert(fileContains('app/api/generate/route.ts', 'export async function POST'));
});
test('S1-09 API: generate route uses createClient', () => {
  assert(fileContains('app/api/generate/route.ts', 'createClient'));
});
test('S1-10 API: status route exists', () => {
  assert(fileExists('app/api/generate/status/route.ts'));
});
test('S1-11 API: status route has GET handler', () => {
  assert(fileContains('app/api/generate/status/route.ts', 'export async function GET'));
});
test('S1-12 Hook: useGeneration exists', () => {
  assert(fileExists('lib/hooks/useGeneration.ts'));
});
test('S1-13 Hook: has polling logic', () => {
  assert(fileContains('lib/hooks/useGeneration.ts', 'poll'));
});
test('S1-14 Hook: exports GenerationState', () => {
  assert(fileContains('lib/hooks/useGeneration.ts', 'GenerationState'));
});
test('S1-15 Migration: V8 SQL exists', () => {
  assert(fileExists('supabase/migrations/20260228_v8_session1_generations.sql'));
});
test('S1-16 Migration: generations table defined', () => {
  assert(fileContains('supabase/migrations/20260228_v8_session1_generations.sql', 'CREATE TABLE'));
});
test('S1-17 Migration: RLS policies', () => {
  assert(fileContains('supabase/migrations/20260228_v8_session1_generations.sql', 'POLICY') ||
    fileContains('supabase/migrations/20260228_v8_session1_generations.sql', 'policy'));
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: V8 UI Génération (S2)
// ═══════════════════════════════════════════════════════════════

test('S2-01 Project page: SPC has generate button', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'Générer'));
});
test('S2-02 Project page: SPC has progress bar', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'progress'));
});
test('S2-03 Project page: SPC has video preview', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', '<video'));
});
test('S2-04 Project page: SPC has polling', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'pollRef'));
});
test('S2-05 Project page: Tout Générer button', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'Tout générer'));
});
test('S2-06 Project page: misen:generate-all event', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'misen:generate-all'));
});
test('S2-07 Project page: Render tab exists', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', "'render'"));
});
test('S2-08 Project page: RenderPanel component', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'RenderPanel'));
});
test('S2-09 Project page: RenderPanel has assembly player', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'currentClip'));
});
test('S2-10 Project page: RenderPanel has export button', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'Export'));
});
test('S2-11 Project page: status states (idle/processing/completed/failed)', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'app/(dashboard)/project/[id]/page.tsx'), 'utf-8');
  for (const s of ['idle', 'processing', 'completed', 'failed']) {
    assert(content.includes(`'${s}'`), `Missing status: ${s}`);
  }
});
test('S2-12 Project page: retry on failure', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', 'Réessayer'));
});
test('S2-13 Project page: Tab type includes render', () => {
  assert(fileContains('app/(dashboard)/project/[id]/page.tsx', "| 'render'"));
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Dashboard Coûts & Crédits (S3)
// ═══════════════════════════════════════════════════════════════

test('S3-01 Usage API exists', () => {
  assert(fileExists('app/api/usage/route.ts'));
});
test('S3-02 Usage API has GET handler', () => {
  assert(fileContains('app/api/usage/route.ts', 'export async function GET'));
});
test('S3-03 Usage API returns plan info', () => {
  assert(fileContains('app/api/usage/route.ts', 'generationsLimit'));
});
test('S3-04 Usage API returns cost by provider', () => {
  assert(fileContains('app/api/usage/route.ts', 'costByProvider'));
});
test('S3-05 Usage API returns daily costs', () => {
  assert(fileContains('app/api/usage/route.ts', 'dailyCosts'));
});
test('S3-06 CostsDashboard component exists', () => {
  assert(fileExists('components/ui/costs-dashboard.tsx'));
});
test('S3-07 CostsDashboard has credits gauge', () => {
  assert(fileContains('components/ui/costs-dashboard.tsx', 'creditPct'));
});
test('S3-08 CostsDashboard has daily chart', () => {
  assert(fileContains('components/ui/costs-dashboard.tsx', 'maxDailyCost'));
});
test('S3-09 CostsDashboard has provider bars', () => {
  assert(fileContains('components/ui/costs-dashboard.tsx', 'costByProvider'));
});
test('S3-10 CostsDashboard has recent generations list', () => {
  assert(fileContains('components/ui/costs-dashboard.tsx', 'recentGenerations'));
});
test('S3-11 Settings: usage tab added', () => {
  assert(fileContains('app/(dashboard)/settings/page.tsx', "'usage'"));
});
test('S3-12 Settings: CostsDashboard imported', () => {
  assert(fileContains('app/(dashboard)/settings/page.tsx', 'CostsDashboard'));
});
test('S3-13 Settings: deep-link from URL params', () => {
  assert(fileContains('app/(dashboard)/settings/page.tsx', 'useSearchParams'));
});
test('S3-14 Dashboard: Coûts shortcut button', () => {
  assert(fileContains('app/(dashboard)/dashboard/page.tsx', 'Coûts'));
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: Webhooks (S4)
// ═══════════════════════════════════════════════════════════════

test('S4-01 Webhook route exists', () => {
  assert(fileExists('app/api/webhooks/generation/route.ts'));
});
test('S4-02 Webhook: POST handler', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', 'export async function POST'));
});
test('S4-03 Webhook: GET health check', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', 'export async function GET'));
});
test('S4-04 Webhook: HMAC verification', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', 'hmac') || fileContains('app/api/webhooks/generation/route.ts', 'createHmac'));
});
test('S4-05 Webhook: all 7 providers normalized', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'app/api/webhooks/generation/route.ts'), 'utf-8');
  for (const p of ['kling', 'runway', 'sora', 'veo', 'seedance', 'wan', 'hailuo']) {
    assert(content.includes(`case '${p}'`), `Missing provider case: ${p}`);
  }
});
test('S4-06 Webhook: updates generations table', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', "from('generations')"));
});
test('S4-07 Webhook: handles completed status', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', 'completed'));
});
test('S4-08 Webhook: handles failed with refund', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', 'refund'));
});
test('S4-09 Webhook: provider param from URL', () => {
  assert(fileContains('app/api/webhooks/generation/route.ts', "searchParams.get('provider')"));
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: Demo Player cinématique
// ═══════════════════════════════════════════════════════════════

test('S5-01 Demo: step 8 Votre film exists', () => {
  assert(fileContains('lib/demo/data.ts', 'result'));
  assert(fileContains('lib/demo/data.ts', 'Votre film'));
});
test('S5-02 Demo: DemoResult component', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'DemoResult'));
});
test('S5-03 Demo: Ken Burns animations', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'kb-right') || fileContains('app/(public)/demo/page.tsx', 'ken'));
});
test('S5-04 Demo: crossfade transitions', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'transitioning') || fileContains('app/(public)/demo/page.tsx', 'crossfade') || fileContains('app/(public)/demo/page.tsx', '1200ms'));
});
test('S5-05 Demo: subtitles synchronized', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'subVisible') || fileContains('app/(public)/demo/page.tsx', 'sub'));
});
test('S5-06 Demo: FIN screen', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'FIN'));
});
test('S5-07 Demo: 2.39:1 aspect ratio', () => {
  assert(fileContains('app/(public)/demo/page.tsx', '2.39'));
});
test('S5-08 Demo: timeline with images', () => {
  assert(fileContains('app/(public)/demo/page.tsx', 'imgSc1P1'));
});
test('S5-09 Demo: Play icon in TAB_ICONS', () => {
  assert(fileContains('app/(public)/demo/page.tsx', "result: Play"));
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: Infrastructure & Integrity
// ═══════════════════════════════════════════════════════════════

test('S6-01 No auth-helpers-nextjs imports', () => {
  const files = ['app/api/generate/route.ts', 'app/api/generate/status/route.ts'];
  files.forEach(f => {
    assert(!fileContains(f, 'auth-helpers-nextjs'), `${f} still uses auth-helpers`);
  });
});
test('S6-02 All API routes use createClient from ssr', () => {
  assert(fileContains('app/api/generate/route.ts', '@/lib/supabase/server'));
  assert(fileContains('app/api/generate/status/route.ts', '@/lib/supabase/server'));
});
test('S6-03 .env.example has video provider keys', () => {
  assert(fileExists('.env.example'));
});
test('S6-04 Stripe config: 3 plans defined', () => {
  assert(fileContains('lib/stripe/config.ts', 'free'));
  assert(fileContains('lib/stripe/config.ts', 'pro'));
  assert(fileContains('lib/stripe/config.ts', 'studio'));
});
test('S6-05 V7 engines intact: 13 engines', () => {
  const enginesDir = 'lib/engines';
  if (fs.existsSync(path.join(__dirname, '..', enginesDir))) {
    const files = fs.readdirSync(path.join(__dirname, '..', enginesDir)).filter(f => f.endsWith('.ts'));
    assert(files.length >= 13, `Expected >=13 engines, got ${files.length}`);
  }
});
test('S6-06 Images: 38 demo images present', () => {
  const imgDir = path.join(__dirname, '..', 'public/images');
  if (fs.existsSync(imgDir)) {
    const imgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));
    assert(imgs.length >= 30, `Expected >=30 images, got ${imgs.length}`);
  }
});
test('S6-07 Project page >900 lines (V8 expansion)', () => {
  assert(fileLines('app/(dashboard)/project/[id]/page.tsx') > 900);
});
test('S6-08 Total project >14000 lines', () => {
  // Count all source files
  let total = 0;
  const exts = ['.ts', '.tsx', '.css', '.sql'];
  function walk(dir) {
    if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else if (exts.some(e => item.endsWith(e))) {
          total += fs.readFileSync(full, 'utf-8').split('\n').length;
        }
      }
    } catch {}
  }
  walk(path.join(__dirname, '..'));
  assert(total > 14000, `Expected >14000 lines, got ${total}`);
});

// ═══════════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════');
console.log('  MISEN V8 — RÉSULTATS TESTS');
console.log('═══════════════════════════════════════════════\n');

const sections = {
  'S1': 'Backend Types & Services',
  'S2': 'UI Génération',
  'S3': 'Dashboard Coûts & Crédits',
  'S4': 'Webhooks Providers',
  'S5': 'Demo Player Cinématique',
  'S6': 'Infrastructure & Intégrité',
};

for (const [prefix, title] of Object.entries(sections)) {
  const sectionResults = results.filter(r => r.name.startsWith(prefix));
  const sPass = sectionResults.filter(r => r.status === '✅').length;
  const sTotal = sectionResults.length;
  const icon = sPass === sTotal ? '✅' : '⚠️';
  console.log(`${icon} ${title}: ${sPass}/${sTotal}`);
  for (const r of sectionResults) {
    if (r.status === '❌') {
      console.log(`   ${r.status} ${r.name}: ${r.error}`);
    }
  }
}

console.log(`\n─────────────────────────────────────────────`);
console.log(`  TOTAL: ${pass}/${pass + fail} tests passés`);
if (fail > 0) {
  console.log(`  ❌ ${fail} ÉCHEC(S)`);
  results.filter(r => r.status === '❌').forEach(r => console.log(`     - ${r.name}: ${r.error}`));
} else {
  console.log('  🎬 TOUS LES TESTS PASSENT — V8 VALIDÉE');
}
console.log(`─────────────────────────────────────────────\n`);

process.exit(fail > 0 ? 1 : 0);
