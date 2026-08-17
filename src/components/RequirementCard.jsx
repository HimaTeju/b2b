import { formatLocation, formatRelativeDate } from '../lib/format'
import './RequirementCard.css'

/**
 * Inner card content for entities with no price/image (service/job-work
 * requirements, and later job posts) — category, title, location, posted
 * date, and a short description snippet. The wrapping clickable card
 * container is rendered by BrowseGrid.
 */
function RequirementCard({ item }) {
  return (
    <div className="requirement-card__content">
      <div className="requirement-card__top">
        {item.machine_categories?.name && (
          <span className="requirement-card__category mono">{item.machine_categories.name}</span>
        )}
        <span className="requirement-card__date mono">{formatRelativeDate(item.created_at)}</span>
      </div>
      <h3 className="requirement-card__title">{item.title}</h3>
      <p className="requirement-card__location">{formatLocation(item)}</p>
      {item.description && <p className="requirement-card__desc">{item.description}</p>}
    </div>
  )
}

export default RequirementCard
