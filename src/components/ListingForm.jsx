import { useState } from 'react'
import CategoryPicker from './CategoryPicker'
import { CONDITIONS, CONDITION_LABELS } from '../lib/constants'
import './EntityForm.css'

const EMPTY_FORM = {
  machine_category_id: '',
  title: '',
  description: '',
  condition: '',
  price: '',
  quantity: '1',
  city: '',
  state: ''
}

export const SELL_COPY = {
  titleLabel: 'Title *',
  titlePlaceholder: 'e.g. CNC Milling Machine, VMC 3-axis',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Specs, model, year, condition notes…',
  priceLabel: 'Price (INR)',
  pricePlaceholder: 'Contact for price',
  quantityLabel: 'Quantity',
  conditionLabel: 'Condition',
  conditionNoneLabel: 'Not specified',
  conditionSuffix: '',
  savingLabel: 'Saving…'
}

export const REQUIREMENT_COPY = {
  intro: "Tell sellers what you need — they'll reach out with an offer.",
  titleLabel: 'What are you looking for? *',
  titlePlaceholder: 'e.g. Used CNC lathe, under 5 years old',
  descriptionLabel: 'More details',
  descriptionPlaceholder: 'Specs, must-haves, timeline…',
  priceLabel: 'Budget (INR)',
  pricePlaceholder: 'Open to offers',
  quantityLabel: 'Quantity needed',
  conditionLabel: 'Preferred condition',
  conditionNoneLabel: 'Either is fine',
  conditionSuffix: ' only',
  savingLabel: 'Posting…'
}

function ListingForm({ intent, copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      intent,
      machine_category_id: form.machine_category_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      condition: form.condition || null,
      price: form.price === '' ? null : parseFloat(form.price),
      quantity: form.quantity === '' ? 1 : parseInt(form.quantity, 10),
      city: form.city.trim() || null,
      state: form.state.trim() || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      <CategoryPicker
        value={form.machine_category_id}
        onChange={(id) => setForm(prev => ({ ...prev, machine_category_id: id }))}
      />

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
          <label className="field__label" htmlFor="price">{copy.priceLabel}</label>
          <input
            id="price"
            type="number"
            className="input--mono"
            value={form.price}
            onChange={handleChange('price')}
            placeholder={copy.pricePlaceholder}
            min="0"
            step="0.01"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="quantity">{copy.quantityLabel}</label>
          <input
            id="quantity"
            type="number"
            className="input--mono"
            value={form.quantity}
            onChange={handleChange('quantity')}
            min="1"
            step="1"
          />
        </div>
      </div>

      <div className="field">
        <span className="field__label">{copy.conditionLabel}</span>
        <div className="entity-form__chip-toggle">
          <button
            type="button"
            className={`entity-form__chip ${form.condition === '' ? 'entity-form__chip--active' : ''}`}
            onClick={() => setForm(prev => ({ ...prev, condition: '' }))}
          >
            {copy.conditionNoneLabel}
          </button>
          {CONDITIONS.map(condition => (
            <button
              type="button"
              key={condition}
              className={`entity-form__chip ${form.condition === condition ? 'entity-form__chip--active' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, condition }))}
            >
              {CONDITION_LABELS[condition]}{copy.conditionSuffix}
            </button>
          ))}
        </div>
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

      <div className="entity-form__actions">
        <button type="button" className="btn btn--ghost btn--block" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
          {saving ? copy.savingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ListingForm
