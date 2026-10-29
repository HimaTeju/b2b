import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getMyInvestorCapability, saveInvestorCapability } from '../api/investorCapabilities'
import InvestorCapabilityForm from '../components/InvestorCapabilityForm'
import '../../../pages/Post.css'

const COPY = {
  intro: 'Tell project owners what you invest in — they can find and contact you directly.',
  titleLabel: 'Investor / firm name *',
  titlePlaceholder: 'e.g. Coastal Ventures',
  descriptionLabel: 'About your investing',
  descriptionPlaceholder: 'Ticket sizes, stages you prefer, what you look for in a project…',
  activeLabel: 'Visible to project owners browsing Investors',
  savingLabel: 'Saving…'
}

function InvestorSetup() {
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
      const data = await getMyInvestorCapability(user.id)
      setExisting(data)
    } catch (err) {
      console.error('Error loading investor profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      await saveInvestorCapability({ profileId: user.id, ...data })
      navigate(`/investors/profiles/${user.id}`)
    } catch (err) {
      console.error('Error saving investor profile:', err)
      setError(err.message || 'Failed to save investor profile')
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
    sectors: existing.sectors || []
  } : undefined

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">IN · Investors</span>
        <h1 className="post__title">{existing ? 'Edit your investor profile' : 'Become an investor'}</h1>

        <button className="post__market-link" onClick={() => navigate('/investors/requirements')}>
          See projects seeking funding &rsaquo;
        </button>

        <InvestorCapabilityForm
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

export default InvestorSetup
