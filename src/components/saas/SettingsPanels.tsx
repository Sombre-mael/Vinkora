'use client'

import { Save } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

export function SettingsPanels() {
  const [emailReports, setEmailReports] = useState(true)
  const [productNews, setProductNews] = useState(false)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.info('Préférences modifiées dans cet aperçu uniquement.')
  }

  return (
    <div className="settings-layout">
      <form className="settings-section" onSubmit={save}>
        <div className="settings-section__head">
          <div>
            <h2>Profil</h2>
            <p>Informations affichées dans votre futur espace.</p>
          </div>
          <button className="button button--secondary" type="submit">
            <Save size={16} /> Enregistrer
          </button>
        </div>
        <div className="settings-fields">
          <div className="form-field">
            <label htmlFor="settings-name">Nom complet</label>
            <input id="settings-name" defaultValue="Sombre Mael" />
          </div>
          <div className="form-field">
            <label htmlFor="settings-company">Entreprise</label>
            <input id="settings-company" placeholder="Nom de votre entreprise" />
          </div>
          <div className="form-field">
            <label htmlFor="settings-email">Adresse e-mail</label>
            <input id="settings-email" type="email" defaultValue="demo@vinkora.app" />
          </div>
          <div className="form-field">
            <label htmlFor="settings-city">Ville</label>
            <input id="settings-city" defaultValue="Lubumbashi" />
          </div>
        </div>
      </form>

      <section className="settings-section">
        <div className="settings-section__head">
          <div>
            <h2>Préférences</h2>
            <p>Choisissez les communications que vous souhaitez recevoir.</p>
          </div>
        </div>
        <div className="settings-toggles">
          <div>
            <span>
              <strong>Rapport hebdomadaire</strong>
              <small>Recevoir un résumé des performances de vos liens.</small>
            </span>
            <button
              className={`switch ${emailReports ? 'is-on' : ''}`}
              type="button"
              role="switch"
              aria-checked={emailReports}
              onClick={() => setEmailReports((value) => !value)}
            >
              <i />
            </button>
          </div>
          <div>
            <span>
              <strong>Nouveautés produit</strong>
              <small>Recevoir les annonces des nouvelles fonctionnalités.</small>
            </span>
            <button
              className={`switch ${productNews ? 'is-on' : ''}`}
              type="button"
              role="switch"
              aria-checked={productNews}
              onClick={() => setProductNews((value) => !value)}
            >
              <i />
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section settings-section--danger">
        <div>
          <h2>Zone sensible</h2>
          <p>La suppression de compte sera disponible avec l’authentification réelle.</p>
        </div>
        <button className="button button--danger" type="button" disabled>
          Supprimer le compte
        </button>
      </section>
    </div>
  )
}
