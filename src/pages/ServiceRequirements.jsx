import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getServiceRequirements } from '../lib/api/serviceRequirements'
import BrowseGrid from '../components/BrowseGrid'
import RequirementCard from '../components/RequirementCard'
import './Browse.css'

function ServiceRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()

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
      />
    </div>
  )
}

export default ServiceRequirements
