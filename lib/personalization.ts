export const INTERFACE_ACCENTS = ['INDIGO', 'TEAL', 'BLUE'] as const
export const INTERFACE_DENSITIES = ['COMFORTABLE', 'COMPACT'] as const
export const INTERFACE_MOTIONS = ['SYSTEM', 'EXPRESSIVE', 'REDUCED'] as const

export type InterfaceAccent = (typeof INTERFACE_ACCENTS)[number]
export type InterfaceDensity = (typeof INTERFACE_DENSITIES)[number]
export type InterfaceMotion = (typeof INTERFACE_MOTIONS)[number]

export type InterfacePreferences = {
  accent: InterfaceAccent
  density: InterfaceDensity
  motion: InterfaceMotion
}

export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  accent: 'INDIGO',
  density: 'COMFORTABLE',
  motion: 'SYSTEM',
}

export type JourneyStage = 'ACCOUNT_READY' | 'QR_CREATED' | 'FIRST_SCAN'

export type JourneySummary = {
  stage: JourneyStage
  completedSteps: number
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export function deriveJourneySummary(qrCode?: { id: string; clickCount: number } | null): JourneySummary {
  if (!qrCode) {
    return {
      stage: 'ACCOUNT_READY',
      completedSteps: 1,
      eyebrow: 'Votre espace est prêt',
      title: 'Créez votre premier QR dynamique.',
      description: 'Préparez une campagne modifiable et retrouvez-la ensuite dans votre espace.',
      actionLabel: 'Ouvrir le Studio',
      actionHref: '/studio',
    }
  }

  if (qrCode.clickCount === 0) {
    return {
      stage: 'QR_CREATED',
      completedSteps: 2,
      eyebrow: 'Votre QR est prêt',
      title: 'Il est temps de le diffuser.',
      description: 'Copiez son lien, exportez le visuel et placez-le sur votre support de campagne.',
      actionLabel: 'Gérer le QR',
      actionHref: `/manage/qr/${qrCode.id}`,
    }
  }

  return {
    stage: 'FIRST_SCAN',
    completedSteps: 3,
    eyebrow: 'Premiers résultats reçus',
    title: 'Votre campagne commence à parler.',
    description: 'Explorez les scans réels pour comprendre où et comment votre QR est utilisé.',
    actionLabel: 'Voir les analytics',
    actionHref: '/dashboard/analytics',
  }
}

export function profilePreferences(profile?: {
  interfaceAccent?: InterfaceAccent | null
  interfaceDensity?: InterfaceDensity | null
  interfaceMotion?: InterfaceMotion | null
} | null): InterfacePreferences {
  return {
    accent: profile?.interfaceAccent ?? DEFAULT_INTERFACE_PREFERENCES.accent,
    density: profile?.interfaceDensity ?? DEFAULT_INTERFACE_PREFERENCES.density,
    motion: profile?.interfaceMotion ?? DEFAULT_INTERFACE_PREFERENCES.motion,
  }
}

export type ParsedProfileSettings = {
  name: string
  company: string | null
  city: string | null
  interfaceAccent: InterfaceAccent
  interfaceDensity: InterfaceDensity
  interfaceMotion: InterfaceMotion
}

export function parseProfileSettings(formData: FormData): ParsedProfileSettings {
  const name = readLimitedText(formData, 'name', 120)
  const company = readLimitedText(formData, 'company', 160, true)
  const city = readLimitedText(formData, 'city', 120, true)
  const interfaceAccent = readChoice(formData, 'interfaceAccent', INTERFACE_ACCENTS)
  const interfaceDensity = readChoice(formData, 'interfaceDensity', INTERFACE_DENSITIES)
  const interfaceMotion = readChoice(formData, 'interfaceMotion', INTERFACE_MOTIONS)

  if (!name) {
    throw new Error('Indiquez votre nom.')
  }

  return {
    name,
    company: company || null,
    city: city || null,
    interfaceAccent,
    interfaceDensity,
    interfaceMotion,
  }
}

function readLimitedText(formData: FormData, field: string, maxLength: number, optional = false) {
  const value = String(formData.get(field) ?? '').trim()
  if (!value && optional) return ''
  if (value.length > maxLength) {
    throw new Error(`Le champ ${field} est trop long.`)
  }
  return value
}

function readChoice<const T extends readonly string[]>(formData: FormData, field: string, choices: T): T[number] {
  const value = String(formData.get(field) ?? '')
  if (!choices.includes(value)) {
    throw new Error('Cette préférence d’interface est invalide.')
  }
  return value as T[number]
}
