import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../lib/api/listings'
import { useAuth } from '../context/AuthContext'
import ListingForm, { SELL_COPY } from '../components/ListingForm'
import './Post.css'

function Post() {
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
      console.error('Error creating listing:', err)
      setError(err.message || 'Failed to create listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">MP · Marketplace</span>
        <h1 className="post__title">List something for sale</h1>

        <ListingForm
          intent="SELL"
          copy={SELL_COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post listing"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default Post
