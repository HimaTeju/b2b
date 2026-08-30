import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getServiceProvider } from '../lib/api/serviceCapabilities'
import { createEnquiry } from '../lib/api/enquiries'
import { formatLocation } from '../lib/format'
import EnquiryComposer from '../components/EnquiryComposer'
import './EntityDetail.css'

function ServiceProviderDetail() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  useEffect(() => {
    loadProvider()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const loadProvider = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getServiceProvider(profileId)
      setProvider(data)
    } catch (err) {
      console.error('Error loading provider:', err)
      setError('Failed to load provider')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEnquiry = async (message) => {
    setSendingEnquiry(true)
    setEnquiryError('')

    try {
      await createEnquiry({
        fromProfileId: user.id,
        toProfileId: profileId,
        serviceCapabilityProfileId: profileId,
        message
      })
      setEnquirySent(true)
    } catch (err) {
      console.error('Error sending enquiry:', err)
      setEnquiryError('Failed to send enquiry. Please try again.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  if (loading) {
    return <div className="entity-detail__state">Loading…</div>
  }

  if (error || !provider) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Provider not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/services')}>Back to providers</button>
      </div>
    )
  }

  const isOwner = user?.id === provider.profile_id
  const categories = (provider.service_capability_categories || []).map(c => c.machine_categories?.name).filter(Boolean)

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--services">Service Provider</span>
          <h1 className="entity-detail__title">{provider.title}</h1>
          <p className="entity-detail__location">{formatLocation(provider)}</p>
        </div>

        {categories.length > 0 && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">Categories covered</h2>
            <div className="entity-detail__tags">
              {categories.map(name => (
                <span key={name} className="entity-detail__tag">{name}</span>
              ))}
            </div>
          </div>
        )}

        {provider.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">About</h2>
            <p className="entity-detail__description">{provider.description}</p>
          </div>
        )}

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Business</h2>
          <div className="entity-detail__contact">
            <p className="entity-detail__contact-name">{provider.profiles?.company_name || 'Business account'}</p>
            {provider.profiles?.website && (
              <a href={provider.profiles.website} target="_blank" rel="noreferrer">{provider.profiles.website}</a>
            )}
          </div>
        </div>

        {isOwner ? (
          <div className="entity-detail__owner-actions">
            <button className="btn btn--ghost btn--block" onClick={() => navigate('/services/provider/setup')}>
              Edit your provider profile
            </button>
          </div>
        ) : (
          <EnquiryComposer
            placeholder="Hi, I'm interested in your services. Please share more details…"
            ctaLabel="Contact provider"
            sendLabel="Send message"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Message sent — the provider will get in touch."
            error={enquiryError}
          />
        )}
      </div>
    </div>
  )
}

export default ServiceProviderDetail
