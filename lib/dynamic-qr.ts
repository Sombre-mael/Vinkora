import { createHash, createHmac, randomBytes } from 'node:crypto'
import { isIP } from 'node:net'
import { Prisma, type PrismaClient, ResourceStatus } from '@prisma/client'
import { defaultQrOptions } from '../src/data/qrPresets'
import type {
  DynamicQrAnalytics,
  DynamicQrResource,
  DynamicQrStatus,
  SavedQrStyle,
} from '../src/types/dynamicQr'

const ACTIVE_ANONYMOUS_LIMIT = 3
const ANALYTICS_RETENTION_DAYS = 30
const CREATION_HASH_RETENTION_HOURS = 48
const MAX_BODY_LENGTH = 16_384
const MAX_NAME_LENGTH = 180
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{2,38}[a-z0-9])$/

const RESERVED_SLUGS = new Set([
  'api',
  'app',
  'dashboard',
  'faq',
  'features',
  'login',
  'manage',
  'pricing',
  'privacy',
  'q',
  'r',
  'register',
  'studio',
  'status',
  'support',
  'vinkora',
])

const STYLE_ENUMS = {
  styleMode: ['classic', 'rounded', 'dots', 'soft'],
  cornerStyle: ['classic', 'rounded', 'accent'],
  level: ['L', 'M', 'Q', 'H'],
  logoFrameShape: ['rounded', 'circle', 'pill'],
  logoFit: ['contain', 'cover'],
} as const

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i

export class DynamicQrError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'DynamicQrError'
  }
}

type CreateDynamicQrInput = {
  destinationUrl: unknown
  name?: unknown
  slug?: unknown
  styleOptions?: unknown
  deviceToken: string
  ipAddress?: string | null
  origin: string
  now?: Date
}

type UpdateDynamicQrInput = {
  destinationUrl?: unknown
  name?: unknown
  styleOptions?: unknown
  status?: unknown
}

export type DynamicQrScanMetadata = {
  visitorHash: string | null
  countryCode: string | null
  city: string | null
  deviceType: string | null
  browser: string | null
  referrerHost: string | null
  isBot: boolean
}

export type DynamicQrRedirect = {
  id: string
  destinationUrl: string
  status: DynamicQrStatus
}

export function isDynamicQrBetaEnabled() {
  return process.env.DYNAMIC_QR_BETA_ENABLED === 'true'
}

export function assertRequestBodySize(contentLength: string | null) {
  if (contentLength && Number(contentLength) > MAX_BODY_LENGTH) {
    throw new DynamicQrError('PAYLOAD_TOO_LARGE', 413, 'La requête est trop volumineuse.')
  }
}

export function assertSameOrigin(requestOrigin: string | null, expectedOrigin: string) {
  if (!requestOrigin) {
    return
  }

  try {
    if (new URL(requestOrigin).origin !== new URL(expectedOrigin).origin) {
      throw new Error('origin')
    }
  } catch {
    throw new DynamicQrError('INVALID_ORIGIN', 403, 'Cette requête ne provient pas de Vinkora.')
  }
}

export function normalizeDynamicDestination(value: unknown) {
  if (typeof value !== 'string') {
    throw new DynamicQrError('INVALID_URL', 400, 'Saisissez une URL HTTP ou HTTPS valide.')
  }

  const trimmed = value.trim()
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new DynamicQrError('INVALID_URL', 400, 'Saisissez une URL HTTP ou HTTPS valide.')
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new DynamicQrError('UNSAFE_URL', 400, 'Cette destination n’est pas autorisée.')
  }

  if (url.port && !['80', '443'].includes(url.port)) {
    throw new DynamicQrError('UNSAFE_URL', 400, 'Seuls les ports web standards sont autorisés.')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (isPrivateHostname(hostname)) {
    throw new DynamicQrError('UNSAFE_URL', 400, 'Les adresses locales ou privées ne sont pas autorisées.')
  }

  return url.toString()
}

export function normalizeDynamicSlug(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return randomSlug()
  }

  if (typeof value !== 'string') {
    throw new DynamicQrError('INVALID_SLUG', 400, 'Le slug est invalide.')
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!SLUG_PATTERN.test(normalized) || RESERVED_SLUGS.has(normalized)) {
    throw new DynamicQrError(
      'INVALID_SLUG',
      400,
      'Utilisez 4 à 40 caractères : lettres minuscules, chiffres et tirets.',
    )
  }

  return normalized
}

export function sanitizeDynamicQrName(value: unknown, destinationUrl: string) {
  const fallback = new URL(destinationUrl).hostname.replace(/^www\./, '')
  if (typeof value !== 'string' || !value.trim()) {
    return fallback.slice(0, MAX_NAME_LENGTH)
  }

  return value.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_NAME_LENGTH)
}

export function sanitizeQrStyle(value: unknown): SavedQrStyle {
  const source = isRecord(value) ? value : {}
  const defaults = defaultQrOptions

  const style: SavedQrStyle = {
    foreground: safeColor(source.foreground, defaults.foreground),
    background: safeColor(source.background, defaults.background),
    transparentBackground: safeBoolean(source.transparentBackground, defaults.transparentBackground),
    useGradient: safeBoolean(source.useGradient, defaults.useGradient),
    gradientFrom: safeColor(source.gradientFrom, defaults.gradientFrom),
    gradientTo: safeColor(source.gradientTo, defaults.gradientTo),
    styleMode: safeEnum(source.styleMode, STYLE_ENUMS.styleMode, defaults.styleMode),
    cornerStyle: safeEnum(source.cornerStyle, STYLE_ENUMS.cornerStyle, defaults.cornerStyle),
    cornerColor: safeColor(source.cornerColor, defaults.cornerColor),
    size: safeNumber(source.size, 180, 420, defaults.size),
    exportSize: safeEnum(source.exportSize, [512, 1024, 2048] as const, defaults.exportSize),
    marginSize: safeNumber(source.marginSize, 0, 12, defaults.marginSize),
    level: safeEnum(source.level, STYLE_ENUMS.level, defaults.level),
    logoSize: safeNumber(source.logoSize, 10, 24, defaults.logoSize),
    showLogo: false,
    logoFrameShape: safeEnum(
      source.logoFrameShape,
      STYLE_ENUMS.logoFrameShape,
      defaults.logoFrameShape,
    ),
    logoPadding: safeNumber(source.logoPadding, 0, 20, defaults.logoPadding),
    logoBackground: safeColor(source.logoBackground, defaults.logoBackground),
    logoBorderColor: safeColor(source.logoBorderColor, defaults.logoBorderColor),
    logoShadow: safeBoolean(source.logoShadow, defaults.logoShadow),
    logoFit: safeEnum(source.logoFit, STYLE_ENUMS.logoFit, defaults.logoFit),
  }

  return style
}

export function generateDeviceToken() {
  return randomBytes(32).toString('base64url')
}

export function generateEditToken() {
  return randomBytes(32).toString('base64url')
}

export function hashEditToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function hashAnonymousValue(value: string, secret: string, scope: string) {
  if (secret.length < 32) {
    throw new DynamicQrError(
      'SERVER_CONFIGURATION_ERROR',
      503,
      'La bêta QR dynamique est temporairement indisponible.',
    )
  }

  return createHmac('sha256', secret).update(`${scope}:${value}`).digest('hex')
}

export function readEditToken(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) {
    throw new DynamicQrError('MANAGEMENT_KEY_REQUIRED', 401, 'La clé de gestion est requise.')
  }

  const token = authorization.slice(7).trim()
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    throw new DynamicQrError('INVALID_MANAGEMENT_KEY', 403, 'La clé de gestion est invalide.')
  }

  return token
}

export async function createAnonymousDynamicQr(
  prisma: PrismaClient,
  input: CreateDynamicQrInput,
) {
  if (!isDynamicQrBetaEnabled()) {
    throw new DynamicQrError(
      'DYNAMIC_QR_BETA_DISABLED',
      503,
      'Les nouvelles créations de QR dynamiques sont temporairement fermées.',
    )
  }

  if (!/^[A-Za-z0-9_-]{40,60}$/.test(input.deviceToken)) {
    throw new DynamicQrError('INVALID_DEVICE_TOKEN', 400, 'Cet appareil ne peut pas être identifié.')
  }

  const now = input.now ?? new Date()
  const destinationUrl = normalizeDynamicDestination(input.destinationUrl)
  const customSlugRequested = typeof input.slug === 'string' && input.slug.trim().length > 0
  let slug = normalizeDynamicSlug(input.slug)
  const name = sanitizeDynamicQrName(input.name, destinationUrl)
  const styleOptions = sanitizeQrStyle(input.styleOptions)
  const editToken = generateEditToken()
  const editTokenHash = hashEditToken(editToken)
  const secret = requireHashSecret('ANONYMOUS_QR_HASH_SECRET')
  const anonymousDeviceHash = hashAnonymousValue(input.deviceToken, secret, 'device')
  const creationIpHash = input.ipAddress
    ? hashAnonymousValue(input.ipAddress, secret, 'creation-ip')
    : null
  const ipLimit = positiveInteger(process.env.ANONYMOUS_QR_IP_DAILY_LIMIT, 50)

  let created
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      created = await prisma.$transaction(
        async (transaction) => {
          const [activeCount, ipCount] = await Promise.all([
            transaction.qrCode.count({
              where: {
                ownership: 'ANONYMOUS_BETA',
                anonymousDeviceHash,
                status: { in: ['ACTIVE', 'SUSPENDED'] },
              },
            }),
            creationIpHash
              ? transaction.qrCode.count({
                  where: {
                    ownership: 'ANONYMOUS_BETA',
                    creationIpHash,
                    createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
                  },
                })
              : Promise.resolve(0),
          ])

          if (activeCount >= ACTIVE_ANONYMOUS_LIMIT) {
            throw new DynamicQrError(
              'ANONYMOUS_QR_LIMIT_REACHED',
              429,
              'Cet appareil possède déjà trois QR dynamiques non archivés.',
            )
          }

          if (ipCount >= ipLimit) {
            throw new DynamicQrError(
              'CREATION_RATE_LIMITED',
              429,
              'Trop de QR dynamiques ont été créés récemment depuis ce réseau.',
            )
          }

          return transaction.qrCode.create({
            data: {
              ownership: 'ANONYMOUS_BETA',
              anonymousDeviceHash,
              editTokenHash,
              creationIpHash,
              slug,
              name,
              destinationUrl,
              styleOptions: styleOptions as unknown as Prisma.InputJsonValue,
              logoUrl: null,
              status: 'ACTIVE',
            },
          })
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10_000,
          timeout: 15_000,
        },
      )
      break
    } catch (error) {
      if (error instanceof DynamicQrError) {
        throw error
      }
      if (isPrismaCode(error, 'P2002')) {
        if (!customSlugRequested && attempt < 2) {
          slug = randomSlug()
          continue
        }
        throw new DynamicQrError('SLUG_ALREADY_USED', 409, 'Ce slug est déjà utilisé.')
      }
      if (isPrismaCode(error, 'P2034') && attempt < 2) {
        continue
      }
      throw error
    }
  }

  if (!created) {
    throw new DynamicQrError('CREATION_CONFLICT', 409, 'La création doit être relancée.')
  }

  const qrCode = serializeDynamicQr(created, input.origin)
  return {
    qrCode,
    editToken,
    manageUrl: `${input.origin}/manage/qr/${created.id}#key=${editToken}`,
  }
}

export async function getManagedDynamicQr(
  prisma: PrismaClient,
  id: string,
  editToken: string,
  origin: string,
) {
  const qrCode = await findAuthorizedAnonymousQr(prisma, id, editToken)
  return serializeDynamicQr(qrCode, origin)
}

export async function updateManagedDynamicQr(
  prisma: PrismaClient,
  id: string,
  editToken: string,
  input: UpdateDynamicQrInput,
  origin: string,
) {
  const editTokenHash = hashEditToken(editToken)
  const existing = await prisma.qrCode.findFirst({
    where: { id, editTokenHash, ownership: 'ANONYMOUS_BETA' },
  })

  if (!existing) {
    throw new DynamicQrError('QR_NOT_FOUND', 404, 'QR dynamique introuvable.')
  }

  const data: Prisma.QrCodeUpdateInput = {}
  const nextDestination = input.destinationUrl !== undefined
    ? normalizeDynamicDestination(input.destinationUrl)
    : existing.destinationUrl

  if (input.destinationUrl !== undefined) data.destinationUrl = nextDestination
  if (input.name !== undefined) {
    data.name = sanitizeDynamicQrName(input.name, nextDestination)
  }
  if (input.styleOptions !== undefined) {
    data.styleOptions = sanitizeQrStyle(input.styleOptions) as unknown as Prisma.InputJsonValue
  }
  if (input.status !== undefined) {
    data.status = parseDynamicStatus(input.status)
  }

  const wantsQuotaSlot =
    existing.status === 'ARCHIVED' && data.status !== undefined && data.status !== 'ARCHIVED'

  let updated: typeof existing | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      updated = await prisma.$transaction(
        async (transaction) => {
          if (wantsQuotaSlot) {
            const activeCount = await transaction.qrCode.count({
              where: {
                ownership: 'ANONYMOUS_BETA',
                anonymousDeviceHash: existing.anonymousDeviceHash,
                status: { in: ['ACTIVE', 'SUSPENDED'] },
              },
            })
            if (activeCount >= ACTIVE_ANONYMOUS_LIMIT) {
              throw new DynamicQrError(
                'ANONYMOUS_QR_LIMIT_REACHED',
                429,
                'Archivez un autre QR dynamique avant de réactiver celui-ci.',
              )
            }
          }

          return transaction.qrCode.update({ where: { id }, data })
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10_000,
          timeout: 15_000,
        },
      )
      break
    } catch (error) {
      if (error instanceof DynamicQrError) throw error
      if (isPrismaCode(error, 'P2034') && attempt < 2) continue
      throw error
    }
  }

  if (!updated) {
    throw new DynamicQrError('UPDATE_CONFLICT', 409, 'La modification doit être relancée.')
  }

  return serializeDynamicQr(updated, origin)
}

export async function resolveDynamicQrRedirect(prisma: PrismaClient, slug: string) {
  const qrCode = await prisma.qrCode.findUnique({
    where: { slug },
    select: { id: true, destinationUrl: true, status: true },
  })

  return qrCode as DynamicQrRedirect | null
}

export async function recordDynamicQrScanSafely(
  prisma: PrismaClient,
  qrCodeId: string,
  metadata: DynamicQrScanMetadata,
  options: { now?: Date; logger?: typeof console.error } = {},
) {
  const now = options.now ?? new Date()
  try {
    const clickWrite = prisma.click.create({
      data: { qrCodeId, occurredAt: now, ...metadata },
      select: { id: true },
    })

    if (metadata.isBot) {
      await prisma.$transaction([clickWrite])
    } else {
      await prisma.$transaction([
        prisma.qrCode.update({
        where: { id: qrCodeId },
        data: { clickCount: { increment: 1 }, lastClickedAt: now },
        select: { id: true },
      }),
        clickWrite,
      ])
    }
    return true
  } catch (error) {
    const logger = options.logger ?? console.error
    logger('Vinkora dynamic QR analytics update failed.', {
      qrCodeId,
      errorCode: getSafeErrorCode(error),
    })
    return false
  }
}

export function buildDynamicQrScanMetadata(headers: Headers, now = new Date()): DynamicQrScanMetadata {
  const userAgent = headers.get('user-agent') ?? ''
  const ipAddress = firstForwardedIp(headers.get('x-forwarded-for'))
  const analyticsSecret = process.env.ANALYTICS_HASH_SECRET
  const visitorHash = ipAddress && analyticsSecret && analyticsSecret.length >= 32
    ? hashAnonymousValue(`${ipAddress}|${userAgent}`, analyticsSecret, `visitor:${utcDate(now)}`)
    : null

  return {
    visitorHash,
    countryCode: cleanHeader(headers.get('x-vercel-ip-country'), 2)?.toUpperCase() ?? null,
    city: decodeHeader(headers.get('x-vercel-ip-city'), 120),
    deviceType: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    referrerHost: getReferrerHost(headers.get('referer')),
    isBot: /bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp/i.test(userAgent),
  }
}

export async function getDynamicQrAnalytics(
  prisma: PrismaClient,
  id: string,
  editToken: string,
): Promise<DynamicQrAnalytics> {
  const qrCode = await findAuthorizedAnonymousQr(prisma, id, editToken)
  const from = new Date(Date.now() - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000)

  const [daily, summary, countries, cities, devices, browsers, referrers] = await Promise.all([
    prisma.$queryRaw<Array<{ date: Date; scans: bigint; uniqueVisitors: bigint }>>(Prisma.sql`
      SELECT date_trunc('day', "occurredAt") AS date,
             count(*)::bigint AS scans,
             count(DISTINCT "visitorHash")::bigint AS "uniqueVisitors"
      FROM "Click"
      WHERE "qrCodeId" = ${id} AND "occurredAt" >= ${from} AND "isBot" = false
      GROUP BY 1 ORDER BY 1
    `),
    prisma.$queryRaw<Array<{ analyzedScans: bigint; uniqueVisitors: bigint; botScans: bigint }>>(Prisma.sql`
      SELECT count(*) FILTER (WHERE "isBot" = false)::bigint AS "analyzedScans",
             count(DISTINCT "visitorHash") FILTER (WHERE "isBot" = false)::bigint AS "uniqueVisitors",
             count(*) FILTER (WHERE "isBot" = true)::bigint AS "botScans"
      FROM "Click"
      WHERE "qrCodeId" = ${id} AND "occurredAt" >= ${from}
    `),
    breakdown(prisma, id, from, 'countryCode'),
    breakdown(prisma, id, from, 'city'),
    breakdown(prisma, id, from, 'deviceType'),
    breakdown(prisma, id, from, 'browser'),
    breakdown(prisma, id, from, 'referrerHost'),
  ])

  return {
    totalScans: qrCode.clickCount,
    lastScanAt: qrCode.lastClickedAt?.toISOString() ?? null,
    periodDays: ANALYTICS_RETENTION_DAYS,
    analyzedScans: Number(summary[0]?.analyzedScans ?? 0),
    estimatedUniqueVisitors: Number(summary[0]?.uniqueVisitors ?? 0),
    botScans: Number(summary[0]?.botScans ?? 0),
    daily: daily.map((item) => ({
      date: item.date.toISOString().slice(0, 10),
      scans: Number(item.scans),
      uniqueVisitors: Number(item.uniqueVisitors),
    })),
    countries,
    cities,
    devices,
    browsers,
    referrers,
  }
}

export async function cleanupAnonymousDynamicQrData(prisma: PrismaClient, now = new Date()) {
  const clickCutoff = new Date(now.getTime() - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const ipCutoff = new Date(now.getTime() - CREATION_HASH_RETENTION_HOURS * 60 * 60 * 1000)

  const [deletedClicks, clearedIpHashes] = await prisma.$transaction([
    prisma.click.deleteMany({
      where: {
        occurredAt: { lt: clickCutoff },
        qrCode: { ownership: 'ANONYMOUS_BETA' },
      },
    }),
    prisma.qrCode.updateMany({
      where: {
        ownership: 'ANONYMOUS_BETA',
        creationIpHash: { not: null },
        createdAt: { lt: ipCutoff },
      },
      data: { creationIpHash: null },
    }),
  ])

  return { deletedClicks: deletedClicks.count, clearedIpHashes: clearedIpHashes.count }
}

export function getClientIp(headers: Headers) {
  return firstForwardedIp(headers.get('x-forwarded-for'))
}

function requireHashSecret(name: 'ANONYMOUS_QR_HASH_SECRET') {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new DynamicQrError(
      'SERVER_CONFIGURATION_ERROR',
      503,
      'La bêta QR dynamique est temporairement indisponible.',
    )
  }
  return value
}

async function findAuthorizedAnonymousQr(prisma: PrismaClient, id: string, editToken: string) {
  const qrCode = await prisma.qrCode.findFirst({
    where: {
      id,
      editTokenHash: hashEditToken(editToken),
      ownership: 'ANONYMOUS_BETA',
    },
  })

  if (!qrCode) {
    throw new DynamicQrError('QR_NOT_FOUND', 404, 'QR dynamique introuvable.')
  }

  return qrCode
}

function serializeDynamicQr(
  qrCode: {
    id: string
    slug: string
    name: string
    destinationUrl: string
    status: ResourceStatus
    styleOptions: Prisma.JsonValue
    clickCount: number
    lastClickedAt: Date | null
    createdAt: Date
    updatedAt: Date
  },
  origin: string,
): DynamicQrResource {
  return {
    id: qrCode.id,
    slug: qrCode.slug,
    name: qrCode.name,
    destinationUrl: qrCode.destinationUrl,
    publicUrl: `${origin}/q/${qrCode.slug}`,
    status: qrCode.status,
    styleOptions: sanitizeQrStyle(qrCode.styleOptions),
    clickCount: qrCode.clickCount,
    lastClickedAt: qrCode.lastClickedAt?.toISOString() ?? null,
    createdAt: qrCode.createdAt.toISOString(),
    updatedAt: qrCode.updatedAt.toISOString(),
  }
}

async function breakdown(
  prisma: PrismaClient,
  qrCodeId: string,
  from: Date,
  field: 'countryCode' | 'city' | 'deviceType' | 'browser' | 'referrerHost',
) {
  const rows = await prisma.click.groupBy({
    by: [field],
    where: { qrCodeId, occurredAt: { gte: from }, isBot: false },
    _count: { _all: true },
    orderBy: { _count: { [field]: 'desc' } },
    take: 8,
  } as never)

  return (rows as unknown as Array<Record<string, string | null> & { _count: { _all: number } }>).map((row) => ({
    label: row[field] || 'Inconnu',
    value: row._count._all,
  }))
}

function isPrivateHostname(hostname: string) {
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true
  }

  const version = isIP(hostname)
  if (version === 4) {
    const [a, b] = hostname.split('.').map(Number)
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
  }

  if (version === 6) {
    return hostname === '::1' || hostname === '::' || /^(fc|fd|fe8|fe9|fea|feb)/i.test(hostname)
  }

  return false
}

function randomSlug() {
  return randomBytes(6).toString('base64url').toLowerCase().replace(/[_-]/g, 'x').slice(0, 8)
}

function parseDynamicStatus(value: unknown): ResourceStatus {
  if (!['ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(String(value))) {
    throw new DynamicQrError('INVALID_STATUS', 400, 'Cet état de QR est invalide.')
  }
  return value as ResourceStatus
}

function firstForwardedIp(value: string | null) {
  return value?.split(',')[0]?.trim() || null
}

function utcDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function cleanHeader(value: string | null, maxLength: number) {
  const cleaned = value?.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength)
  return cleaned || null
}

function decodeHeader(value: string | null, maxLength: number) {
  if (!value) return null
  try {
    return cleanHeader(decodeURIComponent(value), maxLength)
  } catch {
    return cleanHeader(value, maxLength)
  }
}

function getReferrerHost(value: string | null) {
  if (!value) return null
  try {
    return new URL(value).hostname.slice(0, 255) || null
  } catch {
    return null
  }
}

function detectDevice(userAgent: string) {
  if (!userAgent) return null
  if (/tablet|ipad/i.test(userAgent)) return 'Tablette'
  if (/mobile|android|iphone/i.test(userAgent)) return 'Mobile'
  return 'Ordinateur'
}

function detectBrowser(userAgent: string) {
  if (!userAgent) return null
  if (/edg\//i.test(userAgent)) return 'Edge'
  if (/opr\//i.test(userAgent)) return 'Opera'
  if (/firefox\//i.test(userAgent)) return 'Firefox'
  if (/chrome\//i.test(userAgent)) return 'Chrome'
  if (/safari\//i.test(userAgent)) return 'Safari'
  return 'Autre'
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === 'string' && COLOR_PATTERN.test(value) ? value.toLowerCase() : fallback
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function safeNumber(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback
}

function safeEnum<T extends string | number>(value: unknown, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function isPrismaCode(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

function getSafeErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }
  return error instanceof Error ? error.name : 'UNKNOWN'
}

export function toDynamicQrErrorResponse(error: unknown) {
  if (error instanceof DynamicQrError) {
    return { status: error.status, body: { code: error.code, error: error.message } }
  }

  console.error('Vinkora dynamic QR request failed.', { errorCode: getSafeErrorCode(error) })
  return {
    status: 500,
    body: { code: 'DYNAMIC_QR_ERROR', error: 'Le service QR dynamique est indisponible.' },
  }
}
