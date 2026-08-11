import type { Metadata } from 'next'
import { CircleGauge, Info, RefreshCw } from 'lucide-react'
import { PlanCard } from '@/components/saas/PlanCard'
import { PublicPage } from '@/components/saas/PublicPage'
import {
  catalogPriceNotice,
  dynamicResourceDefinition,
  launchCatalogRules,
  publishedLaunchPlans,
} from '@/config/plans'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Découvrez les offres Free, Pass Événement et Starter de Vinkora.',
}

export default function PricingPage() {
  return (
    <PublicPage>
      <section className="public-page-hero">
        <div className="public-container public-page-hero__inner">
          <span className="public-eyebrow">Catalogue de lancement</span>
          <h1>Trois offres claires, selon la durée de votre besoin.</h1>
          <p>
            Free est disponible sans compte. Pass Événement et Starter sont publiés dans le
            catalogue mais resteront désactivés jusqu’à l’intégration du paiement et de l’activation.
          </p>
        </div>
      </section>

      <section className="pricing-page public-section">
        <div className="public-container">
          <div className="pricing-definition" role="note">
            <Info size={19} aria-hidden="true" />
            <p>{dynamicResourceDefinition}</p>
          </div>
          <div className="catalog-plan-grid catalog-plan-grid--full">
            {publishedLaunchPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        <div className="public-container catalog-rules">
          <div className="public-section__heading">
            <span className="public-eyebrow">Règles communes</span>
            <h2>Des limites prévisibles, sans facturation surprise.</h2>
            <p>{catalogPriceNotice}</p>
          </div>
          <div className="catalog-rules__grid">
            <div className="catalog-rules__icon" aria-hidden="true">
              <CircleGauge size={32} />
              <RefreshCw size={20} />
            </div>
            <ul>
              {launchCatalogRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </PublicPage>
  )
}
