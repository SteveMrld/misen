'use client'
import { useI18n } from '@/lib/i18n'
import { LegalLayout } from '@/components/ui/legal-layout'

export default function MentionsPage() {
  const { locale } = useI18n()
  const isFr = locale === 'fr'

  return (
    <LegalLayout
      title={isFr ? "Mentions Légales" : "Legal Notice"}
      lastUpdated={isFr ? "Dernière mise à jour : 1er mars 2026" : "Last updated: March 1, 2026"}
    >
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Éditeur' : 'Publisher'}</h2>
        <p>{isFr ? 'Raison sociale' : 'Company'} : Jabrilia Éditions</p>
        <p>{isFr ? 'Responsable de la publication' : 'Publication Director'} : Steve Moradel</p>
        <p>Contact : contact@jabrilia.com</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Hébergement' : 'Hosting'}</h2>
        <p>{isFr ? 'Application' : 'Application'} : Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
        <p>{isFr ? 'Base de données' : 'Database'} : Supabase Inc. — 970 Toa Payoh North, Singapore</p>
        <p>{isFr ? 'Paiements' : 'Payments'} : Stripe Inc. — 354 Oyster Point Blvd, South San Francisco, CA 94080, USA</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">{isFr ? 'Propriété intellectuelle' : 'Intellectual Property'}</h2>
        <p>{isFr
          ? "L'ensemble du contenu du site MISEN (textes, images, code, marque) est la propriété de Steve Moradel / Jabrilia Éditions, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite."
          : "All content on the MISEN website (text, images, code, brand) is the property of Steve Moradel / Jabrilia Éditions, unless stated otherwise. Any reproduction without prior authorization is prohibited."}</p>
      </section>
    </LegalLayout>
  )
}
