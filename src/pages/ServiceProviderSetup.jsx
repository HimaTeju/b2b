import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyServiceCapability, saveServiceCapability } from '../lib/api/serviceCapabilities'
import CapabilityProfileForm from '../components/CapabilityProfileForm'
import './Post.css'

const COPY = {
  intro: 'Tell seekers what repair/service work you do — they can find and contact you directly.',
  titleLabel: 'Business / service title *',
  titlePlaceholder: 'e.g. Precision CNC Repairs Ltd.',
  descriptionLabel: 'About your service',
  descriptionPlaceholder: 'Turnaround time, specialties, certifications…',
  categoryFieldLabel: 'Categories you service *',
  activeLabel: 'Visible to seekers browsing Services',
  savingLabel: 'Saving…'
}

function ServiceProviderSetup() {
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
      const data = await getMyServiceCapability(user.id)
      setExisting(data)
    } catch (err) {
      console.error('Error loading provider profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      await saveServiceCapability({ profileId: user.id, ...data })
      navigate(`/services/providers/${user.id}`)
    } catch (err) {
      console.error('Error saving provider profile:', err)
      setError(err.message || 'Failed to save provider profile')
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
    categoryIds: (existing.service_capability_categories || []).map(c => c.machine_category_id)
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">SV · Services</span>
        <h1 className="post__title">{existing ? 'Edit your provider profile' : 'Become a service provider'}</h1>

        <button className="post__market-link" onClick={() => navigate('/services/requirements')}>
          See what customers need — check requirements &rsaquo;
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

export default ServiceProviderSetup
