import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobSeekers } from '../lib/api/jobSeekerProfiles'
import BrowseGrid from '../components/BrowseGrid'
import SeekerCard from '../components/SeekerCard'
import './Browse.css'

function JobSeekers() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">JC · Jobs &amp; Careers</span>
            <h1 className="browse__title">Browse job seekers</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/jobs')}>
          &lsaquo; Back to job posts
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getJobSeekers({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search job seekers…"
        emptyMessage="No job seekers match these filters."
        getItemKey={seeker => seeker.profile_id}
        onItemClick={seeker => navigate(`/jobs/seekers/${seeker.profile_id}`)}
        renderItem={seeker => <SeekerCard seeker={seeker} />}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Looking for work?</p>
        <p className="browse__cta-desc">Build a job seeker profile — employers in your trade can find and contact you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/jobs/seeker/setup')}>
          Create job seeker profile
        </button>
      </div>
    </div>
  )
}

export default JobSeekers
