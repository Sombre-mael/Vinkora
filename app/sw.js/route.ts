import { VINKORA_APP_VERSION } from '@/lib/app-version'

export const dynamic = 'force-dynamic'

const workerSource = `
const VINKORA_VERSION = ${JSON.stringify(VINKORA_APP_VERSION)}
const OWNED_CACHE_PREFIXES = ['vinkora-', 'linkshort-']

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting())
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys()
    const obsoleteCacheKeys = cacheKeys.filter((key) =>
      OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)),
    )

    await Promise.all(obsoleteCacheKeys.map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})
`

export function GET() {
  return new Response(workerSource, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'X-Vinkora-Version': VINKORA_APP_VERSION,
    },
  })
}
