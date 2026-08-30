import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../lib/api/listings'
import { uploadListingImages } from '../lib/api/listingImages'
import { useAuth } from '../context/AuthContext'
import ListingForm, { SELL_COPY } from '../components/ListingForm'
import './Post.css'

function Post() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (listingData, images) => {
    setSaving(true)
    setError('')

    try {
      const listing = await createListing({ ...listingData, profile_id: user.id })

      if (images?.newFiles.length) {
        try {
          await uploadListingImages(images.newFiles, {
            profileId: user.id,
            listingId: listing.id,
            makeFirstPrimary: true
          })
        } catch (imgErr) {
          console.error('Error uploading listing images:', imgErr)
          alert('Listing posted, but the photos failed to upload. You can add them from the listing page.')
        }
      }

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

        <button className="post__market-link" onClick={() => navigate('/marketplace/requirements')}>
          Check market demand — see buyer requirements &rsaquo;
        </button>

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
