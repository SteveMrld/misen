'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'

// Background
import heroBg from '@/public/images/hero_bg.png'

// Scenario 1 — Le Poids des cendres (court-métrage)
import sc1Fleuve from '@/public/images/sc1_fleuve.jpg'
import sc1Portrait from '@/public/images/sc1_portrait.jpg'
import sc1Pont from '@/public/images/sc1_pont.jpg'
import sc1Couloir from '@/public/images/sc1_couloir.jpg'

// Scenario 2 — Odyssée (pub parfum)
import sc2Desert from '@/public/images/sc2_desert.jpg'
import sc2Sable from '@/public/images/sc2_sable.jpg'
import sc2Flacon from '@/public/images/sc2_flacon.jpg'
import sc2Visage from '@/public/images/sc2_visage.jpg'
import sc2Desert2 from '@/public/images/sc2_desert2.jpg'
import sc2Falaise from '@/public/images/sc2_falaise.jpg'

// Scenario 3 — Pixel (vidéo éducative)
import sc3Oeil from '@/public/images/sc3_oeil.jpg'
import sc3Ville from '@/public/images/sc3_ville.jpg'
import sc3Code from '@/public/images/sc3_homme_ecran.jpg'
import sc3Silhouette from '@/public/images/sc3_silhouette.jpg'

// Custom pictos — Formats (Set A)
import iconCourtMetrage from '@/public/images/icon_court_metrage.png'
import iconPublicite from '@/public/images/icon_publicite.png'
import iconDocumentaire from '@/public/images/icon_documentaire.png'
import iconClipMusical from '@/public/images/icon_clip_musical.png'
import iconBd from '@/public/images/icon_bd.png'
import iconEducatif from '@/public/images/icon_educatif.png'

// Custom pictos — Steps (Set B)
import iconStepImaginez from '@/public/images/icon_step_imaginez.png'
import iconStepAnalysez from '@/public/images/icon_step_analysez.png'
import iconStepOrchestrez from '@/public/images/icon_step_orchestrez.png'
import iconStepGenerez from '@/public/images/icon_step_generez.png'

// Custom pictos — Engines (Set C)
import iconEngIntentParser from '@/public/images/icon_eng_intent_parser.png'
import iconEngScenarist from '@/public/images/icon_eng_scenarist.png'
import iconEngStoryTracker from '@/public/images/icon_eng_story_tracker.png'
import iconEngShotEvaluator from '@/public/images/icon_eng_shot_evaluator.png'
import iconEngCrispifier from '@/public/images/icon_eng_crispifier.png'
import iconEngHumanAlign from '@/public/images/icon_eng_human_align.png'
import iconEngCamera from '@/public/images/icon_eng_camera.png'
import iconEngAudioTracker from '@/public/images/icon_eng_audio_tracker.png'
import iconEngCameraControl from '@/public/images/icon_eng_camera_control.png'
import iconEngStyleGuard from '@/public/images/icon_eng_style_guard.png'
import iconEngStyleGuard2 from '@/public/images/icon_eng_style_guard2.png'
import iconEngColorHarmonizer from '@/public/images/icon_eng_color_harmonizer.png'
import iconEngMotionFlow from '@/public/images/icon_eng_motion_flow.png'

import {
  Play, ArrowRight, Brain, ChevronDown, Wand2, Check
} from 'lucide-react'

const MODELS = [
  { id: 'kling3', name: 'Kling 3.0', color: '#3B82F6', tag: 'Réalisme' },
  { id: 'runway4.5', name: 'Runway Gen-4.5', color: '#8B5CF6', tag: 'Style' },
  { id: 'sora2', name: 'Sora 2', color: '#EC4899', tag: 'VFX' },
  { id: 'veo3.1', name: 'Veo 3.1', color: '#10B981', tag: 'Dialogue' },
  { id: 'seedance2', name: 'Seedance 2.0', color: '#14B8A6', tag: 'Mouvement' },
  { id: 'wan2.5', name: 'Wan 2.5', color: '#6366F1', tag: 'Animation' },
  { id: 'hailuo2.3', name: 'Hailuo 2.3', color: '#D946EF', tag: 'Cohérence' },
]

const FORMATS = [
  { label: 'Court-métrage', desc: 'Fiction, drame, comédie', icon: iconCourtMetrage },
  { label: 'Publicité', desc: 'Spot 15s, 30s, 60s', icon: iconPublicite },
  { label: 'Documentaire', desc: 'Narration, interviews', icon: iconDocumentaire },
  { label: 'Clip musical', desc: 'Storytelling visuel', icon: iconClipMusical },
  { label: 'Bande dessinée', desc: 'Cases, storyboard', icon: iconBd },
  { label: 'Vidéo éducative', desc: 'Tutos, e-learning', icon: iconEducatif },
]

const STEPS = [
  { step: '01', title: 'Imaginez', desc: "Décrivez votre idée — l'assistant IA vous aide à construire le scénario", icon: iconStepImaginez },
  { step: '02', title: 'Analysez', desc: '13 moteurs décomposent chaque plan, personnage, émotion et cadrage', icon: iconStepAnalysez },
  { step: '03', title: 'Orchestrez', desc: 'Storyboard, timeline, copilote IA — peaufinez chaque détail', icon: iconStepOrchestrez },
  { step: '04', title: 'Générez', desc: 'Le meilleur modèle IA est sélectionné pour chaque plan', icon: iconStepGenerez },
]

const ENGINES = [
  { name: 'Intent Parser', icon: iconEngIntentParser },
  { name: 'Scénariste', icon: iconEngScenarist },
  { name: 'Story Tracker', icon: iconEngStoryTracker },
  { name: 'Shot Evaluator', icon: iconEngShotEvaluator },
  { name: 'Crispifier', icon: iconEngCrispifier },
  { name: 'Human Align', icon: iconEngHumanAlign },
  { name: 'Camera', icon: iconEngCamera },
  { name: 'Audio Tracker', icon: iconEngAudioTracker },
  { name: 'Camera Control', icon: iconEngCameraControl },
  { name: 'Style Guard', icon: iconEngStyleGuard },
  { name: 'Style Sentinel', icon: iconEngStyleGuard2 },
  { name: 'Color Harmonizer', icon: iconEngColorHarmonizer },
  { name: 'Motion Flow', icon: iconEngMotionFlow },
]

export function LandingHero({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter()
  const { t } = useI18n()
  const [selectedModel, setSelectedModel] = useState(0)
  const [showModels, setShowModels] = useState(false)
  const [showEngines, setShowEngines] = useState(false)
  const [scriptPreview, setScriptPreview] = useState('')
  const model = MODELS[selectedModel]

  const handleGo = () => {
    router.push(isLoggedIn ? '/dashboard' : '/register')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* ═══ NAV ═══ */}
      <nav className="flex items-center justify-between px-6 py-4 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Play size={14} className="text-white ml-0.5" fill="white" />
          </div>
          <span className="font-display text-xl text-white tracking-tight">MISEN</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/demo" className="px-2 sm:px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            {t.nav.demo}
          </Link>
          <Link href="/pricing" className="px-2 sm:px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            {t.nav.pricing}
          </Link>
          <Link href="/contact" className="hidden sm:block px-2 sm:px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            {t.nav.contact}
          </Link>
          <LanguageToggle />
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm font-medium rounded-xl">
              {t.common.dashboard}
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm font-medium rounded-xl">
                {t.common.getStarted}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={heroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950/75 to-dark-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/80" />
          <div className="absolute inset-0 vignette" />
        </div>

        {/* Badge */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">NEW</span>
            <span className="text-sm text-slate-300">Assistant IA + 13 moteurs + 7 modèles vidéo</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 font-display text-5xl md:text-7xl text-center text-white mb-4 tracking-tight" style={{ fontWeight: 500, lineHeight: 1.1 }}>
          De l&apos;idée<br />
          <span className="text-gradient-copper">
            à l&apos;image.
          </span>
        </h1>

        {/* NEW Subtitle — la vraie promesse */}
        <p className="relative z-10 text-base md:text-lg text-slate-400 text-center max-w-2xl mb-10 leading-relaxed">
          Court-métrage, publicité, documentaire, clip, BD, vidéo éducative
          — décrivez votre vision, MISEN écrit le scénario, analyse chaque plan avec 13 moteurs
          et sélectionne le meilleur modèle IA parmi 7 pour chaque image.
          <span className="block mt-2 text-slate-300 font-medium">
            Pas un seul outil — le bon outil, à chaque plan.
          </span>
        </p>

        {/* ═══ ACTION BOX ═══ */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-dark-900/80 backdrop-blur-xl border border-orange-500/10 rounded-2xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: model.color }} />
                <span className="text-sm font-medium text-white">{model.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] text-slate-400 rounded">{model.tag}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Wand2 size={11} className="text-orange-500/60" /> Assistant IA</span>
                <span className="flex items-center gap-1"><Brain size={11} /> 13 moteurs</span>
              </div>
            </div>

            {showModels && (
              <div className="mb-4 grid grid-cols-2 gap-1.5 p-2 bg-dark-800/50 rounded-xl border border-dark-700">
                {MODELS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(i); setShowModels(false) }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${i === selectedModel ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04] text-slate-400'}`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-xs font-medium">{m.name}</span>
                    <span className="text-[9px] text-slate-600 ml-auto">{m.tag}</span>
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={scriptPreview}
              onChange={(e) => setScriptPreview(e.target.value)}
              placeholder="Décrivez votre idée ou collez votre scénario..."
              rows={3}
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-[11px] text-slate-600">
                Pas de scénario ? L&apos;assistant IA vous guide · Gratuit
              </p>
              <button
                onClick={handleGo}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl"
              >
                <Play size={14} fill="white" /> {isLoggedIn ? t.common.dashboard : t.common.getStarted}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ STATS ═══ */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 w-full max-w-2xl">
          {[
            { value: '∞', label: 'Formats' },
            { value: '13', label: 'Moteurs IA' },
            { value: '7', label: 'Modèles vidéo' },
            { value: '<10s', label: 'Par analyse' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ USE CASES — Custom Pictos ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          <span className="text-gradient-copper">Un outil, tous les formats</span>
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 max-w-lg mx-auto">
          Que vous soyez réalisateur, marketeur, enseignant ou créateur — MISEN s&apos;adapte à votre vision
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FORMATS.map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-4 rounded-xl bg-dark-900/50 border border-dark-700 hover:border-orange-500/20 hover:bg-dark-900/80 transition-all group">
              <div className="w-12 h-12 flex-shrink-0 relative">
                <Image src={f.icon} alt={f.label} fill className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{f.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Custom Pictos ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight"><span className="text-gradient-copper">Comment ça marche</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.step} className="group text-center">
              <div className="w-20 h-20 mx-auto relative mb-4">
                <Image src={s.icon} alt={s.title} fill className="object-contain" />
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-orange-400 mb-2">
                {s.step}
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ VISUAL SHOWCASE — 3 SCENARIOS ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          <span className="text-gradient-copper">Des résultats cinématiques</span>
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          Chaque plan est assigné au modèle IA optimal — voici 3 projets générés par MISEN
        </p>

        {/* Scenario tabs */}
        {(() => {
          const scenarios = [
            {
              id: 'cendres',
              title: 'Le Poids des cendres',
              genre: 'Court-métrage · Drame',
              shots: [
                { src: sc1Fleuve.src, label: 'Plan large · Fleuve', model: 'Kling 3.0', color: '#3B82F6' },
                { src: sc1Portrait.src, label: 'Gros plan · Portrait', model: 'Veo 3.1', color: '#10B981' },
                { src: sc1Pont.src, label: 'Plan large · Pont', model: 'Sora 2', color: '#EC4899' },
                { src: sc1Couloir.src, label: 'Intérieur · Couloir', model: 'Kling 3.0', color: '#3B82F6' },
              ],
            },
            {
              id: 'odyssee',
              title: 'Odyssée',
              genre: 'Publicité · Parfum luxe',
              shots: [
                { src: sc2Desert.src, label: 'Désert · Silhouette', model: 'Kling 3.0', color: '#3B82F6' },
                { src: sc2Sable.src, label: 'Insert · Sable doré', model: 'Runway Gen-4.5', color: '#8B5CF6' },
                { src: sc2Visage.src, label: 'Gros plan · Visage', model: 'Veo 3.1', color: '#10B981' },
                { src: sc2Falaise.src, label: 'Falaise · Étoiles', model: 'Wan 2.5', color: '#6366F1' },
              ],
            },
            {
              id: 'pixel',
              title: 'Pixel',
              genre: 'Vidéo éducative · IA',
              shots: [
                { src: sc3Oeil.src, label: 'Macro · Œil', model: 'Veo 3.1', color: '#10B981' },
                { src: sc3Ville.src, label: 'Aérien · Ville', model: 'Kling 3.0', color: '#3B82F6' },
                { src: sc3Code.src, label: 'Plan moyen · Écran', model: 'Runway Gen-4.5', color: '#8B5CF6' },
                { src: sc3Silhouette.src, label: 'Contre-jour · Data', model: 'Sora 2', color: '#EC4899' },
              ],
            },
          ]

          return (
            <div>
              {/* Tab buttons */}
              <div className="flex justify-center gap-2 mb-6">
                {scenarios.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const el = document.getElementById(`scenario-${s.id}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium border border-white/[0.08] hover:border-orange-500/50 hover:text-orange-400 text-slate-400 transition-all"
                  >
                    <span className="text-white/80">{s.title}</span>
                    <span className="ml-1.5 text-slate-600">·</span>
                    <span className="ml-1.5">{s.genre.split('·')[0].trim()}</span>
                  </button>
                ))}
              </div>

              {/* Scenarios */}
              <div className="space-y-10">
                {scenarios.map((s) => (
                  <div key={s.id} id={`scenario-${s.id}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                      <div className="text-center">
                        <p className="text-xs font-medium text-orange-400 tracking-wider uppercase">{s.genre}</p>
                        <p className="text-sm text-white/70 font-display mt-0.5">« {s.title} »</p>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {s.shots.map((shot) => (
                        <div key={shot.label} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.15] transition-all">
                          <img src={shot.src} alt={shot.label} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-[11px] text-white font-medium">{shot.label}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: shot.color }} />
                              <span className="text-[9px] text-slate-400">{shot.model}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </section>

      {/* ═══ MODELS ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          7 modèles IA orchestrés
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          MISEN met en compétition chaque modèle et sélectionne le meilleur pour chaque plan
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Kling 3.0', tag: 'Réalisme · Physique', color: '#3B82F6', desc: 'Mouvements naturels, textures réalistes' },
            { name: 'Runway Gen-4.5', tag: 'Style · Contrôle', color: '#8B5CF6', desc: 'Direction artistique précise' },
            { name: 'Sora 2', tag: 'VFX · Émotion', color: '#EC4899', desc: 'Effets visuels, scènes complexes' },
            { name: 'Veo 3.1', tag: 'Dialogue · Audio', color: '#10B981', desc: 'Lip sync, voix intégrées' },
            { name: 'Seedance 2.0', tag: 'Mouvement · Corps', color: '#14B8A6', desc: 'Danse, sport, action' },
            { name: 'Wan 2.5', tag: 'Animation · Caméra', color: '#6366F1', desc: 'Mouvements de caméra fluides' },
            { name: 'Hailuo 2.3', tag: 'Cohérence', color: '#D946EF', desc: 'Personnages persistants' },
          ].map((m) => (
            <div key={m.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-sm font-medium text-white">{m.name}</span>
              </div>
              <p className="text-[10px] font-medium mb-1" style={{ color: m.color }}>{m.tag}</p>
              <p className="text-[11px] text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 13 ENGINES — Custom Pictos ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-3 tracking-tight">13 moteurs d&apos;analyse</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">Chaque scène passe au crible de moteurs spécialisés qui travaillent en synergie</p>
        </div>
        <button onClick={() => setShowEngines(!showEngines)} className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-sm text-slate-400 hover:text-white transition-all mb-4">
          {showEngines ? 'Masquer' : 'Voir'} les 13 moteurs <ChevronDown size={14} className={`transition-transform ${showEngines ? 'rotate-180' : ''}`} />
        </button>
        {showEngines && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 animate-fade-in">
            {ENGINES.map((e) => (
              <div key={e.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors group">
                <div className="w-6 h-6 flex-shrink-0 relative opacity-60 group-hover:opacity-100 transition-opacity">
                  <Image src={e.icon} alt={e.name} fill className="object-contain" />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{e.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight">Tarifs simples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '0€', desc: '3 projets · Prompts illimités', features: ["13 moteurs d'analyse", 'Assistant IA (3 req/mois)', 'Prompts optimisés par plan', 'Mode Simple', 'Export JSON'] },
            { name: 'Pro', price: '29€', desc: '20 projets · Mode Expert', features: ['Tout Free +', 'Assistant IA (30 req/mois)', 'Mode Expert complet', 'Timeline & Copilote IA', 'Génération intégrée (vos clés)'], glow: true },
            { name: 'Studio', price: '79€', desc: 'Illimité · API · Support', features: ['Tout Pro +', 'Assistant IA illimité', 'Projets illimités', 'API access', 'Support dédié'] },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 border transition-all ${p.glow ? 'bg-orange-600/[0.06] border-orange-500/30 shadow-lg shadow-orange-600/5' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <span className={`text-xs font-bold tracking-wider ${p.glow ? 'text-orange-400' : 'text-slate-500'}`}>{p.name.toUpperCase()}</span>
              <div className="mt-3 mb-1">
                <span className="font-display text-3xl text-white">{p.price}</span>
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <p className="text-xs text-slate-500 mb-5">{p.desc}</p>
              <div className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} className={p.glow ? 'text-orange-500' : 'text-slate-600'} /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${p.glow ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300'}`}>
                {p.glow ? t.common.getStarted : t.common.tryDemo}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1">
            Comparer les plans en détail <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-8 relative">
        <div className="beam w-full mb-6" />
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Play size={10} className="text-white ml-0.5" fill="white" />
              </div>
              <span className="font-display text-base text-gradient-copper">MISEN</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Mise en Scène Numérique — par Steve Moradel</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/demo" className="hover:text-slate-300 transition-colors">Démo</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Tarifs</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">{t.common.login}</Link>
            <Link href="/legal/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
            <Link href="/legal/mentions" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
