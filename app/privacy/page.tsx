import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Confidentialité',
  description: 'Informations sur les données traitées par Vinkora.',
}

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <Link href="/" className="privacy-brand">Vinkora</Link>
      <article>
        <p className="eyebrow">Confidentialité</p>
        <h1>Données des QR dynamiques</h1>
        <p>
          La bêta QR dynamique enregistre le moment du scan, le continent, le pays, la région et la ville
          approximative fournis par l’hébergeur, ainsi que le fuseau horaire, la langue, le type d’appareil,
          le système d’exploitation, le navigateur simplifié et le domaine référent lorsqu’il existe.
        </p>
        <p>
          Vinkora ne conserve ni adresse IP brute ni User-Agent complet. Des identifiants pseudonymisés propres
          à chaque QR servent uniquement à estimer les visiteurs uniques et récurrents sur la période conservée.
        </p>
        <p>
          Les événements détaillés des QR anonymes sont supprimés après 30 jours. Le compteur total du QR reste
          disponible afin de préserver son historique global.
        </p>
        <p>
          La clé secrète de gestion est conservée sur votre appareil. Toute personne qui obtient votre lien de
          gestion peut modifier le QR : gardez-le privé.
        </p>
        <Link className="button button--primary" href="/studio">Retour au Studio</Link>
      </article>
    </main>
  )
}
