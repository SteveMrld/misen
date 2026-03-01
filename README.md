# MISEN V8 — Mise en Scène Numérique

Studio IA d'orchestration pour la production cinématographique.

Transformez un scénario en plan de production complet : découpage, assignation de modèles IA (Kling 3.0, Runway Gen-4.5, Sora 2, Veo 3.1, Seedance 2.0, Wan 2.5, Hailuo 2.3), génération de prompts optimisés, calcul des coûts, timeline, et export multi-format.

**Live** : [misen-ten.vercel.app](https://misen-ten.vercel.app)

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS (Design System custom dark theme)
- **Auth & BDD** : Supabase (Auth + PostgreSQL)
- **Paiements** : Stripe (Free / Pro 29€ / Studio 79€)
- **PDF** : pdfkit (server-side)
- **Déploiement** : Vercel

## Fonctionnalités

### 13 moteurs d'analyse
Intent Parser, Grammar, Character Bible, Contextual Prompt, Model Syntax, Negative Prompt, Compliance, Continuity, Tension Curve, Cost Router (MCAP), Consistency, Memory, Scene Splitter

### 7 modèles IA avec scoring MCAP
Kling 3.0, Runway Gen-4.5, Sora 2, Veo 3.1, Seedance 2.0, Wan 2.5, Hailuo 2.3

### Interface
- **Mode Simple** : coller → analyser → exporter
- **Mode Expert** : 7 onglets (Script, Analyse, Timeline, Copilote IA, Médias, Sous-titres, Voix off)
- **Double mode** : copier le prompt + lien studio IA OU générer directement (si clé API configurée)
- **Démo** : 3 scénarios interactifs (court-métrage, publicité, éducatif) avec player 60fps
- **Pricing** : Page dédiée avec Free/Pro/Studio, toggle annuel -20%, FAQ
- **Onboarding** : guide 4 étapes pour nouveaux utilisateurs
- **Legal** : CGU, CGV, Confidentialité RGPD, Mentions légales
- **Responsive** : sidebar drawer mobile, grilles adaptatives

### Export 6 formats
PDF (Bible de Production), HTML, JSON, CSV, Fountain, Prompts TXT

## Structure

```
misen/
├── app/
│   ├── (auth)/            # Login, Register
│   ├── (dashboard)/       # Dashboard, Project, Settings
│   ├── (public)/          # Demo, Pricing, Legal (CGU, CGV, Privacy, Mentions)
│   ├── api/               # 25 routes API
├── components/
│   ├── layout/            # Sidebar, Header
│   └── ui/                # 9 composants (Onboarding, Logo, StoryboardSVG, ModelBadge, ComparePanel, LegalLayout...)
├── lib/
│   ├── engines/           # 21 moteurs (3 000 lignes)
│   ├── demo/              # 3 scénarios démo
│   └── supabase/          # Clients browser & server
└── public/
    └── og-image.png       # Open Graph V8
```

## Sessions de développement

- [x] Session 1-3 — Fondations, Auth, Dashboard, CRUD
- [x] Session 4 — 13 moteurs d'analyse
- [x] Session 5 — Stripe, plans, API keys
- [x] Session 6 — Polish, lancement, SEO
- [x] Session 7 — Timeline, sous-titres, voix off
- [x] Session 8 — Copilote IA, banque média, mode démo
- [x] Session 9 — Mode simple/expert, gestion d'erreurs
- [x] Session 10 — Storyboard SVG, badges modèles, courbe tension
- [x] Session 11 — Compare MCAP, scoring transparent
- [x] Session 12 — Sources MCAP documentées
- [x] Session 13 — Responsive, Export PDF, Onboarding, SEO
- [x] Session 14 (V8) — Démo 3 scénarios 60fps, double mode, pricing, onboarding V2, legal, polish

---

**Porteur de projet** : Steve Moradel
**Développement** : Claude (Anthropic)
**© 2026 Jabrilia Éditions** — Tous droits réservés
