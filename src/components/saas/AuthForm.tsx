'use client'

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useActionState, useState } from 'react'
import {
  signInWithEmail,
  signUpWithEmail,
  type AuthActionState,
} from '../../../app/auth-actions'
import { GoogleAuthButton } from './GoogleAuthButton'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isRegister = mode === 'register'
  const action = isRegister ? signUpWithEmail : signInWithEmail
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(action, {
    error: '',
  })

  return (
    <div className="auth-methods">
      <GoogleAuthButton mode={mode} />
      <div className="auth-methods__divider" aria-hidden="true">
        <span>ou avec votre e-mail</span>
      </div>
      <form className="auth-form" action={formAction}>
        {isRegister ? (
          <div className="form-field">
            <label htmlFor="auth-name">Nom complet</label>
            <input
              id="auth-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Votre nom"
              required
            />
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
              required
            />
          </div>
        </div>
        <div className="form-field">
          <div className="form-field__label-row">
            <label htmlFor="auth-password">Mot de passe</label>
            {!isRegister ? <small>Réinitialisation bientôt disponible</small> : null}
          </div>
          <div className="input-with-icon">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="auth-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="8 caractères minimum"
              minLength={8}
              required
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
            <input type="checkbox" name="terms" required />
            <span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span>
          </label>
        ) : null}
        {state.error ? <p className="form-message form-message--error">{state.error}</p> : null}
        <button
          className="button button--primary button--large auth-form__submit"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? isRegister
              ? 'Création du compte…'
              : 'Connexion…'
            : isRegister
              ? 'Créer mon compte'
              : 'Se connecter'}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p className="auth-form__notice">
          Votre session est protégée par un cookie sécurisé géré côté serveur.
        </p>
      </form>
    </div>
  )
}
