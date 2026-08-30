import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../lib/api/listings'
import { uploadListingImages } from '../lib/api/listingImages'
import { useAuth } from '../context/AuthContext'
import ListingForm, { SELL_COPY } from '../components/ListingForm'
import { SECTION_LABELS, SECTION_PATH } from '../lib/constants'
import './Post.css'

function Post({ section = 'MACHINERY' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Clear stale state from a previous section when navigating between
  // /marketplace/sell/new, /marketplace/tools-accessories/sell/new, /marketplace/scrap/sell/new
  // client-side, since React reuses this component instance across those routes.
  useEffect(() => {
    setError('')
    setSaving(false)
  }, [section])

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
        <h1 className="post__title">List {SECTION_LABELS[section]} for sale</h1>

        <button className="post__market-link" onClick={() => navigate(`/marketplace${SECTION_PATH[section]}/requirements`)}>
          Check market demand — see buyer requirements &rsaquo;
        </button>

        <ListingForm
          key={section}
          section={section}
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
