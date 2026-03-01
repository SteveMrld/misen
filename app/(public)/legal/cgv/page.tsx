'use client'
import { useI18n } from '@/lib/i18n'
import { LegalLayout } from '@/components/ui/legal-layout'

export default function CGVPage() {
  const { locale } = useI18n()
  const isFr = locale === 'fr'

  return (
    <LegalLayout
      title={isFr ? "Conditions Générales de Vente" : "Terms of Sale"}
      lastUpdated={isFr ? "Dernière mise à jour : 1er mars 2026" : "Last updated: March 1, 2026"}
    >
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 1 — Objet' : 'Article 1 — Purpose'}</h2>
        <p>{isFr
          ? "Les présentes CGV régissent les conditions de vente des abonnements MISEN Pro et Studio."
          : "These Terms of Sale govern the subscription plans for MISEN Pro and Studio."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 2 — Offres et tarifs' : 'Article 2 — Plans & Pricing'}</h2>
        <p>{isFr
          ? "Free : 0€ (3 projets, 13 moteurs, mode Simple). Pro : 29€/mois ou 23€/mois en annuel (20 projets, mode Expert, génération intégrée). Studio : 79€/mois ou 63€/mois en annuel (illimité, API, support dédié). Tarifs TTC."
          : "Free: €0 (3 projects, 13 engines, Simple mode). Pro: €29/mo or €23/mo annual (20 projects, Expert mode, integrated generation). Studio: €79/mo or €63/mo annual (unlimited, API, dedicated support). Prices include taxes."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 3 — Paiement' : 'Article 3 — Payment'}</h2>
        <p>{isFr
          ? "Le paiement est effectué par carte bancaire via Stripe. L'abonnement est renouvelé automatiquement sauf résiliation."
          : "Payment is made by credit card via Stripe. Subscriptions renew automatically unless cancelled."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 4 — Résiliation' : 'Article 4 — Cancellation'}</h2>
        <p>{isFr
          ? "L'Utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. L'accès aux fonctionnalités premium reste actif jusqu'à la fin de la période payée."
          : "Users may cancel their subscription at any time from account settings. Premium features remain accessible until the end of the paid period."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 5 — Droit de rétractation' : 'Article 5 — Right of Withdrawal'}</h2>
        <p>{isFr
          ? "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis dès la souscription."
          : "In accordance with French Consumer Code art. L221-28, the right of withdrawal does not apply to digital content provided immediately upon subscription."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Article 6 — Contact' : 'Article 6 — Contact'}</h2>
        <p>contact@jabrilia.com</p>
      </section>
    </LegalLayout>
  )
}
