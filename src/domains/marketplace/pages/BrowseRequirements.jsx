import { useNavigate, useSearchParams } from 'react-router-dom'
import MarketplaceGrid from '../components/MarketplaceGrid'
import SectionSwitcher from '../components/SectionSwitcher'
import { SECTION_LABELS, SECTION_PATH } from '../../../lib/constants'
import '../../../pages/Browse.css'

function BrowseRequirements({ section = 'MACHINERY' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sectionBase = `/marketplace${SECTION_PATH[section]}`

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">MP · Marketplace</span>
            <h1 className="browse__title">{SECTION_LABELS[section]} requirements</h1>
          </div>
        </div>

        <SectionSwitcher section={section} suffix="/requirements" />

        <button className="browse__requirements-link" onClick={() => navigate(sectionBase)}>
          &lsaquo; Back to for-sale listings
        </button>
      </div>

      <MarketplaceGrid key={section} section={section} intent="REQUIREMENT" initialSearch={searchParams.get('search') || ''} />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find a matching buyer?</p>
        <p className="browse__cta-desc">List your item — buyers will see it directly.</p>
        <button className="btn btn--primary" onClick={() => navigate(`${sectionBase}/sell/new`)}>
          List your item
        </button>
      </div>
    </div>
  )
}

export default BrowseRequirements
