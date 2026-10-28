import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getBusinessServiceProviders } from '../api/businessServicesCapabilities'
import { BUSINESS_SERVICE_TYPES } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import ProviderCard from '../../../components/ProviderCard'
import '../../../pages/Browse.css'

function BusinessProviders() {
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
            <h1 className="browse__title">Find a service provider</h1>
          </div>
        </div>
      </div>

      <BrowseGrid
        fetchItems={({ search, excludeProfileId, serviceType }) => getBusinessServiceProviders({ search, excludeProfileId, serviceType })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search import-export, audit, tax…"
        emptyMessage="No providers match these filters."
        getItemKey={provider => provider.profile_id}
        onItemClick={provider => navigate(`/business-services/providers/${provider.profile_id}`)}
        renderItem={provider => <ProviderCard provider={provider} />}
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
        <p className="browse__cta-title">Need help with import-export, audit or tax?</p>
        <p className="browse__cta-desc">Post what you need — providers will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/business-services/requirements/new')}>
          Post a requirement
        </button>
      </div>
    </div>
  )
}

export default BusinessProviders
