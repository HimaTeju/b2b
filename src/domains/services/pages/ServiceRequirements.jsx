import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getServiceRequirements } from '../api/serviceRequirements'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function ServiceRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">SV · Services</span>
            <h1 className="browse__title">Repair requirements</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/services')}>
          &lsaquo; Back to providers
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getServiceRequirements({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search repair requirements…"
        emptyMessage="No requirements match these filters."
        onItemClick={requirement => navigate(`/services/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
        initialSearch={searchParams.get('search') || ''}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find a lead?</p>
        <p className="browse__cta-desc">Set up your provider profile — customers will find you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/services/provider/setup')}>
          Set up provider profile
        </button>
      </div>
    </div>
  )
}

export default ServiceRequirements
