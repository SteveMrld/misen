'use client'

import { useState, useEffect } from 'react'
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

const HERO_SCENES = [
  { id: 'cinema', gradient: 'linear-gradient(135deg, #1a0e05 0%, #3d1f0a 30%, #0d0d1a 70%, #1a0e05 100%)', label: 'Cinéma' },
  { id: 'pub', gradient: 'linear-gradient(135deg, #120a20 0%, #2d1b4e 30%, #0d0d1a 70%, #120a20 100%)', label: 'Publicité' },
  { id: 'animation', gradient: 'linear-gradient(135deg, #051a1a 0%, #0d3d3d 30%, #0d0d1a 70%, #051a1a 100%)', label: 'Animation' },
  { id: 'docu', gradient: 'linear-gradient(135deg, #0a1a0a 0%, #1a3d1a 30%, #0d0d1a 70%, #0a1a0a 100%)', label: 'Documentaire' },
  { id: 'clip', gradient: 'linear-gradient(135deg, #1a050f 0%, #3d0a1f 30%, #0d0d1a 70%, #1a050f 100%)', label: 'Clip musical' },
  { id: 'bd', gradient: 'linear-gradient(135deg, #1a0f05 0%, #3d2a0a 30%, #0d0d1a 70%, #1a0f05 100%)', label: 'BD & Motion' },
]

const SHOWCASE_SCENES = [
  { id: 'sc_desert', bg: 'linear-gradient(135deg, #92400e, #78350f)', title: 'Desert Epic', desc: 'Plan large, lumière dorée' },
  { id: 'sc_urban', bg: 'linear-gradient(135deg, #334155, #1e293b)', title: 'Urban Noir', desc: 'Rue nocturne, néons, pluie' },
  { id: 'sc_ocean', bg: 'linear-gradient(135deg, #0369a1, #1e3a5f)', title: 'Deep Blue', desc: 'Plongée sous-marine' },
  { id: 'sc_forest', bg: 'linear-gradient(135deg, #065f46, #064e3b)', title: 'Forest Mist', desc: 'Forêt brumeuse, lumière filtrée' },
  { id: 'sc_space', bg: 'linear-gradient(135deg, #312e81, #1e1b4b)', title: 'Cosmic', desc: 'Nébuleuse stellaire' },
  { id: 'sc_portrait', bg: 'linear-gradient(135deg, #44403c, #292524)', title: 'Portrait', desc: 'Gros plan cinématique' },
]

const MODELS = [
  { name: 'Kling 3.0', color: '#3B82F6', specialty: 'Réalisme physique' },
  { name: 'Runway Gen-4.5', color: '#8B5CF6', specialty: 'Direction artistique' },
  { name: 'Sora 2', color: '#EC4899', specialty: 'Effets visuels' },
  { name: 'Veo 3.1', color: '#10B981', specialty: 'Dialogues synchronisés' },
  { name: 'Seedance 2.0', color: '#14B8A6', specialty: 'Mouvement organique' },
  { name: 'Wan 2.5', color: '#6366F1', specialty: 'Animation stylisée' },
  { name: 'Hailuo 2.3', color: '#D946EF', specialty: 'Cohérence temporelle' },
]

const ENGINES_SHORT = [
  'Intent Parser', 'Scénariste', 'Story Tracker', 'Shot Evaluator',
  'Crispifier', 'Human Align', 'Camera Control', 'Audio Tracker',
  'Style Guard', 'Color Harmonizer', 'Motion Flow', 'Score Composer', 'Video Assembly',
]

const USE_CASES = [
  { icon: Film, title: 'Court-métrage', desc: "Du script à l'écran en quelques heures" },
  { icon: Sparkles, title: 'Publicité', desc: 'Spots 15s, 30s, 60s prêts à diffuser' },
  { icon: Camera, title: 'Documentaire', desc: 'Narration, interviews, B-roll généré' },
  { icon: Music, title: 'Clip musical', desc: 'Storytelling visuel synchronisé' },
  { icon: Layers, title: 'BD & Motion', desc: 'Planches, storyboards animés' },
  { icon: Globe, title: 'Éducatif', desc: 'Capsules pédagogiques immersives' },
]

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function LandingHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t, locale } = useI18n()
  const [currentHero, setCurrentHero] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const fr = locale === 'fr'

  // Random start
  useEffect(() => {
    setCurrentHero(Math.floor(Math.random() * HERO_SCENES.length))
  }, [])

  // Hero rotation every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentHero(prev => (prev + 1) % HERO_SCENES.length)
        setTimeout(() => setIsTransitioning(false), 600)
      }, 600)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  // Parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-light">
      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
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
        {HERO_SCENES.map((scene, i) => (
          <div
            key={scene.id}
            style={{
              position: 'absolute', inset: 0,
              background: scene.gradient,
              opacity: currentHero === i && !isTransitioning ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        ))}

        {/* Light overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.2), rgba(246,247,249,0.7))' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '0 24px', transform: `translateY(${scrollY * 0.12}px)` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.05)', marginBottom: 32, fontSize: 12, color: 'rgba(15,17,21,0.45)', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#C56A2D', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            {HERO_SCENES[currentHero]?.label || 'Cinéma'} — {fr ? 'Généré par MISEN' : 'Generated by MISEN'}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0F1115', marginBottom: 24, fontWeight: 700 }}>
            {fr ? 'Du scénario' : 'From script'}<br />
            <span style={{ background: 'linear-gradient(135deg, #C56A2D, #D4974A, #C56A2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {fr ? "à l'écran" : 'to screen'}
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(15,17,21,0.45)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 300 }}>
            {fr
              ? "MISEN orchestre 13 moteurs d'analyse et 7 modèles IA pour transformer vos scénarios en productions cinématographiques."
              : 'MISEN orchestrates 13 analysis engines and 7 AI models to transform your screenplays into cinematic productions.'
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 56 }}>
            {[
              { n: '13', l: fr ? 'Moteurs' : 'Engines' },
              { n: '7', l: fr ? 'Modèles IA' : 'AI Models' },
              { n: '4K', l: fr ? 'Résolution' : 'Resolution' },
              { n: '<10s', l: fr ? 'Analyse' : 'Analysis' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: '#0F1115', letterSpacing: '-0.02em' }}>{s.n}</span>
                <span style={{ fontSize: 12, color: 'rgba(15,17,21,0.3)', fontWeight: 500 }}>{s.l}</span>
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
              { step: '01', icon: Wand2, title: fr ? 'Imaginez' : 'Imagine', desc: fr ? 'Écrivez ou importez votre scénario.' : 'Write or import your screenplay.' },
              { step: '02', icon: Eye, title: fr ? 'Analysez' : 'Analyze', desc: fr ? '13 moteurs dissèquent chaque scène.' : '13 engines dissect every scene.' },
              { step: '03', icon: Layers, title: fr ? 'Orchestrez' : 'Orchestrate', desc: fr ? 'Storyboard IA, timeline 5 pistes, musique.' : 'AI storyboard, 5-track timeline, music.' },
              { step: '04', icon: Zap, title: fr ? 'Générez' : 'Generate', desc: fr ? '7 modèles IA, assembly auto, export.' : '7 AI models, auto assembly, export.' },
            ].map(s => (
              <div key={s.step} className="landing-card">
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'rgba(197,106,45,0.35)', letterSpacing: '0.08em' }}>{s.step}</span>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F6F7F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 20 }}>
                  <s.icon size={20} color="#C56A2D" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: '#0F1115', marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(15,17,21,0.4)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
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
                {/* Replace with <video src={`/videos/${scene.id}.webm`} autoPlay muted loop playsInline /> */}
                <div style={{ position: 'absolute', inset: 0, background: scene.bg }} />
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
              <div key={m.name} className="landing-card" style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${m.color}12` }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.name.charAt(0)}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1115', marginBottom: 4, letterSpacing: '-0.01em' }}>{m.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(15,17,21,0.35)' }}>{m.specialty}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 64, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(15,17,21,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              {fr ? 'Propulsé par 13 moteurs d\'analyse' : 'Powered by 13 analysis engines'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 700, margin: '0 auto' }}>
              {ENGINES_SHORT.map(e => (
                <span key={e} style={{ padding: '6px 12px', borderRadius: 99, background: 'white', border: '1px solid rgba(0,0,0,0.04)', fontSize: 11, color: 'rgba(15,17,21,0.4)', fontWeight: 500 }}>{e}</span>
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
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(197,106,45,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <uc.icon size={20} color="#C56A2D" strokeWidth={1.5} />
                </div>
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
              { name: 'Free', price: '0€', desc: fr ? '3 projets' : '3 projects', features: fr ? ['13 moteurs d\'analyse', 'Assistant IA (3/mois)', 'Mode Simple', 'Export JSON'] : ['13 analysis engines', 'AI Assistant (3/mo)', 'Simple Mode', 'JSON Export'], hl: false },
              { name: 'Pro', price: '29€', desc: fr ? '20 projets' : '20 projects', features: fr ? ['Tout Free +', 'Assistant IA (30/mois)', 'Mode Expert complet', 'Timeline & Copilote', 'Génération intégrée'] : ['Everything Free +', 'AI Assistant (30/mo)', 'Full Expert Mode', 'Timeline & Copilot', 'Built-in Gen'], hl: true },
              { name: 'Studio', price: '79€', desc: fr ? 'Illimité' : 'Unlimited', features: fr ? ['Tout Pro +', 'IA illimitée', 'Projets illimités', 'API access', 'Support dédié'] : ['Everything Pro +', 'Unlimited AI', 'Unlimited Projects', 'API Access', 'Priority Support'], hl: false },
            ].map(p => (
              <div key={p.name} className="landing-card" style={{ padding: 28, transform: p.hl ? 'scale(1.02)' : undefined, border: p.hl ? '1px solid rgba(197,106,45,0.2)' : undefined, boxShadow: p.hl ? '0 8px 32px rgba(197,106,45,0.06)' : undefined }}>
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
