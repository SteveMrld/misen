'use client'
import { useI18n } from '@/lib/i18n'
import { LegalLayout } from '@/components/ui/legal-layout'

export default function PrivacyPage() {
  const { locale } = useI18n()
  const isFr = locale === 'fr'

  return (
    <LegalLayout
      title={isFr ? "Politique de Confidentialité" : "Privacy Policy"}
      lastUpdated={isFr ? "Dernière mise à jour : 1er mars 2026" : "Last updated: March 1, 2026"}
    >
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Responsable du traitement' : 'Data Controller'}</h2>
        <p>{isFr
          ? "Steve Moradel — Jabrilia Éditions. Contact : contact@jabrilia.com."
          : "Steve Moradel — Jabrilia Éditions. Contact: contact@jabrilia.com."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Données collectées' : 'Data Collected'}</h2>
        <p>{isFr
          ? "Nous collectons : adresse email, nom (optionnel), scénarios et projets créés, clés API (stockées chiffrées), données d'utilisation. Les clés API sont chiffrées côté serveur et ne sont jamais exposées en clair."
          : "We collect: email address, name (optional), scripts and projects created, API keys (stored encrypted), usage data. API keys are encrypted server-side and never exposed in plaintext."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Base légale et finalités' : 'Legal Basis & Purposes'}</h2>
        <p>{isFr
          ? "Les traitements sont fondés sur le consentement de l'Utilisateur et l'exécution du contrat. Finalités : fourniture du service, gestion des comptes, amélioration du service, communication."
          : "Processing is based on user consent and contract execution. Purposes: service delivery, account management, service improvement, communication."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Vos droits' : 'Your Rights'}</h2>
        <p>{isFr
          ? "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. La suppression du compte et l'export des données sont disponibles dans les paramètres de votre compte. Contact : contact@jabrilia.com."
          : "Under GDPR, you have the right to access, rectify, delete, export, and object to processing of your data. Account deletion and data export are available in your account settings. Contact: contact@jabrilia.com."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Cookies' : 'Cookies'}</h2>
        <p>{isFr
          ? "MISEN utilise exclusivement des cookies fonctionnels nécessaires à l'authentification (Supabase Auth). Aucun cookie publicitaire ou de tracking n'est utilisé."
          : "MISEN uses only functional cookies required for authentication (Supabase Auth). No advertising or tracking cookies are used."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Hébergement et sécurité' : 'Hosting & Security'}</h2>
        <p>{isFr
          ? "Données hébergées par Supabase (PostgreSQL) et Vercel (CDN/Edge). Connexions chiffrées (TLS). Headers de sécurité HTTP configurés (X-Frame-Options, CSP, HSTS)."
          : "Data hosted by Supabase (PostgreSQL) and Vercel (CDN/Edge). Encrypted connections (TLS). HTTP security headers configured (X-Frame-Options, CSP, HSTS)."}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Contact DPO' : 'DPO Contact'}</h2>
        <p>contact@jabrilia.com</p>
      </section>
    </LegalLayout>
  )
}
