import type { QrOptions, QrPreset } from '@/types/link'

export const defaultQrOptions: QrOptions = {
  foreground: '#111827',
  background: '#ffffff',
  transparentBackground: false,
  useGradient: false,
  gradientFrom: '#2563eb',
  gradientTo: '#7c3aed',
  styleMode: 'classic',
  cornerStyle: 'classic',
  cornerColor: '#111827',
  size: 260,
  exportSize: 1024,
  marginSize: 4,
  level: 'M',
  logoSrc: '',
  logoSize: 20,
  showLogo: false,
  logoFrameShape: 'rounded',
  logoPadding: 8,
  logoBackground: '#ffffff',
  logoBorderColor: '#e2e8f0',
  logoShadow: true,
  logoFit: 'contain',
}

export const qrPresets: QrPreset[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Noir, blanc, lisible partout.',
    options: {
      foreground: '#111827',
      background: '#ffffff',
      useGradient: false,
      styleMode: 'classic',
      cornerStyle: 'classic',
      cornerColor: '#111827',
    },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Bleu profond et coins accentues.',
    options: {
      foreground: '#0f172a',
      background: '#f8fafc',
      useGradient: true,
      gradientFrom: '#0f766e',
      gradientTo: '#2563eb',
      styleMode: 'rounded',
      cornerStyle: 'accent',
      cornerColor: '#0f766e',
      level: 'Q',
    },
  },
  {
    id: 'social',
    name: 'Réseaux sociaux',
    description: 'Couleurs fortes pour partage digital.',
    options: {
      foreground: '#be185d',
      background: '#fff1f2',
      useGradient: true,
      gradientFrom: '#db2777',
      gradientTo: '#f97316',
      styleMode: 'dots',
      cornerStyle: 'rounded',
      cornerColor: '#be185d',
      level: 'Q',
    },
  },
  {
    id: 'event',
    name: 'Événement',
    description: 'Contraste eleve pour affiches et badges.',
    options: {
      foreground: '#312e81',
      background: '#fefce8',
      useGradient: true,
      gradientFrom: '#312e81',
      gradientTo: '#ca8a04',
      styleMode: 'soft',
      cornerStyle: 'accent',
      cornerColor: '#ca8a04',
      level: 'H',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Sobre, clair, prêt à imprimer.',
    options: {
      foreground: '#18181b',
      background: '#fafafa',
      transparentBackground: false,
      useGradient: false,
      styleMode: 'classic',
      cornerStyle: 'rounded',
      cornerColor: '#18181b',
      marginSize: 4,
    },
  },
]

export const foregroundColors = ['#111827', '#2563eb', '#0f766e', '#dc2626', '#7c3aed', '#be185d', '#f97316']

export const backgroundColors = ['#ffffff', '#f8fafc', '#eff6ff', '#ecfdf5', '#fff1f2', '#fefce8']
