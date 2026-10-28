import { useState } from 'react'
import { BUSINESS_SERVICE_TYPES, BUSINESS_SERVICES_DISCLAIMER } from '../../../lib/constants'
import '../../../components/EntityForm.css'

const EMPTY_FORM = {
  title: '',
  description: '',
  city: '',
  state: '',
  is_active: true,
  serviceTypes: []
}

/**
 * Business Services provider profile form. Same one-time-setup,
 * editable-anytime shape as CapabilityProfileForm, but a provider picks from
 * the fixed service-type list (chips) instead of machine categories.
 */
function BusinessServiceCapabilityForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [typeError, setTypeError] = useState('')

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const toggleType = (type) => {
    setTypeError('')
    setForm(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.serviceTypes.length === 0) {
      setTypeError('Select at least one service.')
      return
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      isActive: form.is_active,
      serviceTypes: form.serviceTypes
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      <div className="field">
        <span className="field__label">Services you offer *</span>
        <div className="entity-form__chip-toggle">
          {BUSINESS_SERVICE_TYPES.map(type => (
            <button
              type="button"
              key={type}
              className={`entity-form__chip ${form.serviceTypes.includes(type) ? 'entity-form__chip--active' : ''}`}
              aria-pressed={form.serviceTypes.includes(type)}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {typeError && <p className="field__error">{typeError}</p>}
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

      <label className="entity-form__toggle">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
        />
        {copy.activeLabel}
      </label>

      <p className="entity-form__intro">{BUSINESS_SERVICES_DISCLAIMER}</p>

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

export default BusinessServiceCapabilityForm
