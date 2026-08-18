import { useNavigate, useSearchParams } from 'react-router-dom'
import MarketplaceGrid from '../components/MarketplaceGrid'
import './Browse.css'

function BrowseRequirements() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">MP · Marketplace</span>
            <h1 className="browse__title">Buyer requirements</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/marketplace')}>
          &lsaquo; Back to for-sale listings
        </button>
      </div>

      <MarketplaceGrid intent="REQUIREMENT" initialSearch={searchParams.get('search') || ''} />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find a matching buyer?</p>
        <p className="browse__cta-desc">List your machine — buyers will see it directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/marketplace/sell/new')}>
          List your machine
        </button>
      </div>
    </div>
  )
}

export default BrowseRequirements
