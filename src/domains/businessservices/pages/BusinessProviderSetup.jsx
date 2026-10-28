import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getMyBusinessServiceCapability, saveBusinessServiceCapability } from '../api/businessServicesCapabilities'
import BusinessServiceCapabilityForm from '../components/BusinessServiceCapabilityForm'
import '../../../pages/Post.css'

const COPY = {
  intro: 'Tell people what you can help with — they can find and contact you directly.',
  titleLabel: 'Business / practice name *',
  titlePlaceholder: 'e.g. Sharma & Associates, Import-Export Consultants',
  descriptionLabel: 'About your services',
  descriptionPlaceholder: 'Experience, who you help (e.g. beginners starting to import or export), areas you cover…',
  activeLabel: 'Visible to people browsing Business Services',
  savingLabel: 'Saving…'
}

function BusinessProviderSetup() {
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
      const data = await getMyBusinessServiceCapability(user.id)
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
      await saveBusinessServiceCapability({ profileId: user.id, ...data })
      navigate(`/business-services/providers/${user.id}`)
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
    serviceTypes: existing.service_types || []
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">BZ · Business Services</span>
        <h1 className="post__title">{existing ? 'Edit your provider profile' : 'Offer business services'}</h1>

        <button className="post__market-link" onClick={() => navigate('/business-services/requirements')}>
          See what people need — check requirements &rsaquo;
        </button>

        <BusinessServiceCapabilityForm
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

export default BusinessProviderSetup
