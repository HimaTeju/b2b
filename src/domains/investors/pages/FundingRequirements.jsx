import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getFundingRequirements } from '../api/fundingRequirements'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function FundingRequirements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

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
        fetchItems={({ search, excludeProfileId }) => getFundingRequirements({ search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search projects…"
        emptyMessage="No projects match these filters."
        onItemClick={requirement => navigate(`/investors/requirements/${requirement.id}`)}
        renderItem={requirement => <RequirementCard item={requirement} />}
        initialSearch={searchParams.get('search') || ''}
        showCategoryFilter={false}
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
