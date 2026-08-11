'use client'

import {
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { DemoLink, DemoLinkStatus } from '@/data/saasDemo'
import { Badge } from './SaasUi'

type Filter = 'all' | DemoLinkStatus

export function LinksManager({ initialLinks }: { initialLinks: DemoLink[] }) {
  const [links, setLinks] = useState(initialLinks)
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

  async function copyLink(link: DemoLink) {
    try {
      await navigator.clipboard.writeText(`https://${link.shortUrl}`)
      setCopiedId(link.id)
      toast.success('Lien copié')
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      toast.error('Impossible de copier automatiquement.')
    }
  }

  function toggleLink(id: string) {
    setLinks((current) =>
      current.map((link) =>
        link.id === id
          ? { ...link, status: link.status === 'active' ? 'paused' : 'active' }
          : link,
      ),
    )
    toast.info('État modifié dans cet aperçu uniquement.')
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
                {link.status === 'active' ? 'Actif' : 'En pause'}
              </Badge>
            </div>
            <div className="links-table__clicks" data-label="Clics">
              <strong>{link.clicks.toLocaleString('fr-FR')}</strong>
              <span className={link.trend >= 0 ? 'is-positive' : 'is-negative'}>
                {link.trend >= 0 ? '+' : ''}{link.trend} %
              </span>
            </div>
            <span data-label="Création">{link.createdAt}</span>
            <div className="links-table__actions">
              <button
                className="icon-button"
                type="button"
                aria-label={link.status === 'active' ? `Mettre ${link.title} en pause` : `Activer ${link.title}`}
                onClick={() => toggleLink(link.id)}
              >
                {link.status === 'active' ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <a
                className="icon-button"
                href={link.destination}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ouvrir la destination de ${link.title}`}
              >
                <ExternalLink size={17} />
              </a>
              <button className="icon-button" type="button" aria-label={`Plus d’actions pour ${link.title}`}>
                <MoreHorizontal size={18} />
              </button>
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
