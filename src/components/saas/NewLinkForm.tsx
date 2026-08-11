'use client'

import { ChevronDown, Link2, LockKeyhole, WandSparkles } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'

function safeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function NewLinkForm() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const previewSlug = useMemo(() => safeSlug(slug) || 'votre-slug', [slug])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol')
    } catch {
      setError('Saisissez une adresse HTTP ou HTTPS complète et valide.')
      return
    }

    setError('')
    toast.info('Création désactivée : l’authentification et l’offre active ne sont pas encore intégrées.')
  }

  return (
    <form className="new-link-form" onSubmit={submit} noValidate>
      <section className="form-section">
        <div className="form-section__heading">
          <span>01</span>
          <div>
            <h2>Destination</h2>
            <p>L’adresse vers laquelle vos visiteurs seront redirigés.</p>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="new-link-url">URL de destination</label>
          <div className="input-with-icon">
            <Link2 size={18} aria-hidden="true" />
            <input
              id="new-link-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                if (error) setError('')
              }}
              placeholder="https://votre-site.com/campagne"
              aria-invalid={Boolean(error)}
            />
          </div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
        </div>
        <div className="form-field">
          <label htmlFor="new-link-title">Titre <span>Facultatif</span></label>
          <input
            id="new-link-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Campagne Instagram août"
          />
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__heading">
          <span>02</span>
          <div>
            <h2>Adresse courte</h2>
            <p>Choisissez un nom facile à lire et à retenir.</p>
          </div>
        </div>
        <div className="slug-field">
          <span>vinkora.link/</span>
          <label className="sr-only" htmlFor="new-link-slug">Slug personnalisé</label>
          <input
            id="new-link-slug"
            value={slug}
            onChange={(event) => setSlug(safeSlug(event.target.value))}
            placeholder="votre-slug"
          />
          <button
            className="icon-button"
            type="button"
            aria-label="Suggérer un slug"
            onClick={() => setSlug(safeSlug(title) || 'campagne-2026')}
          >
            <WandSparkles size={18} />
          </button>
        </div>
        <div className="link-preview">
          <span>Aperçu</span>
          <strong>https://vinkora.link/{previewSlug}</strong>
        </div>
      </section>

      <details className="advanced-options">
        <summary>
          <span>Options avancées</span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <div>
          <label className="check-row">
            <input type="checkbox" />
            <span>
              <strong>Paramètres UTM</strong>
              <small>Préparer le suivi de campagne dans vos outils analytics.</small>
            </span>
          </label>
          <label className="check-row">
            <input type="checkbox" />
            <span>
              <strong>Expiration du lien</strong>
              <small>Option prévue dans une version ultérieure.</small>
            </span>
          </label>
        </div>
      </details>

      <div className="new-link-form__footer">
        <p>
          <LockKeyhole size={16} />
          Cette création est un aperçu. Aucune donnée ne sera envoyée à Neon.
        </p>
        <button className="button button--primary button--large" type="submit">
          Créer le lien
        </button>
      </div>
    </form>
  )
}
