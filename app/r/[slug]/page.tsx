import { notFound, redirect } from 'next/navigation'
import { after } from 'next/server'
import {
  createPrismaLinkTransitionStore,
  recordLinkClickSafely,
  resolveLinkRedirect,
} from '../../../lib/link-transition'
import { getPrisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

type RedirectPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params
  const prisma = getPrisma()
  const store = createPrismaLinkTransitionStore(prisma)
  const link = await resolveLinkRedirect(store, slug)

  if (!link) {
    notFound()
  }

  after(() => recordLinkClickSafely(store, link.id))
  redirect(link.destination)
}
