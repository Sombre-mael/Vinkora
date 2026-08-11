'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/features', label: 'Fonctionnalités' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/faq', label: 'FAQ' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
              className={pathname === item.href ? 'is-active' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-nav__actions">
          <Link className="button button--ghost" href="/login">
            Se connecter
          </Link>
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
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}>Se connecter</Link>
          <Link className="button button--primary" href="/studio" onClick={() => setOpen(false)}>
            Ouvrir le Studio
          </Link>
        </nav>
      </div>
    </header>
  )
}
