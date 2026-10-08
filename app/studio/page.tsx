import type { Metadata } from 'next'
import App from '@/App'
import { getCurrentVinkoraUser } from '../../lib/auth/vinkora-user'
import { profilePreferences } from '../../lib/personalization'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'Créez et personnalisez gratuitement votre QR code.',
}

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const user = await getCurrentVinkoraUser()

  return <App preferences={profilePreferences(user?.profile)} />
}
