import { formatLocation } from '../lib/format'
import './ProviderCard.css'

/**
 * Inner card content for a capability profile (service provider / job-work
 * vendor) — title, location, category chips. No price/image. Kept copy-free
 * (no domain-specific wording) so Job Work's vendor browsing can reuse it as-is.
 */
function ProviderCard({ provider }) {
  const categories = (provider.service_capability_categories || provider.jobwork_capability_categories || [])
    .map(c => c.machine_categories?.name)
    .filter(Boolean)

  return (
    <div className="provider-card__content">
      <h3 className="provider-card__title">{provider.title}</h3>
      <p className="provider-card__location">{formatLocation(provider)}</p>
      {categories.length > 0 && (
        <div className="provider-card__tags">
          {categories.slice(0, 3).map(name => (
            <span key={name} className="provider-card__tag">{name}</span>
          ))}
          {categories.length > 3 && <span className="provider-card__tag">+{categories.length - 3}</span>}
        </div>
      )}
    </div>
  )
}

export default ProviderCard
