# MISEN V7 — Mise en Scène Numérique

Studio IA d'orchestration pour la production cinématographique.

Transformez un scénario en plan de production complet : découpage, assignation de modèles IA (Kling 3.0, Runway Gen-4.5, Sora 2, Veo 3.1, Seedance 2.0, Wan 2.5, Hailuo 2.3), génération de prompts optimisés, calcul des coûts, timeline, et export multi-format.

**Live** : [misen-ten.vercel.app](https://misen-ten.vercel.app)

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS (Design System custom dark theme)
- **Auth & BDD** : Supabase (Auth + PostgreSQL)
- **Paiements** : Stripe (Free / Studio / Production)
- **PDF** : pdfkit (server-side)
- **Déploiement** : Vercel

## Fonctionnalités

### 13 moteurs d'analyse
Intent Parser, Grammar, Character Bible, Contextual Prompt, Model Syntax, Negative Prompt, Compliance, Continuity, Tension Curve, Cost Router, Consistency, Memory, Scene Splitter

### 7 modèles IA avec scoring MCAP
Kling 3.0, Runway Gen-4.5, Sora 2, Veo 3.1, Seedance 2.0, Wan 2.5, Hailuo 2.3

### Interface
- **Mode Simple** : coller → analyser → exporter
- **Mode Expert** : 7 onglets (Script, Analyse, Timeline, Copilote IA, Médias, Sous-titres, Voix off)
- **Responsive** : sidebar drawer mobile, grilles adaptatives
- **Onboarding** : guide 3 étapes pour nouveaux utilisateurs
- **Raccourcis clavier** : navigation rapide entre onglets

### Export 6 formats
PDF (Bible de Production), HTML, JSON, CSV, Fountain, Prompts TXT

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/SteveMrld/misen.git
cd misen

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les clés Supabase et Stripe

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
misen/
├── app/
│   ├── (auth)/            # Login, Register
│   ├── (dashboard)/       # Dashboard, Project, Settings
│   ├── (public)/          # Demo
│   ├── api/               # 20+ routes API
│   │   ├── projects/      # CRUD, analyze, export, copilot, media, subtitles, voiceover
│   │   ├── stripe/        # Checkout, portal, webhook
│   │   └── auth/          # Callback
│   ├── sitemap.ts         # SEO sitemap
│   ├── robots.ts          # SEO robots
│   ├── manifest.ts        # PWA manifest
│   ├── not-found.tsx      # 404
│   ├── error.tsx          # Error boundary
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Sidebar (responsive), Header
│   └── ui/                # Onboarding, Logo, StoryboardSVG, ModelBadge, ComparePanel, KeyboardShortcuts
├── lib/
│   ├── engines/           # 20 moteurs (pipeline, intent, grammar, tension, export-pdf...)
│   ├── supabase/          # Clients browser & server
│   ├── db/                # Database helpers
│   └── data/              # Demo scenario
├── middleware.ts           # Auth middleware
├── tailwind.config.ts     # Design System complet
└── public/
    └── images/            # 38 illustrations GPT
```

## Sessions de développement

- [x] Session 1-3 — Fondations, Auth, Dashboard, CRUD
- [x] Session 4 — 13 moteurs d'analyse
- [x] Session 5 — Stripe, plans, API keys
- [x] Session 6 — Polonais, lancement, i18n
- [x] Session 7 — Timeline, sous-titres, voix off
- [x] Session 8 — Copilote IA, banque média, mode démo
- [x] Session 9 — Mode simple/expert, gestion d'erreurs
- [x] Session 10 — Visuel (storyboard SVG, badges modèles, courbe tension)
- [x] Session 11 — Compare MCAP, scoring transparent
- [x] Session 12 — Sources MCAP documentées
- [x] Session 13 — Responsive, Export PDF, Onboarding, SEO

---

**Porteur de projet** : Steve Moradel
**Développement** : Claude (Anthropic)
**© 2026 Jabrilia Éditions** — Tous droits réservés
