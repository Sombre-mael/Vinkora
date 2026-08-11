export type DemoLinkStatus = 'active' | 'paused'

export type DemoLink = {
  id: string
  title: string
  slug: string
  shortUrl: string
  destination: string
  clicks: number
  status: DemoLinkStatus
  createdAt: string
  trend: number
}

export type DemoActivity = {
  id: string
  label: string
  detail: string
  time: string
  tone: 'indigo' | 'teal' | 'neutral'
}

export const DEMO_DATA_NOTICE =
  'Aperçu avec des données de démonstration. La connexion au compte sera ajoutée dans une prochaine phase.'

export const demoLinks: DemoLink[] = [
  {
    id: 'demo-link-1',
    title: 'Menu été 2026',
    slug: 'menu-ete',
    shortUrl: 'vinkora.link/menu-ete',
    destination: 'https://example.com/restaurant/menu',
    clicks: 1248,
    status: 'active',
    createdAt: '24 juil. 2026',
    trend: 18,
  },
  {
    id: 'demo-link-2',
    title: 'Campagne Instagram',
    slug: 'instagram-juillet',
    shortUrl: 'vinkora.link/instagram-juillet',
    destination: 'https://example.com/campagne/instagram',
    clicks: 863,
    status: 'active',
    createdAt: '19 juil. 2026',
    trend: 9,
  },
  {
    id: 'demo-link-3',
    title: 'Invitation conférence',
    slug: 'conference-lushi',
    shortUrl: 'vinkora.link/conference-lushi',
    destination: 'https://example.com/evenements/conference',
    clicks: 417,
    status: 'paused',
    createdAt: '12 juil. 2026',
    trend: -4,
  },
  {
    id: 'demo-link-4',
    title: 'Catalogue WhatsApp',
    slug: 'catalogue',
    shortUrl: 'vinkora.link/catalogue',
    destination: 'https://example.com/catalogue',
    clicks: 291,
    status: 'active',
    createdAt: '5 juil. 2026',
    trend: 6,
  },
]

export const demoTrend = [
  { label: '22 juil.', value: 118 },
  { label: '23 juil.', value: 164 },
  { label: '24 juil.', value: 139 },
  { label: '25 juil.', value: 212 },
  { label: '26 juil.', value: 187 },
  { label: '27 juil.', value: 256 },
  { label: '28 juil.', value: 231 },
] as const

export const demoActivities: DemoActivity[] = [
  {
    id: 'activity-1',
    label: 'Nouveau pic de trafic',
    detail: 'Menu été 2026 a reçu 126 clics aujourd’hui.',
    time: 'Il y a 12 min',
    tone: 'teal',
  },
  {
    id: 'activity-2',
    label: 'Lien mis en pause',
    detail: 'Invitation conférence ne redirige plus temporairement.',
    time: 'Il y a 2 h',
    tone: 'neutral',
  },
  {
    id: 'activity-3',
    label: 'Lien créé',
    detail: 'Catalogue WhatsApp a été ajouté à l’espace.',
    time: 'Il y a 3 jours',
    tone: 'indigo',
  },
]

export const demoSources = [
  { label: 'Accès direct', value: 46 },
  { label: 'Réseaux sociaux', value: 31 },
  { label: 'Messageries', value: 15 },
  { label: 'Autres sites', value: 8 },
] as const

export const demoDevices = [
  { label: 'Mobile', value: 72 },
  { label: 'Ordinateur', value: 21 },
  { label: 'Tablette', value: 7 },
] as const

export const demoCountries = [
  { label: 'RDC', value: 61 },
  { label: 'France', value: 14 },
  { label: 'Belgique', value: 9 },
  { label: 'Autres', value: 16 },
] as const
