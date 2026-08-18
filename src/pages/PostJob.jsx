import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJobPost } from '../lib/api/jobPosts'
import { useAuth } from '../context/AuthContext'
import EntityRequirementForm from '../components/EntityRequirementForm'
import './Post.css'

const COPY = {
  intro: 'Post a vacancy — no setup needed, any account can post a job.',
  titleLabel: 'Job title *',
  titlePlaceholder: 'e.g. CNC Machine Operator',
  descriptionLabel: 'Role details',
  descriptionPlaceholder: 'Responsibilities, experience needed, pay, shift…',
  savingLabel: 'Posting…'
}

function PostJob() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const jobPost = await createJobPost({ ...data, profile_id: user.id })
      navigate(`/jobs/${jobPost.id}`)
    } catch (err) {
      console.error('Error posting job:', err)
      setError(err.message || 'Failed to post job')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">JC · Jobs &amp; Careers</span>
        <h1 className="post__title">Post a job</h1>

        <EntityRequirementForm
          categoryRequired={false}
          copy={COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post job"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default PostJob
