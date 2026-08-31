import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJobPost } from '../api/jobPosts'
import { useAuth } from '../../../context/AuthContext'
import { JOB_CATEGORIES } from '../../../lib/constants'
import EntityRequirementForm from '../../../components/EntityRequirementForm'
import '../../../pages/Post.css'

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
  const [jobCategory, setJobCategory] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const jobPost = await createJobPost({ ...data, job_category: jobCategory || null, profile_id: user.id })
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

        <button className="post__market-link" onClick={() => navigate('/jobs/seekers')}>
          Check if a candidate is already listed — browse job seekers &rsaquo;
        </button>

        <EntityRequirementForm
          categoryRequired={false}
          copy={COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post job"
          saving={saving}
          error={error}
          extraFields={
            <div className="field">
              <label className="field__label" htmlFor="jobCategory">Role type</label>
              <select id="jobCategory" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)}>
                <option value="">Select a role type (optional)</option>
                {JOB_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          }
        />
      </div>
    </div>
  )
}

export default PostJob
