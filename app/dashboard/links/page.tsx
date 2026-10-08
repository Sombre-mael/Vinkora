import { LinksManager } from '@/components/saas/LinksManager'
import { SectionHeading } from '@/components/saas/SaasUi'
import { requireCurrentVinkoraUser } from '../../../lib/auth/vinkora-user'
import { getPrisma } from '../../../lib/prisma'

export default async function LinksPage() {
  const user = await requireCurrentVinkoraUser()
  const qrCodes = await getPrisma().qrCode.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      destinationUrl: true,
      clickCount: true,
      status: true,
      createdAt: true,
    },
  })

  const resources = qrCodes.map((qrCode) => ({
    id: qrCode.id,
    title: qrCode.name,
    slug: qrCode.slug,
    shortUrl: `/q/${qrCode.slug}`,
    destination: qrCode.destinationUrl,
    clicks: qrCode.clickCount,
    status: qrCode.status === 'ACTIVE'
      ? 'active' as const
      : qrCode.status === 'SUSPENDED'
        ? 'paused' as const
        : 'archived' as const,
    createdAt: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(qrCode.createdAt),
    manageUrl: `/manage/qr/${qrCode.id}`,
  }))

  return (
    <div className="dashboard-page">
      <SectionHeading
        title="Tous vos liens"
        description="Recherchez, copiez et organisez les liens de votre espace."
      />
      <LinksManager initialLinks={resources} />
    </div>
  )
}
