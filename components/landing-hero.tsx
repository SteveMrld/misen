'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import {
  Play, ArrowRight, ChevronDown, Sparkles, Film, Wand2, Check,
  Layers, Zap, Eye, Music, Camera, Globe
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// VIDEO HERO SYSTEM — 6 rotating backgrounds
// Replace gradient placeholders with <video> when files are ready
// ═══════════════════════════════════════════════════════════

const HERO_SCENES_BASE = [
  { id: 'cinema', video: '/videos/hero_cybercity.mp4', label: 'Cinéma' },
  { id: 'pub', video: '/videos/hero_car.mp4', label: 'Publicité' },
  { id: 'animation', video: '/videos/hero_animation.mp4', label: 'Animation' },
  { id: 'portrait', video: '/videos/hero_portrait.mp4', label: 'Portrait' },
  { id: 'clip', video: '/videos/hero_desert.mp4', label: 'Clip musical' },
  { id: 'action', video: '/videos/hero_action.mp4', label: 'Action' },
  { id: 'cinematic', video: '/videos/hero_cinematic.mp4', label: 'Cinématique' },
  { id: 'atmosphere', video: '/videos/hero_atmosphere.mp4', label: 'Atmosphère' },
]

// Fisher-Yates shuffle for truly random order each visit
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SHOWCASE_SCENES = [
  { id: 'sc_dance', video: '/videos/show_dance.mp4', title: 'Clip musical', desc: 'Danseur, jeux de lumière' },
  { id: 'sc_studio', video: '/videos/show_studio.mp4', title: 'Behind the Scenes', desc: 'Plateau de tournage' },
  { id: 'sc_abstract', video: '/videos/show_abstract.mp4', title: 'Motion Design', desc: 'Formes lumineuses abstraites' },
  { id: 'sc_perfume', video: '/videos/show_perfume.mp4', title: 'Publicité Luxe', desc: 'Produit, particules dorées' },
]

const MODELS = [
  { name: 'Kling 3.0', color: '#3B82F6', specialty: 'Réalisme physique', logo: '/images/models/kling.svg' },
  { name: 'Runway Gen-4.5', color: '#8B5CF6', specialty: 'Direction artistique', logo: '/images/models/runway.svg' },
  { name: 'Sora 2', color: '#EC4899', specialty: 'Effets visuels', logo: '/images/models/sora.svg' },
  { name: 'Veo 3.1', color: '#10B981', specialty: 'Dialogues synchronisés', logo: '/images/models/veo.svg' },
  { name: 'Seedance 2.0', color: '#14B8A6', specialty: 'Mouvement organique', logo: '/images/models/seedance.svg' },
  { name: 'Wan 2.5', color: '#6366F1', specialty: 'Animation stylisée', logo: '/images/models/wan.svg' },
  { name: 'Hailuo 2.3', color: '#D946EF', specialty: 'Cohérence temporelle', logo: '/images/models/hailuo.svg' },
]

const ENGINES_DATA = [
  { name: 'Intent Parser', img: '/images/icon_eng_intent_parser.png' },
  { name: 'Scénariste', img: '/images/icon_eng_scenarist.png' },
  { name: 'Story Tracker', img: '/images/icon_eng_story_tracker.png' },
  { name: 'Shot Evaluator', img: '/images/icon_eng_shot_evaluator.png' },
  { name: 'Crispifier', img: '/images/icon_eng_crispifier.png' },
  { name: 'Human Align', img: '/images/icon_eng_human_align.png' },
  { name: 'Camera Control', img: '/images/icon_eng_camera_control.png' },
  { name: 'Audio Tracker', img: '/images/icon_eng_audio_tracker.png' },
  { name: 'Style Guard', img: '/images/icon_eng_style_guard.png' },
  { name: 'Color Harmonizer', img: '/images/icon_eng_color_harmonizer.png' },
  { name: 'Motion Flow', img: '/images/icon_eng_motion_flow.png' },
  { name: 'Score Composer', img: null },
  { name: 'Video Assembly', img: null },
]

const USE_CASES = [
  { img: '/images/icon_court_metrage.png', title: 'Court-métrage', desc: "Du script à l'écran en quelques heures" },
  { img: '/images/icon_publicite.png', title: 'Publicité', desc: 'Spots 15s, 30s, 60s prêts à diffuser' },
  { img: '/images/icon_documentaire.png', title: 'Documentaire', desc: 'Narration, interviews, B-roll généré' },
  { img: '/images/icon_clip_musical.png', title: 'Clip musical', desc: 'Storytelling visuel synchronisé' },
  { img: '/images/icon_bd.png', title: 'BD & Motion', desc: 'Planches, storyboards animés' },
  { img: '/images/icon_educatif.png', title: 'Éducatif', desc: 'Capsules pédagogiques immersives' },
]

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function LandingHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t, locale } = useI18n()
  const [heroScenes] = useState(() => shuffleArray(HERO_SCENES_BASE))
  const [currentHero, setCurrentHero] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [hasInvite, setHasInvite] = useState(false)
  const fr = locale === 'fr'

  // Check for invite cookie
  useEffect(() => {
    const match = document.cookie.match(/misen_invite=([^;]+)/)
    if (match) setHasInvite(true)
  }, [])

  // Hero rotation: advance when current video ends
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const onVideoEnd = useCallback(() => {
    setCurrentHero(prev => (prev + 1) % heroScenes.length)
  }, [heroScenes.length])

  // When currentHero changes, play the new video from start
  useEffect(() => {
    const vid = videoRefs.current[currentHero]
    if (vid) {
      vid.currentTime = 0
      vid.play().catch(() => {})
    }
    // Safety fallback if video fails to trigger onEnded
    const fallback = setTimeout(() => {
      setCurrentHero(prev => (prev + 1) % heroScenes.length)
    }, 8000)
    return () => clearTimeout(fallback)
  }, [currentHero])

  // Parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-light">
      {/* ═══ INVITE BANNER ═══ */}
      {hasInvite && !isLoggedIn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: 'linear-gradient(90deg, #C56A2D, #6C4DFF)', padding: '8px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'white', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontSize: 10 }}>INVITATION</span>
            {fr ? 'Votre invitation est activée. Créez votre compte pour commencer.' : 'Your invitation is active. Create your account to start.'}
            <Link href="/register" style={{ color: 'white', textDecoration: 'underline', fontWeight: 700, marginLeft: 4 }}>
              {fr ? 'Créer mon compte →' : 'Create account →'}
            </Link>
          </p>
        </div>
      )}
      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: hasInvite && !isLoggedIn ? 34 : 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'top 0.3s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #C56A2D, #A35520)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(197,106,45,0.2)' }}>
              <Play size={13} color="white" fill="white" style={{ marginLeft: 1 }} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: '#0F1115', letterSpacing: '-0.02em', fontWeight: 700 }}>MISEN</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
            {[
              { href: '#pipeline', label: 'Pipeline' },
              { href: '#showcase', label: fr ? 'Créations' : 'Showcase' },
              { href: '#models', label: fr ? 'Modèles IA' : 'AI Models' },
              { href: '#usecases', label: fr ? 'Cas d\'usage' : 'Use cases' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: 13, color: 'rgba(15,17,21,0.5)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0F1115')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(15,17,21,0.5)')}
              >{l.label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ height: 36, padding: '0 20px', borderRadius: 99, background: '#C56A2D', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 13, color: 'rgba(15,17,21,0.5)', fontWeight: 500, textDecoration: 'none' }}>
                  {t.common.login}
                </Link>
                <Link href="/register" style={{ height: 36, padding: '0 20px', borderRadius: 99, background: '#0F1115', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  {t.common.getStarted}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ HERO — VIDEO BACKGROUND ═══ */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {heroScenes.map((scene, i) => (
          <div
            key={scene.id}
            style={{
              position: 'absolute', inset: 0,
              opacity: currentHero === i ? 1 : 0,
              transition: 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <video
              ref={el => { videoRefs.current[i] = el }}
              src={scene.video}
              autoPlay={i === 0}
              muted
              playsInline
              onEnded={currentHero === i ? onVideoEnd : undefined}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}

        {/* Light overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5), rgba(0,0,0,0.7))' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '0 24px', transform: `translateY(${scrollY * 0.12}px)` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: 32, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#C56A2D', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            {heroScenes[currentHero]?.label || 'Cinéma'} — {fr ? 'Généré par MISEN' : 'Generated by MISEN'}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff', marginBottom: 24, fontWeight: 700, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {fr ? 'Du scénario' : 'From script'}<br />
            <span style={{ background: 'linear-gradient(135deg, #C56A2D, #D4974A, #C56A2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {fr ? "à l'écran" : 'to screen'}
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.8)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 400 }}>
            {fr
              ? "MISEN orchestre 17 moteurs d'analyse et 7 modèles IA pour transformer vos scénarios en productions cinématographiques."
              : 'MISEN orchestrates 17 analysis engines and 7 AI models to transform your screenplays into cinematic productions.'
            }
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link href={isLoggedIn ? '/dashboard' : '/register'} className="landing-cta-primary">
              {fr ? 'Commencer gratuitement' : 'Start for free'} <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="landing-cta-secondary">
              <Play size={14} color="#C56A2D" fill="#C56A2D" /> {fr ? 'Voir la démo' : 'Watch demo'}
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 48, marginTop: 56 }}>
            {[
              { n: '13', l: fr ? 'Moteurs' : 'Engines' },
              { n: '7', l: fr ? 'Modèles IA' : 'AI Models' },
              { n: '4K', l: fr ? 'Résolution' : 'Resolution' },
              { n: '<10s', l: fr ? 'Analyse' : 'Analysis' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 70 }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }} className="animate-bounce">
          <ChevronDown size={20} color="#0F1115" />
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section id="pipeline" className="landing-section" style={{ background: '#F6F7F9' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="landing-label" style={{ color: '#C56A2D' }}>Pipeline</p>
            <h2 className="landing-h2">{fr ? 'Quatre étapes. Un film.' : 'Four steps. One film.'}</h2>
            <p className="landing-subtitle">{fr ? "De l'écriture à l'export, MISEN guide chaque phase." : 'From writing to export, MISEN guides every phase.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { step: '01', img: '/images/icon_step_imaginez.png', title: fr ? 'Imaginez' : 'Imagine', desc: fr ? 'Écrivez ou importez votre scénario.' : 'Write or import your screenplay.' },
              { step: '02', img: '/images/icon_step_analysez.png', title: fr ? 'Analysez' : 'Analyze', desc: fr ? '17 moteurs dissèquent chaque scène.' : '17 engines dissect every scene.' },
              { step: '03', img: '/images/icon_step_orchestrez.png', title: fr ? 'Orchestrez' : 'Orchestrate', desc: fr ? 'Storyboard IA, timeline 5 pistes, musique.' : 'AI storyboard, 5-track timeline, music.' },
              { step: '04', img: '/images/icon_step_generez.png', title: fr ? 'Générez' : 'Generate', desc: fr ? '7 modèles IA, assembly auto, export.' : '7 AI models, auto assembly, export.' },
            ].map(s => (
              <div key={s.step} className="landing-card">
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'rgba(197,106,45,0.35)', letterSpacing: '0.08em' }}>{s.step}</span>
                <div style={{ width: 72, height: 72, borderRadius: 16, marginTop: 16, marginBottom: 20, background: '#0f1115', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={s.img} alt={s.title} style={{ width: 48, height: 48, objectFit: 'contain' }} /></div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: '#0F1115', marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(15,17,21,0.4)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW — Comment ça marche concrètement ═══ */}
      <section id="workflow" className="landing-section" style={{ background: '#FFFFFF' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="landing-label" style={{ color: '#C56A2D' }}>{fr ? 'VOTRE WORKFLOW' : 'YOUR WORKFLOW'}</p>
            <h2 className="landing-h2">{fr ? 'De l\'idée à la vidéo en 5 minutes' : 'From idea to video in 5 minutes'}</h2>
            <p className="landing-subtitle">{fr ? 'MISEN pense votre film. Vous n\'avez qu\'à cliquer.' : 'MISEN thinks your film. You just click.'}</p>
          </div>

          {/* Timeline workflow */}
          <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 28, top: 28, bottom: 28, width: 2, background: 'linear-gradient(to bottom, #C56A2D, #6C4DFF)', opacity: 0.15, borderRadius: 99 }} />

            {[
              {
                step: '1',
                title: fr ? 'Écrivez votre scénario' : 'Write your screenplay',
                desc: fr ? 'Collez votre texte, importez un fichier, ou choisissez un template professionnel prêt à l\'emploi. Court-métrage, pub, clip — tout est possible.' : 'Paste your text, import a file, or pick a professional template. Short film, ad, music video — anything goes.',
                where: 'MISEN',
                color: '#C56A2D',
              },
              {
                step: '2',
                title: fr ? 'Lancez l\'analyse' : 'Run the analysis',
                desc: fr ? '17 moteurs IA dissèquent chaque mot : découpage en scènes, plans, émotions, personnages, mouvements de caméra, courbe de tension. Tout est automatique.' : '13 AI engines dissect every word: scene breakdown, shots, emotions, characters, camera movements, tension curve. Fully automatic.',
                where: 'MISEN',
                color: '#C56A2D',
              },
              {
                step: '3',
                title: fr ? 'Récupérez vos prompts' : 'Get your prompts',
                desc: fr ? 'Pour chaque plan, MISEN génère un prompt optimisé et adapté à la syntaxe du modèle IA recommandé. Copiez-le en un clic.' : 'For each shot, MISEN generates an optimized prompt adapted to the recommended AI model\'s syntax. Copy it in one click.',
                where: 'MISEN',
                color: '#C56A2D',
              },
              {
                step: '4',
                title: fr ? 'Générez sur la plateforme IA' : 'Generate on the AI platform',
                desc: fr ? 'Collez le prompt dans Kling, Runway, Sora ou Veo. Le prompt est déjà optimisé — le résultat sera cinématographique dès le premier essai.' : 'Paste the prompt into Kling, Runway, Sora or Veo. The prompt is pre-optimized — the result will be cinematic on the first try.',
                where: fr ? 'Kling / Runway / Sora / Veo' : 'Kling / Runway / Sora / Veo',
                color: '#6C4DFF',
              },
              {
                step: '5',
                title: fr ? 'Votre film est prêt' : 'Your film is ready',
                desc: fr ? 'Chaque plan est cohérent avec les autres grâce aux tokens de personnages, à la bible de style et au tracking de continuité. Assemblez et publiez.' : 'Every shot is consistent thanks to character tokens, style bible and continuity tracking. Assemble and publish.',
                where: fr ? 'Résultat' : 'Result',
                color: '#10B981',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, marginBottom: i < 4 ? 32 : 0, position: 'relative' }}>
                {/* Step number */}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${item.color}10`, border: `2px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: item.color }}>{item.step}</span>
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#0F1115', letterSpacing: '-0.02em', margin: 0 }}>{item.title}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: item.color, background: `${item.color}10`, padding: '3px 10px', borderRadius: 99 }}>{item.where}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(15,17,21,0.45)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <p style={{ fontSize: 14, color: 'rgba(15,17,21,0.3)', marginBottom: 20, fontStyle: 'italic' }}>
              {fr ? '→ Vous ne revenez jamais dans MISEN pour coller quoi que ce soit. MISEN est le cerveau, l\'IA vidéo est le bras.' : '→ You never come back to MISEN to paste anything. MISEN is the brain, the video AI is the arm.'}
            </p>
            <a href="/register" className="landing-cta-primary">{hasInvite ? (fr ? 'Créer mon compte' : 'Create my account') : (fr ? 'Demander un accès' : 'Request access')} →</a>
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE ═══ */}
      <section id="showcase" className="landing-section" style={{ background: '#FFFFFF' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="landing-label" style={{ color: '#6C4DFF' }}>Showcase</p>
            <h2 className="landing-h2">{fr ? 'Ce que MISEN peut créer' : 'What MISEN can create'}</h2>
            <p className="landing-subtitle">{fr ? 'Chaque style, chaque ambiance — en quelques minutes.' : 'Every style, every mood — in minutes.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {SHOWCASE_SCENES.map(scene => (
              <div key={scene.id} className="landing-video-card" style={{ aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                <video
                  src={scene.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'white', fontSize: 18, letterSpacing: '-0.02em' }}>{scene.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>{scene.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MODELS ═══ */}
      <section id="models" className="landing-section" style={{ background: '#F6F7F9' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="landing-label" style={{ color: '#6C4DFF' }}>{fr ? 'Écosystème IA' : 'AI Ecosystem'}</p>
            <h2 className="landing-h2">{fr ? '7 modèles. Le meilleur pour chaque plan.' : '7 models. The best for every shot.'}</h2>
            <p className="landing-subtitle">{fr ? 'MISEN sélectionne automatiquement le modèle optimal.' : 'MISEN automatically selects the optimal model.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {MODELS.map(m => (
              <div key={m.name} className="landing-card" style={{ padding: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 16, background: '#0f1115', backgroundImage: `url(${m.logo})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: 'contain', backgroundOrigin: 'content-box', boxSizing: 'border-box', padding: 10 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1115', marginBottom: 4, letterSpacing: '-0.01em' }}>{m.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(15,17,21,0.35)' }}>{m.specialty}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 64, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(15,17,21,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              {fr ? 'Propulsé par 17 moteurs d\'analyse' : 'Powered by 17 analysis engines'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 700, margin: '0 auto' }}>
              {ENGINES_DATA.map(e => (
                <span key={e.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 4px', borderRadius: 99, background: 'white', border: '1px solid rgba(0,0,0,0.04)', fontSize: 11, color: 'rgba(15,17,21,0.5)', fontWeight: 500 }}>
                  {e.img ? <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115' }}><img src={e.img} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /></span> : <span style={{ width: 28, height: 28, borderRadius: 99, background: 'rgba(197,106,45,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C56A2D', fontWeight: 700, flexShrink: 0 }}>AI</span>}
                  {e.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section id="usecases" className="landing-section" style={{ background: '#FFFFFF' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="landing-label" style={{ color: '#C56A2D' }}>{fr ? "Cas d'usage" : 'Use cases'}</p>
            <h2 className="landing-h2">{fr ? 'Un studio pour chaque histoire' : 'A studio for every story'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {USE_CASES.map(uc => (
              <div key={uc.title} className="landing-usecase">
                <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: '#0f1115', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={uc.img} alt={uc.title} style={{ width: 36, height: 36, objectFit: 'contain' }} /></div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#0F1115', marginBottom: 6, letterSpacing: '-0.02em' }}>{uc.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(15,17,21,0.4)', lineHeight: 1.6 }}>{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: '128px 24px', background: '#0F1115', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'rgba(197,106,45,0.08)', borderRadius: '50%', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '25%', width: 300, height: 300, background: 'rgba(108,77,255,0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>
            {fr ? 'Prêt à créer ?' : 'Ready to create?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            {fr ? 'Rejoignez les créateurs qui transforment leurs idées en productions cinématographiques.' : 'Join creators turning ideas into cinematic productions.'}
          </p>
          <Link href={isLoggedIn ? '/dashboard' : '/register'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, height: 56, padding: '0 40px', borderRadius: 99, fontSize: 16, fontWeight: 600, color: 'white', textDecoration: 'none',
            background: 'linear-gradient(135deg, #C56A2D, #D4974A, #C56A2D)', boxShadow: '0 4px 24px rgba(197,106,45,0.3)',
          }}>
            {fr ? 'Commencer maintenant' : 'Start now'} <ArrowRight size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 56, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            <span>{fr ? 'Gratuit pour commencer' : 'Free to start'}</span>
            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
            <span>{fr ? 'Aucune carte requise' : 'No credit card'}</span>
            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
            <span>RGPD</span>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="landing-section" style={{ background: '#F6F7F9' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="landing-label" style={{ color: '#C56A2D' }}>Tarifs</p>
            <h2 className="landing-h2">{fr ? 'Simple et transparent' : 'Simple and transparent'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { name: 'Free', price: '0€', desc: fr ? '3 projets' : '3 projects', features: fr ? ['17 moteurs d\'analyse', 'Assistant IA (3/mois)', 'Mode Simple', 'Export JSON'] : ['17 analysis engines', 'AI Assistant (3/mo)', 'Simple Mode', 'JSON Export'], hl: false },
              { name: 'Pro', price: '29€', desc: fr ? '20 projets' : '20 projects', features: fr ? ['Tout Free +', 'Assistant IA (30/mois)', 'Mode Expert complet', 'Timeline & Copilote', 'Génération intégrée'] : ['Everything Free +', 'AI Assistant (30/mo)', 'Full Expert Mode', 'Timeline & Copilot', 'Built-in Gen'], hl: true },
              { name: 'Studio', price: '79€', desc: fr ? 'Illimité' : 'Unlimited', features: fr ? ['Tout Pro +', 'IA illimitée', 'Projets illimités', 'API access', 'Support dédié'] : ['Everything Pro +', 'Unlimited AI', 'Unlimited Projects', 'API Access', 'Priority Support'], hl: false },
            ].map(p => (
              <div key={p.name} className="landing-card" style={{ padding: 28, alignItems: 'flex-start', textAlign: 'left', transform: p.hl ? 'scale(1.02)' : undefined, border: p.hl ? '1px solid rgba(197,106,45,0.2)' : undefined, boxShadow: p.hl ? '0 8px 32px rgba(197,106,45,0.06)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: p.hl ? '#C56A2D' : 'rgba(15,17,21,0.25)' }}>{p.name.toUpperCase()}</span>
                  {p.hl && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#C56A2D', background: 'rgba(197,106,45,0.08)', padding: '2px 8px', borderRadius: 99 }}>POPULAIRE</span>}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, color: '#0F1115', letterSpacing: '-0.02em' }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: 'rgba(15,17,21,0.25)' }}>/mois</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(15,17,21,0.3)', marginBottom: 24 }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(15,17,21,0.55)' }}>
                      <Check size={14} color={p.hl ? '#C56A2D' : 'rgba(15,17,21,0.12)'} /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" style={{
                  display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: p.hl ? '#0F1115' : '#F6F7F9', color: p.hl ? 'white' : 'rgba(15,17,21,0.5)',
                }}>
                  {p.hl ? (fr ? 'Commencer' : 'Get started') : (fr ? 'Essayer' : 'Try it')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: '40px 24px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #C56A2D, #A35520)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={11} color="white" fill="white" style={{ marginLeft: 1 }} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#0F1115', letterSpacing: '-0.02em', fontWeight: 700 }}>MISEN</span>
            <span style={{ fontSize: 11, color: 'rgba(15,17,21,0.2)', marginLeft: 4 }}>Mise en Scène Numérique</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, fontSize: 12, color: 'rgba(15,17,21,0.25)', fontWeight: 500 }}>
            {[
              { href: '/demo', label: 'Démo' },
              { href: '/pricing', label: 'Tarifs' },
              { href: '/login', label: t.common.login },
              { href: '/legal/cgu', label: 'CGU' },
              { href: '/legal/cgv', label: 'CGV' },
              { href: '/legal/privacy', label: 'Confidentialité' },
              { href: '/legal/mentions', label: 'Mentions légales' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'inherit', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(15,17,21,0.15)' }}>© 2026 Steve Moradel — Jabrilia Éditions</p>
        </div>
      </footer>

      {/* ═══ SCOPED STYLES ═══ */}
      <style jsx global>{`
        .landing-light { background: #F6F7F9; color: #0F1115; min-height: 100vh; }
        .landing-section { padding: 128px 24px; }
        .landing-container { max-width: 1200px; margin: 0 auto; }
        .landing-label { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .landing-h2 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3.5rem); color: #0F1115; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 20px; }
        .landing-subtitle { color: rgba(15,17,21,0.35); font-size: 18px; max-width: 520px; margin: 0 auto; line-height: 1.7; }
        .landing-card {
          padding: 32px; border-radius: 16px; background: white; border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .landing-card:hover { border-color: rgba(197,106,45,0.15); box-shadow: 0 8px 32px rgba(197,106,45,0.04); transform: translateY(-2px); }
        .landing-usecase { display: flex; align-items: flex-start; gap: 20px; padding: 24px; border-radius: 16px; transition: background 0.3s; }
        .landing-usecase:hover { background: #F6F7F9; }
        .landing-video-card { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
        .landing-video-card:hover { transform: scale(1.02); }
        .landing-cta-primary {
          display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 32px;
          border-radius: 99px; background: #0F1115; color: white; font-size: 15px; font-weight: 600;
          text-decoration: none; transition: all 0.3s; box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .landing-cta-primary:hover { background: rgba(15,17,21,0.8); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .landing-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 32px;
          border-radius: 99px; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.06); color: #0F1115; font-size: 15px; font-weight: 600;
          text-decoration: none; transition: all 0.3s;
        }
        .landing-cta-secondary:hover { background: white; transform: translateY(-2px); }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 768px) {
          .landing-section { padding: 80px 16px; }
          .hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
