import { useNavigate, useSearchParams } from 'react-router-dom'
import MarketplaceGrid from '../components/MarketplaceGrid'
import './Browse.css'

function Browse() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">MP · Marketplace</span>
            <h1 className="browse__title">Browse listings</h1>
          </div>
          <button
            className="browse__quick-post"
            onClick={() => navigate('/marketplace/requirements/new')}
            aria-label="Post a requirement"
            title="Post a requirement"
          >
            +
          </button>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/marketplace/requirements')}>
          Looking for a buyer? See requirements &rsaquo;
        </button>
      </div>

      <MarketplaceGrid intent="SELL" initialSearch={searchParams.get('search') || ''} />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find what you're looking for?</p>
        <p className="browse__cta-desc">Post your requirement — sellers will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/marketplace/requirements/new')}>
          Post your requirement
        </button>
      </div>
    </div>
  )
}

export default Browse
