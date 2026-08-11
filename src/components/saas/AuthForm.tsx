'use client'

import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const isRegister = mode === 'register'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    if (!email.includes('@') || password.length < 8) {
      setError('Utilisez une adresse valide et un mot de passe d’au moins 8 caractères.')
      return
    }

    setError('')
    toast.info('L’authentification sécurisée sera activée dans une prochaine phase.')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {isRegister ? (
        <div className="form-field">
          <label htmlFor="auth-name">Nom complet</label>
          <input id="auth-name" name="name" type="text" autoComplete="name" placeholder="Votre nom" />
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="auth-email">Adresse e-mail</label>
        <div className="input-with-icon">
          <Mail size={18} aria-hidden="true" />
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@entreprise.com"
          />
        </div>
      </div>
      <div className="form-field">
        <div className="form-field__label-row">
          <label htmlFor="auth-password">Mot de passe</label>
          {!isRegister ? <Link href="/faq">Mot de passe oublié ?</Link> : null}
        </div>
        <div className="input-with-icon">
          <LockKeyhole size={18} aria-hidden="true" />
          <input
            id="auth-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="8 caractères minimum"
          />
          <button
            className="input-with-icon__action"
            type="button"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {isRegister ? (
        <label className="check-row">
          <input type="checkbox" name="terms" />
          <span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span>
        </label>
      ) : null}
      {error ? <p className="form-message form-message--error">{error}</p> : null}
      <button className="button button--primary button--large auth-form__submit" type="submit">
        {isRegister ? 'Créer mon compte' : 'Se connecter'}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
      <p className="auth-form__notice">
        Démonstration visuelle uniquement. Aucun compte ni aucune session ne sera créé.
      </p>
    </form>
  )
}
