'use client'

import { useState } from 'react'
import { authClient } from '../../../lib/auth/client'

type GoogleAuthButtonProps = {
  mode: 'login' | 'register'
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setIsPending(true)
    setError('')

    try {
      const callbackURL = new URL('/dashboard', window.location.origin).toString()
      const { error: authError } = await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      })

      if (authError) {
        setError('La connexion avec Google a échoué. Réessayez.')
        setIsPending(false)
      }
    } catch {
      setError('La connexion avec Google est momentanément indisponible.')
      setIsPending(false)
    }
  }

  return (
    <div className="google-auth">
      <button
        className="google-auth__button"
        type="button"
        disabled={isPending}
        onClick={handleGoogleSignIn}
      >
        <span className="google-auth__mark" aria-hidden="true">
          G
        </span>
        {isPending
          ? 'Ouverture de Google…'
          : mode === 'register'
            ? 'Créer un compte avec Google'
            : 'Continuer avec Google'}
      </button>
      {mode === 'register' ? (
        <p className="google-auth__terms">
          En continuant avec Google, vous acceptez les conditions d’utilisation et la politique
          de confidentialité.
        </p>
      ) : null}
      {error ? <p className="form-message form-message--error">{error}</p> : null}
    </div>
  )
}
