import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createServiceRequirement } from '../api/serviceRequirements'
import { useAuth } from '../../../context/AuthContext'
import EntityRequirementForm from '../../../components/EntityRequirementForm'
import '../../../pages/Post.css'

const COPY = {
  intro: "Tell providers what you need fixed — they'll reach out with an offer.",
  titleLabel: 'What needs repair? *',
  titlePlaceholder: 'e.g. CNC spindle motor repair',
  descriptionLabel: 'More details',
  descriptionPlaceholder: 'Symptoms, machine model, urgency…',
  savingLabel: 'Posting…'
}

function PostServiceRequirement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const requirement = await createServiceRequirement({ ...data, profile_id: user.id })
      navigate(`/services/requirements/${requirement.id}`)
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
        <span className="eyebrow">SV · Services</span>
        <h1 className="post__title">Post a repair requirement</h1>

        <EntityRequirementForm
          copy={COPY}
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

export default PostServiceRequirement
