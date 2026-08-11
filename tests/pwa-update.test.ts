import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { GET as getVersion } from '../app/api/version/route'
import { GET as getServiceWorker } from '../app/sw.js/route'
import { VINKORA_APP_VERSION } from '../src/lib/app-version'

const readProjectFile = (path: string) => readFileSync(path, 'utf8')

test('the PWA manifest uses a stable root identity and opens the Studio shortcut', () => {
  const manifest = JSON.parse(readProjectFile('public/manifest.webmanifest')) as {
    id: string
    start_url: string
    scope: string
    shortcuts: Array<{ url: string }>
  }

  assert.equal(manifest.id, '/')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.shortcuts[0]?.url, '/studio')
})

test('the deployment version endpoint is never cached', async () => {
  const response = getVersion()
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate')
  assert.equal(body.version, VINKORA_APP_VERSION)
})

test('the service worker is dynamic, versioned and activated only on request', async () => {
  const serviceWorkerRoute = readProjectFile('app/sw.js/route.ts')
  const response = getServiceWorker()
  const worker = await response.text()

  assert.equal(existsSync('public/sw.js'), false)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate')
  assert.equal(response.headers.get('X-Vinkora-Version'), VINKORA_APP_VERSION)
  assert.equal(
    worker.includes(`VINKORA_VERSION = ${JSON.stringify(VINKORA_APP_VERSION)}`),
    true,
  )
  assert.match(worker, /SKIP_WAITING/)
  assert.match(serviceWorkerRoute, /VINKORA_APP_VERSION/)
  assert.match(serviceWorkerRoute, /OWNED_CACHE_PREFIXES/)
  assert.match(serviceWorkerRoute, /clients\.claim/)
  assert.doesNotMatch(worker, /addEventListener\(['"]fetch['"]/)
})

test('the client checks deployments and offers an in-app update', () => {
  const registration = readProjectFile('src/components/PwaRegistration.tsx')

  assert.match(registration, /updateViaCache: 'none'/)
  assert.match(registration, /\/api\/version/)
  assert.match(registration, /registration\?\.update|registration\.update/)
  assert.match(registration, /controllerchange/)
  assert.match(registration, /visibilitychange/)
  assert.match(registration, /window\.setInterval/)
  assert.match(registration, /Mise à jour disponible/)
  assert.match(registration, /Mettre à jour/)
})
