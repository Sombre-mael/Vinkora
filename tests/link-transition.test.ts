import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '@prisma/client'
import {
  createPrismaLinkTransitionStore,
  recordLinkClickSafely,
  resolveLinkRedirect,
  synchronizedLinkUrlData,
  type LinkTransitionStore,
} from '../lib/link-transition'

type MemoryLink = {
  id: string
  slug: string
  originalUrl: string | null
  destinationUrl: string
  clicks: number
  clickCount: number
  lastClickedAt: Date | null
}

function createMemoryStore(link: MemoryLink): LinkTransitionStore {
  return {
    async findForRedirect(slug) {
      if (slug !== link.slug) {
        return null
      }

      return {
        id: link.id,
        originalUrl: link.originalUrl,
        destinationUrl: link.destinationUrl,
      }
    },
    async incrementClick(linkId, clickedAt) {
      assert.equal(linkId, link.id)
      link.clicks += 1
      link.clickCount += 1
      link.lastClickedAt = clickedAt
    },
  }
}

function createLegacyLink(): MemoryLink {
  return {
    id: 'legacy-link',
    slug: 'legacy-slug',
    originalUrl: 'https://example.com/legacy',
    destinationUrl: 'https://example.com/legacy',
    clicks: 7,
    clickCount: 7,
    lastClickedAt: null,
  }
}

test('a legacy link resolves with originalUrl as the transitional source', async () => {
  const link = createLegacyLink()
  link.destinationUrl = 'https://example.com/new-field'

  const resolved = await resolveLinkRedirect(createMemoryStore(link), link.slug)

  assert.deepEqual(resolved, {
    id: link.id,
    destination: link.originalUrl,
  })
})

test('destinationUrl is used only as a fallback when originalUrl is absent', async () => {
  const link = createLegacyLink()
  link.originalUrl = null
  link.destinationUrl = 'https://example.com/fallback'

  const resolved = await resolveLinkRedirect(createMemoryStore(link), link.slug)

  assert.equal(resolved?.destination, link.destinationUrl)
})

test('an unknown slug preserves the not-found result', async () => {
  const link = createLegacyLink()

  const resolved = await resolveLinkRedirect(createMemoryStore(link), 'missing')

  assert.equal(resolved, null)
})

test('one successful redirect increments both counters exactly once', async () => {
  const link = createLegacyLink()
  const clickedAt = new Date('2026-07-28T12:00:00.000Z')

  const recorded = await recordLinkClickSafely(createMemoryStore(link), link.id, {
    now: () => clickedAt,
  })

  assert.equal(recorded, true)
  assert.equal(link.clicks, 8)
  assert.equal(link.clickCount, 8)
  assert.equal(link.lastClickedAt, clickedAt)
})

test('successive and concurrent redirects keep both counters equal', async () => {
  const link = createLegacyLink()
  const store = createMemoryStore(link)

  await recordLinkClickSafely(store, link.id)
  await recordLinkClickSafely(store, link.id)
  await Promise.all(
    Array.from({ length: 10 }, () => recordLinkClickSafely(store, link.id)),
  )

  assert.equal(link.clicks, 19)
  assert.equal(link.clickCount, 19)
})

test('the Prisma adapter uses atomic increments for both counters', async () => {
  const updates: unknown[] = []
  const clickedAt = new Date('2026-07-28T12:30:00.000Z')
  const prisma = {
    link: {
      async findUnique() {
        return null
      },
      async update(args: unknown) {
        updates.push(args)
        return { id: 'legacy-link' }
      },
    },
  } as unknown as PrismaClient

  const store = createPrismaLinkTransitionStore(prisma)
  await store.incrementClick('legacy-link', clickedAt)

  assert.deepEqual(updates, [
    {
      where: { id: 'legacy-link' },
      data: {
        clicks: { increment: 1 },
        clickCount: { increment: 1 },
        lastClickedAt: clickedAt,
      },
      select: { id: true },
    },
  ])
})

test('an analytics write failure does not invalidate the resolved redirect', async () => {
  const link = createLegacyLink()
  const resolved = await resolveLinkRedirect(createMemoryStore(link), link.slug)
  const logs: Array<{ message: string; linkId: string; errorCode: string }> = []
  const failingStore: LinkTransitionStore = {
    async findForRedirect() {
      return null
    },
    async incrementClick() {
      throw Object.assign(new Error('sensitive database detail'), { code: 'P1001' })
    },
  }

  const recorded = await recordLinkClickSafely(failingStore, link.id, {
    logger(message, context) {
      logs.push({ message, ...context })
    },
  })

  assert.equal(recorded, false)
  assert.equal(resolved?.destination, link.originalUrl)
  assert.deepEqual(logs, [
    {
      message: 'Vinkora link analytics update failed.',
      linkId: link.id,
      errorCode: 'P1001',
    },
  ])
  assert.doesNotMatch(JSON.stringify(logs), /sensitive database detail/)
})

test('Link URL write data always synchronizes old and new fields', () => {
  const url = 'https://example.com/synchronized'

  assert.deepEqual(synchronizedLinkUrlData(url), {
    originalUrl: url,
    destinationUrl: url,
  })
})
