import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJobWorkRequirement } from '../lib/api/jobworkRequirements'
import { useAuth } from '../context/AuthContext'
import EntityRequirementForm from '../components/EntityRequirementForm'
import './Post.css'

const COPY = {
  intro: "Tell vendors what you need produced — they'll reach out with an offer.",
  titleLabel: 'What needs to be produced? *',
  titlePlaceholder: 'e.g. 5,000 CNC-machined brackets',
  descriptionLabel: 'More details',
  descriptionPlaceholder: 'Specs, quantity, timeline…',
  savingLabel: 'Posting…'
}

function PostJobWorkRequirement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const requirement = await createJobWorkRequirement({ ...data, profile_id: user.id })
      navigate(`/job-work/requirements/${requirement.id}`)
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
        <span className="eyebrow">JW · Job Work</span>
        <h1 className="post__title">Post a job-work requirement</h1>

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

export default PostJobWorkRequirement
