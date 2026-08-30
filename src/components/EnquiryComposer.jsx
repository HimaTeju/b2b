import { useState } from 'react'
import './EnquiryComposer.css'

/**
 * Shared "contact" interaction for any detail page (listing, requirement,
 * provider/vendor profile, ...): a CTA button that reveals a message
 * textarea, or a confirmation banner once sent. Caller owns the actual
 * enquiry creation and controls `sending`/`sent`.
 */
function EnquiryComposer({ placeholder, ctaLabel, sendLabel = 'Send', sendingLabel = 'Sending…', onSubmit, sending, sent, sentMessage, error }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(message)
  }

  if (sent) {
    return <div className="banner banner--positive">{sentMessage}</div>
  }

  if (!showForm) {
    return (
      <>
        {error && <div className="banner">{error}</div>}
        <button className="btn btn--primary btn--block" onClick={() => setShowForm(true)}>
          {ctaLabel}
        </button>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="enquiry-composer">
      {error && <div className="banner">{error}</div>}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows={4}
        required
      />
      <div className="enquiry-composer__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => { setShowForm(false); setMessage('') }}
          disabled={sending}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? sendingLabel : sendLabel}
        </button>
      </div>
    </form>
  )
}

export default EnquiryComposer
