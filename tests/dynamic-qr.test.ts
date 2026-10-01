import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { PrismaClient } from '@prisma/client'
import {
  DynamicQrError,
  buildDynamicQrScanMetadata,
  createAnonymousDynamicQr,
  getManagedDynamicQr,
  normalizeDynamicDestination,
  normalizeDynamicSlug,
  recordDynamicQrScanSafely,
  sanitizeQrStyle,
} from '../lib/dynamic-qr'
import { toCloudSafeQrStyle } from '../src/services/dynamicQr'

const DEVICE_TOKEN = 'd'.repeat(43)
const SECRET = 's'.repeat(48)

type StoredQr = {
  id: string
  slug: string
  name: string
  destinationUrl: string
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  ownership: 'ANONYMOUS_BETA'
  anonymousDeviceHash: string
  editTokenHash: string
  creationIpHash: string | null
  styleOptions: object
  clickCount: number
  lastClickedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function withBetaEnvironment<T>(run: () => Promise<T>) {
  const previous = {
    enabled: process.env.DYNAMIC_QR_BETA_ENABLED,
    deviceSecret: process.env.ANONYMOUS_QR_HASH_SECRET,
    analyticsSecret: process.env.ANALYTICS_HASH_SECRET,
  }
  process.env.DYNAMIC_QR_BETA_ENABLED = 'true'
  process.env.ANONYMOUS_QR_HASH_SECRET = SECRET
  process.env.ANALYTICS_HASH_SECRET = SECRET

  return run().finally(() => {
    restoreEnv('DYNAMIC_QR_BETA_ENABLED', previous.enabled)
    restoreEnv('ANONYMOUS_QR_HASH_SECRET', previous.deviceSecret)
    restoreEnv('ANALYTICS_HASH_SECRET', previous.analyticsSecret)
  })
}

function createMemoryPrisma(initial: StoredQr[] = []) {
  const rows = [...initial]
  let sequence = rows.length
  let transactionQueue = Promise.resolve()

  const qrCode = {
    async count(args: { where: Record<string, unknown> }) {
      return rows.filter((row) => {
        const where = args.where
        if (where.ownership && row.ownership !== where.ownership) return false
        if (where.anonymousDeviceHash && row.anonymousDeviceHash !== where.anonymousDeviceHash) return false
        if (where.creationIpHash && row.creationIpHash !== where.creationIpHash) return false
        if (where.status && typeof where.status === 'object' && where.status !== null) {
          const statuses = (where.status as { in: StoredQr['status'][] }).in
          if (!statuses.includes(row.status)) return false
        }
        return true
      }).length
    },
    async create(args: { data: Omit<StoredQr, 'id' | 'clickCount' | 'lastClickedAt' | 'createdAt' | 'updatedAt'> }) {
      if (rows.some((row) => row.slug === args.data.slug)) {
        throw { code: 'P2002' }
      }
      const now = new Date('2026-09-30T10:00:00.000Z')
      const created: StoredQr = {
        ...args.data,
        id: `qr-${++sequence}`,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      rows.push(created)
      return created
    },
    async findFirst(args: { where: { id: string; editTokenHash: string } }) {
      return rows.find(
        (row) => row.id === args.where.id && row.editTokenHash === args.where.editTokenHash,
      ) ?? null
    },
  }

  const prisma = {
    qrCode,
    $transaction<T>(operation: (transaction: { qrCode: typeof qrCode }) => Promise<T>) {
      const result = transactionQueue.then(() => operation({ qrCode }))
      transactionQueue = result.then(() => undefined, () => undefined)
      return result
    },
  } as unknown as PrismaClient

  return { prisma, rows }
}

test('dynamic destinations accept public HTTP(S) URLs and reject unsafe targets', () => {
  assert.equal(normalizeDynamicDestination('example.com/menu'), 'https://example.com/menu')
  assert.throws(() => normalizeDynamicDestination('http://127.0.0.1/admin'), DynamicQrError)
  assert.throws(() => normalizeDynamicDestination('https://user:secret@example.com'), DynamicQrError)
  assert.throws(() => normalizeDynamicDestination('https://example.com:8443'), DynamicQrError)
  assert.throws(() => normalizeDynamicDestination('javascript:alert(1)'), DynamicQrError)
})

test('custom slugs are normalized and reserved slugs are refused', () => {
  assert.equal(normalizeDynamicSlug('Menu Été 2026'), 'menu-ete-2026')
  assert.throws(() => normalizeDynamicSlug('api'), DynamicQrError)
  assert.throws(() => normalizeDynamicSlug('abc'), DynamicQrError)
})

test('cloud QR style strips logo data and clamps unsafe values', () => {
  const style = sanitizeQrStyle({
    foreground: '#ABCDEF',
    logoSrc: 'data:image/png;base64,secret',
    showLogo: true,
    logoSize: 99,
    marginSize: -10,
  })

  assert.equal(style.foreground, '#abcdef')
  assert.equal(style.showLogo, false)
  assert.equal('logoSrc' in style, false)
  assert.equal(style.logoSize, 24)
  assert.equal(style.marginSize, 0)
})

test('the browser removes logoSrc before sending a dynamic QR style', () => {
  const cloudStyle = toCloudSafeQrStyle({
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
    level: 'H',
    logoSrc: 'data:image/png;base64,must-not-leave-the-browser',
    logoSize: 20,
    showLogo: true,
    logoFrameShape: 'rounded',
    logoPadding: 8,
    logoBackground: '#ffffff',
    logoBorderColor: '#e2e8f0',
    logoShadow: true,
    logoFit: 'contain',
  })

  assert.equal('logoSrc' in cloudStyle, false)
  assert.equal(cloudStyle.showLogo, false)
  assert.doesNotMatch(JSON.stringify(cloudStyle), /base64/)
})

test('three anonymous QR creations succeed and the fourth is refused', async () => {
  await withBetaEnvironment(async () => {
    const { prisma, rows } = createMemoryPrisma()

    for (let index = 1; index <= 3; index += 1) {
      await createAnonymousDynamicQr(prisma, {
        destinationUrl: `https://example.com/${index}`,
        slug: `test-${index}`,
        deviceToken: DEVICE_TOKEN,
        origin: 'https://vinkora.test',
      })
    }

    await assert.rejects(
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.com/4',
        slug: 'test-4',
        deviceToken: DEVICE_TOKEN,
        origin: 'https://vinkora.test',
      }),
      (error: unknown) => error instanceof DynamicQrError && error.status === 429,
    )
    assert.equal(rows.length, 3)
  })
})

test('two concurrent creations cannot exceed the device quota', async () => {
  await withBetaEnvironment(async () => {
    const { prisma, rows } = createMemoryPrisma()
    await createAnonymousDynamicQr(prisma, {
      destinationUrl: 'https://example.com/one',
      slug: 'race-one',
      deviceToken: DEVICE_TOKEN,
      origin: 'https://vinkora.test',
    })
    await createAnonymousDynamicQr(prisma, {
      destinationUrl: 'https://example.com/two',
      slug: 'race-two',
      deviceToken: DEVICE_TOKEN,
      origin: 'https://vinkora.test',
    })

    const results = await Promise.allSettled([
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.com/three',
        slug: 'race-three',
        deviceToken: DEVICE_TOKEN,
        origin: 'https://vinkora.test',
      }),
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.com/four',
        slug: 'race-four',
        deviceToken: DEVICE_TOKEN,
        origin: 'https://vinkora.test',
      }),
    ])

    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(results.filter((result) => result.status === 'rejected').length, 1)
    assert.equal(rows.length, 3)
  })
})

test('an occupied slug returns a conflict', async () => {
  await withBetaEnvironment(async () => {
    const { prisma } = createMemoryPrisma()
    const input = {
      destinationUrl: 'https://example.com/menu',
      slug: 'same-slug',
      deviceToken: DEVICE_TOKEN,
      origin: 'https://vinkora.test',
    }
    await createAnonymousDynamicQr(prisma, input)
    await assert.rejects(
      createAnonymousDynamicQr(prisma, input),
      (error: unknown) => error instanceof DynamicQrError && error.status === 409,
    )
  })
})

test('a wrong management key reveals no QR data', async () => {
  const { prisma } = createMemoryPrisma()
  await assert.rejects(
    getManagedDynamicQr(prisma, 'qr-secret', 'x'.repeat(43), 'https://vinkora.test'),
    (error: unknown) => error instanceof DynamicQrError && error.status === 404,
  )
})

test('analytics metadata is reduced and a missing secret does not break a redirect', () => {
  const previous = process.env.ANALYTICS_HASH_SECRET
  delete process.env.ANALYTICS_HASH_SECRET
  try {
    const headers = new Headers({
      'user-agent': 'Mozilla/5.0 (iPhone) AppleWebKit Safari/605.1',
      'x-forwarded-for': '203.0.113.42',
      'x-vercel-ip-country': 'cd',
      'x-vercel-ip-city': 'Lubumbashi',
      referer: 'https://example.com/private/path?secret=yes',
    })
    const metadata = buildDynamicQrScanMetadata(headers)
    assert.equal(metadata.visitorHash, null)
    assert.equal(metadata.deviceType, 'Mobile')
    assert.equal(metadata.browser, 'Safari')
    assert.equal(metadata.countryCode, 'CD')
    assert.equal(metadata.referrerHost, 'example.com')
    assert.equal('userAgent' in metadata, false)
    assert.equal('ipAddress' in metadata, false)
  } finally {
    restoreEnv('ANALYTICS_HASH_SECRET', previous)
  }
})

test('an analytics failure is logged safely and does not become a redirect failure', async () => {
  const logs: unknown[] = []
  const prisma = {
    qrCode: { update: () => Promise.reject(Object.assign(new Error('database secret'), { code: 'P1001' })) },
    click: { create: () => Promise.resolve({ id: 'click' }) },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaClient

  const recorded = await recordDynamicQrScanSafely(
    prisma,
    'qr-safe',
    {
      visitorHash: null,
      countryCode: null,
      city: null,
      deviceType: null,
      browser: null,
      referrerHost: null,
      isBot: false,
    },
    { logger: (...args) => logs.push(args) },
  )

  assert.equal(recorded, false)
  assert.doesNotMatch(JSON.stringify(logs), /database secret/)
  assert.match(JSON.stringify(logs), /P1001/)
})

test('bot scans are retained for the separate metric without incrementing the main counter', async () => {
  let counterUpdates = 0
  let clickWrites = 0
  const prisma = {
    qrCode: { update: () => { counterUpdates += 1; return Promise.resolve({ id: 'qr-bot' }) } },
    click: { create: () => { clickWrites += 1; return Promise.resolve({ id: 'click-bot' }) } },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaClient

  const recorded = await recordDynamicQrScanSafely(prisma, 'qr-bot', {
    visitorHash: null,
    countryCode: null,
    city: null,
    deviceType: null,
    browser: null,
    referrerHost: null,
    isBot: true,
  })

  assert.equal(recorded, true)
  assert.equal(counterUpdates, 0)
  assert.equal(clickWrites, 1)
})

test('the public dynamic route keeps analytics non-blocking and returns an explicit 302', () => {
  const source = readFileSync('app/q/[slug]/route.ts', 'utf8')
  assert.match(source, /after\(\(\) => recordDynamicQrScanSafely/)
  assert.match(source, /NextResponse\.redirect\(qrCode\.destinationUrl, 302\)/)
})

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}
