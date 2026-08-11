'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

const CURRENT_VERSION = process.env.NEXT_PUBLIC_VINKORA_VERSION ?? 'development'
const VERSION_ENDPOINT = '/api/version'
const UPDATE_TOAST_ID = 'vinkora-pwa-update'
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    let registration: ServiceWorkerRegistration | null = null
    let intervalId: number | undefined
    let disposed = false
    let checkingVersion = false
    let reloading = false

    const reloadOnce = () => {
      if (reloading || disposed) {
        return
      }

      reloading = true
      window.location.reload()
    }

    const applyUpdate = async () => {
      toast.dismiss(UPDATE_TOAST_ID)

      try {
        await registration?.update()
      } catch {
        // Reloading still retrieves the current deployment when update() is unavailable.
      }

      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.setTimeout(reloadOnce, 1500)
        return
      }

      reloadOnce()
    }

    const offerUpdate = () => {
      if (disposed) {
        return
      }

      toast.info('Mise à jour disponible', {
        id: UPDATE_TOAST_ID,
        description: 'Une nouvelle version de Vinkora est prête.',
        duration: Infinity,
        action: {
          label: 'Mettre à jour',
          onClick: () => void applyUpdate(),
        },
      })
    }

    const checkDeploymentVersion = async () => {
      if (checkingVersion || disposed) {
        return
      }

      checkingVersion = true

      try {
        const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { version?: unknown }

        if (typeof data.version === 'string' && data.version !== CURRENT_VERSION) {
          offerUpdate()
          void registration?.update()
        }
      } catch {
        // Update checks are best-effort and never block Vinkora.
      } finally {
        checkingVersion = false
      }
    }

    const monitorInstallingWorker = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          offerUpdate()
        }
      })
    }

    const handleUpdateFound = () => {
      if (registration?.installing) {
        monitorInstallingWorker(registration.installing)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void registration?.update()
        void checkDeploymentVersion()
      }
    }

    const handleOnline = () => {
      void registration?.update()
      void checkDeploymentVersion()
    }

    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce)

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((nextRegistration) => {
        if (disposed) {
          return
        }

        registration = nextRegistration
        registration.addEventListener('updatefound', handleUpdateFound)

        if (registration.waiting && navigator.serviceWorker.controller) {
          offerUpdate()
        }

        void registration.update()
        void checkDeploymentVersion()

        intervalId = window.setInterval(checkDeploymentVersion, UPDATE_CHECK_INTERVAL)
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('online', handleOnline)
      })
      .catch(() => {
        // Vinkora remains usable when service workers are unavailable.
      })

    return () => {
      disposed = true
      toast.dismiss(UPDATE_TOAST_ID)
      navigator.serviceWorker.removeEventListener('controllerchange', reloadOnce)
      registration?.removeEventListener('updatefound', handleUpdateFound)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)

      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  return null
}
