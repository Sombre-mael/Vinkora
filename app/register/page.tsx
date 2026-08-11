import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AuthForm } from '@/components/saas/AuthForm'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Interface d’inscription Vinkora.',
}

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-page__brand">
        <Link href="/" aria-label="Retour à l’accueil">
          <Image src="/brand/vinkora-logo-dark.png" alt="Vinkora" width={176} height={48} priority />
        </Link>
        <div>
          <span>Préparez votre espace</span>
          <h1>Transformez vos prochains partages en campagnes mesurables.</h1>
          <ul>
            <li><CheckCircle2 size={18} /> Liens et QR réunis</li>
            <li><CheckCircle2 size={18} /> Interface adaptée au mobile</li>
            <li><CheckCircle2 size={18} /> Offre Mobile Money prévue</li>
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
            <span>Inscription</span>
            <h2>Créer votre espace Vinkora</h2>
            <p>Ce formulaire présente le futur parcours sans créer de compte réel.</p>
          </div>
          <AuthForm mode="register" />
          <p className="auth-panel__switch">
            Déjà inscrit ? <Link href="/login">Se connecter</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
