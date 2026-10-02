export const DYNAMIC_QR_CHANNELS = [
  { id: 'UNSPECIFIED', label: 'Non précisé' },
  { id: 'SOCIAL_MEDIA', label: 'Réseaux sociaux' },
  { id: 'POSTER', label: 'Affiche' },
  { id: 'FLYER', label: 'Flyer' },
  { id: 'MENU', label: 'Menu' },
  { id: 'EVENT', label: 'Événement' },
  { id: 'PACKAGING', label: 'Emballage' },
  { id: 'OTHER', label: 'Autre support' },
] as const

export type DynamicQrCampaignChannel = (typeof DYNAMIC_QR_CHANNELS)[number]['id']

export function getDynamicQrChannelLabel(channel: DynamicQrCampaignChannel) {
  return DYNAMIC_QR_CHANNELS.find((item) => item.id === channel)?.label ?? 'Non précisé'
}
