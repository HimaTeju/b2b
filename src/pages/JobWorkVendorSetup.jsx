import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyJobWorkCapability, saveJobWorkCapability } from '../lib/api/jobworkCapabilities'
import CapabilityProfileForm from '../components/CapabilityProfileForm'
import './Post.css'

const COPY = {
  intro: 'Tell businesses what production/manufacturing work you can take on — they can find and contact you directly.',
  titleLabel: 'Business / vendor title *',
  titlePlaceholder: 'e.g. Precision CNC Job Work Ltd.',
  descriptionLabel: 'About your capacity',
  descriptionPlaceholder: 'Machines available, turnaround time, certifications…',
  categoryFieldLabel: 'Categories you produce on *',
  activeLabel: 'Visible to seekers browsing Job Work',
  savingLabel: 'Saving…'
}

function JobWorkVendorSetup() {
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
      const data = await getMyJobWorkCapability(user.id)
      setExisting(data)
    } catch (err) {
      console.error('Error loading vendor profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      await saveJobWorkCapability({ profileId: user.id, ...data })
      navigate(`/job-work/vendors/${user.id}`)
    } catch (err) {
      console.error('Error saving vendor profile:', err)
      setError(err.message || 'Failed to save vendor profile')
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
    title: existing.title,
    description: existing.description || '',
    city: existing.city || '',
    state: existing.state || '',
    is_active: existing.is_active,
    categoryIds: (existing.jobwork_capability_categories || []).map(c => c.machine_category_id)
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">JW · Job Work</span>
        <h1 className="post__title">{existing ? 'Edit your vendor profile' : 'Become a job-work vendor'}</h1>

        <button className="post__market-link" onClick={() => navigate('/job-work/requirements')}>
          See what's in demand — check requirements &rsaquo;
        </button>

        <CapabilityProfileForm
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

export default JobWorkVendorSetup
