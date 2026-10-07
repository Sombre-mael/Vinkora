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
      const { error: authError } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
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
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.22c-.22 1.4-1.01 2.59-2.14 3.39v2.82h3.47c2.03-1.87 3.2-4.62 3.2-8.24Z"
            />
            <path
              fill="#34A853"
              d="M12 21.6c2.91 0 5.35-.96 7.13-2.61l-3.47-2.82c-.96.64-2.18 1.03-3.66 1.03-2.82 0-5.21-1.91-6.07-4.48H2.34v2.91A10.77 10.77 0 0 0 12 21.6Z"
            />
            <path
              fill="#FBBC05"
              d="M5.93 12.72a6.48 6.48 0 0 1-.34-1.92c0-.67.12-1.32.34-1.92V5.97H2.34A10.8 10.8 0 0 0 1.2 10.8c0 1.74.42 3.39 1.14 4.83l3.59-2.91Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.4c1.58 0 3 .54 4.12 1.6l3.08-3.08C17.35 1.18 14.91.2 12 .2A10.77 10.77 0 0 0 2.34 5.97l3.59 2.91C6.79 6.31 9.18 4.4 12 4.4Z"
            />
          </svg>
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
