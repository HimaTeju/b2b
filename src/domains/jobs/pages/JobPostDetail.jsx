import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getJobPost, deleteJobPost } from '../api/jobPosts'
import { createEnquiry } from '../../../lib/api/enquiries'
import { formatLocation } from '../../../lib/format'
import EnquiryComposer from '../../../components/EnquiryComposer'
import '../../../pages/EntityDetail.css'

function JobPostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobPost, setJobPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadJobPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadJobPost = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobPost(id)
      setJobPost(data)
    } catch (err) {
      console.error('Error loading job post:', err)
      setError('Failed to load job post')
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
        toProfileId: jobPost.profile_id,
        jobPostId: id,
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
    const confirmed = window.confirm(`Delete "${jobPost.title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      await deleteJobPost(id)
      navigate('/jobs')
    } catch (err) {
      console.error('Error deleting job post:', err)
      setDeleteError('Failed to delete job post. Please try again.')
    }
  }

  if (loading) {
    return <div className="entity-detail__state">Loading…</div>
  }

  if (error || !jobPost) {
    return (
      <div className="entity-detail__state">
        <p className="banner">{error || 'Job post not found'}</p>
        <button className="btn btn--primary" onClick={() => navigate('/jobs')}>Back to job posts</button>
      </div>
    )
  }

  const isOwner = user?.id === jobPost.profile_id

  return (
    <div className="entity-detail">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <span className="stamp stamp--solid stamp--jobs">Job Post</span>
          {jobPost.machine_categories?.name && (
            <span className="entity-detail__category mono">{jobPost.machine_categories.name}</span>
          )}
          <h1 className="entity-detail__title">{jobPost.title}</h1>
          <p className="entity-detail__location">{formatLocation(jobPost)}</p>
        </div>

        {jobPost.description && (
          <div className="entity-detail__section">
            <h2 className="entity-detail__section-title">Description</h2>
            <p className="entity-detail__description">{jobPost.description}</p>
          </div>
        )}

        <div className="entity-detail__section">
          <h2 className="entity-detail__section-title">Posted by</h2>
          <div className="entity-detail__contact">
            <p className="entity-detail__contact-name">{jobPost.profiles?.company_name || 'Business account'}</p>
            <p className="entity-detail__contact-meta">{formatLocation(jobPost.profiles || {})}</p>
          </div>
        </div>

        {!isOwner && (
          <EnquiryComposer
            placeholder="Hi, I'm interested in this role. Here's a bit about me…"
            ctaLabel="Apply now"
            sendLabel="Send application"
            onSubmit={handleSendEnquiry}
            sending={sendingEnquiry}
            sent={enquirySent}
            sentMessage="Application sent — the employer will get in touch."
            error={enquiryError}
          />
        )}

        {isOwner && (
          <div className="entity-detail__owner-actions">
            {deleteError && <div className="banner">{deleteError}</div>}
            <button className="btn btn--ghost btn--block" onClick={() => navigate(`/jobs/edit/${id}`)}>
              Edit job post
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

export default JobPostDetail
