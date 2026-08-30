import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings, deleteListing } from '../domains/marketplace/api/listings'
import { getEnquiryCounts } from '../lib/api/enquiries'
import { formatListingPrice } from '../lib/format'
import { INTENT_LABELS, SECTION_LABELS } from '../lib/constants'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [counts, setCounts] = useState({ sent: 0, received: 0, unread: 0 })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [listingsData, countsData] = await Promise.all([
        getMyListings(user.id),
        getEnquiryCounts(user.id)
      ])
      setListings(listingsData || [])
      setCounts(countsData)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (listingId, title) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      const target = listings.find(l => l.id === listingId)
      await deleteListing(listingId, target?.listing_images)
      await loadDashboard()
    } catch (err) {
      console.error('Error deleting listing:', err)
      setDeleteError('Failed to delete listing. Please try again.')
    }
  }

  const activeListingsCount = listings.filter(l => l.status === 'ACTIVE').length

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <span className="eyebrow">MP · Marketplace</span>
        <h1 className="dashboard__title">Your dashboard</h1>

        {error && <div className="banner">{error}</div>}
        {deleteError && <div className="banner">{deleteError}</div>}

        {loading ? (
          <div className="dashboard__loading">Loading…</div>
        ) : (
          <>
            <div className="dashboard__stats">
              <div className="stat-card">
                <div className="stat-card__value mono">{activeListingsCount}</div>
                <div className="stat-card__label">Active listings</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value mono">{counts.received}</div>
                <div className="stat-card__label">Enquiries received</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value mono">{counts.sent}</div>
                <div className="stat-card__label">Enquiries sent</div>
              </div>
              <div className="stat-card stat-card--accent">
                <div className="stat-card__value mono">{counts.unread}</div>
                <div className="stat-card__label">Unread</div>
              </div>
            </div>

            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <h2 className="dashboard__section-title">My listings</h2>
                <button className="btn btn--sm btn--primary" onClick={() => navigate('/marketplace/sell/new')}>
                  + Post new
                </button>
              </div>
              <button className="dashboard__secondary-link" onClick={() => navigate('/marketplace/requirements/new')}>
                Looking to buy instead? Post a requirement &rsaquo;
              </button>

              {listings.length === 0 ? (
                <div className="dashboard__empty">
                  <p>You haven't posted anything yet.</p>
                  <button className="btn btn--primary" onClick={() => navigate('/marketplace/sell/new')}>
                    Create your first listing
                  </button>
                </div>
              ) : (
                <div className="dashboard__listings">
                  {listings.map(listing => (
                    <div key={listing.id} className="listing-row">
                      <div className="listing-row__main" onClick={() => navigate(`/marketplace/${listing.id}`)}>
                        <div className="listing-row__badges">
                          <span className="stamp stamp--ink">{INTENT_LABELS[listing.intent]}</span>
                          <span className={`stamp ${listing.status === 'ACTIVE' ? 'stamp--positive' : 'stamp--muted'}`}>
                            {listing.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="listing-row__title">{listing.title}</h3>
                        <p className="listing-row__meta mono">{listing.machine_categories?.name || SECTION_LABELS[listing.section]} · {formatListingPrice(listing)}</p>
                      </div>
                      <div className="listing-row__actions">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => navigate(`/marketplace/post/edit/${listing.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDelete(listing.id, listing.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard__section">
              <h2 className="dashboard__section-title">Quick actions</h2>
              <div className="dashboard__actions">
                <button className="action-card" onClick={() => navigate('/marketplace/sell/new')}>
                  <span>Post a listing</span>
                </button>
                <button className="action-card" onClick={() => navigate('/enquiries')}>
                  <span>View enquiries</span>
                </button>
                <button className="action-card" onClick={() => navigate('/marketplace')}>
                  <span>Browse marketplace</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
