import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { PrismaClient } from '@prisma/client'
import {
  DynamicQrError,
  buildDynamicQrScanMetadata,
  createAccountDynamicQr,
  getManagedDynamicQr,
  hashEditToken,
  normalizeDynamicDestination,
  normalizeDynamicSlug,
  parseCampaignChannel,
  recordDynamicQrScanSafely,
  sanitizeQrStyle,
} from '../lib/dynamic-qr'
import { toCloudSafeQrStyle } from '../src/services/dynamicQr'

const SECRET = 's'.repeat(48)

type StoredQr = {
  id: string
  slug: string
  name: string
  campaignChannel: 'UNSPECIFIED' | 'SOCIAL_MEDIA' | 'POSTER' | 'FLYER' | 'MENU' | 'EVENT' | 'PACKAGING' | 'OTHER'
  destinationUrl: string
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  ownership: 'USER_OWNED' | 'ANONYMOUS_BETA'
  ownerId: string | null
  createdUnderSubscriptionId: string | null
  anonymousDeviceHash: string | null
  editTokenHash: string | null
  creationIpHash: string | null
  styleOptions: object
  clickCount: number
  lastClickedAt: Date | null
  createdAt: Date
  updatedAt: Date
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
        if (where.ownerId && row.ownerId !== where.ownerId) return false
        if ('createdUnderSubscriptionId' in where && row.createdUnderSubscriptionId !== where.createdUnderSubscriptionId) return false
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
    async findFirst(args: { where: Record<string, unknown> }) {
      return rows.find((row) => {
        if (args.where.id && row.id !== args.where.id) return false
        if (args.where.ownerId && row.ownerId !== args.where.ownerId) return false
        if (args.where.ownership && row.ownership !== args.where.ownership) return false
        if ('createdUnderSubscriptionId' in args.where && row.createdUnderSubscriptionId !== args.where.createdUnderSubscriptionId) return false
        if (args.where.editTokenHash && row.editTokenHash !== args.where.editTokenHash) return false
        if (args.where.status && typeof args.where.status === 'object') {
          const statuses = (args.where.status as { in: StoredQr['status'][] }).in
          if (!statuses.includes(row.status)) return false
        }
        return true
      }) ?? null
    },
    async findUnique(args: { where: { id: string } }) {
      return rows.find((row) => row.id === args.where.id) ?? null
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

test('campaign channels are allowlisted and default safely', () => {
  assert.equal(parseCampaignChannel('POSTER'), 'POSTER')
  assert.equal(parseCampaignChannel('unknown-channel'), 'UNSPECIFIED')
  assert.equal(parseCampaignChannel(undefined), 'UNSPECIFIED')
})

test('dynamic QR creation stores its campaign support', async () => {
  const { prisma, rows } = createMemoryPrisma()
  const created = await createAccountDynamicQr(prisma, 'user-one', {
    destinationUrl: 'https://example.com/campaign',
    name: 'Campagne rentrée',
    slug: 'campagne-rentree',
    campaignChannel: 'POSTER',
    origin: 'https://vinkora.test',
  })

  assert.equal(created.qrCode.campaignChannel, 'POSTER')
  assert.equal(rows[0]?.campaignChannel, 'POSTER')
  assert.equal(rows[0]?.ownerId, 'user-one')
  assert.equal(rows[0]?.createdUnderSubscriptionId, null)
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

test('one account QR creation succeeds and the second is refused', async () => {
  const { prisma, rows } = createMemoryPrisma()
  await createAccountDynamicQr(prisma, 'user-limit', {
    destinationUrl: 'https://example.com/one',
    slug: 'test-one',
    origin: 'https://vinkora.test',
  })

  await assert.rejects(
    createAccountDynamicQr(prisma, 'user-limit', {
      destinationUrl: 'https://example.com/two',
      slug: 'test-two',
      origin: 'https://vinkora.test',
    }),
    (error: unknown) => error instanceof DynamicQrError && error.status === 429,
  )
  assert.equal(rows.length, 1)
})

test('the public QR API requires an authenticated Vinkora account', () => {
  const source = readFileSync('app/api/qr-codes/route.ts', 'utf8')
  assert.match(source, /getCurrentVinkoraUser\(\)/)
  assert.match(source, /AUTHENTICATION_REQUIRED/)
  assert.match(source, /createAccountDynamicQr/)
  assert.doesNotMatch(source, /x-vinkora-device-token/i)
})

test('two concurrent creations cannot exceed the account quota', async () => {
  const { prisma, rows } = createMemoryPrisma()
  const results = await Promise.allSettled([
    createAccountDynamicQr(prisma, 'user-race', {
      destinationUrl: 'https://example.com/one',
      slug: 'race-one',
      origin: 'https://vinkora.test',
    }),
    createAccountDynamicQr(prisma, 'user-race', {
      destinationUrl: 'https://example.com/two',
      slug: 'race-two',
      origin: 'https://vinkora.test',
    }),
  ])

  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(results.filter((result) => result.status === 'rejected').length, 1)
  assert.equal(rows.length, 1)
})

test('an occupied slug returns a conflict', async () => {
  const { prisma } = createMemoryPrisma()
  const input = {
    destinationUrl: 'https://example.com/menu',
    slug: 'same-slug',
    origin: 'https://vinkora.test',
  }
  await createAccountDynamicQr(prisma, 'user-a', input)
  await assert.rejects(
    createAccountDynamicQr(prisma, 'user-b', input),
    (error: unknown) => error instanceof DynamicQrError && error.status === 409,
  )
})

test('a wrong management key reveals no QR data', async () => {
  const correctToken = 'a'.repeat(43)
  const { prisma } = createMemoryPrisma([{
    id: 'qr-secret',
    slug: 'legacy-secret',
    name: 'Ancien QR',
    campaignChannel: 'UNSPECIFIED',
    destinationUrl: 'https://example.com/legacy',
    status: 'ACTIVE',
    ownership: 'ANONYMOUS_BETA',
    ownerId: null,
    createdUnderSubscriptionId: null,
    anonymousDeviceHash: 'd'.repeat(64),
    editTokenHash: hashEditToken(correctToken),
    creationIpHash: null,
    styleOptions: {},
    clickCount: 0,
    lastClickedAt: null,
    createdAt: new Date('2026-09-30T10:00:00.000Z'),
    updatedAt: new Date('2026-09-30T10:00:00.000Z'),
  }])
  await assert.rejects(
    getManagedDynamicQr(
      prisma,
      'qr-secret',
      { editToken: 'x'.repeat(43) },
      'https://vinkora.test',
    ),
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
    const metadata = buildDynamicQrScanMetadata(headers, 'qr-analytics')
    assert.equal(metadata.visitorHash, null)
    assert.equal(metadata.dailyVisitorHash, null)
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

test('analytics metadata enriches scans without retaining raw IP or User-Agent', () => {
  const previous = process.env.ANALYTICS_HASH_SECRET
  process.env.ANALYTICS_HASH_SECRET = SECRET
  try {
    const now = new Date('2026-10-02T10:00:00.000Z')
    const headers = new Headers({
      'user-agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit Chrome/140.0 Mobile Safari/537.36',
      'x-vercel-forwarded-for': '203.0.113.42',
      'x-vercel-ip-continent': 'AF',
      'x-vercel-ip-country': 'CD',
      'x-vercel-ip-country-region': 'HK',
      'x-vercel-ip-city': 'Lubumbashi',
      'x-vercel-ip-timezone': 'Africa/Lubumbashi',
      'accept-language': 'fr-CD,fr;q=0.9',
      'sec-ch-ua-platform': '"Android"',
    })
    const first = buildDynamicQrScanMetadata(headers, 'qr-campaign', now)
    const nextDay = buildDynamicQrScanMetadata(
      headers,
      'qr-campaign',
      new Date('2026-10-03T10:00:00.000Z'),
    )

    assert.equal(first.continentCode, 'AF')
    assert.equal(first.regionCode, 'HK')
    assert.equal(first.timezone, 'Africa/Lubumbashi')
    assert.equal(first.language, 'fr-cd')
    assert.equal(first.operatingSystem, 'Android')
    assert.equal(first.localHour, 12)
    assert.equal(first.visitorHash, nextDay.visitorHash)
    assert.notEqual(first.dailyVisitorHash, nextDay.dailyVisitorHash)
    assert.equal('userAgent' in first, false)
    assert.equal('ipAddress' in first, false)
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
      dailyVisitorHash: null,
      continentCode: null,
      countryCode: null,
      regionCode: null,
      city: null,
      timezone: null,
      language: null,
      deviceType: null,
      operatingSystem: null,
      browser: null,
      referrerHost: null,
      localHour: null,
      localWeekday: null,
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
    dailyVisitorHash: null,
    continentCode: null,
    countryCode: null,
    regionCode: null,
    city: null,
    timezone: null,
    language: null,
    deviceType: null,
    operatingSystem: null,
    browser: null,
    referrerHost: null,
    localHour: null,
    localWeekday: null,
    isBot: true,
  })

  assert.equal(recorded, true)
  assert.equal(counterUpdates, 0)
  assert.equal(clickWrites, 1)
})

test('the public dynamic route keeps analytics non-blocking and returns an explicit 302', () => {
  const source = readFileSync('app/q/[slug]/route.ts', 'utf8')
  assert.match(source, /after\(\(\) => recordDynamicQrScanSafely/)
  assert.match(source, /buildDynamicQrScanMetadata\(request\.headers, qrCode\.id\)/)
  assert.match(source, /NextResponse\.redirect\(qrCode\.destinationUrl, 302\)/)
})

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}
