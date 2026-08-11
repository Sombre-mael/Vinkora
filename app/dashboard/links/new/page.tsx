import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewLinkForm } from '@/components/saas/NewLinkForm'
import { DemoNotice } from '@/components/saas/SaasUi'

export default function NewLinkPage() {
  return (
    <div className="dashboard-page dashboard-page--narrow">
      <DemoNotice />
      <Link className="back-link" href="/dashboard/links">
        <ArrowLeft size={16} /> Retour aux liens
      </Link>
      <div className="new-link-intro">
        <span>Nouveau lien</span>
        <h2>Préparez une adresse courte et mémorable.</h2>
        <p>
          Le formulaire est prêt pour la future couche authentifiée. Il n’enregistre encore
          aucune donnée.
        </p>
      </div>
      <NewLinkForm />
    </div>
  )
}
