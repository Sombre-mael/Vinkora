import 'dotenv/config'
import assert from 'node:assert/strict'
import test from 'node:test'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import {
  DynamicQrError,
  cleanupAnonymousDynamicQrData,
  createAnonymousDynamicQr,
  getDynamicQrAnalytics,
  getManagedDynamicQr,
  recordDynamicQrScanSafely,
  updateManagedDynamicQr,
} from '../lib/dynamic-qr'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
const explicitlyAllowed = process.env.ALLOW_DISPOSABLE_DATABASE_TEST === 'true'
const canRun = Boolean(testDatabaseUrl && explicitlyAllowed)

test('anonymous dynamic QR flow on disposable PostgreSQL', { skip: !canRun }, async () => {
  assertDisposableDatabase(testDatabaseUrl as string)

  process.env.DYNAMIC_QR_BETA_ENABLED = 'true'
  process.env.ANONYMOUS_QR_HASH_SECRET = 'integration-device-secret-32-characters-minimum'
  process.env.ANALYTICS_HASH_SECRET = 'integration-analytics-secret-32-characters-minimum'

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: testDatabaseUrl as string }),
  })
  const ids: string[] = []
  const prefix = `it-${Date.now().toString(36)}`
  const origin = 'https://vinkora.test'

  try {
    const firstDevice = 'a'.repeat(43)
    const created = []
    for (let index = 1; index <= 3; index += 1) {
      const item = await createAnonymousDynamicQr(prisma, {
        destinationUrl: `https://example.com/${index}`,
        slug: `${prefix}-${index}`,
        deviceToken: firstDevice,
        ipAddress: '203.0.113.10',
        origin,
      })
      ids.push(item.qrCode.id)
      created.push(item)
    }

    await assert.rejects(
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.com/limit',
        slug: `${prefix}-limit`,
        deviceToken: firstDevice,
        ipAddress: '203.0.113.10',
        origin,
      }),
      (error: unknown) => error instanceof DynamicQrError && error.status === 429,
    )

    const concurrentDevice = 'b'.repeat(43)
    for (let index = 1; index <= 2; index += 1) {
      const item = await createAnonymousDynamicQr(prisma, {
        destinationUrl: `https://example.org/${index}`,
        slug: `${prefix}-race-${index}`,
        deviceToken: concurrentDevice,
        ipAddress: '203.0.113.11',
        origin,
      })
      ids.push(item.qrCode.id)
    }

    const race = await Promise.allSettled([
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.org/three',
        slug: `${prefix}-race-3`,
        deviceToken: concurrentDevice,
        ipAddress: '203.0.113.11',
        origin,
      }),
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.org/four',
        slug: `${prefix}-race-4`,
        deviceToken: concurrentDevice,
        ipAddress: '203.0.113.11',
        origin,
      }),
    ])
    for (const result of race) {
      if (result.status === 'fulfilled') ids.push(result.value.qrCode.id)
    }
    assert.equal(race.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(race.filter((result) => result.status === 'rejected').length, 1)

    await assert.rejects(
      createAnonymousDynamicQr(prisma, {
        destinationUrl: 'https://example.net/conflict',
        slug: created[0].qrCode.slug,
        deviceToken: 'c'.repeat(43),
        ipAddress: '203.0.113.12',
        origin,
      }),
      (error: unknown) => error instanceof DynamicQrError && error.status === 409,
    )

    await assert.rejects(
      getManagedDynamicQr(prisma, created[0].qrCode.id, 'x'.repeat(43), origin),
      (error: unknown) => error instanceof DynamicQrError && error.status === 404,
    )

    const newDestination = 'https://example.com/after-printing'
    const updated = await updateManagedDynamicQr(
      prisma,
      created[0].qrCode.id,
      created[0].editToken,
      { destinationUrl: newDestination },
      origin,
    )
    assert.equal(updated.slug, created[0].qrCode.slug)
    assert.equal(updated.publicUrl, created[0].qrCode.publicUrl)
    assert.equal(updated.destinationUrl, newDestination)

    await recordDynamicQrScanSafely(prisma, created[0].qrCode.id, emptyMetadata(false))
    await recordDynamicQrScanSafely(prisma, created[0].qrCode.id, emptyMetadata(true))
    const analytics = await getDynamicQrAnalytics(prisma, created[0].qrCode.id, created[0].editToken)
    assert.equal(analytics.totalScans, 1)
    assert.equal(analytics.analyzedScans, 1)
    assert.equal(analytics.botScans, 1)

    await prisma.click.create({
      data: {
        qrCodeId: created[0].qrCode.id,
        occurredAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        isBot: false,
      },
    })
    const aggregateBeforeCleanup = await prisma.qrCode.findUniqueOrThrow({
      where: { id: created[0].qrCode.id },
      select: { clickCount: true },
    })
    const cleanup = await cleanupAnonymousDynamicQrData(prisma)
    const aggregateAfterCleanup = await prisma.qrCode.findUniqueOrThrow({
      where: { id: created[0].qrCode.id },
      select: { clickCount: true },
    })
    assert.ok(cleanup.deletedClicks >= 1)
    assert.equal(aggregateAfterCleanup.clickCount, aggregateBeforeCleanup.clickCount)
  } finally {
    if (ids.length) await prisma.qrCode.deleteMany({ where: { id: { in: ids } } })
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
