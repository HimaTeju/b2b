import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getPackersMoversRequirements } from '../api/packersMoversRequirements'
import { PACKERS_MOVERS_REQUEST_TYPE_LABELS } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function PackersMoversRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [requestType, setRequestType] = useState('')

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">PM · Packers &amp; Movers</span>
            <h1 className="browse__title">Lifting requirements</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/packers-movers')}>
          &lsaquo; Back to movers
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId, requestType }) => getPackersMoversRequirements({ categoryIds, search, excludeProfileId, requestType })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search lifting requirements…"
        emptyMessage="No requirements match these filters."
        onItemClick={requirement => navigate(`/packers-movers/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
        initialSearch={searchParams.get('search') || ''}
        extraFilters={{ requestType }}
        renderExtraFilter={
          <select
            className="browse-grid__extra-filter"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            aria-label="Filter by request type"
          >
            <option value="">All request types</option>
            {Object.entries(PACKERS_MOVERS_REQUEST_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        }
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find a lead?</p>
        <p className="browse__cta-desc">Set up your vendor profile — requesters will find you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/packers-movers/vendor/setup')}>
          Set up vendor profile
        </button>
      </div>
    </div>
  )
}

export default PackersMoversRequirements
