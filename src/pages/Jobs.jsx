import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobPosts } from '../lib/api/jobPosts'
import BrowseGrid from '../components/BrowseGrid'
import RequirementCard from '../components/RequirementCard'
import './Browse.css'

function Jobs() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">JC · Jobs &amp; Careers</span>
            <h1 className="browse__title">Browse job posts</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/jobs/seekers')}>
          Hiring? Browse job seekers &rsaquo;
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getJobPosts({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search job posts…"
        emptyMessage="No job posts match these filters."
        onItemClick={jobPost => navigate(`/jobs/${jobPost.id}`)}
        renderItem={jobPost => <RequirementCard item={jobPost} />}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Looking to hire?</p>
        <p className="browse__cta-desc">Post a vacancy — no setup needed, anyone can post a job.</p>
        <button className="btn btn--primary" onClick={() => navigate('/jobs/new')}>
          Post a job
        </button>
      </div>
    </div>
  )
}

export default Jobs
