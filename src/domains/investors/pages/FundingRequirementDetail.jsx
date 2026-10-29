import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getFundingRequirement, deleteFundingRequirement } from '../api/fundingRequirements'
import { createEnquiry } from '../../../lib/api/enquiries'
import { formatLocation } from '../../../lib/format'
import { INVESTORS_DISCLAIMER } from '../../../lib/constants'
import EnquiryComposer from '../../../components/EnquiryComposer'
import EntityDetailSkeleton from '../../../pages/EntityDetailSkeleton'
import '../../../pages/EntityDetail.css'

function FundingRequirementDetail() {
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
      const data = await getFundingRequirement(id)
      setRequirement(data)
    } catch (err) {
      console.error('Error loading requirement:', err)
      setError('Failed to load project')
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
        fundingRequirementId: id,
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
      await deleteFundingRequirement(id)
      navigate('/investors/requirements')
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
        <p className="banner">{error || 'Project not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/investors/requirements')}>Back to projects</button>
      </div>
    )
  }

  const isOwner = user?.id === requirement.profile_id

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--investors">Seeking funding</span>
          <h1 className="entity-detail__title">{requirement.title}</h1>
          <p className="entity-detail__location">{formatLocation(requirement)}</p>
        </div>

        {requirement.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">About the project</h2>
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

        <p className="entity-form__intro">{INVESTORS_DISCLAIMER}</p>

        {!isOwner && (
          <EnquiryComposer
            placeholder="Hi, I'm interested in this project. I'd like to know more…"
            ctaLabel="I'm interested"
            sendLabel="Send message"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Message sent — the project owner will get in touch."
            error={enquiryError}
          />
        )}

        {isOwner && (
          <div className="entity-detail__owner-actions">
            {deleteError && <div className="banner">{deleteError}</div>}
            <button className="btn btn--ghost btn--block" onClick={() => navigate(`/investors/requirements/edit/${id}`)}>
              Edit project
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

export default FundingRequirementDetail
