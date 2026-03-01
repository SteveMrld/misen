'use client'

import { LegalLayout } from '@/components/ui/legal-layout'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de Confidentialité" lastUpdated="1er mars 2026">
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">1. Responsable du traitement</h2>
        <p>Le responsable du traitement des données personnelles est Steve Moradel, éditeur de la plateforme MISEN, accessible à l&apos;adresse misen-ten.vercel.app.</p>
        <p className="mt-2">Contact : <span className="text-orange-400">contact@jabrilia.com</span></p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <p className="mt-2"><strong className="text-white">Données de compte :</strong> adresse e-mail, nom (optionnel), mot de passe hashé. Ces données sont nécessaires à la création et à la gestion de votre compte.</p>
        <p className="mt-2"><strong className="text-white">Données de projet :</strong> scénarios, résultats d&apos;analyse, prompts générés. Ces données sont nécessaires au fonctionnement du service.</p>
        <p className="mt-2"><strong className="text-white">Clés API :</strong> si vous configurez des clés API tierces, elles sont stockées de manière chiffrée. Elles ne sont utilisées que pour envoyer des requêtes aux services correspondants.</p>
        <p className="mt-2"><strong className="text-white">Données d&apos;utilisation :</strong> nombre de requêtes, horodatages d&apos;utilisation de l&apos;assistant IA, identifiants de session. Ces données servent à la gestion des quotas et à l&apos;amélioration du service.</p>
        <p className="mt-2"><strong className="text-white">Données techniques :</strong> adresse IP, type de navigateur, système d&apos;exploitation. Collectées automatiquement pour des raisons de sécurité et de performance.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">3. Finalités du traitement</h2>
        <p>Vos données sont traitées pour les finalités suivantes :</p>
        <p className="mt-2">— Fourniture et gestion du service (base légale : exécution du contrat)</p>
        <p>— Gestion des abonnements et paiements (base légale : exécution du contrat)</p>
        <p>— Amélioration du service et statistiques d&apos;utilisation (base légale : intérêt légitime)</p>
        <p>— Communication relative au service (base légale : intérêt légitime)</p>
        <p>— Respect des obligations légales (base légale : obligation légale)</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">4. Sous-traitants et transferts de données</h2>
        <p>Nous faisons appel aux sous-traitants suivants :</p>
        <p className="mt-2"><strong className="text-white">Supabase (États-Unis) :</strong> hébergement de la base de données et authentification. Transfert encadré par les clauses contractuelles types de la Commission européenne.</p>
        <p className="mt-2"><strong className="text-white">Vercel (États-Unis) :</strong> hébergement de l&apos;application web. Transfert encadré par les clauses contractuelles types.</p>
        <p className="mt-2"><strong className="text-white">Stripe (États-Unis) :</strong> traitement des paiements. Certifié PCI-DSS. Transfert encadré par les clauses contractuelles types.</p>
        <p className="mt-2"><strong className="text-white">Anthropic / OpenAI :</strong> traitement IA pour l&apos;assistant scénariste. Les prompts sont envoyés pour traitement et ne sont pas conservés par ces services au-delà du traitement.</p>
        <p className="mt-2">Vos scénarios et contenus ne sont jamais utilisés pour entraîner des modèles d&apos;intelligence artificielle.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">5. Durée de conservation</h2>
        <p><strong className="text-white">Données de compte :</strong> conservées tant que le compte est actif, puis supprimées dans les 30 jours suivant la demande de suppression.</p>
        <p className="mt-2"><strong className="text-white">Données de projet :</strong> conservées tant que le projet existe. Supprimées immédiatement sur demande de l&apos;Utilisateur.</p>
        <p className="mt-2"><strong className="text-white">Clés API :</strong> supprimées immédiatement lorsque l&apos;Utilisateur les retire de ses paramètres.</p>
        <p className="mt-2"><strong className="text-white">Données de facturation :</strong> conservées 10 ans conformément aux obligations comptables françaises.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">6. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
        <p className="mt-2"><strong className="text-white">Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles.</p>
        <p className="mt-2"><strong className="text-white">Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</p>
        <p className="mt-2"><strong className="text-white">Droit à l&apos;effacement :</strong> demander la suppression de vos données.</p>
        <p className="mt-2"><strong className="text-white">Droit à la portabilité :</strong> recevoir vos données dans un format structuré (JSON).</p>
        <p className="mt-2"><strong className="text-white">Droit d&apos;opposition :</strong> vous opposer au traitement de vos données pour motif légitime.</p>
        <p className="mt-2"><strong className="text-white">Droit à la limitation :</strong> demander la limitation du traitement dans certains cas.</p>
        <p className="mt-2">Pour exercer ces droits, contactez-nous à : <span className="text-orange-400">contact@jabrilia.com</span>. Nous répondrons dans un délai maximum de 30 jours.</p>
        <p className="mt-2">Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) : <span className="text-orange-400">www.cnil.fr</span></p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">7. Cookies</h2>
        <p>La Plateforme utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
        <p className="mt-2"><strong className="text-white">Cookies d&apos;authentification :</strong> gestion de la session utilisateur (Supabase Auth).</p>
        <p className="mt-2"><strong className="text-white">Cookies de préférences :</strong> état de l&apos;onboarding, préférences d&apos;interface.</p>
        <p className="mt-2">Aucun cookie de tracking, de publicité ou d&apos;analyse comportementale n&apos;est utilisé. Nous n&apos;utilisons pas Google Analytics ni aucun outil de suivi tiers.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">8. Sécurité</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement en transit (TLS), authentification sécurisée, stockage chiffré des clés API, accès restreint aux données.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">9. Modifications</h2>
        <p>La présente politique peut être modifiée à tout moment. Les modifications substantielles feront l&apos;objet d&apos;une notification aux Utilisateurs.</p>
      </section>
    </LegalLayout>
  )
}
