'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '../../../lib/auth/client'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    const { error } = await authClient.signOut()

    if (error) {
      setPending(false)
      toast.error('La déconnexion a échoué. Réessayez.')
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      className="dashboard-sidebar__sign-out"
      type="button"
      aria-label="Se déconnecter"
      title="Se déconnecter"
      disabled={pending}
      onClick={signOut}
    >
      <LogOut size={17} aria-hidden="true" />
    </button>
  )
}
