'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AccountStatusLink } from './AccountStatusLink'

const navItems = [
  { href: '/features', label: 'Fonctionnalités' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/faq', label: 'FAQ' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const handleNavigation = (href: string) => {
    setOpen(false)
    if (href !== pathname) {
      setPendingHref(href)
    }
  }

  const isNavigationPending = (href: string) => pendingHref === href && pathname !== href

  return (
    <header className="public-nav">
      <div className="public-container public-nav__inner">
        <Link className="public-nav__brand" href="/" aria-label="Vinkora, accueil">
          <Image
            src="/brand/vinkora-logo.png"
            alt="Vinkora"
            width={176}
            height={48}
            priority
          />
        </Link>

        <nav className="public-nav__links" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${pathname === item.href ? 'is-active' : ''}${isNavigationPending(item.href) ? ' is-pending' : ''}`.trim()}
              aria-current={pathname === item.href ? 'page' : undefined}
              aria-busy={isNavigationPending(item.href)}
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-nav__actions">
          <AccountStatusLink className="button button--ghost" />
          <Link className="button button--primary" href="/studio">
            Ouvrir le Studio
          </Link>
        </div>

        <button
          className="icon-button public-nav__toggle"
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="public-mobile-menu"
        className={`public-nav__mobile ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <nav aria-label="Navigation mobile">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isNavigationPending(item.href) ? 'is-pending' : undefined}
              aria-current={pathname === item.href ? 'page' : undefined}
              aria-busy={isNavigationPending(item.href)}
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </Link>
          ))}
          <AccountStatusLink onClick={() => setOpen(false)} />
          <Link className="button button--primary" href="/studio" onClick={() => setOpen(false)}>
            Ouvrir le Studio
          </Link>
        </nav>
      </div>
    </header>
  )
}
