import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getMyJobSeekerProfile, saveJobSeekerProfile } from '../api/jobSeekerProfiles'
import JobSeekerProfileForm from '../components/JobSeekerProfileForm'
import '../../../pages/Post.css'

const COPY = {
  intro: 'Build a job seeker profile — employers looking for your trade can find and contact you directly.',
  savingLabel: 'Saving…'
}

function JobSeekerProfileSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadExisting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadExisting = async () => {
    setLoading(true)
    try {
      const data = await getMyJobSeekerProfile(user.id)
      setExisting(data)
    } catch (err) {
      console.error('Error loading job seeker profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      await saveJobSeekerProfile({ profileId: user.id, ...data })
      navigate(`/jobs/seekers/${user.id}`)
    } catch (err) {
      console.error('Error saving job seeker profile:', err)
      setError(err.message || 'Failed to save job seeker profile')
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

  const initialValues = existing ? {
    headline: existing.headline || '',
    about: existing.about || '',
    experience_years: existing.experience_years ?? '',
    resume_url: existing.resume_url || '',
    city: existing.city || '',
    state: existing.state || '',
    is_active: existing.is_active,
    categoryIds: (existing.job_seeker_categories || []).map(c => c.machine_category_id)
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">JC · Jobs &amp; Careers</span>
        <h1 className="post__title">{existing ? 'Edit your job seeker profile' : 'Create your job seeker profile'}</h1>

        <JobSeekerProfileForm
          copy={COPY}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel={existing ? 'Save changes' : 'Create profile'}
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default JobSeekerProfileSetup
