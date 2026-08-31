import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getListing, deleteListing } from '../api/listings'
import { createEnquiry } from '../../../lib/api/enquiries'
import { getOrderedImages } from '../api/listingImages'
import { formatListingPrice, formatLocation } from '../../../lib/format'
import { INTENT_LABELS, CONDITION_LABELS, SECTION_LABELS, WEIGHT_UNIT_LABELS } from '../../../lib/constants'
import EnquiryComposer from '../../../components/EnquiryComposer'
import ListingGallery from '../components/ListingGallery'
import './ListingDetail.css'

function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [notice] = useState(location.state?.notice || '')

  useEffect(() => {
    loadListing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadListing = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getListing(id)
      setListing(data)
    } catch (err) {
      console.error('Error loading listing:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEnquiry = async (message) => {
    setSendingEnquiry(true)
    setEnquiryError('')

    try {
      await createEnquiry({
        fromProfileId: user.id,
        toProfileId: listing.profile_id,
        marketplaceListingId: id,
        message
      })
      setEnquirySent(true)
    } catch (err) {
      console.error('Error sending enquiry:', err)
      setEnquiryError('Failed to send enquiry. Please try again.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${listing.title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      await deleteListing(id, listing.listing_images)
      navigate('/dashboard')
    } catch (err) {
      console.error('Error deleting listing:', err)
      setDeleteError('Failed to delete listing. Please try again.')
    }
  }

  if (loading) {
    return <div className="listing-detail__state">Loading…</div>
  }

  if (error || !listing) {
    return (
      <div className="listing-detail__state">
        <p className="banner">{error || 'Listing not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
      </div>
    )
  }

  const isOwner = user?.id === listing.profile_id
  const isRequirement = listing.intent === 'REQUIREMENT'
  const images = getOrderedImages(listing.listing_images)

  return (
    <div className="listing-detail">
      <div className="listing-detail__layout">
        <div className="listing-detail__gallery">
          <ListingGallery images={images} alt={listing.title} />
        </div>

        <div className="listing-detail__content">
          {notice && <div className="banner">{notice}</div>}

          <div className="listing-detail__header">
            <span className="stamp stamp--solid stamp--ink">{INTENT_LABELS[listing.intent]}</span>
            {listing.condition && <span className="stamp stamp--muted">{CONDITION_LABELS[listing.condition]}</span>}

            {(listing.machine_categories?.name || listing.section) && (
              <span className="listing-detail__category mono">
                {listing.machine_categories?.name || SECTION_LABELS[listing.section]}
              </span>
            )}
            <h1 className="listing-detail__title">{listing.title}</h1>
            <p className="listing-detail__location">{formatLocation(listing)}</p>
            <p className="listing-detail__price mono">{formatListingPrice(listing)}</p>
          </div>

          {listing.description && (
            <div className="listing-detail__section">
              <h2 className="listing-detail__section-title">Description</h2>
              <p className="listing-detail__description">{listing.description}</p>
            </div>
          )}

          <div className="listing-detail__section">
            <h2 className="listing-detail__section-title">Details</h2>
            <dl className="listing-detail__specs">
              {listing.section === 'SCRAP' && listing.material_type && (
                <div className="listing-detail__spec">
                  <dt>Material</dt>
                  <dd className="mono">{listing.material_type}</dd>
                </div>
              )}
              {listing.section === 'SCRAP' && listing.shape && (
                <div className="listing-detail__spec">
                  <dt>Shape</dt>
                  <dd className="mono">{listing.shape}</dd>
                </div>
              )}
              {listing.section === 'SCRAP' && listing.weight != null && (
                <div className="listing-detail__spec">
                  <dt>Weight</dt>
                  <dd className="mono">{listing.weight} {WEIGHT_UNIT_LABELS[listing.weight_unit]}</dd>
                </div>
              )}
              <div className="listing-detail__spec">
                <dt>{isRequirement ? 'Quantity needed' : 'Quantity'}</dt>
                <dd className="mono">{listing.quantity}</dd>
              </div>
              <div className="listing-detail__spec">
                <dt>Posted</dt>
                <dd className="mono">{new Date(listing.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div className="listing-detail__section">
            <h2 className="listing-detail__section-title">{isRequirement ? 'Posted by' : 'Sold by'}</h2>
            <div className="listing-detail__seller">
              <p className="listing-detail__seller-name">{listing.profiles?.company_name || 'Business account'}</p>
              <p className="listing-detail__seller-meta">{formatLocation(listing.profiles || {})}</p>
              {listing.profiles?.website && (
                <a href={listing.profiles.website} target="_blank" rel="noreferrer">{listing.profiles.website}</a>
              )}
            </div>
          </div>

          {!isOwner && (
            <EnquiryComposer
              placeholder={isRequirement
                ? 'Hi, I have this available. Here\'s what I can offer…'
                : 'Hi, I\'m interested in this listing. Please share more details…'}
              ctaLabel={isRequirement ? 'I can help' : 'Send enquiry'}
              sendLabel={isRequirement ? 'Send offer' : 'Send enquiry'}
              onSubmit={handleSendEnquiry}
              sending={sendingEnquiry}
              sent={enquirySent}
              sentMessage={isRequirement ? 'Response sent — the buyer will get in touch.' : 'Enquiry sent — the seller will get in touch.'}
              error={enquiryError}
            />
          )}

          {isOwner && (
            <div className="listing-detail__owner-actions">
              {deleteError && <div className="banner">{deleteError}</div>}
              <button className="btn btn--ghost btn--block" onClick={() => navigate(`/marketplace/post/edit/${id}`)}>
                {isRequirement ? 'Edit requirement' : 'Edit listing'}
              </button>
              <button className="btn btn--danger btn--block" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListingDetail
