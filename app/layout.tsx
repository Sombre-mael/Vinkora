import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { PwaRegistration } from '@/components/PwaRegistration'
import '@/index.css'
import '@/App.css'
import './saas.css'

export const metadata: Metadata = {
  title: {
    default: 'Vinkora',
    template: '%s | Vinkora',
  },
  description:
    'Vinkora permet de raccourcir vos liens et de créer des QR codes personnalisés, prêts à être partagés.',
  applicationName: 'Vinkora',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/favicon-64.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1220',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <PwaRegistration />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
