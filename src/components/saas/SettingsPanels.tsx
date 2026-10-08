type SettingsPanelsProps = {
  user: {
    name: string
    email: string
    company: string
    city: string
  }
}

export function SettingsPanels({ user }: SettingsPanelsProps) {
  const fields = [
    { label: 'Nom complet', value: user.name || 'Non renseigné' },
    { label: 'Adresse e-mail', value: user.email },
    { label: 'Entreprise', value: user.company || 'Non renseignée' },
    { label: 'Ville', value: user.city || 'Non renseignée' },
  ]

  return (
    <section className="settings-section">
      <div className="settings-section__head">
        <div>
          <h2>Profil</h2>
          <p>Informations associées à votre compte Vinkora.</p>
        </div>
      </div>
      <dl className="settings-fields">
        {fields.map((field) => (
          <div className="form-field" key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
