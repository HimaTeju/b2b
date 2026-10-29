import { useState } from 'react'
import { INVESTORS_DISCLAIMER } from '../../../lib/constants'
import '../../../components/EntityForm.css'

const EMPTY_FORM = {
  title: '',
  description: '',
  city: '',
  state: ''
}

export const FUNDING_COPY = {
  intro: "Describe your project in your own words — interested investors will reach out to you.",
  titleLabel: 'Project title *',
  titlePlaceholder: 'e.g. CNC component unit expansion',
  descriptionLabel: 'Project details *',
  descriptionPlaceholder: 'What the project is, how much funding you need, what it is for, progress so far, timeline, how to reach you…',
  savingLabel: 'Posting…'
}

/**
 * "My project needs funding" form: deliberately free text — a title and a
 * required details box where the seeker enters whatever they want investors
 * to know (amount, stage, purpose…), plus location. Dedicated to this domain
 * rather than a reuse of EntityRequirementForm, which is built around a
 * required machine category.
 */
function FundingRequirementForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
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
          rows={8}
          required
        />
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="city">City</label>
          <input id="city" type="text" value={form.city} onChange={handleChange('city')} placeholder="e.g. Coimbatore" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="state">State</label>
          <input id="state" type="text" value={form.state} onChange={handleChange('state')} placeholder="e.g. Tamil Nadu" />
        </div>
      </div>

      <p className="entity-form__intro">{INVESTORS_DISCLAIMER}</p>

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

export default FundingRequirementForm
