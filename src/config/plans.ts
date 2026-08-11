export const PLAN_IDS = ['FREE', 'EVENT_PASS', 'STARTER'] as const

export type PlanId = (typeof PLAN_IDS)[number]
export type PlanType = 'FREE' | 'PASS' | 'SUBSCRIPTION'
export type CatalogPublicationStatus = 'PUBLISHED' | 'HIDDEN'
export type PlanAvailability = 'AVAILABLE' | 'COMING_SOON'

export type LaunchPlan = {
  id: PlanId
  publicName: string
  type: PlanType
  summary: string
  pricing: {
    usd: number
    cdf: number | null
  }
  duration: {
    days: number | null
    label: string
  }
  quotas: {
    dynamicResourcesPerPeriod: number
    analyzedEventsPerPeriod: number
  }
  features: readonly string[]
  limitations: readonly string[]
  statisticsRetention: {
    days: number | null
    label: string
  }
  gracePeriodDays: number | null
  postExpirationBehavior: string
  commercialStatus: {
    publication: CatalogPublicationStatus
    availability: PlanAvailability
    purchasable: boolean
  }
  recommended: boolean
  cta: {
    label: string
    href: string | null
  }
}

export const dynamicResourceDefinition =
  'Une ressource dynamique correspond à un lien court ou un QR dynamique.'

export const catalogPriceNotice =
  'Les prix USD et CDF sont des prix commerciaux distincts. Le prix CDF n’est pas calculé avec un taux de change.'

export const launchCatalogRules = [
  'Les quotas représentent les créations autorisées pendant une période.',
  'Supprimer une ressource ne restitue pas le quota consommé.',
  'Les quotas sont renouvelés au début d’une nouvelle période payée.',
  'Un QR statique créé avec Free ne consomme aucun quota.',
  'Atteindre la limite d’analyses ne bloque pas une redirection encore autorisée.',
  'Après la limite, aucun nouvel événement analytique détaillé n’est enregistré.',
  'Aucun dépassement n’est facturé automatiquement.',
  'Il faut renouveler l’offre ou passer à une offre supérieure pour obtenir de nouveaux quotas.',
] as const

export const launchPlans = [
  {
    id: 'FREE',
    publicName: 'Free',
    type: 'FREE',
    summary: 'Pour créer et exporter des QR codes statiques directement dans votre navigateur.',
    pricing: { usd: 0, cdf: null },
    duration: { days: null, label: 'Illimitée' },
    quotas: {
      dynamicResourcesPerPeriod: 0,
      analyzedEventsPerPeriod: 0,
    },
    features: [
      'QR codes statiques uniquement',
      'Génération locale dans le navigateur',
      'Aucun compte obligatoire',
      'Historique conservé uniquement sur l’appareil',
      'Personnalisation du QR',
      'Aucune publicité intégrée dans le QR exporté',
    ],
    limitations: [
      'Aucune sauvegarde dans Neon',
      'Aucune statistique serveur',
      'Aucune ressource dynamique',
      'Destination non modifiable après impression',
      'Encarts sponsorisés possibles dans l’application',
    ],
    statisticsRetention: {
      days: null,
      label: 'Aucune statistique serveur',
    },
    gracePeriodDays: null,
    postExpirationBehavior: 'Sans expiration : les QR statiques exportés restent autonomes.',
    commercialStatus: {
      publication: 'PUBLISHED',
      availability: 'AVAILABLE',
      purchasable: false,
    },
    recommended: false,
    cta: {
      label: 'Ouvrir le Studio',
      href: '/studio',
    },
  },
  {
    id: 'EVENT_PASS',
    publicName: 'Pass Événement',
    type: 'PASS',
    summary: 'Pour une campagne courte, un événement ou une activation limitée dans le temps.',
    pricing: { usd: 2, cdf: 5000 },
    duration: { days: 7, label: '7 jours' },
    quotas: {
      dynamicResourcesPerPeriod: 10,
      analyzedEventsPerPeriod: 2000,
    },
    features: [
      'Slugs personnalisés',
      'Modification des destinations',
      'Statistiques par date, appareil et pays',
      'Consultation du rapport pendant 30 jours après la fin du Pass',
      'Un seul utilisateur',
      'Aucune publicité',
    ],
    limitations: ['Aucun domaine personnalisé'],
    statisticsRetention: {
      days: 30,
      label: 'Rapport consultable pendant 30 jours après la fin du Pass',
    },
    gracePeriodDays: 3,
    postExpirationBehavior:
      'Après la période de grâce, une page indique que la campagne est terminée.',
    commercialStatus: {
      publication: 'PUBLISHED',
      availability: 'COMING_SOON',
      purchasable: false,
    },
    recommended: false,
    cta: {
      label: 'Bientôt disponible',
      href: null,
    },
  },
  {
    id: 'STARTER',
    publicName: 'Starter',
    type: 'SUBSCRIPTION',
    summary: 'Pour gérer régulièrement des liens courts, des QR dynamiques et leurs résultats.',
    pricing: { usd: 4, cdf: 10000 },
    duration: { days: 30, label: '30 jours' },
    quotas: {
      dynamicResourcesPerPeriod: 50,
      analyzedEventsPerPeriod: 10000,
    },
    features: [
      'Slugs personnalisés',
      'Modification des destinations',
      'Dashboard et historique cloud',
      'Organisation simple des ressources',
      'Conservation des statistiques pendant 90 jours',
      'Un seul utilisateur',
      'Aucune publicité',
    ],
    limitations: ['Aucun domaine personnalisé'],
    statisticsRetention: {
      days: 90,
      label: 'Conservation des statistiques pendant 90 jours',
    },
    gracePeriodDays: 7,
    postExpirationBehavior:
      'Après expiration, les redirections sont conservées, les destinations sont figées et les nouvelles statistiques sont bloquées.',
    commercialStatus: {
      publication: 'PUBLISHED',
      availability: 'COMING_SOON',
      purchasable: false,
    },
    recommended: true,
    cta: {
      label: 'Bientôt disponible',
      href: null,
    },
  },
] as const satisfies readonly LaunchPlan[]

export const publishedLaunchPlans = launchPlans.filter(
  (plan) => plan.commercialStatus.publication === 'PUBLISHED',
)

export function getLaunchPlan(id: PlanId) {
  return launchPlans.find((plan) => plan.id === id)
}
