import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  deriveJourneySummary,
  parseProfileSettings,
  profilePreferences,
} from '../lib/personalization'

test('le parcours distingue le compte prêt, le QR créé et le premier scan', () => {
  assert.deepEqual(deriveJourneySummary(null).stage, 'ACCOUNT_READY')
  assert.deepEqual(deriveJourneySummary({ id: 'qr-1', clickCount: 0 }).stage, 'QR_CREATED')
  assert.deepEqual(deriveJourneySummary({ id: 'qr-1', clickCount: 1 }).stage, 'FIRST_SCAN')
  assert.equal(deriveJourneySummary({ id: 'qr-1', clickCount: 1 }).actionHref, '/dashboard/analytics')
})

test('les préférences absentes conservent une interface claire et confortable', () => {
  assert.deepEqual(profilePreferences(null), {
    accent: 'INDIGO',
    density: 'COMFORTABLE',
    motion: 'SYSTEM',
  })
})

test('les réglages de profil valides sont normalisés', () => {
  const formData = new FormData()
  formData.set('name', '  Maël Kahilu  ')
  formData.set('company', ' Vinkora ')
  formData.set('city', ' Lubumbashi ')
  formData.set('interfaceAccent', 'TEAL')
  formData.set('interfaceDensity', 'COMPACT')
  formData.set('interfaceMotion', 'EXPRESSIVE')

  assert.deepEqual(parseProfileSettings(formData), {
    name: 'Maël Kahilu',
    company: 'Vinkora',
    city: 'Lubumbashi',
    interfaceAccent: 'TEAL',
    interfaceDensity: 'COMPACT',
    interfaceMotion: 'EXPRESSIVE',
  })
})

test('une préférence inconnue ou un nom vide est refusé', () => {
  const invalidChoice = validSettings()
  invalidChoice.set('interfaceMotion', 'INTENSE')
  assert.throws(() => parseProfileSettings(invalidChoice), /invalide/)

  const missingName = validSettings()
  missingName.set('name', '   ')
  assert.throws(() => parseProfileSettings(missingName), /nom/)
})

test('la migration des préférences est additive et possède des valeurs par défaut', () => {
  const migration = readFileSync(
    'prisma/migrations/20261008113000_add_profile_ui_preferences/migration.sql',
    'utf8',
  )

  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN|TYPE)/i)
  assert.match(migration, /ADD COLUMN "interfaceAccent"[\s\S]*DEFAULT 'INDIGO'/)
  assert.match(migration, /ADD COLUMN "interfaceDensity"[\s\S]*DEFAULT 'COMFORTABLE'/)
  assert.match(migration, /ADD COLUMN "interfaceMotion"[\s\S]*DEFAULT 'SYSTEM'/)
})

function validSettings() {
  const formData = new FormData()
  formData.set('name', 'Maël')
  formData.set('company', '')
  formData.set('city', '')
  formData.set('interfaceAccent', 'INDIGO')
  formData.set('interfaceDensity', 'COMFORTABLE')
  formData.set('interfaceMotion', 'SYSTEM')
  return formData
}
