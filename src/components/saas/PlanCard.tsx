import Link from 'next/link'
import { Check, Clock3, Minus } from 'lucide-react'
import type { LaunchPlan } from '@/config/plans'

type PlanCardProps = {
  plan: LaunchPlan
  compact?: boolean
  context?: 'public' | 'billing'
}

const numberFormatter = new Intl.NumberFormat('fr-FR')

function PlanPrice({ plan }: { plan: LaunchPlan }) {
  if (plan.pricing.usd === 0) {
    return <strong className="catalog-plan__price">Gratuit</strong>
  }

  if (plan.pricing.cdf === null) {
    return (
      <div className="catalog-plan__prices" aria-label={`Prix de l’offre ${plan.publicName}`}>
        <strong>{numberFormatter.format(plan.pricing.usd)} USD</strong>
      </div>
    )
  }

  return (
    <div className="catalog-plan__prices" aria-label={`Prix de l’offre ${plan.publicName}`}>
      <strong>{numberFormatter.format(plan.pricing.usd)} USD</strong>
      <span>ou</span>
      <strong>{numberFormatter.format(plan.pricing.cdf)} CDF</strong>
    </div>
  )
}

export function PlanCard({ plan, compact = false, context = 'public' }: PlanCardProps) {
  const isComingSoon = plan.commercialStatus.availability === 'COMING_SOON'

  return (
    <article
      className={`catalog-plan ${plan.recommended ? 'catalog-plan--recommended' : ''} ${compact ? 'catalog-plan--compact' : ''}`}
      data-plan-id={plan.id}
    >
      <div className="catalog-plan__topline">
        <span>{plan.type === 'PASS' ? 'Pass' : plan.type === 'SUBSCRIPTION' ? 'Abonnement' : 'Accès libre'}</span>
        {plan.recommended ? <small>Recommandé</small> : isComingSoon ? <small>Bientôt</small> : null}
      </div>
      <div className="catalog-plan__heading">
        <h3>{plan.publicName}</h3>
        <PlanPrice plan={plan} />
        <p>{plan.summary}</p>
      </div>
      <div className="catalog-plan__duration">
        <Clock3 size={16} aria-hidden="true" />
        <span>Durée</span>
        <strong>{plan.duration.label}</strong>
      </div>
      <div className="catalog-plan__quotas">
        <div>
          <span>Ressources dynamiques</span>
          <strong>{numberFormatter.format(plan.quotas.dynamicResourcesPerPeriod)}</strong>
          <small>par période</small>
        </div>
        <div>
          <span>Clics ou scans analysés</span>
          <strong>{numberFormatter.format(plan.quotas.analyzedEventsPerPeriod)}</strong>
          <small>par période</small>
        </div>
      </div>
      <ul className="catalog-plan__features">
        {plan.features.slice(0, compact ? 3 : undefined).map((feature) => (
          <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>
        ))}
      </ul>
      {!compact ? (
        <>
          <div className="catalog-plan__limits">
            <strong>Limites</strong>
            <ul>
              {plan.limitations.map((limitation) => (
                <li key={limitation}><Minus size={15} aria-hidden="true" />{limitation}</li>
              ))}
            </ul>
          </div>
          <dl className="catalog-plan__terms">
            <div><dt>Conservation</dt><dd>{plan.statisticsRetention.label}</dd></div>
            <div>
              <dt>Grâce</dt>
              <dd>{plan.gracePeriodDays === null ? 'Sans objet' : `${numberFormatter.format(plan.gracePeriodDays)} jours`}</dd>
            </div>
            <div><dt>Après expiration</dt><dd>{plan.postExpirationBehavior}</dd></div>
          </dl>
        </>
      ) : null}
      <div className="catalog-plan__cta">
        {plan.cta.href ? (
          <Link className="button button--secondary" href={plan.cta.href}>{plan.cta.label}</Link>
        ) : (
          <button className="button button--secondary" type="button" disabled>
            {plan.cta.label}
          </button>
        )}
        {context === 'billing' && isComingSoon ? (
          <small>Aucun achat ni paiement n’est disponible.</small>
        ) : null}
      </div>
    </article>
  )
}
