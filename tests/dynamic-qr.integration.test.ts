import 'dotenv/config'
import assert from 'node:assert/strict'
import test from 'node:test'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import {
  DynamicQrError,
  createAccountDynamicQr,
  getDynamicQrAnalytics,
  getManagedDynamicQr,
  recordDynamicQrScanSafely,
  updateManagedDynamicQr,
} from '../lib/dynamic-qr'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
const explicitlyAllowed = process.env.ALLOW_DISPOSABLE_DATABASE_TEST === 'true'
const canRun = Boolean(testDatabaseUrl && explicitlyAllowed)

test('account dynamic QR flow on disposable PostgreSQL', { skip: !canRun }, async () => {
  assertDisposableDatabase(testDatabaseUrl as string)

  process.env.ANALYTICS_HASH_SECRET = 'integration-analytics-secret-32-characters-minimum'

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: testDatabaseUrl as string }),
  })
  const ids: string[] = []
  const userIds: string[] = []
  const prefix = `it-${Date.now().toString(36)}`
  const origin = 'https://vinkora.test'

  try {
    const user = await prisma.user.create({ data: { email: `${prefix}@example.test` } })
    userIds.push(user.id)
    const created = await createAccountDynamicQr(prisma, user.id, {
      destinationUrl: 'https://example.com/one',
      slug: `${prefix}-one`,
      origin,
    })
    ids.push(created.qrCode.id)

    await assert.rejects(
      createAccountDynamicQr(prisma, user.id, {
        destinationUrl: 'https://example.com/limit',
        slug: `${prefix}-limit`,
        origin,
      }),
      (error: unknown) => error instanceof DynamicQrError && error.status === 429,
    )

    const raceUser = await prisma.user.create({ data: { email: `${prefix}-race@example.test` } })
    userIds.push(raceUser.id)
    const concurrent = await Promise.allSettled([
      createAccountDynamicQr(prisma, raceUser.id, {
        destinationUrl: 'https://example.org/one',
        slug: `${prefix}-race-one`,
        origin,
      }),
      createAccountDynamicQr(prisma, raceUser.id, {
        destinationUrl: 'https://example.org/two',
        slug: `${prefix}-race-two`,
        origin,
      }),
    ])
    for (const result of concurrent) {
      if (result.status === 'fulfilled') ids.push(result.value.qrCode.id)
    }
    assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(concurrent.filter((result) => result.status === 'rejected').length, 1)

    await assert.rejects(
      getManagedDynamicQr(prisma, created.qrCode.id, { userId: 'another-user' }, origin),
      (error: unknown) => error instanceof DynamicQrError && error.status === 404,
    )

    const newDestination = 'https://example.com/after-printing'
    const updated = await updateManagedDynamicQr(
      prisma,
      created.qrCode.id,
      { userId: user.id },
      { destinationUrl: newDestination },
      origin,
    )
    assert.equal(updated.slug, created.qrCode.slug)
    assert.equal(updated.publicUrl, created.qrCode.publicUrl)
    assert.equal(updated.destinationUrl, newDestination)

    await recordDynamicQrScanSafely(prisma, created.qrCode.id, emptyMetadata(false))
    await recordDynamicQrScanSafely(prisma, created.qrCode.id, emptyMetadata(true))
    const analytics = await getDynamicQrAnalytics(prisma, created.qrCode.id, { userId: user.id })
    assert.equal(analytics.totalScans, 1)
    assert.equal(analytics.analyzedScans, 1)
    assert.equal(analytics.botScans, 1)

    await prisma.click.create({
      data: {
        qrCodeId: created.qrCode.id,
        occurredAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        isBot: false,
      },
    })
    const aggregateBeforeCleanup = await prisma.qrCode.findUniqueOrThrow({
      where: { id: created.qrCode.id },
      select: { clickCount: true },
    })
    assert.equal(aggregateBeforeCleanup.clickCount, 1)
  } finally {
    if (ids.length) await prisma.qrCode.deleteMany({ where: { id: { in: ids } } })
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    await prisma.$disconnect()
  }
})

function assertDisposableDatabase(url: string) {
  const target = new URL(url)
  const protectedHosts = [process.env.DATABASE_URL, process.env.DIRECT_URL]
    .filter(Boolean)
    .map((value) => new URL(value as string).hostname)

  assert.equal(explicitlyAllowed, true, 'Disposable database tests require explicit opt-in.')
  assert.ok(!protectedHosts.includes(target.hostname), 'Refusing to run against the configured Vinkora database.')
}

function emptyMetadata(isBot: boolean) {
  return {
    visitorHash: isBot ? null : 'v'.repeat(64),
    dailyVisitorHash: isBot ? null : 'd'.repeat(64),
    continentCode: 'AF',
    countryCode: 'CD',
    regionCode: 'HK',
    city: 'Lubumbashi',
    timezone: 'Africa/Lubumbashi',
    language: 'fr-cd',
    deviceType: 'Mobile',
    operatingSystem: 'Android',
    browser: 'Chrome',
    referrerHost: 'example.com',
    localHour: 12,
    localWeekday: 5,
    isBot,
  }
}
