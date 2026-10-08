import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { DynamicQrManager } from '@/components/dynamic/DynamicQrManager'
import { DashboardShell } from '@/components/saas/DashboardShell'
import { getCurrentVinkoraUser } from '../../../../lib/auth/vinkora-user'
import { profilePreferences } from '../../../../lib/personalization'
import { getPrisma } from '../../../../lib/prisma'

export const metadata: Metadata = {
  title: 'Gérer un QR dynamique',
  description: 'Modifiez la destination et consultez les statistiques de votre QR dynamique Vinkora.',
  robots: { index: false, follow: false },
}

type ManageDynamicQrPageProps = {
  params: Promise<{ id: string }>
}

export default async function ManageDynamicQrPage({ params }: ManageDynamicQrPageProps) {
  const { id } = await params
  const qrCode = await getPrisma().qrCode.findUnique({
    where: { id },
    select: { name: true, ownership: true, ownerId: true },
  })

  if (!qrCode) {
    notFound()
  }

  if (qrCode.ownership === 'ANONYMOUS_BETA') {
    return <DynamicQrManager id={id} />
  }

  const user = await getCurrentVinkoraUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/manage/qr/${id}`)}`)
  }
  if (qrCode.ownerId !== user.id) {
    notFound()
  }

  return (
    <DashboardShell
      user={{
        name: user.profile?.name || user.email.split('@')[0],
        email: user.email,
        company: user.profile?.company,
      }}
      preferences={profilePreferences(user.profile)}
      pageOverride={{
        title: qrCode.name,
        description: 'Gérez la destination et suivez les scans de votre QR.',
      }}
    >
      <DynamicQrManager id={id} embedded />
    </DashboardShell>
  )
}
