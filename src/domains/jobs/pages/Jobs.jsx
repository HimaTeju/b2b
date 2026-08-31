import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getJobPosts } from '../api/jobPosts'
import { JOB_CATEGORIES } from '../../../lib/constants'
import BrowseGrid from '../../../components/BrowseGrid'
import RequirementCard from '../../../components/RequirementCard'
import '../../../pages/Browse.css'

function Jobs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [jobCategory, setJobCategory] = useState('')

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">JC · Jobs &amp; Careers</span>
            <h1 className="browse__title">Browse job posts</h1>
          </div>
        </div>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId, jobCategory }) => getJobPosts({ categoryIds, search, excludeProfileId, jobCategory })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search job posts…"
        emptyMessage="No job posts match these filters."
        onItemClick={jobPost => navigate(`/jobs/${jobPost.id}`)}
        renderItem={jobPost => <RequirementCard item={jobPost} />}
        initialSearch={searchParams.get('search') || ''}
        extraFilters={{ jobCategory }}
        renderExtraFilter={
          <select
            className="browse-grid__extra-filter"
            value={jobCategory}
            onChange={(e) => setJobCategory(e.target.value)}
            aria-label="Filter by role type"
          >
            <option value="">All role types</option>
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        }
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
