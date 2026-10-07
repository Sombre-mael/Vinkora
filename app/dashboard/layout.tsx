import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/saas/DashboardShell'
import {
  requireCurrentVinkoraUser,
  SuspendedUserError,
} from '../../lib/auth/vinkora-user'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Vinkora',
  },
  description: 'Aperçu de l’espace SaaS Vinkora.',
}

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user

  try {
    user = await requireCurrentVinkoraUser()
  } catch (error) {
    if (error instanceof SuspendedUserError) {
      redirect('/login?status=suspended')
    }

    throw error
  }

  const displayName = user.profile?.name || user.email.split('@')[0]

  return (
    <DashboardShell user={{ name: displayName, email: user.email }}>
      {children}
    </DashboardShell>
  )
}
