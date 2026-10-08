'use client'

import { useActionState } from 'react'
import { Check, LoaderCircle, Save } from 'lucide-react'
import {
  updateProfileSettings,
  type SettingsActionState,
} from '../../../app/settings-actions'
import type { InterfacePreferences } from '../../../lib/personalization'

type SettingsPanelsProps = {
  user: {
    name: string
    email: string
    company: string
    city: string
  }
  preferences: InterfacePreferences
}

const initialState: SettingsActionState = { status: 'idle', message: '' }

export function SettingsPanels({ user, preferences }: SettingsPanelsProps) {
  const [state, formAction, pending] = useActionState(updateProfileSettings, initialState)

  return (
    <form className="settings-form" action={formAction}>
      <section className="settings-section">
        <div className="settings-section__head">
          <div>
            <h2>Profil</h2>
            <p>Les informations visibles dans votre espace Vinkora.</p>
          </div>
        </div>
        <div className="settings-form__grid">
          <label className="form-field">
            <span>Nom complet</span>
            <input name="name" defaultValue={user.name} maxLength={120} required />
          </label>
          <label className="form-field">
            <span>Adresse e-mail</span>
            <input value={user.email} disabled aria-describedby="email-help" />
            <small id="email-help">Gérée par votre méthode de connexion.</small>
          </label>
          <label className="form-field">
            <span>Entreprise</span>
            <input name="company" defaultValue={user.company} maxLength={160} placeholder="Votre entreprise" />
          </label>
          <label className="form-field">
            <span>Ville</span>
            <input name="city" defaultValue={user.city} maxLength={120} placeholder="Votre ville" />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section__head">
          <div>
            <h2>Votre interface</h2>
            <p>Adaptez l’accent, l’espacement et les transitions à votre façon de travailler.</p>
          </div>
        </div>

        <fieldset className="preference-group">
          <legend>Couleur d’accent</legend>
          <div className="preference-options preference-options--accent">
            <PreferenceOption name="interfaceAccent" value="INDIGO" label="Indigo" defaultChecked={preferences.accent === 'INDIGO'} />
            <PreferenceOption name="interfaceAccent" value="TEAL" label="Turquoise" defaultChecked={preferences.accent === 'TEAL'} />
            <PreferenceOption name="interfaceAccent" value="BLUE" label="Bleu" defaultChecked={preferences.accent === 'BLUE'} />
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>Densité</legend>
          <div className="preference-options">
            <PreferenceOption name="interfaceDensity" value="COMFORTABLE" label="Confortable" description="Plus d’air entre les contenus" defaultChecked={preferences.density === 'COMFORTABLE'} />
            <PreferenceOption name="interfaceDensity" value="COMPACT" label="Compacte" description="Plus d’informations à l’écran" defaultChecked={preferences.density === 'COMPACT'} />
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>Mouvement</legend>
          <div className="preference-options">
            <PreferenceOption name="interfaceMotion" value="SYSTEM" label="Système" description="Suit le réglage de votre appareil" defaultChecked={preferences.motion === 'SYSTEM'} />
            <PreferenceOption name="interfaceMotion" value="EXPRESSIVE" label="Expressif" description="Transitions Vinkora plus présentes" defaultChecked={preferences.motion === 'EXPRESSIVE'} />
            <PreferenceOption name="interfaceMotion" value="REDUCED" label="Réduit" description="Mouvements minimisés" defaultChecked={preferences.motion === 'REDUCED'} />
          </div>
        </fieldset>
      </section>

      <div className="settings-form__footer">
        <p className={`settings-feedback is-${state.status}`} role="status" aria-live="polite">
          {state.status === 'success' ? <Check size={17} aria-hidden="true" /> : null}
          {state.message}
        </p>
        <button className="button button--primary" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

type PreferenceOptionProps = {
  name: 'interfaceAccent' | 'interfaceDensity' | 'interfaceMotion'
  value: string
  label: string
  description?: string
  defaultChecked: boolean
}

function PreferenceOption({
  name,
  value,
  label,
  description,
  defaultChecked,
}: PreferenceOptionProps) {
  return (
    <label className="preference-option">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} />
      <span className={`preference-option__visual is-${value.toLowerCase()}`} aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <Check className="preference-option__check" size={17} aria-hidden="true" />
    </label>
  )
}
