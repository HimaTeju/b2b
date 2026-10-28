import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getBusinessServiceRequirements } from '../api/businessServicesRequirements'
import { BUSINESS_SERVICE_TYPES } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function BusinessRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [serviceType, setServiceType] = useState('')
  const extraFilters = useMemo(() => ({ serviceType }), [serviceType])

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">BZ · Business Services</span>
            <h1 className="browse__title">Service requirements</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/business-services')}>
          &lsaquo; Back to providers
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ search, excludeProfileId, serviceType }) => getBusinessServiceRequirements({ search, excludeProfileId, serviceType })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search service requirements…"
        emptyMessage="No requirements match these filters."
        onItemClick={requirement => navigate(`/business-services/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
        initialSearch={searchParams.get('search') || ''}
        showCategoryFilter={false}
        extraFilters={extraFilters}
        renderExtraFilter={
          <select
            className="browse-grid__extra-filter"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            aria-label="Filter by service"
          >
            <option value="">All services</option>
            {BUSINESS_SERVICE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        }
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Can you help with these?</p>
        <p className="browse__cta-desc">Set up your provider profile — people will find you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/business-services/provider/setup')}>
          Set up provider profile
        </button>
      </div>
    </div>
  )
}

export default BusinessRequirements
