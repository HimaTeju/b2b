import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobWorkRequirements } from '../lib/api/jobworkRequirements'
import BrowseGrid from '../components/BrowseGrid'
import RequirementCard from '../components/RequirementCard'
import './Browse.css'

function JobWorkRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">JW · Job Work</span>
            <h1 className="browse__title">Job work requirements</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/job-work')}>
          &lsaquo; Back to vendors
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getJobWorkRequirements({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search job work requirements…"
        emptyMessage="No requirements match these filters."
        onItemClick={requirement => navigate(`/job-work/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
      />
    </div>
  )
}

export default JobWorkRequirements
