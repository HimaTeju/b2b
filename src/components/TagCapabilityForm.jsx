import { useState } from 'react'
import './EntityForm.css'

const EMPTY_FORM = {
  title: '',
  description: '',
  city: '',
  state: '',
  is_active: true,
  selected: []
}

/**
 * One-time-setup, editable-anytime capability profile form for domains whose
 * providers pick from a fixed list (chips) instead of machine categories —
 * Business Services (service types) and Investors (sectors). Shared
 * counterpart of CapabilityProfileForm. Returns the picked values as `selected`.
 *
 * props beyond the usual form ones:
 *   options       - the fixed list to pick from
 *   selectedLabel - field label above the chips (e.g. "Services you offer *")
 *   emptyError    - message when nothing is picked
 *   disclaimer    - optional note shown above the buttons
 */
function TagCapabilityForm({ options, selectedLabel, emptyError, disclaimer, copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [pickError, setPickError] = useState('')

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const toggleOption = (option) => {
    setPickError('')
    setForm(prev => ({
      ...prev,
      selected: prev.selected.includes(option)
        ? prev.selected.filter(o => o !== option)
        : [...prev.selected, option]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.selected.length === 0) {
      setPickError(emptyError)
      return
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      isActive: form.is_active,
      selected: form.selected
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      <div className="field">
        <span className="field__label">{selectedLabel}</span>
        <div className="entity-form__chip-toggle">
          {options.map(option => (
            <button
              type="button"
              key={option}
              className={`entity-form__chip ${form.selected.includes(option) ? 'entity-form__chip--active' : ''}`}
              aria-pressed={form.selected.includes(option)}
              onClick={() => toggleOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {pickError && <p className="field__error">{pickError}</p>}
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
          <input id="city" type="text" value={form.city} onChange={handleChange('city')} placeholder="e.g. Coimbatore" />
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

      {disclaimer && <p className="entity-form__intro">{disclaimer}</p>}

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

export default TagCapabilityForm
