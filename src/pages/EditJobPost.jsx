import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getJobPost, updateJobPost } from '../lib/api/jobPosts'
import { useAuth } from '../context/AuthContext'
import EntityRequirementForm from '../components/EntityRequirementForm'
import './Post.css'

const COPY = {
  titleLabel: 'Job title *',
  titlePlaceholder: 'e.g. CNC Machine Operator',
  descriptionLabel: 'Role details',
  descriptionPlaceholder: 'Responsibilities, experience needed, pay, shift…',
  savingLabel: 'Saving…'
}

function EditJobPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobPost, setJobPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadJobPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadJobPost = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobPost(id)

      if (data.profile_id !== user.id) {
        setError('You do not have permission to edit this job post')
        return
      }

      setJobPost(data)
    } catch (err) {
      console.error('Error loading job post:', err)
      setError('Failed to load job post')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (updates) => {
    setSaving(true)
    setError('')

    try {
      await updateJobPost(id, updates)
      navigate(`/jobs/${id}`)
    } catch (err) {
      console.error('Error updating job post:', err)
      setError(err.message || 'Failed to update job post')
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

  if (error && !jobPost) {
    return (
      <div className="post">
        <div className="post__container">
          <div className="banner">{error}</div>
          <button className="btn btn--primary post__back" onClick={() => navigate('/jobs')}>
            Back to job posts
          </button>
        </div>
      </div>
    )
  }

  const initialValues = {
    machine_category_id: jobPost.machine_category_id || '',
    title: jobPost.title,
    description: jobPost.description || '',
    city: jobPost.city || '',
    state: jobPost.state || ''
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">JC · Jobs &amp; Careers</span>
        <h1 className="post__title">Edit job post</h1>

        <EntityRequirementForm
          categoryRequired={false}
          copy={COPY}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/jobs/${id}`)}
          submitLabel="Save changes"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default EditJobPost
