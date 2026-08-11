import type { PrismaClient } from '@prisma/client'

type LinkForRedirect = {
  id: string
  originalUrl: string | null
  destinationUrl: string
}

export type ResolvedLinkRedirect = {
  id: string
  destination: string
}

export type LinkTransitionStore = {
  findForRedirect(slug: string): Promise<LinkForRedirect | null>
  incrementClick(linkId: string, clickedAt: Date): Promise<void>
}

type AnalyticsFailureContext = {
  linkId: string
  errorCode: string
}

export type AnalyticsFailureLogger = (
  message: string,
  context: AnalyticsFailureContext,
) => void

export function createPrismaLinkTransitionStore(prisma: PrismaClient): LinkTransitionStore {
  return {
    findForRedirect(slug) {
      return prisma.link.findUnique({
        where: { slug },
        select: {
          id: true,
          originalUrl: true,
          destinationUrl: true,
        },
      })
    },
    async incrementClick(linkId, clickedAt) {
      await prisma.link.update({
        where: { id: linkId },
        data: {
          clicks: { increment: 1 },
          clickCount: { increment: 1 },
          lastClickedAt: clickedAt,
        },
        select: { id: true },
      })
    },
  }
}

export async function resolveLinkRedirect(
  store: LinkTransitionStore,
  slug: string,
): Promise<ResolvedLinkRedirect | null> {
  const link = await store.findForRedirect(slug)

  if (!link) {
    return null
  }

  return {
    id: link.id,
    destination: link.originalUrl || link.destinationUrl,
  }
}

export async function recordLinkClickSafely(
  store: LinkTransitionStore,
  linkId: string,
  options: {
    now?: () => Date
    logger?: AnalyticsFailureLogger
  } = {},
): Promise<boolean> {
  try {
    await store.incrementClick(linkId, options.now?.() ?? new Date())
    return true
  } catch (error) {
    const logger = options.logger ?? console.error
    logger('Vinkora link analytics update failed.', {
      linkId,
      errorCode: getSafeErrorCode(error),
    })
    return false
  }
}

export function synchronizedLinkUrlData(url: string) {
  return {
    originalUrl: url,
    destinationUrl: url,
  }
}

function getSafeErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code
  }

  return error instanceof Error ? error.name : 'UNKNOWN'
}
