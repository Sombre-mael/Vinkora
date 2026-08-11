import { KeyRound, ShieldCheck } from 'lucide-react'
import { DemoNotice } from '@/components/saas/SaasUi'
import { SettingsPanels } from '@/components/saas/SettingsPanels'

export default function SettingsPage() {
  return (
    <div className="dashboard-page dashboard-page--settings">
      <DemoNotice />
      <SettingsPanels />
      <section className="security-preview">
        <span><ShieldCheck size={21} /></span>
        <div>
          <h2>Sécurité du compte</h2>
          <p>La gestion du mot de passe et des sessions apparaîtra après l’intégration de l’authentification.</p>
        </div>
        <button className="button button--secondary" type="button" disabled>
          <KeyRound size={16} /> Gérer la sécurité
        </button>
      </section>
    </div>
  )
}
