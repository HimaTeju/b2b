import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBusinessServiceRequirement } from '../api/businessServicesRequirements'
import { useAuth } from '../../../context/AuthContext'
import BusinessServiceRequirementForm, { REQUIREMENT_COPY } from '../components/BusinessServiceRequirementForm'
import '../../../pages/Post.css'

function PostBusinessRequirement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const requirement = await createBusinessServiceRequirement({ ...data, profile_id: user.id })
      navigate(`/business-services/requirements/${requirement.id}`)
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
        <span className="eyebrow">BZ · Business Services</span>
        <h1 className="post__title">Post a service requirement</h1>

        <BusinessServiceRequirementForm
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

export default PostBusinessRequirement
