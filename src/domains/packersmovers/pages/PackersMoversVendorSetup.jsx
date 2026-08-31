import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getMyPackersMoversCapability, savePackersMoversCapability } from '../api/packersMoversCapabilities'
import CapabilityProfileForm from '../../../components/CapabilityProfileForm'
import '../../../pages/Post.css'

const COPY = {
  intro: 'Tell requesters what you can lift and move — they can find and contact you directly.',
  titleLabel: 'Business / mover title *',
  titlePlaceholder: 'e.g. Sri Balaji Packers & Movers',
  descriptionLabel: 'About your service',
  descriptionPlaceholder: 'Equipment, crew size, service area…',
  categoryFieldLabel: 'Machines you can lift *',
  activeLabel: 'Visible to requesters browsing Packers & Movers',
  savingLabel: 'Saving…'
}

function PackersMoversVendorSetup() {
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
      const data = await getMyPackersMoversCapability(user.id)
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
      await savePackersMoversCapability({ profileId: user.id, ...data })
      navigate(`/packers-movers/vendors/${user.id}`)
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
    categoryIds: (existing.packers_movers_capability_categories || []).map(c => c.machine_category_id)
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">PM · Packers &amp; Movers</span>
        <h1 className="post__title">{existing ? 'Edit your vendor profile' : 'Become a mover'}</h1>

        <button className="post__market-link" onClick={() => navigate('/packers-movers/requirements')}>
          See what people need moved — check requirements &rsaquo;
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

export default PackersMoversVendorSetup
