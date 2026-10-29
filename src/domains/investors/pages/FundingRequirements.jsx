import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getFundingRequirements } from '../api/fundingRequirements'
import { INVESTMENT_SECTORS, PROJECT_STAGES } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function FundingRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [sector, setSector] = useState('')
  const [stage, setStage] = useState('')
  const extraFilters = useMemo(() => ({ sector, stage }), [sector, stage])

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">IN · Investors</span>
            <h1 className="browse__title">Projects seeking funding</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/investors')}>
          &lsaquo; Back to investors
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ search, excludeProfileId, sector, stage }) => getFundingRequirements({ search, excludeProfileId, sector, stage })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search projects…"
        emptyMessage="No projects match these filters."
        onItemClick={requirement => navigate(`/investors/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
        initialSearch={searchParams.get('search') || ''}
        showCategoryFilter={false}
        extraFilters={extraFilters}
        renderExtraFilter={
          <div className="field__row">
            <select
              className="browse-grid__extra-filter"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              aria-label="Filter by sector"
            >
              <option value="">All sectors</option>
              {INVESTMENT_SECTORS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className="browse-grid__extra-filter"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              aria-label="Filter by project stage"
            >
              <option value="">All stages</option>
              {PROJECT_STAGES.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Looking to invest?</p>
        <p className="browse__cta-desc">Set up your investor profile — project owners will find you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/investors/profile/setup')}>
          Set up investor profile
        </button>
      </div>
    </div>
  )
}

export default FundingRequirements
