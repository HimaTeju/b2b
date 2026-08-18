import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobWorkVendor } from '../lib/api/jobworkCapabilities'
import { createEnquiry } from '../lib/api/enquiries'
import { formatLocation } from '../lib/format'
import EnquiryComposer from '../components/EnquiryComposer'
import './EntityDetail.css'

function JobWorkVendorDetail() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)

  useEffect(() => {
    loadVendor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const loadVendor = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobWorkVendor(profileId)
      setVendor(data)
    } catch (err) {
      console.error('Error loading vendor:', err)
      setError('Failed to load vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEnquiry = async (message) => {
    setSendingEnquiry(true)

    try {
      await createEnquiry({
        fromProfileId: user.id,
        toProfileId: profileId,
        jobworkCapabilityProfileId: profileId,
        message
      })
      setEnquirySent(true)
    } catch (err) {
      console.error('Error sending enquiry:', err)
      alert('Failed to send enquiry. Please try again.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  if (loading) {
    return <div className="entity-detail__state">Loading…</div>
  }

  if (error || !vendor) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Vendor not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/job-work')}>Back to vendors</button>
      </div>
    )
  }

  const isOwner = user?.id === vendor.profile_id
  const categories = (vendor.jobwork_capability_categories || []).map(c => c.machine_categories?.name).filter(Boolean)

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--jobwork">Job Work Vendor</span>
          <h1 className="entity-detail__title">{vendor.title}</h1>
          <p className="entity-detail__location">{formatLocation(vendor)}</p>
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

        {vendor.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">About</h2>
            <p className="entity-detail__description">{vendor.description}</p>
          </div>
        )}

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Business</h2>
          <div className="entity-detail__contact">
            <p className="entity-detail__contact-name">{vendor.profiles?.company_name || 'Business account'}</p>
            {vendor.profiles?.website && (
              <a href={vendor.profiles.website} target="_blank" rel="noreferrer">{vendor.profiles.website}</a>
            )}
          </div>
        </div>

        {isOwner ? (
          <div className="entity-detail__owner-actions">
            <button className="btn btn--ghost btn--block" onClick={() => navigate('/job-work/vendor/setup')}>
              Edit your vendor profile
            </button>
          </div>
        ) : (
          <EnquiryComposer
            placeholder="Hi, I'm interested in your job-work capacity. Please share more details…"
            ctaLabel="Contact vendor"
            sendLabel="Send message"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Message sent — the vendor will get in touch."
          />
        )}
      </div>
    </div>
  )
}

export default JobWorkVendorDetail
