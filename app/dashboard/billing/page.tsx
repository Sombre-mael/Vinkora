import { CreditCard, FileText, Gauge, PackageOpen } from 'lucide-react'
import { PlanCard } from '@/components/saas/PlanCard'
import { EmptyState } from '@/components/saas/SaasUi'
import { publishedLaunchPlans } from '@/config/plans'

export default function BillingPage() {
  return (
    <div className="dashboard-page">
      <section className="billing-current billing-current--empty">
        <span className="billing-current__icon"><PackageOpen size={22} /></span>
        <div>
          <span>Offre actuelle</span>
          <h2>Aucune offre active</h2>
          <p>Votre compte ne possède actuellement aucune offre active.</p>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div><span>Utilisation</span><h2>Quotas de l’espace</h2></div>
          <Gauge size={20} aria-hidden="true" />
        </div>
        <EmptyState
          icon={Gauge}
          title="Aucune utilisation à afficher"
          description="Votre utilisation apparaîtra ici lorsqu’une offre sera active sur votre compte."
        />
      </section>

      <section className="billing-catalog">
        <div className="section-heading">
          <div>
            <span className="section-heading__eyebrow">Catalogue officiel</span>
            <h2>Offres de lancement</h2>
            <p>Les souscriptions en ligne ne sont pas encore ouvertes.</p>
          </div>
        </div>
        <div className="catalog-plan-grid catalog-plan-grid--billing">
          {publishedLaunchPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} context="billing" />
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div><span>Paiements</span><h2>Historique de facturation</h2></div>
          <CreditCard size={20} aria-hidden="true" />
        </div>
        <EmptyState
          icon={FileText}
          title="Aucune facture ni transaction"
          description="Votre historique apparaîtra ici après votre premier paiement."
        />
      </section>
    </div>
  )
}
