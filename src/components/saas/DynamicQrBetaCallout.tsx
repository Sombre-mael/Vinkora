import Link from 'next/link'
import { ArrowRight, BarChart3, RefreshCw, ShieldCheck } from 'lucide-react'

export function DynamicQrBetaCallout() {
  const enabled = process.env.DYNAMIC_QR_BETA_ENABLED === 'true'

  return (
    <section className="dynamic-beta-band" aria-labelledby="dynamic-beta-title">
      <div className="public-container dynamic-beta-band__inner">
        <div className="dynamic-beta-band__symbol" aria-hidden="true">
          <RefreshCw />
        </div>
        <div className="dynamic-beta-band__copy">
          <span>Bêta gratuite temporaire · hors forfait</span>
          <h2 id="dynamic-beta-title">Un QR que vous pouvez modifier après l’impression.</h2>
          <p>
            Créez jusqu’à trois QR dynamiques par appareil, changez leur destination et consultez
            trente jours de statistiques avec une clé de gestion privée.
          </p>
        </div>
        <div className="dynamic-beta-band__facts">
          <span><ShieldCheck aria-hidden="true" /> Sans compte</span>
          <span><BarChart3 aria-hidden="true" /> Statistiques réelles</span>
        </div>
        {enabled ? (
          <Link className="button button--primary" href="/studio">
            Essayer la bêta
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span className="dynamic-beta-band__pending">Ouverture progressive</span>
        )}
      </div>
    </section>
  )
}
