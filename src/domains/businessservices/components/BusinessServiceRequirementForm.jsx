import { useState } from 'react'
import { BUSINESS_SERVICE_TYPES } from '../../../lib/constants'
import '../../../components/EntityForm.css'

const EMPTY_FORM = {
  service_type: '',
  title: '',
  description: '',
  city: '',
  state: ''
}

export const REQUIREMENT_COPY = {
  intro: "Tell providers what you need — they'll reach out with an offer.",
  titleLabel: 'What do you need help with? *',
  titlePlaceholder: 'e.g. Guidance on starting to export garments',
  descriptionLabel: 'More details',
  descriptionPlaceholder: "Your business, what you've done so far, timeline…",
  savingLabel: 'Posting…'
}

/**
 * "I need a business service" requirement form — a single service type
 * (dropdown) plus the usual title/description/location. Dedicated to this
 * domain rather than a reuse of EntityRequirementForm, which is built around
 * a required machine category.
 */
function BusinessServiceRequirementForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      service_type: form.service_type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      <div className="field">
        <label className="field__label" htmlFor="service_type">Service needed *</label>
        <select
          id="service_type"
          value={form.service_type}
          onChange={handleChange('service_type')}
          required
        >
          <option value="">Select a service</option>
          {BUSINESS_SERVICE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="title">{copy.titleLabel}</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={handleChange('title')}
          placeholder={copy.titlePlaceholder}
          maxLength={255}
          required
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">{copy.descriptionLabel}</label>
        <textarea
          id="description"
          value={form.description}
          onChange={handleChange('description')}
          placeholder={copy.descriptionPlaceholder}
          rows={5}
        />
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="city">City</label>
          <input id="city" type="text" value={form.city} onChange={handleChange('city')} placeholder="e.g. Chennai" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="state">State</label>
          <input id="state" type="text" value={form.state} onChange={handleChange('state')} placeholder="e.g. Tamil Nadu" />
        </div>
      </div>

      <div className="entity-form__actions">
        <button type="button" className="btn btn--ghost btn--block" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
          {saving ? (copy.savingLabel || 'Saving…') : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default BusinessServiceRequirementForm
