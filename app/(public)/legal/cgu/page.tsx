'use client'

import { LegalLayout } from '@/components/ui/legal-layout'

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="1er mars 2026">
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 1 — Objet</h2>
        <p>Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d&apos;utilisation de la plateforme MISEN (accessible à l&apos;adresse misen-ten.vercel.app), ci-après « la Plateforme », éditée par Steve Moradel.</p>
        <p className="mt-2">MISEN est un studio de production cinématographique assisté par intelligence artificielle. La Plateforme permet l&apos;analyse de scénarios, la génération de prompts optimisés pour des modèles de génération vidéo IA, et l&apos;organisation de projets de production.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 2 — Acceptation des CGU</h2>
        <p>L&apos;accès et l&apos;utilisation de la Plateforme impliquent l&apos;acceptation pleine et entière des présentes CGU. En créant un compte, l&apos;Utilisateur reconnaît avoir lu et accepté les présentes CGU.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 3 — Inscription et compte utilisateur</h2>
        <p>L&apos;utilisation de certaines fonctionnalités requiert la création d&apos;un compte. L&apos;Utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Toute activité réalisée depuis son compte est sous sa responsabilité.</p>
        <p className="mt-2">L&apos;Utilisateur peut supprimer son compte à tout moment depuis les paramètres de la Plateforme ou en contactant l&apos;éditeur.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 4 — Description des services</h2>
        <p>La Plateforme offre les services suivants :</p>
        <p className="mt-2"><strong className="text-white">Analyse de scénario :</strong> traitement automatisé par 13 moteurs d&apos;analyse (cadrage, tension narrative, continuité, compliance, etc.).</p>
        <p className="mt-2"><strong className="text-white">Génération de prompts :</strong> création de prompts optimisés pour chaque plan, adaptés au modèle IA assigné (Kling, Runway, Sora, Veo, etc.).</p>
        <p className="mt-2"><strong className="text-white">Assistant scénariste IA :</strong> aide à l&apos;écriture et à la structuration de scénarios.</p>
        <p className="mt-2"><strong className="text-white">Génération vidéo (optionnelle) :</strong> si l&apos;Utilisateur configure ses propres clés API, la Plateforme peut envoyer les prompts aux services tiers de génération vidéo.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 5 — Propriété intellectuelle</h2>
        <p>Les scénarios, textes et contenus créés par l&apos;Utilisateur restent sa propriété exclusive. MISEN ne revendique aucun droit sur les contenus soumis par les Utilisateurs.</p>
        <p className="mt-2">La Plateforme, son code source, son design, ses moteurs d&apos;analyse et ses algorithmes sont la propriété exclusive de l&apos;éditeur et sont protégés par les lois relatives à la propriété intellectuelle.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 6 — Clés API tierces</h2>
        <p>L&apos;Utilisateur peut fournir ses propres clés API (Kling, Runway, OpenAI, Google, etc.) pour activer la génération vidéo intégrée. Les clés sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers.</p>
        <p className="mt-2">L&apos;Utilisateur est seul responsable de l&apos;utilisation et du coût associé à ses clés API. MISEN n&apos;est pas responsable des frais facturés par les services tiers.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 7 — Utilisation acceptable</h2>
        <p>L&apos;Utilisateur s&apos;engage à ne pas utiliser la Plateforme pour :</p>
        <p className="mt-2">— Créer du contenu illicite, diffamatoire, discriminatoire ou portant atteinte aux droits de tiers.</p>
        <p>— Tenter de contourner les mesures de sécurité ou d&apos;accéder à des fonctionnalités non autorisées.</p>
        <p>— Utiliser la Plateforme à des fins de spam, de scraping ou de surcharge intentionnelle.</p>
        <p>— Revendre l&apos;accès à la Plateforme sans autorisation.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 8 — Limitation de responsabilité</h2>
        <p>MISEN est fourni « en l&apos;état ». L&apos;éditeur ne garantit pas l&apos;absence d&apos;interruptions ou d&apos;erreurs. Les résultats d&apos;analyse et les prompts générés sont des suggestions et ne constituent pas des conseils professionnels.</p>
        <p className="mt-2">L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation de la Plateforme ou des vidéos générées via les services tiers.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 9 — Modification des CGU</h2>
        <p>L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur la Plateforme. L&apos;Utilisateur sera informé par notification en cas de modification substantielle.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 10 — Droit applicable</h2>
        <p>Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux de Paris seront seuls compétents.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
        <p>Pour toute question relative aux présentes CGU, veuillez contacter : <span className="text-orange-400">contact@jabrilia.com</span></p>
      </section>
    </LegalLayout>
  )
}
