'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Link2,
  Menu,
  QrCode,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { InterfacePreferences } from '../../../lib/personalization'
import { SignOutButton } from './SignOutButton'

const navItems = [
  { href: '/dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/links', label: 'Mes liens', icon: Link2 },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/billing', label: 'Facturation', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
]

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Vue d’ensemble',
    description: 'Suivez l’essentiel de votre activité.',
  },
  '/dashboard/links': {
    title: 'Mes liens',
    description: 'Organisez et gérez vos destinations.',
  },
  '/dashboard/links/new': {
    title: 'Studio QR',
    description: 'Créez et personnalisez votre QR code.',
  },
  '/dashboard/analytics': {
    title: 'Analytics',
    description: 'Comprenez les performances de vos liens.',
  },
  '/dashboard/billing': {
    title: 'Offre et facturation',
    description: 'Consultez votre offre et son utilisation.',
  },
  '/dashboard/settings': {
    title: 'Paramètres',
    description: 'Gérez votre profil et vos préférences.',
  },
}

function isCurrent(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

type DashboardShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email: string
    company?: string | null
  }
  preferences: InterfacePreferences
  pageOverride?: { title: string; description: string }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'VK'
}

export function DashboardShell({ children, user, preferences, pageOverride }: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const page = pageOverride ?? pageTitles[pathname] ?? pageTitles['/dashboard']

  const handleNavigation = (href: string, exact?: boolean) => {
    if (!isCurrent(pathname, href, exact)) {
      setPendingPath(href)
    }
    setMobileOpen(false)
  }

  const isNavigationPending = (href: string) => pendingPath === href && pathname !== href

  return (
    <div
      className="dashboard-shell"
      data-accent={preferences.accent.toLowerCase()}
      data-density={preferences.density.toLowerCase()}
      data-motion={preferences.motion.toLowerCase()}
    >
      <span
        className={`dashboard-route-progress${pendingPath && pathname !== pendingPath ? ' is-visible' : ''}`}
        aria-hidden="true"
      />
      <aside id="dashboard-navigation" className={`dashboard-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar__head">
          <Link href="/" aria-label="Vinkora, retour au site">
            <Image
              className="dashboard-sidebar__logo"
              src="/brand/vinkora-logo-dark.png"
              alt="Vinkora"
              width={154}
              height={42}
              priority
            />
          </Link>
          <button
            className="icon-button dashboard-sidebar__close"
            type="button"
            aria-label="Fermer la navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="dashboard-sidebar__workspace">
          <span className="dashboard-avatar dashboard-avatar--small">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.company || 'Compte Vinkora'}</small>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav" aria-label="Navigation de l’application">
          <span>Votre espace</span>
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              className={isCurrent(pathname, href, exact) ? 'is-active' : undefined}
              href={href}
              aria-current={isCurrent(pathname, href, exact) ? 'page' : undefined}
              aria-busy={isNavigationPending(href)}
              data-pending={isNavigationPending(href) ? 'true' : undefined}
              onClick={() => handleNavigation(href, exact)}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
              {isNavigationPending(href) ? <span className="dashboard-nav__pending" aria-hidden="true" /> : null}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__plan">
          <div>
            <span>Catalogue de lancement</span>
            <strong>Aucune offre active</strong>
          </div>
          <Link href="/dashboard/billing" onClick={() => handleNavigation('/dashboard/billing')}>
            Voir les offres
          </Link>
        </div>

        <div className="dashboard-sidebar__profile">
          <span className="dashboard-avatar">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {mobileOpen ? (
        <button
          className="dashboard-backdrop"
          type="button"
          aria-label="Fermer la navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header__title">
            <button
              className="icon-button dashboard-header__menu"
              type="button"
              aria-label="Ouvrir la navigation"
              aria-controls="dashboard-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <Link className="dashboard-header__brand" href="/" aria-label="Vinkora, retour au site">
              <Image
                src="/brand/vinkora-symbol.png"
                alt="Vinkora"
                width={30}
                height={30}
              />
            </Link>
            <div>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
            </div>
          </div>
          <div className="dashboard-header__actions">
            {pathname !== '/dashboard' ? (
              <Link className="button button--primary" href="/studio" aria-label="Ouvrir le Studio">
                <QrCode size={18} aria-hidden="true" />
                <span>Ouvrir le Studio</span>
              </Link>
            ) : null}
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>

      <nav className="dashboard-mobile-nav" aria-label="Navigation mobile de l’application">
        {navItems.slice(0, 4).map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            className={isCurrent(pathname, href, exact) ? 'is-active' : undefined}
            href={href}
            aria-current={isCurrent(pathname, href, exact) ? 'page' : undefined}
            aria-busy={isNavigationPending(href)}
            data-pending={isNavigationPending(href) ? 'true' : undefined}
            onClick={() => handleNavigation(href, exact)}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label === 'Vue d’ensemble' ? 'Accueil' : label}</span>
            {isNavigationPending(href) ? <span className="dashboard-nav__pending" aria-hidden="true" /> : null}
          </Link>
        ))}
      </nav>
    </div>
  )
}
