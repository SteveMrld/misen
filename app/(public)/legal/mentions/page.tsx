'use client'

import { LegalLayout } from '@/components/ui/legal-layout'

export default function MentionsPage() {
  return (
    <LegalLayout title="Mentions Légales" lastUpdated="1er mars 2026">
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Éditeur du site</h2>
        <p><strong className="text-white">Nom :</strong> Steve Moradel</p>
        <p><strong className="text-white">Statut :</strong> Entrepreneur individuel</p>
        <p><strong className="text-white">Adresse :</strong> [À compléter]</p>
        <p><strong className="text-white">E-mail :</strong> <span className="text-orange-400">contact@jabrilia.com</span></p>
        <p><strong className="text-white">SIRET :</strong> [À compléter]</p>
        <p><strong className="text-white">Numéro TVA intracommunautaire :</strong> [À compléter]</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Directeur de la publication</h2>
        <p>Steve Moradel</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Hébergement</h2>
        <p><strong className="text-white">Application web :</strong> Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
        <p><strong className="text-white">Base de données :</strong> Supabase Inc., 970 Toa Payoh North #07-04, Singapour.</p>
        <p><strong className="text-white">Paiements :</strong> Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irlande.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Propriété intellectuelle</h2>
        <p>L&apos;ensemble du contenu de la Plateforme MISEN (textes, graphismes, logos, icônes, images, code source, algorithmes) est la propriété exclusive de Steve Moradel, sauf mention contraire.</p>
        <p className="mt-2">Toute reproduction, représentation, modification ou exploitation non autorisée du contenu est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
        <p className="mt-2">Le nom « MISEN » et le logo associé sont des marques déposées ou en cours de dépôt.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Données personnelles</h2>
        <p>Pour toute information relative à la collecte et au traitement de vos données personnelles, veuillez consulter notre <a href="/legal/privacy" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Politique de Confidentialité</a>.</p>
        <p className="mt-2">Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits : <span className="text-orange-400">contact@jabrilia.com</span></p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Crédits</h2>
        <p><strong className="text-white">Conception et développement :</strong> Steve Moradel</p>
        <p><strong className="text-white">Technologies :</strong> Next.js, React, Tailwind CSS, Supabase, Vercel</p>
        <p><strong className="text-white">Icônes :</strong> Lucide Icons (licence MIT)</p>
        <p><strong className="text-white">Images de démonstration :</strong> générées par IA (usage commercial autorisé)</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Liens hypertextes</h2>
        <p>La Plateforme peut contenir des liens vers des sites tiers (Kling, Runway, Sora, etc.). L&apos;éditeur n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Droit applicable</h2>
        <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux de Paris seront seuls compétents.</p>
      </section>
    </LegalLayout>
  )
}
