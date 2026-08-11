'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  Link2,
  Menu,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'

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
    title: 'Nouveau lien',
    description: 'Préparez un lien court pour votre prochaine campagne.',
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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const page = pageTitles[pathname] ?? pageTitles['/dashboard']

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileOpen ? 'is-open' : ''}`}>
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
          <span className="dashboard-avatar dashboard-avatar--small">VD</span>
          <div>
            <strong>Espace démo</strong>
            <small>Aucune offre active</small>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav" aria-label="Navigation de l’application">
          <span>Votre espace</span>
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              className={isCurrent(pathname, href, exact) ? 'is-active' : undefined}
              href={href}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__plan">
          <div>
            <span>Catalogue de lancement</span>
            <strong>Aucune offre active</strong>
          </div>
          <Link href="/dashboard/billing">Voir les offres</Link>
        </div>

        <div className="dashboard-sidebar__profile">
          <span className="dashboard-avatar">SM</span>
          <div>
            <strong>Compte visuel</strong>
            <small>Session non connectée</small>
          </div>
          <Settings size={17} aria-hidden="true" />
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
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
            </div>
          </div>
          <div className="dashboard-header__actions">
            <label className="dashboard-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Rechercher dans Vinkora</span>
              <input type="search" placeholder="Rechercher…" />
            </label>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <Link className="button button--primary" href="/dashboard/links/new">
              <Plus size={18} aria-hidden="true" />
              <span>Nouveau lien</span>
            </Link>
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
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label === 'Vue d’ensemble' ? 'Accueil' : label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
