'use client'

import { usePathname } from 'next/navigation'

export function RouteReveal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="dashboard-route" key={pathname}>
      {children}
    </div>
  )
}
