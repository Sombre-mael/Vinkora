import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  FileImage,
  Globe2,
  Link2,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { DashboardPreview } from '@/components/saas/DashboardPreview'
import { PublicFooter } from '@/components/saas/PublicFooter'
import { PublicNav } from '@/components/saas/PublicNav'
import { PublicUrlTool } from '@/components/saas/PublicUrlTool'
import { PlanCard } from '@/components/saas/PlanCard'
import { publishedLaunchPlans } from '@/config/plans'

export const metadata: Metadata = {
  title: 'Vinkora — Liens courts et QR codes',
  description:
    'Créez des QR codes professionnels, gérez vos liens et comprenez leurs performances avec Vinkora.',
}

const features = [
  {
    icon: Link2,
    title: 'Des liens faciles à partager',
    description: 'Transformez des adresses longues en liens clairs et mémorables.',
  },
  {
    icon: QrCode,
    title: 'Des QR codes à votre image',
    description: 'Couleurs, formes, logo et exports haute définition depuis le Studio.',
  },
  {
    icon: BarChart3,
    title: 'Des résultats compréhensibles',
    description: 'Suivez les clics, les sources et les appareils depuis un seul espace.',
  },
  {
    icon: Globe2,
    title: 'Pensé pour vos campagnes',
    description: 'Menus, événements, réseaux sociaux et supports imprimés.',
  },
]

const reassurance = [
  { icon: ShieldCheck, label: 'QR statiques créés localement' },
  { icon: Zap, label: 'Redirections rapides' },
  { icon: FileImage, label: 'Exports PNG et SVG' },
]

export default function HomePage() {
  return (
    <div className="public-site">
      <PublicNav />
      <main>
        <section className="home-hero">
          <div className="public-container home-hero__grid">
            <div className="home-hero__copy reveal">
              <span className="public-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                La gestion de liens, simplement
              </span>
              <h1>
                <span>Vinkora,</span> vos liens enfin mesurables.
              </h1>
              <p>
                Créez des QR codes professionnels aujourd’hui. Gérez demain vos liens courts,
                campagnes et performances depuis un espace conçu pour aller à l’essentiel.
              </p>
              <div className="home-hero__actions">
                <Link className="button button--primary button--large" href="/studio">
                  Créer mon QR code
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="button button--secondary button--large" href="/features">
                  Découvrir Vinkora
                </Link>
              </div>
              <div className="home-hero__proof">
                {reassurance.map(({ icon: Icon, label }) => (
                  <span key={label}>
                    <Icon size={15} aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="home-hero__tool reveal reveal--delay">
              <PublicUrlTool />
            </div>
          </div>
        </section>

        <section className="product-preview public-section">
          <div className="public-container">
            <div className="public-section__heading public-section__heading--center">
              <span className="public-eyebrow">Un espace, une vision claire</span>
              <h2>Pilotez vos liens sans vous perdre dans les chiffres.</h2>
              <p>
                L’interface rassemble les indicateurs utiles, les liens actifs et les actions
                quotidiennes dans un tableau de bord lisible.
              </p>
            </div>
            <DashboardPreview />
            <p className="product-preview__caption">
              Aperçu de l’interface. Les données affichées sont fictives.
            </p>
          </div>
        </section>

        <section className="feature-band public-section" id="fonctionnalites">
          <div className="public-container">
            <div className="public-section__heading">
              <span className="public-eyebrow">Tout ce qu’il faut</span>
              <h2>Du premier partage à la première décision.</h2>
              <p>
                Vinkora relie création, personnalisation et mesure dans un flux cohérent.
              </p>
            </div>
            <div className="feature-lines">
              {features.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="feature-line">
                  <span className="feature-line__number">0{index + 1}</span>
                  <span className="feature-line__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <ArrowRight size={18} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow public-section">
          <div className="public-container workflow__grid">
            <div className="public-section__heading">
              <span className="public-eyebrow">Trois étapes</span>
              <h2>Créez. Partagez. Mesurez.</h2>
              <p>Un parcours court, depuis votre URL jusqu’aux résultats de votre campagne.</p>
            </div>
            <ol className="workflow__steps">
              <li>
                <span>1</span>
                <div>
                  <h3>Créez</h3>
                  <p>Ajoutez votre destination et choisissez un lien ou un QR code.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <h3>Personnalisez</h3>
                  <p>Adaptez le style, le nom et le format à votre marque.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <h3>Analysez</h3>
                  <p>Observez les clics et identifiez les canaux qui fonctionnent.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="pricing-teaser public-section">
          <div className="public-container pricing-teaser__grid">
            <div>
              <span className="public-eyebrow">Commencez gratuitement</span>
              <h2>Le bon niveau de puissance, au bon moment.</h2>
              <p>
                Free couvre les QR statiques locaux. Pass Événement et Starter ajouteront les
                ressources dynamiques et les statistiques lorsqu’ils seront disponibles.
              </p>
              <Link className="text-link" href="/pricing">
                Comparer les offres <ArrowRight size={16} />
              </Link>
            </div>
            <div className="catalog-plan-grid catalog-plan-grid--compact">
              {publishedLaunchPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} compact />
              ))}
            </div>
          </div>
        </section>

        <section className="trust-band">
          <div className="public-container trust-band__inner">
            <div>
              <Image src="/brand/vinkora-symbol.png" alt="" width={58} height={58} />
              <div>
                <strong>Une plateforme pensée depuis la RDC</strong>
                <span>Simple à adopter, claire à utiliser, prête à grandir avec vos besoins.</span>
              </div>
            </div>
            <div className="trust-band__facts">
              <span><strong>100 %</strong> local pour le QR gratuit</span>
              <span><strong>0</strong> compte requis pour commencer</span>
              <span><strong>2</strong> formats d’export</span>
            </div>
          </div>
        </section>

        <section className="home-faq public-section">
          <div className="public-container home-faq__grid">
            <div className="public-section__heading">
              <span className="public-eyebrow">Questions fréquentes</span>
              <h2>Vous pouvez commencer sans engagement.</h2>
              <Link className="text-link" href="/faq">
                Voir toutes les réponses <ArrowRight size={16} />
              </Link>
            </div>
            <div className="faq-list">
              <details open>
                <summary>Le Studio QR est-il vraiment gratuit ?</summary>
                <p>Oui. Les QR statiques sont créés localement et exportables sans compte.</p>
              </details>
              <details>
                <summary>Quand les statistiques seront-elles disponibles ?</summary>
                <p>Elles arriveront avec Pass Événement et Starter.</p>
              </details>
              <details>
                <summary>Mes QR existants continueront-ils à fonctionner ?</summary>
                <p>Oui, un QR statique exporté reste autonome et ne dépend pas de Vinkora.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="public-container final-cta__inner">
            <div>
              <span>Votre prochain lien peut déjà mieux travailler.</span>
              <h2>Créez un QR professionnel en quelques minutes.</h2>
            </div>
            <Link className="button button--accent button--large" href="/studio">
              Ouvrir le Studio
              <Palette size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
