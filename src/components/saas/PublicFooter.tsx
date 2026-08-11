import Image from 'next/image'
import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-container public-footer__grid">
        <div className="public-footer__brand">
          <Image src="/brand/vinkora-logo.png" alt="Vinkora" width={156} height={42} />
          <p>Créez. Partagez. Mesurez.</p>
          <span>Une plateforme pensée pour transformer chaque lien en opportunité.</span>
        </div>
        <div>
          <strong>Produit</strong>
          <Link href="/features">Fonctionnalités</Link>
          <Link href="/pricing">Tarifs</Link>
          <Link href="/studio">Studio QR</Link>
        </div>
        <div>
          <strong>Ressources</strong>
          <Link href="/faq">Questions fréquentes</Link>
          <Link href="/dashboard">Aperçu du dashboard</Link>
        </div>
        <div>
          <strong>Compte</strong>
          <Link href="/login">Connexion</Link>
          <Link href="/register">Créer un compte</Link>
        </div>
      </div>
      <div className="public-container public-footer__bottom">
        <span>© 2026 Vinkora. Tous droits réservés.</span>
        <span>Conçu en République démocratique du Congo.</span>
      </div>
    </footer>
  )
}
