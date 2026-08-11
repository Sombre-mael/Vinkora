import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from '../app/api/links/route'

test('POST /api/links refuses anonymous durable link creation', async () => {
  const response = await POST()
  const body = await response.json()

  assert.equal(response.status, 401)
  assert.equal(body.code, 'AUTHENTICATION_AND_ACTIVE_PLAN_REQUIRED')
  assert.match(body.error, /authentification/i)
  assert.match(body.error, /offre active/i)
})
