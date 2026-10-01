import type { Metadata } from 'next'
import Link from 'next/link'
import { CirclePause, QrCode } from 'lucide-react'

export const metadata: Metadata = {
  title: 'QR dynamique indisponible',
  robots: { index: false, follow: false },
}

type DynamicQrStatusPageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function DynamicQrStatusPage({ searchParams }: DynamicQrStatusPageProps) {
  const { reason } = await searchParams
  const unknown = reason === 'unknown'

  return (
    <main className="dynamic-status-page">
      <Link className="dynamic-status-brand" href="/">
        <QrCode aria-hidden="true" /> Vinkora
      </Link>
      <section>
        <CirclePause aria-hidden="true" />
        <p>QR dynamique</p>
        <h1>{unknown ? 'Ce QR dynamique est introuvable.' : 'Cette campagne n’est plus disponible.'}</h1>
        <span>
          {unknown
            ? 'Vérifiez le lien ou demandez une nouvelle adresse à son propriétaire.'
            : 'Le propriétaire de ce QR l’a suspendu ou archivé.'}
        </span>
      </section>
    </main>
  )
}
