import { RouteReveal } from '@/components/saas/RouteReveal'

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <RouteReveal>{children}</RouteReveal>
}
