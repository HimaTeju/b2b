import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../lib/api/listings'
import { useAuth } from '../context/AuthContext'
import ListingForm, { REQUIREMENT_COPY } from '../components/ListingForm'
import './Post.css'

function PostRequirement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (listingData) => {
    setSaving(true)
    setError('')

    try {
      const listing = await createListing({ ...listingData, profile_id: user.id })
      navigate(`/marketplace/${listing.id}`)
    } catch (err) {
      console.error('Error posting requirement:', err)
      setError(err.message || 'Failed to post requirement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">MP · Marketplace</span>
        <h1 className="post__title">Post a requirement</h1>

        <ListingForm
          intent="REQUIREMENT"
          copy={REQUIREMENT_COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post requirement"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default PostRequirement
