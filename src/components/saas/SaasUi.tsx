import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight, FlaskConical } from 'lucide-react'

type BadgeProps = {
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'indigo' | 'warning'
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`saas-badge saas-badge--${tone}`}>{children}</span>
}

type StatCardProps = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  trend?: string
}

export function StatCard({ label, value, detail, icon: Icon, trend }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__top">
        <span>{label}</span>
        <span className="stat-card__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-card__detail">
        {trend ? <span className="stat-card__trend">{trend}</span> : null}
        <span>{detail}</span>
      </div>
    </article>
  )
}

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <span className="section-heading__eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  )
}

export function DemoNotice() {
  return (
    <div className="demo-notice" role="note">
      <FlaskConical size={17} aria-hidden="true" />
      <span>Données de démonstration</span>
      <span className="demo-notice__detail">La connexion au compte arrive dans une prochaine phase.</span>
    </div>
  )
}

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionHref ? (
        <Link className="button button--secondary" href={actionHref}>
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
