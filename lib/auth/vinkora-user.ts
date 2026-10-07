import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getPrisma } from '../prisma'
import { auth } from './server'

export const NEON_AUTH_PROVIDER = 'neon-auth'

type AuthUser = {
  id: string
  email: string
  name: string
}

export class SuspendedUserError extends Error {
  constructor() {
    super('Ce compte Vinkora est suspendu.')
    this.name = 'SuspendedUserError'
  }
}

export async function ensureVinkoraUser(authUser: AuthUser) {
  const prisma = getPrisma()
  const email = authUser.email.trim().toLowerCase()
  const name = authUser.name.trim() || email.split('@')[0]

  const existingIdentity = await prisma.authIdentity.findUnique({
    where: {
      provider_subject: {
        provider: NEON_AUTH_PROVIDER,
        subject: authUser.id,
      },
    },
    include: {
      user: {
        include: { profile: true },
      },
    },
  })

  if (existingIdentity) {
    if (existingIdentity.user.status === 'SUSPENDED') {
      throw new SuspendedUserError()
    }

    return existingIdentity.user
  }

  const emailAlreadyUsed = await prisma.user.findUnique({ where: { email } })
  if (emailAlreadyUsed) {
    throw new Error('Cette adresse est déjà rattachée à un compte Vinkora.')
  }

  try {
    return await prisma.user.create({
      data: {
        email,
        authIdentities: {
          create: {
            provider: NEON_AUTH_PROVIDER,
            subject: authUser.id,
          },
        },
        profile: {
          create: { name },
        },
      },
      include: { profile: true },
    })
  } catch (error) {
    const identityCreatedByAnotherRequest = await prisma.authIdentity.findUnique({
      where: {
        provider_subject: {
          provider: NEON_AUTH_PROVIDER,
          subject: authUser.id,
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    })

    if (identityCreatedByAnotherRequest) {
      if (identityCreatedByAnotherRequest.user.status === 'SUSPENDED') {
        throw new SuspendedUserError()
      }

      return identityCreatedByAnotherRequest.user
    }

    throw error
  }
}

export const getCurrentVinkoraUser = cache(async () => {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return null
  }

  return ensureVinkoraUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
})

export async function requireCurrentVinkoraUser() {
  const user = await getCurrentVinkoraUser()

  if (!user) {
    redirect('/login')
  }

  return user
}
