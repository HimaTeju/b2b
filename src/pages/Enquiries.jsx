import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReceivedEnquiries, getSentEnquiries, setEnquiryRead, getEnquirySubject } from '../lib/api/enquiries'
import { formatRelativeDate } from '../lib/format'
import './Enquiries.css'

function Enquiries() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('received')
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadEnquiries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    const match = id ? enquiries.find(e => e.id === id) : null
    selectEnquiry(match || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enquiries])

  const loadEnquiries = async () => {
    setLoading(true)
    setError('')
    try {
      const data = activeTab === 'received'
        ? await getReceivedEnquiries(user.id)
        : await getSentEnquiries(user.id)
      setEnquiries(data || [])
    } catch (err) {
      console.error('Error loading enquiries:', err)
      setError('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  const selectEnquiry = (enquiry) => {
    setSelected(enquiry)
    if (activeTab === 'received' && enquiry && !enquiry.is_read) {
      handleReadToggle(enquiry, true)
    }
  }

  const handleEnquiryClick = (enquiry) => {
    navigate(`/enquiries/${enquiry.id}`)
    selectEnquiry(enquiry)
  }

  const handleBackToList = () => {
    setSelected(null)
    navigate('/enquiries')
  }

  const handleReadToggle = async (enquiry, isRead) => {
    try {
      await setEnquiryRead(enquiry.id, isRead)
      setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, is_read: isRead } : e))
      setSelected(prev => prev && prev.id === enquiry.id ? { ...prev, is_read: isRead } : prev)
    } catch (err) {
      console.error('Error updating enquiry:', err)
    }
  }

  const counterpart = (enquiry) => activeTab === 'received' ? enquiry.from_profile : enquiry.to_profile

  const contactLabel = (enquiry) => counterpart(enquiry)?.company_name || 'Business account'

  const selectedSubject = selected ? getEnquirySubject(selected) : null

  return (
    <div className={`enquiries ${selected ? 'enquiries--detail-open' : ''}`}>
      <div className="enquiries__sidebar">
        <div className="enquiries__sidebar-header">
          <h1 className="enquiries__sidebar-title">Enquiries</h1>
          <div className="enquiries__tabs">
            <button
              className={`enquiries__tab ${activeTab === 'received' ? 'enquiries__tab--active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`enquiries__tab ${activeTab === 'sent' ? 'enquiries__tab--active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="enquiries__state">Loading…</div>
        ) : error ? (
          <div className="enquiries__state">{error}</div>
        ) : enquiries.length === 0 ? (
          <div className="enquiries__state">
            <p>{activeTab === 'received' ? 'No enquiries received yet.' : 'No enquiries sent yet.'}</p>
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/marketplace')}>
              Browse marketplace
            </button>
          </div>
        ) : (
          <div className="enquiries__list">
            {enquiries.map(enquiry => (
              <button
                key={enquiry.id}
                className={`enquiry-item ${selected?.id === enquiry.id ? 'enquiry-item--active' : ''}`}
                onClick={() => handleEnquiryClick(enquiry)}
              >
                <div className="enquiry-item__content">
                  <div className="enquiry-item__header">
                    <span className="enquiry-item__name">{contactLabel(enquiry)}</span>
                    <span className="enquiry-item__time mono">{formatRelativeDate(enquiry.created_at)}</span>
                  </div>
                  <p className="enquiry-item__listing">{getEnquirySubject(enquiry)?.title || 'Removed'}</p>
                  <p className="enquiry-item__preview">{enquiry.message}</p>
                </div>
                {activeTab === 'received' && !enquiry.is_read && <span className="enquiry-item__dot" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="enquiries__main">
        {selected ? (
          <>
            <div className="enquiries__header">
              <button className="enquiries__back" onClick={handleBackToList} aria-label="Back to list">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="enquiries__header-text">
                <h2 className="enquiries__header-title">{contactLabel(selected)}</h2>
                <p className="enquiries__header-subtitle">Re: {selectedSubject?.title || 'Removed'}</p>
              </div>
              {activeTab === 'received' && (
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleReadToggle(selected, !selected.is_read)}
                >
                  Mark as {selected.is_read ? 'unread' : 'read'}
                </button>
              )}
            </div>

            <div className="enquiries__detail">
              <div className="enquiries__detail-section">
                <h3 className="enquiries__detail-label">Message</h3>
                <p className="enquiries__detail-text">{selected.message}</p>
              </div>

              {selectedSubject && (
                <div className="enquiries__detail-section">
                  <h3 className="enquiries__detail-label">Details</h3>
                  <p className="enquiries__detail-text">
                    <strong>{selectedSubject.removed ? 'Removed' : selectedSubject.title}</strong>
                  </p>
                  {!selectedSubject.removed && (
                    <button className="btn btn--ghost btn--sm" onClick={() => navigate(selectedSubject.path)}>
                      View
                    </button>
                  )}
                </div>
              )}

              <div className="enquiries__detail-section">
                <h3 className="enquiries__detail-label">Contact</h3>
                <p className="enquiries__detail-text">
                  <strong>{activeTab === 'received' ? 'From' : 'To'}:</strong> {contactLabel(selected)}
                </p>
                {counterpart(selected)?.city && (
                  <p className="enquiries__detail-text">{counterpart(selected).city}, {counterpart(selected).state}</p>
                )}
              </div>

              <p className="enquiries__detail-meta">Sent {new Date(selected.created_at).toLocaleString()}</p>
            </div>
          </>
        ) : (
          <div className="enquiries__empty">Select an enquiry to view it</div>
        )}
      </div>
    </div>
  )
}

export default Enquiries
