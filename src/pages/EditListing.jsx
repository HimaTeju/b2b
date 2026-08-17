import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getListing, updateListing } from '../lib/api/listings'
import { useAuth } from '../context/AuthContext'
import ListingForm, { SELL_COPY, REQUIREMENT_COPY } from '../components/ListingForm'
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

  const handleSubmit = async (updates) => {
    setSaving(true)
    setError('')

    try {
      await updateListing(id, updates)
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
  const initialValues = {
    machine_category_id: listing.machine_category_id,
    title: listing.title,
    description: listing.description || '',
    condition: listing.condition || '',
    price: listing.price ?? '',
    quantity: String(listing.quantity ?? 1),
    city: listing.city || '',
    state: listing.state || ''
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">MP · Marketplace</span>
        <h1 className="post__title">{isRequirement ? 'Edit requirement' : 'Edit listing'}</h1>

        <ListingForm
          intent={listing.intent}
          copy={isRequirement ? REQUIREMENT_COPY : SELL_COPY}
          initialValues={initialValues}
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
