import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getPackersMoversVendors } from '../api/packersMoversCapabilities'
import BrowseGrid from '../../../components/BrowseGrid'
import ProviderCard from '../../../components/ProviderCard'
import '../../../pages/Browse.css'

function PackersMoversVendors() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__title-row">
          <div>
            <span className="eyebrow">PM · Packers &amp; Movers</span>
            <h1 className="browse__title">Find a mover</h1>
          </div>
        </div>
      </div>

      <BrowseGrid
        fetchItems={({ categoryIds, search, excludeProfileId }) => getPackersMoversVendors({ categoryIds, search, excludeProfileId })}
        excludeProfileId={user?.id}
        searchPlaceholder="Search packers & movers…"
        emptyMessage="No movers match these filters."
        getItemKey={vendor => vendor.profile_id}
        onItemClick={vendor => navigate(`/packers-movers/vendors/${vendor.profile_id}`)}
        renderItem={vendor => <ProviderCard provider={vendor} />}
        initialSearch={searchParams.get('search') || ''}
      />

      <div className="browse__cta">
        <p className="browse__cta-title">Need something moved?</p>
        <p className="browse__cta-desc">Post what needs lifting — movers will reach out to you directly.</p>
        <div className="browse__cta-actions">
          <button className="btn btn--primary" onClick={() => navigate('/packers-movers/requirements/machine-lifting/new')}>
            Request machine lifting
          </button>
          <button className="btn btn--ghost" onClick={() => navigate('/packers-movers/requirements/shop-lifting/new')}>
            Request shop lifting
          </button>
        </div>
      </div>
    </div>
  )
}

export default PackersMoversVendors
