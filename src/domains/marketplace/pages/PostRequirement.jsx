import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../api/listings'
import { uploadListingImages } from '../api/listingImages'
import { useAuth } from '../../../context/AuthContext'
import ListingForm, { REQUIREMENT_COPY } from '../components/ListingForm'
import { SECTION_LABELS } from '../../../lib/constants'
import '../../../pages/Post.css'

function PostRequirement({ section = 'MACHINERY' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    setSaving(false)
  }, [section])

  const handleSubmit = async (listingData, images) => {
    setSaving(true)
    setError('')

    try {
      const listing = await createListing({ ...listingData, profile_id: user.id })
      let notice

      if (images?.newFiles.length) {
        try {
          await uploadListingImages(images.newFiles, {
            profileId: user.id,
            listingId: listing.id,
            makeFirstPrimary: true
          })
        } catch (imgErr) {
          console.error('Error uploading listing images:', imgErr)
          notice = 'Requirement posted, but the photos failed to upload. You can add them from the listing page.'
        }
      }

      navigate(`/marketplace/${listing.id}`, { state: { notice } })
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
        <h1 className="post__title">Post a {SECTION_LABELS[section]} requirement</h1>

        <ListingForm
          key={section}
          section={section}
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
