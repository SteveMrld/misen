# MISEN V7 — Mise en Scène Numérique

Studio IA d'orchestration pour la production cinématographique.

Transformez un scénario en plan de production complet : découpage, assignation de modèles IA (Kling, Runway, Sora, Veo, Seedance, Wan, Hailuo), génération de prompts optimisés, calcul des coûts, timeline, et export multi-format.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS (Design System custom)
- **Auth & BDD** : Supabase
- **Déploiement** : Vercel

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/SteveMrld/misen.git
cd misen

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
misen/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # Dashboard, Settings
│   ├── api/auth/        # Auth callback
│   ├── globals.css      # Design System CSS
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Entry point
├── components/
│   ├── layout/          # Sidebar, Header
│   └── ui/              # Logo, composants réutilisables
├── lib/
│   ├── supabase/        # Clients browser & server
│   └── utils/           # Helpers (cn, etc.)
├── middleware.ts         # Auth middleware
└── tailwind.config.ts   # Design System complet
```

## Roadmap V7

- [x] Session 1 — Fondations (Next.js + Auth + Dashboard)
- [ ] Session 2 — Migration des 13 moteurs
- [ ] Session 3 — Persistance (CRUD projets)
- [ ] Session 4 — Connexion modèles IA
- [ ] Session 5 — Paiement + Plans (Stripe)
- [ ] Session 6 — Polish + Lancement

---

**Porteur de projet** : Steve Moradel
**Développement** : Claude (Anthropic)
**Confidentiel** — © 2026 Jabrilia Éditions
