import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LinksManager } from '@/components/saas/LinksManager'
import { DemoNotice, SectionHeading } from '@/components/saas/SaasUi'
import { demoLinks } from '@/data/saasDemo'

export default function LinksPage() {
  return (
    <div className="dashboard-page">
      <DemoNotice />
      <SectionHeading
        title="Tous vos liens"
        description="Recherchez, copiez et organisez les liens de votre espace."
        action={
          <Link className="button button--primary" href="/dashboard/links/new">
            <Plus size={17} /> Nouveau lien
          </Link>
        }
      />
      <LinksManager initialLinks={demoLinks} />
    </div>
  )
}
