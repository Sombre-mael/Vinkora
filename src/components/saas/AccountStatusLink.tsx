'use client'

import Link from 'next/link'
import { LayoutDashboard, LogIn } from 'lucide-react'
import { authClient } from '../../../lib/auth/client'

type AccountStatusLinkProps = {
  className?: string
  compact?: boolean
  onClick?: () => void
}

export function AccountStatusLink({ className = '', compact = false, onClick }: AccountStatusLinkProps) {
  const { data: session, isPending } = authClient.useSession()
  const isAuthenticated = Boolean(session?.user)
  const label = isPending ? 'Vérification…' : isAuthenticated ? 'Mon espace' : 'Se connecter'
  const classes = `${className} account-status-link${isPending ? ' is-pending' : ''}`.trim()

  if (isPending) {
    return (
      <span className={classes} aria-live="polite" aria-busy="true" onClick={onClick}>
        <span>{label}</span>
        {compact ? <LogIn size={18} aria-hidden="true" /> : null}
      </span>
    )
  }

  return (
    <Link
      className={classes}
      href={isAuthenticated ? '/dashboard' : '/login'}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {compact ? (
        isAuthenticated ? <LayoutDashboard size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </Link>
  )
}
