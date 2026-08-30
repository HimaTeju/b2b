import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getJobSeeker } from '../api/jobSeekerProfiles'
import { createEnquiry } from '../../../lib/api/enquiries'
import { formatLocation } from '../../../lib/format'
import EnquiryComposer from '../../../components/EnquiryComposer'
import '../../../pages/EntityDetail.css'

function JobSeekerDetail() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [seeker, setSeeker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  useEffect(() => {
    loadSeeker()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  const loadSeeker = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobSeeker(profileId)
      setSeeker(data)
    } catch (err) {
      console.error('Error loading job seeker:', err)
      setError('Failed to load job seeker')
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
        jobSeekerProfileId: profileId,
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

  if (error || !seeker) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Job seeker not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/jobs/seekers')}>Back to job seekers</button>
      </div>
    )
  }

  const isOwner = user?.id === seeker.profile_id
  const categories = (seeker.job_seeker_categories || []).map(c => c.machine_categories?.name).filter(Boolean)

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--jobs">Job Seeker</span>
          <h1 className="entity-detail__title">{seeker.headline}</h1>
          <p className="entity-detail__location">
            {formatLocation(seeker)}
            {seeker.experience_years > 0 && ` · ${seeker.experience_years} yr${seeker.experience_years === 1 ? '' : 's'} experience`}
          </p>
        </div>

        {categories.length > 0 && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">Skills / categories</h2>
            <div className="entity-detail__tags">
              {categories.map(name => (
                <span key={name} className="entity-detail__tag">{name}</span>
              ))}
            </div>
          </div>
        )}

        {seeker.about && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">About</h2>
            <p className="entity-detail__description">{seeker.about}</p>
          </div>
        )}

        {seeker.resume_url && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">Resume</h2>
            <a href={seeker.resume_url} target="_blank" rel="noreferrer">{seeker.resume_url}</a>
          </div>
        )}

        {isOwner ? (
          <div className="entity-detail__owner-actions">
            <button className="btn btn--ghost btn--block" onClick={() => navigate('/jobs/seeker/setup')}>
              Edit your job seeker profile
            </button>
          </div>
        ) : (
          <EnquiryComposer
            placeholder="Hi, we have a role that might suit you. Here are the details…"
            ctaLabel="Contact candidate"
            sendLabel="Send message"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Message sent — the candidate will get in touch."
            error={enquiryError}
          />
        )}
      </div>
    </div>
  )
}

export default JobSeekerDetail
