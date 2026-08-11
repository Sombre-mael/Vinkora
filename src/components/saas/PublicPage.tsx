import { PublicFooter } from './PublicFooter'
import { PublicNav } from './PublicNav'

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
