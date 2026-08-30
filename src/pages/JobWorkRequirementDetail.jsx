import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobWorkRequirement, deleteJobWorkRequirement } from '../lib/api/jobworkRequirements'
import { createEnquiry } from '../lib/api/enquiries'
import { formatLocation } from '../lib/format'
import EnquiryComposer from '../components/EnquiryComposer'
import './EntityDetail.css'

function JobWorkRequirementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requirement, setRequirement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadRequirement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadRequirement = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobWorkRequirement(id)
      setRequirement(data)
    } catch (err) {
      console.error('Error loading requirement:', err)
      setError('Failed to load requirement')
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
        toProfileId: requirement.profile_id,
        jobworkRequirementId: id,
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

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${requirement.title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      await deleteJobWorkRequirement(id)
      navigate('/job-work/requirements')
    } catch (err) {
      console.error('Error deleting requirement:', err)
      setDeleteError('Failed to delete requirement. Please try again.')
    }
  }

  if (loading) {
    return <div className="entity-detail__state">Loading…</div>
  }

  if (error || !requirement) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Requirement not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/job-work/requirements')}>Back to requirements</button>
      </div>
    )
  }

  const isOwner = user?.id === requirement.profile_id

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--jobwork">Job Work Requirement</span>
          {requirement.machine_categories?.name && (
            <span className="entity-detail__category mono">{requirement.machine_categories.name}</span>
          )}
          <h1 className="entity-detail__title">{requirement.title}</h1>
          <p className="entity-detail__location">{formatLocation(requirement)}</p>
        </div>

        {requirement.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">Description</h2>
            <p className="entity-detail__description">{requirement.description}</p>
          </div>
        )}

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Posted by</h2>
          <div className="entity-detail__contact">
            <p className="entity-detail__contact-name">{requirement.profiles?.company_name || 'Business account'}</p>
            <p className="entity-detail__contact-meta">{formatLocation(requirement.profiles || {})}</p>
          </div>
        </div>

        {!isOwner && (
          <EnquiryComposer
            placeholder="Hi, I can take this on. Here's what I'd suggest…"
            ctaLabel="I can help"
            sendLabel="Send offer"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Response sent — they'll get in touch."
            error={enquiryError}
          />
        )}

        {isOwner && (
          <div className="entity-detail__owner-actions">
            {deleteError && <div className="banner">{deleteError}</div>}
            <button className="btn btn--ghost btn--block" onClick={() => navigate(`/job-work/requirements/edit/${id}`)}>
              Edit requirement
            </button>
            <button className="btn btn--danger btn--block" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobWorkRequirementDetail
