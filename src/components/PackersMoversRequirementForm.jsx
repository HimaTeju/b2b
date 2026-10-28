import { useState } from 'react'
import CategoryPicker from './CategoryPicker'
import LocationFields from './LocationFields'
import './EntityForm.css'

const EMPTY_FORM = {
  machine_category_id: '',
  title: '',
  description: '',
  pickup_city: '',
  pickup_state: '',
  drop_city: '',
  drop_state: ''
}

/**
 * Packers & Movers requirement form — a dedicated shape rather than a reuse
 * of EntityRequirementForm, since a move needs a from-location and a
 * to-location (not one city/state pair), and Machine Lifting needs an actual
 * machine_category_id while Shop Lifting has none. `requestType` is fixed by
 * which page renders this form (see PostMachineLifting.jsx/PostShopLifting.jsx)
 * rather than a picker inside the form, per the app's "dedicated form per
 * intent" convention.
 */
function PackersMoversRequirementForm({ requestType, copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      machine_category_id: requestType === 'MACHINE_LIFTING' ? (form.machine_category_id || null) : null,
      title: form.title.trim(),
      description: form.description.trim() || null,
      pickup_city: form.pickup_city.trim() || null,
      pickup_state: form.pickup_state.trim() || null,
      drop_city: form.drop_city.trim() || null,
      drop_state: form.drop_state.trim() || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      {requestType === 'MACHINE_LIFTING' && (
        <CategoryPicker
          value={form.machine_category_id}
          onChange={(id) => setForm(prev => ({ ...prev, machine_category_id: id }))}
          label="Machine to be moved"
          required
        />
      )}

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

      <LocationFields
        idPrefix="pickup-"
        labelPrefix="Pickup"
        city={form.pickup_city}
        state={form.pickup_state}
        onChange={({ city, state }) => setForm(prev => ({ ...prev, pickup_city: city, pickup_state: state }))}
      />

      <LocationFields
        idPrefix="drop-"
        labelPrefix="Drop"
        city={form.drop_city}
        state={form.drop_state}
        cityPlaceholder="e.g. Chennai"
        onChange={({ city, state }) => setForm(prev => ({ ...prev, drop_city: city, drop_state: state }))}
      />

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

export default PackersMoversRequirementForm
