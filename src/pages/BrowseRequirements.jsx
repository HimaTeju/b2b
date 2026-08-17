import { useNavigate } from 'react-router-dom'
import MarketplaceGrid from '../components/MarketplaceGrid'
import './Browse.css'

function BrowseRequirements() {
  const navigate = useNavigate()

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

      <MarketplaceGrid intent="REQUIREMENT" />
    </div>
  )
}

export default BrowseRequirements
