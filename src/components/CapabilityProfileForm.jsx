import { useState } from 'react'
import CategoryTagPicker from './CategoryTagPicker'
import './EntityForm.css'

const EMPTY_FORM = {
  title: '',
  description: '',
  city: '',
  state: '',
  is_active: true,
  categoryIds: []
}

/**
 * One-time-setup, editable-anytime capability profile form — shared by
 * Services (provider) and Job Work (vendor) capability setup. A capability
 * profile can cover multiple machine categories, unlike a listing's single
 * category, so this uses CategoryTagPicker rather than CategoryPicker.
 */
function CapabilityProfileForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [categoryError, setCategoryError] = useState('')

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.categoryIds.length === 0) {
      setCategoryError('Select at least one category.')
      return
    }
    setCategoryError('')

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      isActive: form.is_active,
      categoryIds: form.categoryIds
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

      <div className="field">
        <span className="field__label">{copy.categoryFieldLabel || 'Categories you cover *'}</span>
        <CategoryTagPicker
          value={form.categoryIds}
          onChange={(categoryIds) => setForm(prev => ({ ...prev, categoryIds }))}
        />
        {categoryError && <p className="field__error">{categoryError}</p>}
      </div>

      <label className="entity-form__toggle">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
        />
        {copy.activeLabel || 'Visible to other businesses'}
      </label>

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

export default CapabilityProfileForm
