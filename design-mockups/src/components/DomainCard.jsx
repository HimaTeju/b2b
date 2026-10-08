import { useNavigate } from 'react-router-dom'
import { Icon } from '../icons'

/**
 * Flat, single-tap replacement for the current app's sidebar rail + panel.
 * Every domain is a full-width card with its two actions right on it —
 * no intermediate navigation step to reach "browse" or "post".
 */
function DomainCard({ domain }) {
  const navigate = useNavigate()
  const DomainIcon = Icon[domain.key]

  return (
    <article className={`domain-card domain-card--${domain.key}`}>
      <div className="domain-card__icon">
        <DomainIcon width={24} height={24} />
      </div>
      <div className="domain-card__body">
        <h3 className="domain-card__title">{domain.label}</h3>
        <p className="domain-card__blurb">{domain.blurb}</p>
        <div className="domain-card__actions">
          <button className="btn btn--primary" onClick={() => navigate(domain.to)}>
            {domain.primaryAction}
          </button>
          <button className="btn btn--ghost" onClick={() => navigate(domain.to)}>
            {domain.secondaryAction}
          </button>
        </div>
      </div>
    </article>
  )
}

export default DomainCard
