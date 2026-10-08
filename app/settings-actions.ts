'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentVinkoraUser } from '../lib/auth/vinkora-user'
import { parseProfileSettings } from '../lib/personalization'
import { getPrisma } from '../lib/prisma'

export type SettingsActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export async function updateProfileSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentVinkoraUser()

  if (!user) {
    return { status: 'error', message: 'Reconnectez-vous pour enregistrer vos préférences.' }
  }

  try {
    const settings = parseProfileSettings(formData)

    await getPrisma().profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...settings },
      update: settings,
    })

    revalidatePath('/dashboard', 'layout')
    revalidatePath('/studio')

    return { status: 'success', message: 'Votre espace Vinkora a été personnalisé.' }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Impossible d’enregistrer vos préférences.',
    }
  }
}
