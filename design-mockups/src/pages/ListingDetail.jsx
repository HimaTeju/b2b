import { useParams } from 'react-router-dom'
import { LISTINGS } from '../data'
import { Icon } from '../icons'

function ListingDetail() {
  const { id } = useParams()
  const item = LISTINGS.find(l => String(l.id) === id) || LISTINGS[0]

  return (
    <div className="detail">
      <div className="detail__header">
        <span className="detail__category">{item.category}</span>
        <h1 className="detail__title">{item.title}</h1>
        <p className="detail__location"><Icon.pin width={14} height={14} /> {item.location} · {item.posted}</p>
      </div>

      <p className="detail__price">{item.price}</p>

      <div className="detail__section">
        <h2>Description</h2>
        <p className="detail__desc">{item.desc}</p>
      </div>

      <div className="detail__contact">
        <div>
          <p className="detail__contact-name">Ramesh Traders</p>
          <p className="detail__contact-meta">Posted by owner · Peenya Industrial Area</p>
        </div>
      </div>

      <button className="detail__cta">
        <Icon.call width={18} height={18} />
        Enquire now
      </button>
    </div>
  )
}

export default ListingDetail
