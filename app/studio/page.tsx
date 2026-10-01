import type { Metadata } from 'next'
import App from '@/App'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'Créez et personnalisez gratuitement votre QR code.',
}

export default function StudioPage() {
  return <App dynamicBetaEnabled={process.env.DYNAMIC_QR_BETA_ENABLED === 'true'} />
}
