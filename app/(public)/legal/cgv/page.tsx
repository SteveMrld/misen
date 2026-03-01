'use client'

import { LegalLayout } from '@/components/ui/legal-layout'

export default function CGVPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente" lastUpdated="1er mars 2026">
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 1 — Objet</h2>
        <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les conditions de souscription et d&apos;utilisation des offres payantes de la plateforme MISEN, éditée par Steve Moradel.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 2 — Offres et tarifs</h2>
        <p>MISEN propose les forfaits suivants :</p>
        <p className="mt-2"><strong className="text-white">Free (0€) :</strong> 3 projets, 13 moteurs d&apos;analyse, assistant IA (3 requêtes/mois), prompts optimisés, mode Simple, export JSON.</p>
        <p className="mt-2"><strong className="text-white">Pro (29€/mois ou 23€/mois en annuel) :</strong> 20 projets, mode Expert, assistant IA (30 requêtes/mois), timeline, copilote IA, sous-titres, voix off, génération intégrée (clés API utilisateur), support prioritaire.</p>
        <p className="mt-2"><strong className="text-white">Studio (79€/mois ou 63€/mois en annuel) :</strong> projets illimités, assistant IA illimité, accès API MISEN, support dédié.</p>
        <p className="mt-2">Les prix sont indiqués en euros, toutes taxes comprises (TTC). L&apos;éditeur se réserve le droit de modifier les tarifs à tout moment. Les modifications s&apos;appliquent uniquement aux nouvelles souscriptions et aux renouvellements.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 3 — Souscription</h2>
        <p>La souscription à un forfait payant s&apos;effectue en ligne depuis la Plateforme. Le paiement est traité par Stripe, prestataire de paiement sécurisé. L&apos;Utilisateur garantit qu&apos;il est autorisé à utiliser le moyen de paiement choisi.</p>
        <p className="mt-2">L&apos;abonnement prend effet immédiatement après confirmation du paiement.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 4 — Durée et renouvellement</h2>
        <p>Les abonnements mensuels sont souscrits pour une durée d&apos;un mois et renouvelés automatiquement. Les abonnements annuels sont souscrits pour une durée de douze mois et renouvelés automatiquement.</p>
        <p className="mt-2">L&apos;Utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. La résiliation prend effet à la fin de la période en cours. Aucun remboursement prorata temporis ne sera effectué.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 5 — Droit de rétractation</h2>
        <p>Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de contenu numérique non fourni sur un support matériel dont l&apos;exécution a commencé avec l&apos;accord du consommateur.</p>
        <p className="mt-2">En acceptant les présentes CGV et en utilisant immédiatement le service, l&apos;Utilisateur renonce expressément à son droit de rétractation.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 6 — Coûts des services tiers</h2>
        <p>L&apos;utilisation de la génération vidéo intégrée nécessite les propres clés API de l&apos;Utilisateur (Kling, Runway, etc.). Les coûts de génération facturés par ces services tiers sont entièrement à la charge de l&apos;Utilisateur.</p>
        <p className="mt-2">MISEN ne facture aucun surcoût sur l&apos;utilisation des clés API de l&apos;Utilisateur.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 7 — Résiliation par l&apos;éditeur</h2>
        <p>L&apos;éditeur se réserve le droit de suspendre ou de résilier l&apos;accès d&apos;un Utilisateur en cas de violation des CGU ou des présentes CGV, sans préavis ni indemnité.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 8 — Garantie et responsabilité</h2>
        <p>L&apos;éditeur s&apos;engage à fournir un service conforme aux descriptions des forfaits. En cas de dysfonctionnement prolongé (supérieur à 72 heures consécutives), l&apos;Utilisateur pourra demander une extension de sa période d&apos;abonnement.</p>
        <p className="mt-2">La responsabilité de l&apos;éditeur est limitée au montant de l&apos;abonnement payé par l&apos;Utilisateur pour la période en cours.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 9 — Médiation</h2>
        <p>Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu, l&apos;Utilisateur peut recourir gratuitement au service de médiation. Le médiateur de la consommation compétent sera communiqué sur demande.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Article 10 — Droit applicable</h2>
        <p>Les présentes CGV sont régies par le droit français. En cas de litige, les tribunaux de Paris seront seuls compétents.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
        <p>Pour toute question relative aux présentes CGV : <span className="text-orange-400">contact@jabrilia.com</span></p>
      </section>
    </LegalLayout>
  )
}
