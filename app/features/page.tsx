import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brush,
  FileDown,
  FolderKanban,
  Link2,
  MousePointerClick,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { PublicPage } from '@/components/saas/PublicPage'

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description: 'Découvrez les outils de création, de gestion et d’analyse de Vinkora.',
}

const capabilities = [
  {
    icon: Link2,
    title: 'Liens courts maîtrisés',
    description:
      'Créez des adresses mémorables et organisez chaque lien selon sa campagne ou son usage.',
    points: ['Slug personnalisé', 'Statut actif ou suspendu', 'Copie en un geste'],
    availability: 'Bientôt avec Pass Événement ou Starter',
  },
  {
    icon: QrCode,
    title: 'Studio QR complet',
    description:
      'Transformez une URL en QR code professionnel sans compte et sans envoyer vos données.',
    points: ['Couleurs et formes', 'Logo intégré', 'Contrôle de lisibilité'],
    availability: 'Disponible gratuitement',
  },
  {
    icon: BarChart3,
    title: 'Analytics lisibles',
    description:
      'Comprenez rapidement quand, où et depuis quel appareil vos liens sont consultés.',
    points: ['Évolution des clics', 'Sources et appareils', 'Liens performants'],
    availability: 'Bientôt avec Pass Événement ou Starter',
  },
]

const detailFeatures = [
  { icon: RefreshCw, title: 'Destination modifiable', text: 'Faites évoluer une campagne sans réimprimer son QR dynamique.' },
  { icon: FileDown, title: 'Exports propres', text: 'Téléchargez vos créations au format PNG ou SVG.' },
  { icon: FolderKanban, title: 'Organisation claire', text: 'Retrouvez vos liens et campagnes depuis un même espace.' },
  { icon: MousePointerClick, title: 'Suivi utile', text: 'Concentrez-vous sur les indicateurs qui soutiennent vos décisions.' },
  { icon: ShieldCheck, title: 'Contrôle serveur', text: 'Les ressources payantes seront protégées par des droits vérifiés côté serveur.' },
  { icon: Brush, title: 'Identité cohérente', text: 'Adaptez chaque QR code à votre marque et à son support.' },
]

export default function FeaturesPage() {
  return (
    <PublicPage>
      <section className="public-page-hero public-page-hero--features">
        <div className="public-container public-page-hero__inner">
          <span className="public-eyebrow">Fonctionnalités</span>
          <h1>Un lien simple à partager. Des outils sérieux derrière.</h1>
          <p>
            Vinkora rassemble le Studio QR gratuit et les futurs outils de gestion nécessaires
            pour piloter vos campagnes au quotidien.
          </p>
          <Link className="button button--primary button--large" href="/studio">
            Essayer le Studio
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="capabilities public-section">
        <div className="public-container">
          {capabilities.map(({ icon: Icon, title, description, points, availability }, index) => (
            <article className="capability-row" key={title}>
              <div className="capability-row__visual">
                <span>0{index + 1}</span>
                <Icon size={54} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <div>
                <small>{availability}</small>
                <h2>{title}</h2>
                <p>{description}</p>
                <ul>
                  {points.map((point) => (
                    <li key={point}><span aria-hidden="true">✓</span>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-features public-section">
        <div className="public-container">
          <div className="public-section__heading public-section__heading--center">
            <span className="public-eyebrow">Conçu pour rester clair</span>
            <h2>Chaque fonction répond à un besoin concret.</h2>
          </div>
          <div className="detail-features__grid">
            {detailFeatures.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={21} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="public-container final-cta__inner">
          <div>
            <span>Disponible dès maintenant</span>
            <h2>Commencez avec un QR statique professionnel.</h2>
          </div>
          <Link className="button button--accent button--large" href="/studio">
            Créer mon QR code
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PublicPage>
  )
}
