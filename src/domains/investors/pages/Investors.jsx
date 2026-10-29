import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getInvestors } from '../api/investorCapabilities'
import { INVESTMENT_SECTORS } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import ProviderCard from '../../../components/ProviderCard'
import '../../../pages/Browse.css'

function Investors() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [sector, setSector] = useState('')
  const extraFilters = useMemo(() => ({ sector }), [sector])

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">IN · Investors</span>
            <h1 className="browse__title">Find an investor</h1>
          </div>
        </div>
      </div>

      <BrowseGrid
        fetchItems={({ search, excludeProfileId, sector }) => getInvestors({ search, excludeProfileId, sector })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search investors…"
        emptyMessage="No investors match these filters."
        getItemKey={investor => investor.profile_id}
        onItemClick={investor => navigate(`/investors/profiles/${investor.profile_id}`)}
        renderItem={investor => <ProviderCard provider={investor} />}
        initialSearch={searchParams.get('search') || ''}
        showCategoryFilter={false}
        extraFilters={extraFilters}
        renderExtraFilter={
          <select
            className="browse-grid__extra-filter"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filter by sector"
          >
            <option value="">All sectors</option>
            {INVESTMENT_SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        }
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Looking for funding for a project?</p>
        <p className="browse__cta-desc">Post your project — interested investors will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/investors/requirements/new')}>
          Post a funding request
        </button>
      </div>
    </div>
  )
}

export default Investors
