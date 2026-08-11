import type { Metadata } from 'next'
import { DashboardShell } from '@/components/saas/DashboardShell'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Vinkora',
  },
  description: 'Aperçu de l’espace SaaS Vinkora.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
