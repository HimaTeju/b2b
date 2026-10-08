import { useNavigate } from 'react-router-dom'

function ListingCard({ item }) {
  const navigate = useNavigate()

  return (
    <article className="listing-card" onClick={() => navigate(`/listing/${item.id}`)}>
      <div className={`listing-card__accent listing-card__accent--${item.domain}`} />
      <div className="listing-card__body">
        <div className="listing-card__top">
          <span className="listing-card__category">{item.category}</span>
          <span className="listing-card__posted">{item.posted}</span>
        </div>
        <h3 className="listing-card__title">{item.title}</h3>
        <p className="listing-card__price">{item.price}</p>
        <p className="listing-card__location">{item.location}</p>
      </div>
    </article>
  )
}

export default ListingCard
