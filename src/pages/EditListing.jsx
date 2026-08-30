import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getListing, updateListing } from '../lib/api/listings'
import { uploadListingImages, deleteListingImages } from '../lib/api/listingImages'
import { useAuth } from '../context/AuthContext'
import ListingForm, { SELL_COPY, REQUIREMENT_COPY } from '../components/ListingForm'
import { SECTION_LABELS } from '../lib/constants'
import './Post.css'

function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadListing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadListing = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getListing(id)

      if (data.profile_id !== user.id) {
        setError('You do not have permission to edit this listing')
        return
      }

      setListing(data)
    } catch (err) {
      console.error('Error loading listing:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (updates, images) => {
    setSaving(true)
    setError('')

    try {
      await updateListing(id, updates)

      try {
        const removedImages = (listing.listing_images || [])
          .filter(image => images.removedImageIds.includes(image.id))
        if (removedImages.length) {
          await deleteListingImages(removedImages)
        }
        if (images.newFiles.length) {
          await uploadListingImages(images.newFiles, {
            profileId: user.id,
            listingId: id,
            startOrder: images.keptImageCount,
            makeFirstPrimary: images.keptImageCount === 0
          })
        }
      } catch (imgErr) {
        console.error('Error updating listing images:', imgErr)
        alert('Listing saved, but some photo changes failed. You can retry from the listing page.')
      }

      navigate(`/marketplace/${id}`)
    } catch (err) {
      console.error('Error updating listing:', err)
      setError(err.message || 'Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="post">
        <div className="post__container">Loading…</div>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="post">
        <div className="post__container">
          <div className="banner">{error}</div>
          <button className="btn btn--primary post__back" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const isRequirement = listing.intent === 'REQUIREMENT'
  const section = listing.section || 'MACHINERY'
  const initialValues = {
    machine_category_id: listing.machine_category_id || '',
    title: listing.title,
    description: listing.description || '',
    condition: listing.condition || '',
    price: listing.price ?? '',
    quantity: String(listing.quantity ?? 1),
    city: listing.city || '',
    state: listing.state || '',
    material_type: listing.material_type || '',
    shape: listing.shape || '',
    weight: listing.weight ?? '',
    weight_unit: listing.weight_unit || 'KG'
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">MP · Marketplace</span>
        <h1 className="post__title">{isRequirement ? `Edit ${SECTION_LABELS[section]} requirement` : `Edit ${SECTION_LABELS[section]} listing`}</h1>

        <ListingForm
          section={section}
          intent={listing.intent}
          copy={isRequirement ? REQUIREMENT_COPY : SELL_COPY}
          initialValues={initialValues}
          existingImages={listing.listing_images}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/marketplace/${id}`)}
          submitLabel="Save changes"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default EditListing
