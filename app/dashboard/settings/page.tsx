import { ShieldCheck } from 'lucide-react'
import { SettingsPanels } from '@/components/saas/SettingsPanels'
import { requireCurrentVinkoraUser } from '../../../lib/auth/vinkora-user'
import { profilePreferences } from '../../../lib/personalization'

export default async function SettingsPage() {
  const user = await requireCurrentVinkoraUser()

  return (
    <div className="dashboard-page dashboard-page--settings">
      <SettingsPanels
        user={{
          name: user.profile?.name ?? '',
          email: user.email,
          company: user.profile?.company ?? '',
          city: user.profile?.city ?? '',
        }}
        preferences={profilePreferences(user.profile)}
      />
      <section className="security-preview">
        <span><ShieldCheck size={21} /></span>
        <div>
          <h2>Sécurité du compte</h2>
          <p>Votre compte est protégé par votre méthode de connexion Vinkora.</p>
        </div>
      </section>
    </div>
  )
}
