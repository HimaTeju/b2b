import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getInvestor } from '../api/investorCapabilities'
import { createEnquiry } from '../../../lib/api/enquiries'
import { formatLocation } from '../../../lib/format'
import { INVESTORS_DISCLAIMER } from '../../../lib/constants'
import EnquiryComposer from '../../../components/EnquiryComposer'
import EntityDetailSkeleton from '../../../pages/EntityDetailSkeleton'
import '../../../pages/EntityDetail.css'

function InvestorDetail() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [investor, setInvestor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  useEffect(() => {
    loadInvestor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const loadInvestor = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getInvestor(profileId)
      setInvestor(data)
    } catch (err) {
      console.error('Error loading investor:', err)
      setError('Failed to load investor')
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
        investorCapabilityProfileId: profileId,
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
    return <EntityDetailSkeleton />
  }

  if (error || !investor) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Investor not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/investors')}>Back to investors</button>
      </div>
    )
  }

  const isOwner = user?.id === investor.profile_id

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--investors">Investor</span>
          <h1 className="entity-detail__title">{investor.title}</h1>
          <p className="entity-detail__location">{formatLocation(investor)}</p>
        </div>

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Sectors of interest</h2>
          <div className="entity-detail__tags">
            {investor.sectors.map(sector => (
              <span key={sector} className="entity-detail__tag">{sector}</span>
            ))}
          </div>
        </div>

        {investor.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">About</h2>
            <p className="entity-detail__description">{investor.description}</p>
          </div>
        )}

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Business</h2>
          <div className="entity-detail__contact">
            <p className="entity-detail__contact-name">{investor.profiles?.company_name || 'Business account'}</p>
            {investor.profiles?.website && (
              <a href={investor.profiles.website} target="_blank" rel="noreferrer">{investor.profiles.website}</a>
            )}
          </div>
        </div>

        <p className="entity-form__intro">{INVESTORS_DISCLAIMER}</p>

        {isOwner ? (
          <div className="entity-detail__owner-actions">
            <button className="btn btn--ghost btn--block" onClick={() => navigate('/investors/profile/setup')}>
              Edit your investor profile
            </button>
          </div>
        ) : (
          <EnquiryComposer
            placeholder="Hi, I have a project that might interest you…"
            ctaLabel="Contact investor"
            sendLabel="Send message"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Message sent — the investor will get in touch."
            error={enquiryError}
          />
        )}
      </div>
    </div>
  )
}

export default InvestorDetail
