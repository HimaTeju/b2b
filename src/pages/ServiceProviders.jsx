import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getServiceProviders } from '../lib/api/serviceCapabilities'
import BrowseGrid from '../components/BrowseGrid'
import ProviderCard from '../components/ProviderCard'
import './Browse.css'

function ServiceProviders() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">SV · Services</span>
            <h1 className="browse__title">Find a provider</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/services/requirements')}>
          Looking for leads? See requirements &rsaquo;
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getServiceProviders({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search service providers…"
        emptyMessage="No providers match these filters."
        getItemKey={provider => provider.profile_id}
        onItemClick={provider => navigate(`/services/providers/${provider.profile_id}`)}
        renderItem={provider => <ProviderCard provider={provider} />}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find the right provider?</p>
        <p className="browse__cta-desc">Post your requirement — providers will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/services/requirements/new')}>
          Post a requirement
        </button>
      </div>
    </div>
  )
}

export default ServiceProviders
