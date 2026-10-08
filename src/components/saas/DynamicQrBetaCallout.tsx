import Link from 'next/link'
import { ArrowRight, BarChart3, RefreshCw, ShieldCheck } from 'lucide-react'

export function DynamicQrBetaCallout() {
  return (
    <section className="dynamic-beta-band" aria-labelledby="dynamic-beta-title">
      <div className="public-container dynamic-beta-band__inner">
        <div className="dynamic-beta-band__symbol" aria-hidden="true">
          <RefreshCw />
        </div>
        <div className="dynamic-beta-band__copy">
          <span>Inclus avec votre compte Vinkora</span>
          <h2 id="dynamic-beta-title">Un QR que vous pouvez modifier après l’impression.</h2>
          <p>
            Chaque compte peut créer un QR dynamique, changer sa destination et consulter
            ses statistiques depuis son espace.
          </p>
        </div>
        <div className="dynamic-beta-band__facts">
          <span><ShieldCheck aria-hidden="true" /> Lié à votre compte</span>
          <span><BarChart3 aria-hidden="true" /> Statistiques réelles</span>
        </div>
        <Link className="button button--primary" href="/studio">
          Créer mon QR dynamique
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
