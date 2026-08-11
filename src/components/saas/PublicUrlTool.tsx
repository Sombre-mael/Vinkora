'use client'

import Link from 'next/link'
import { ArrowRight, Check, Copy, Link2, LockKeyhole, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

function normalizePublicUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

export function PublicUrlTool() {
  const [value, setValue] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizePublicUrl(value)

    if (!normalized) {
      setError('Saisissez une adresse HTTP ou HTTPS valide.')
      return
    }

    setError('')
    setGeneratedUrl(normalized)
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      toast.success('Lien copié')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('La copie automatique est indisponible.')
    }
  }

  return (
    <div className="hero-tool">
      <div className="hero-tool__modes" aria-label="Mode de création">
        <span className="hero-tool__mode is-active">
          <QrCode size={17} aria-hidden="true" />
          QR statique gratuit
        </span>
        <span className="hero-tool__mode is-locked" title="Disponible avec un compte actif">
          <LockKeyhole size={15} aria-hidden="true" />
          Lien court
          <small>Bientôt</small>
        </span>
      </div>

      <form className="hero-tool__form" onSubmit={handleSubmit} noValidate>
        <div className="hero-tool__field">
          <Link2 size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="public-url">
            Adresse de destination
          </label>
          <input
            id="public-url"
            type="url"
            inputMode="url"
            placeholder="votre-site.com/offre"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError('')
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'public-url-error' : 'public-url-help'}
          />
        </div>
        <button className="button button--primary hero-tool__submit" type="submit">
          Créer le QR
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
      {error ? (
        <p className="form-message form-message--error" id="public-url-error">
          {error}
        </p>
      ) : (
        <p className="hero-tool__help" id="public-url-help">
          Votre QR statique est généré dans ce navigateur. Aucune donnée n’est enregistrée.
        </p>
      )}

      {generatedUrl ? (
        <div className="hero-tool__result" aria-live="polite">
          <div className="hero-tool__qr">
            <QRCodeSVG
              value={generatedUrl}
              size={120}
              level="M"
              marginSize={1}
              bgColor="#FFFFFF"
              fgColor="#0B1220"
              title="Aperçu du QR code"
            />
          </div>
          <div className="hero-tool__result-copy">
            <span>QR prêt à partager</span>
            <strong>{generatedUrl}</strong>
            <div>
              <button className="button button--secondary button--small" type="button" onClick={copyUrl}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
              <Link className="button button--primary button--small" href="/studio">
                Personnaliser
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
