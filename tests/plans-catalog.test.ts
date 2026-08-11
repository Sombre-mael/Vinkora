import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PLAN_IDS,
  catalogPriceNotice,
  dynamicResourceDefinition,
  launchPlans,
  publishedLaunchPlans,
} from '../src/config/plans'

const readProjectFile = (path: string) => readFileSync(path, 'utf8')

test('the public launch catalog contains only the three approved offers', () => {
  assert.deepEqual(PLAN_IDS, ['FREE', 'EVENT_PASS', 'STARTER'])
  assert.deepEqual(publishedLaunchPlans.map((plan) => plan.id), [...PLAN_IDS])
  assert.deepEqual(publishedLaunchPlans.map((plan) => plan.publicName), [
    'Free',
    'Pass Événement',
    'Starter',
  ])
})

test('Free matches the approved local static QR offer', () => {
  const free = launchPlans.find((plan) => plan.id === 'FREE')

  assert.ok(free)
  assert.equal(free.publicName, 'Free')
  assert.deepEqual(free.pricing, { usd: 0, cdf: null })
  assert.deepEqual(free.duration, { days: null, label: 'Illimitée' })
  assert.deepEqual(free.quotas, {
    dynamicResourcesPerPeriod: 0,
    analyzedEventsPerPeriod: 0,
  })
  assert.equal(free.cta.href, '/studio')
  assert.equal(free.commercialStatus.availability, 'AVAILABLE')
  assert.equal(free.commercialStatus.purchasable, false)
  assert.match(free.features.join(' '), /Génération locale dans le navigateur/)
  assert.match(free.limitations.join(' '), /Aucune sauvegarde dans Neon/)
  assert.match(free.limitations.join(' '), /Destination non modifiable après impression/)
})

test('Pass Événement has the exact approved prices, duration and quotas', () => {
  const eventPass = launchPlans.find((plan) => plan.id === 'EVENT_PASS')

  assert.ok(eventPass)
  assert.deepEqual(eventPass.pricing, { usd: 2, cdf: 5000 })
  assert.deepEqual(eventPass.duration, { days: 7, label: '7 jours' })
  assert.deepEqual(eventPass.quotas, {
    dynamicResourcesPerPeriod: 10,
    analyzedEventsPerPeriod: 2000,
  })
  assert.equal(eventPass.statisticsRetention.days, 30)
  assert.equal(eventPass.gracePeriodDays, 3)
  assert.equal(eventPass.commercialStatus.purchasable, false)
  assert.equal(eventPass.cta.href, null)
})

test('Starter has the exact approved prices, duration and quotas', () => {
  const starter = launchPlans.find((plan) => plan.id === 'STARTER')

  assert.ok(starter)
  assert.deepEqual(starter.pricing, { usd: 4, cdf: 10000 })
  assert.deepEqual(starter.duration, { days: 30, label: '30 jours' })
  assert.deepEqual(starter.quotas, {
    dynamicResourcesPerPeriod: 50,
    analyzedEventsPerPeriod: 10000,
  })
  assert.equal(starter.statisticsRetention.days, 90)
  assert.equal(starter.gracePeriodDays, 7)
  assert.equal(starter.recommended, true)
  assert.equal(starter.commercialStatus.purchasable, false)
  assert.equal(starter.cta.href, null)
})

test('all catalog surfaces use the centralized pricing source', () => {
  const surfaces = [
    'app/page.tsx',
    'app/pricing/page.tsx',
    'app/dashboard/billing/page.tsx',
  ]

  for (const surface of surfaces) {
    const source = readProjectFile(surface)
    assert.match(source, /publishedLaunchPlans/)
    assert.match(source, /PlanCard/)
  }

  const planCard = readProjectFile('src/components/saas/PlanCard.tsx')
  assert.match(planCard, /plan\.pricing/)
  assert.match(planCard, /plan\.duration/)
  assert.match(planCard, /plan\.quotas/)
  assert.match(planCard, /disabled/)
  assert.doesNotMatch(planCard, /pricing\.cdf\s*\?\?\s*0/)
})

test('no retired or excluded launch offer remains on catalog surfaces', () => {
  const sources = [
    readProjectFile('app/page.tsx'),
    readProjectFile('app/pricing/page.tsx'),
    readProjectFile('app/dashboard/billing/page.tsx'),
    readProjectFile('src/components/saas/PlanCard.tsx'),
  ].join('\n')

  assert.doesNotMatch(sources, /Pro\s*(?:à|a)?\s*3\s*\$/i)
  assert.doesNotMatch(sources, /Vinkora Pro/i)
  assert.doesNotMatch(sources, /<span>Studio<\/span>/)
  assert.doesNotMatch(sources, /\b(?:Business|Agence|Revendeur|Entreprise)\b/)
})

test('commercial values are not duplicated directly in catalog page components', () => {
  const pageSources = [
    readProjectFile('app/page.tsx'),
    readProjectFile('app/pricing/page.tsx'),
    readProjectFile('app/dashboard/billing/page.tsx'),
  ].join('\n')

  assert.doesNotMatch(pageSources, /\b(?:2|4)\s*USD\b/)
  assert.doesNotMatch(pageSources, /\b(?:5[\s\u00a0]?000|10[\s\u00a0]?000)\s*CDF\b/)
  assert.doesNotMatch(pageSources, /\b(?:2[\s\u00a0]?000|10[\s\u00a0]?000)\s*(?:clics|scans)\b/i)
})

test('billing remains empty and the Studio route remains available', () => {
  const billing = readProjectFile('app/dashboard/billing/page.tsx')
  const studio = readProjectFile('app/studio/page.tsx')

  assert.match(billing, /Aucune offre active/)
  assert.match(billing, /Aucune utilisation à afficher/)
  assert.match(billing, /Aucune facture ni transaction/)
  assert.doesNotMatch(billing, /demoPlan|usage\.value|is-current/)
  assert.match(studio, /import App from '@\/App'/)
  assert.equal(dynamicResourceDefinition.length > 0, true)
  assert.equal(catalogPriceNotice.length > 0, true)
})
