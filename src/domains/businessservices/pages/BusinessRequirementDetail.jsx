import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getBusinessServiceRequirement, deleteBusinessServiceRequirement } from '../api/businessServicesRequirements'
import { createEnquiry } from '../../../lib/api/enquiries'
import { formatLocation } from '../../../lib/format'
import { BUSINESS_SERVICES_DISCLAIMER } from '../../../lib/constants'
import EnquiryComposer from '../../../components/EnquiryComposer'
import EntityDetailSkeleton from '../../../pages/EntityDetailSkeleton'
import '../../../pages/EntityDetail.css'

function BusinessRequirementDetail() {
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
      const data = await getBusinessServiceRequirement(id)
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
        businessServiceRequirementId: id,
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
      await deleteBusinessServiceRequirement(id)
      navigate('/business-services/requirements')
    } catch (err) {
      console.error('Error deleting requirement:', err)
      setDeleteError('Failed to delete requirement. Please try again.')
    }
  }

  if (loading) {
    return <EntityDetailSkeleton />
  }

  if (error || !requirement) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Requirement not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/business-services/requirements')}>Back to requirements</button>
      </div>
    )
  }

  const isOwner = user?.id === requirement.profile_id

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--businessservices">{requirement.service_type}</span>
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

        <p className="entity-form__intro">{BUSINESS_SERVICES_DISCLAIMER}</p>

        {!isOwner && (
          <EnquiryComposer
            placeholder="Hi, I can help with this. Here's how…"
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
            <button className="btn btn--ghost btn--block" onClick={() => navigate(`/business-services/requirements/edit/${id}`)}>
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

export default BusinessRequirementDetail
