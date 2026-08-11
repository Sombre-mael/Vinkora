import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Link2, QrCode } from 'lucide-react'
import { AuthForm } from '@/components/saas/AuthForm'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Interface de connexion Vinkora.',
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-page__brand">
        <Link href="/" aria-label="Retour à l’accueil">
          <Image src="/brand/vinkora-logo-dark.png" alt="Vinkora" width={176} height={48} priority />
        </Link>
        <div>
          <span>Votre espace de travail</span>
          <h1>Retrouvez vos liens, vos QR et leurs performances.</h1>
          <ul>
            <li><Link2 size={18} /> Gérez vos liens courts</li>
            <li><QrCode size={18} /> Modifiez vos QR dynamiques</li>
            <li><BarChart3 size={18} /> Analysez vos campagnes</li>
          </ul>
        </div>
        <small>Créez. Partagez. Mesurez.</small>
      </section>
      <section className="auth-page__panel">
        <div className="auth-panel">
          <Link className="auth-panel__back" href="/">
            <ArrowLeft size={16} /> Retour à l’accueil
          </Link>
          <div className="auth-panel__heading">
            <span>Connexion</span>
            <h2>Bienvenue sur Vinkora</h2>
            <p>L’authentification réelle sera activée dans une prochaine phase.</p>
          </div>
          <AuthForm mode="login" />
          <p className="auth-panel__switch">
            Pas encore de compte ? <Link href="/register">Créer un compte</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
