import { useState } from 'react'
import { INVESTMENT_SECTORS, PROJECT_STAGES, INVESTORS_DISCLAIMER } from '../../../lib/constants'
import '../../../components/EntityForm.css'

const EMPTY_FORM = {
  sector: '',
  stage: '',
  amount_sought: '',
  title: '',
  description: '',
  city: '',
  state: ''
}

export const FUNDING_COPY = {
  intro: "Tell investors about your project — interested investors will reach out to you.",
  titleLabel: 'Project title *',
  titlePlaceholder: 'e.g. CNC component unit expansion',
  descriptionLabel: 'About the project',
  descriptionPlaceholder: 'What it is, what the money is for, progress so far, timeline…',
  savingLabel: 'Posting…'
}

/**
 * "My project needs funding" form: sector and stage dropdowns, an optional
 * amount (INR), plus the usual title/description/location. Dedicated to this
 * domain rather than a reuse of EntityRequirementForm, which is built around
 * a required machine category.
 */
function FundingRequirementForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      sector: form.sector,
      stage: form.stage,
      amount_sought: form.amount_sought === '' ? null : parseFloat(form.amount_sought),
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

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="sector">Sector *</label>
          <select id="sector" value={form.sector} onChange={handleChange('sector')} required>
            <option value="">Select a sector</option>
            {INVESTMENT_SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="stage">Project stage *</label>
          <select id="stage" value={form.stage} onChange={handleChange('stage')} required>
            <option value="">Select a stage</option>
            {PROJECT_STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
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
        <label className="field__label" htmlFor="amount_sought">Amount sought (INR)</label>
        <input
          id="amount_sought"
          type="number"
          className="input--mono"
          value={form.amount_sought}
          onChange={handleChange('amount_sought')}
          placeholder="Open to discuss"
          min="0"
          step="0.01"
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
