import { useNavigate, useSearchParams } from 'react-router-dom'
import MarketplaceGrid from '../components/MarketplaceGrid'
import SectionSwitcher from '../components/SectionSwitcher'
import { SECTION_LABELS, SECTION_PATH } from '../../../lib/constants'
import '../../../pages/Browse.css'

function Browse({ section = 'MACHINERY' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requirementsNewPath = `/marketplace${SECTION_PATH[section]}/requirements/new`

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">MP · Marketplace</span>
            <h1 className="browse__title">Browse {SECTION_LABELS[section]}</h1>
          </div>
          <button
            className="browse__quick-post"
            onClick={() => navigate(requirementsNewPath)}
            aria-label="Post a requirement"
            title="Post a requirement"
          >
            +
          </button>
        </div>

        <SectionSwitcher section={section} />
      </div>

      <MarketplaceGrid key={section} section={section} intent="SELL" initialSearch={searchParams.get('search') || ''} />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find what you're looking for?</p>
        <p className="browse__cta-desc">Post your requirement — sellers will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate(requirementsNewPath)}>
          Post your requirement
        </button>
      </div>
    </div>
  )
}

export default Browse
