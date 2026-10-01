import type { Metadata } from 'next'
import { DynamicQrManager } from '@/components/dynamic/DynamicQrManager'

export const metadata: Metadata = {
  title: 'Gérer un QR dynamique',
  description: 'Modifiez la destination et consultez les statistiques de votre QR dynamique Vinkora.',
  robots: { index: false, follow: false },
}

type ManageDynamicQrPageProps = {
  params: Promise<{ id: string }>
}

export default async function ManageDynamicQrPage({ params }: ManageDynamicQrPageProps) {
  const { id } = await params
  return <DynamicQrManager id={id} />
}
