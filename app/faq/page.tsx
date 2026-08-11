import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicPage } from '@/components/saas/PublicPage'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description: 'Réponses aux questions fréquentes sur Vinkora et son Studio QR.',
}

const questions = [
  ['Puis-je utiliser Vinkora gratuitement ?', 'Oui. Le Studio permet de créer et d’exporter des QR statiques sans compte.'],
  ['Vinkora enregistre-t-il mes QR gratuits ?', 'Non. L’URL, le style et l’historique gratuit restent dans votre navigateur.'],
  ['Puis-je modifier la destination après impression ?', 'Cette possibilité arrivera avec les QR dynamiques de Pass Événement et Starter. Un QR statique conserve sa destination initiale.'],
  ['Les liens courts sont-ils disponibles maintenant ?', 'Ils sont réservés à la prochaine phase avec authentification et droit actif. Les créations anonymes sont actuellement refusées.'],
  ['Quels formats puis-je télécharger ?', 'Le Studio propose des exports PNG et SVG adaptés au web et à l’impression légère.'],
  ['Le paiement Mobile Money est-il déjà actif ?', 'Non. Il est prévu pour le lancement commercial, avec une validation manuelle sécurisée dans un premier temps.'],
  ['Que montrent les pages du dashboard ?', 'Il s’agit pour le moment d’un aperçu d’interface utilisant des données de démonstration clairement signalées.'],
  ['Mes anciens QR continueront-ils à fonctionner ?', 'Les QR statiques exportés sont autonomes. Les anciens liens déjà diffusés conservent également leur route de redirection.'],
]

export default function FaqPage() {
  return (
    <PublicPage>
      <section className="public-page-hero public-page-hero--compact">
        <div className="public-container public-page-hero__inner">
          <span className="public-eyebrow">Questions fréquentes</span>
          <h1>Les réponses utiles, sans détour.</h1>
          <p>Comprenez ce qui est déjà disponible et ce qui arrivera dans les prochaines phases.</p>
        </div>
      </section>
      <section className="faq-page public-section">
        <div className="public-container faq-page__grid">
          <aside>
            <strong>Besoin de créer maintenant ?</strong>
            <p>Le Studio QR statique est déjà disponible gratuitement.</p>
            <Link className="button button--primary" href="/studio">
              Ouvrir le Studio <ArrowRight size={16} />
            </Link>
          </aside>
          <div className="faq-list faq-list--large">
            {questions.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  )
}
