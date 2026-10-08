import { useParams } from 'react-router-dom'
import { LISTINGS, DOMAINS } from '../data'
import { Icon } from '../icons'
import ListingCard from '../components/ListingCard'

function Browse() {
  const { domainKey } = useParams()
  const domain = DOMAINS.find(d => d.key === domainKey) || DOMAINS[0]
  const items = LISTINGS.filter(l => l.domain === 'marketplace')

  return (
    <div className="browse">
      <h1 className="browse__title">{domain.label}</h1>

      <div className="browse__search">
        <Icon.search width={18} height={18} />
        <input type="search" placeholder={`Search ${domain.label.toLowerCase()}…`} />
      </div>

      <div className="browse__chips">
        {['All', 'Lathe Machines', 'CNC', 'Compressors', 'Sheet Metal'].map((c, i) => (
          <span key={c} className={`chip${i === 0 ? ' chip--active' : ''}`}>{c}</span>
        ))}
      </div>

      <div className="browse__grid">
        {items.map(item => <ListingCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

export default Browse
