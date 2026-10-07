'use server'

import { redirect } from 'next/navigation'
import { auth } from '../lib/auth/server'
import { ensureVinkoraUser, SuspendedUserError } from '../lib/auth/vinkora-user'

export type AuthActionState = {
  error: string
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
  }
}

function validateCredentials(email: string, password: string) {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Saisissez une adresse e-mail valide.'
  }

  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.'
  }

  return ''
}

function toSafeAuthError(error: unknown) {
  if (error instanceof SuspendedUserError) {
    return error.message
  }

  console.error('[vinkora-auth] Authentication failed.', {
    errorType: error instanceof Error ? error.name : typeof error,
  })
  return 'Une erreur empêche la connexion pour le moment. Réessayez plus tard.'
}

export async function signUpWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get('name') ?? '').trim()
  const termsAccepted = formData.get('terms') === 'on'
  const { email, password } = readCredentials(formData)
  const validationError = validateCredentials(email, password)

  if (!name) {
    return { error: 'Indiquez votre nom.' }
  }

  if (validationError) {
    return { error: validationError }
  }

  if (!termsAccepted) {
    return { error: 'Vous devez accepter les conditions d’utilisation.' }
  }

  try {
    const { data, error } = await auth.signUp.email({ email, password, name })

    if (error || !data?.user) {
      return { error: error?.message || 'La création du compte a échoué.' }
    }

    await ensureVinkoraUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    })
  } catch (error) {
    if (error instanceof SuspendedUserError) {
      await auth.signOut()
    }

    return { error: toSafeAuthError(error) }
  }

  redirect('/dashboard')
}

export async function signInWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData)
  const validationError = validateCredentials(email, password)

  if (validationError) {
    return { error: validationError }
  }

  try {
    const { data, error } = await auth.signIn.email({ email, password })

    if (error || !data?.user) {
      return { error: 'Adresse e-mail ou mot de passe incorrect.' }
    }

    await ensureVinkoraUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    })
  } catch (error) {
    if (error instanceof SuspendedUserError) {
      await auth.signOut()
    }

    return { error: toSafeAuthError(error) }
  }

  redirect('/dashboard')
}
