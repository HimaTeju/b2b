import { formatLocation } from '../../../lib/format'
import '../../../components/ProviderCard.css'

/**
 * Inner card content for a job seeker profile — headline, experience,
 * location, category chips. Reuses ProviderCard's layout/CSS since the
 * shape (title-like field + location + tags) is the same, but reads from
 * job_seeker_profiles fields (headline, experience_years) rather than a
 * capability profile's title.
 */
function SeekerCard({ seeker }) {
  const categories = (seeker.job_seeker_categories || [])
    .map(c => c.machine_categories?.name)
    .filter(Boolean)

  return (
    <div className="provider-card__content">
      <h3 className="provider-card__title">{seeker.headline}</h3>
      <p className="provider-card__location">
        {formatLocation(seeker)}
        {seeker.experience_years > 0 && ` · ${seeker.experience_years} yr${seeker.experience_years === 1 ? '' : 's'} experience`}
      </p>
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

export default SeekerCard
