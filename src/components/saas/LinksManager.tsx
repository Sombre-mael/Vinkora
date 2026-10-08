'use client'

import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge, EmptyState } from './SaasUi'

export type DashboardLinkStatus = 'active' | 'paused' | 'archived'

export type DashboardLink = {
  id: string
  title: string
  slug: string
  shortUrl: string
  destination: string
  clicks: number
  status: DashboardLinkStatus
  createdAt: string
  manageUrl: string
}

type Filter = 'all' | DashboardLinkStatus

export function LinksManager({ initialLinks }: { initialLinks: DashboardLink[] }) {
  const links = initialLinks
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return links.filter((link) => {
      const matchesFilter = filter === 'all' || link.status === filter
      const matchesQuery =
        !normalized ||
        link.title.toLowerCase().includes(normalized) ||
        link.slug.toLowerCase().includes(normalized) ||
        link.destination.toLowerCase().includes(normalized)
      return matchesFilter && matchesQuery
    })
  }, [filter, links, query])

  async function copyLink(link: DashboardLink) {
    try {
      const publicUrl = link.shortUrl.startsWith('/')
        ? `${window.location.origin}${link.shortUrl}`
        : link.shortUrl
      await navigator.clipboard.writeText(publicUrl)
      setCopiedId(link.id)
      toast.success('Lien copié')
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      toast.error('Impossible de copier automatiquement.')
    }
  }

  if (!links.length) {
    return (
      <EmptyState
        icon={Link2}
        title="Aucun lien dans votre espace"
        description="Vos liens courts et QR dynamiques apparaîtront ici après leur création."
        actionLabel="Ouvrir le Studio"
        actionHref="/studio"
      />
    )
  }

  return (
    <section className="links-manager">
      <div className="links-toolbar">
        <label className="links-toolbar__search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Rechercher un lien</span>
          <input
            type="search"
            placeholder="Rechercher par nom, slug ou destination"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="links-toolbar__filters" aria-label="Filtrer les liens">
          <SlidersHorizontal size={17} aria-hidden="true" />
          {([
            ['all', 'Tous'],
            ['active', 'Actifs'],
            ['paused', 'En pause'],
            ['archived', 'Archivés'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? 'is-active' : undefined}
              type="button"
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="links-table">
        <div className="links-table__head">
          <span>Lien</span>
          <span>État</span>
          <span>Clics</span>
          <span>Création</span>
          <span className="sr-only">Actions</span>
        </div>
        {filtered.map((link) => (
          <article className="links-table__row" key={link.id}>
            <div className="links-table__identity">
              <span className="links-table__favicon">{link.title.charAt(0)}</span>
              <div>
                <strong>{link.title}</strong>
                <button type="button" onClick={() => copyLink(link)}>
                  {link.shortUrl}
                  {copiedId === link.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <small title={link.destination}>{link.destination}</small>
              </div>
            </div>
            <div data-label="État">
              <Badge tone={link.status === 'active' ? 'success' : 'warning'}>
                {link.status === 'active' ? 'Actif' : link.status === 'paused' ? 'En pause' : 'Archivé'}
              </Badge>
            </div>
            <div className="links-table__clicks" data-label="Clics">
              <strong>{link.clicks.toLocaleString('fr-FR')}</strong>
            </div>
            <span data-label="Création">{link.createdAt}</span>
            <div className="links-table__actions">
              <a
                className="icon-button"
                href={link.manageUrl}
                aria-label={`Gérer ${link.title}`}
              >
                <ExternalLink size={17} />
              </a>
            </div>
          </article>
        ))}
        {!filtered.length ? (
          <div className="links-table__empty">
            <Search size={22} />
            <strong>Aucun lien trouvé</strong>
            <span>Essayez une recherche ou un filtre différent.</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
