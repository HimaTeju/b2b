import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobWorkVendors } from '../lib/api/jobworkCapabilities'
import BrowseGrid from '../components/BrowseGrid'
import ProviderCard from '../components/ProviderCard'
import './Browse.css'

function JobWorkVendors() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">JW · Job Work</span>
            <h1 className="browse__title">Find a vendor</h1>
          </div>
        </div>

        <button className="browse__requirements-link" onClick={() => navigate('/job-work/requirements')}>
          Looking for leads? See requirements &rsaquo;
        </button>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getJobWorkVendors({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search job-work vendors…"
        emptyMessage="No vendors match these filters."
        getItemKey={vendor => vendor.profile_id}
        onItemClick={vendor => navigate(`/job-work/vendors/${vendor.profile_id}`)}
        renderItem={vendor => <ProviderCard provider={vendor} />}
        initialSearch={searchParams.get('search') || ''}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Didn't find the right vendor?</p>
        <p className="browse__cta-desc">Post your requirement — vendors will reach out to you directly.</p>
        <button className="btn btn--primary" onClick={() => navigate('/job-work/requirements/new')}>
          Post a requirement
        </button>
      </div>
    </div>
  )
}

export default JobWorkVendors
