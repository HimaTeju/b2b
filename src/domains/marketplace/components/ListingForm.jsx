import { useState, useEffect, useRef } from 'react'
import CategoryPicker from '../../../components/CategoryPicker'
import { CONDITIONS, CONDITION_LABELS, WEIGHT_UNITS, WEIGHT_UNIT_LABELS } from '../../../lib/constants'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, getListingImageUrl } from '../api/listingImages'
import '../../../components/EntityForm.css'

const MAX_PHOTOS = 6

const EMPTY_FORM = {
  machine_category_id: '',
  title: '',
  description: '',
  condition: '',
  price: '',
  quantity: '1',
  city: '',
  state: '',
  material_type: '',
  shape: '',
  weight: '',
  weight_unit: 'KG'
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

function ListingForm({ section = 'MACHINERY', intent, copy, initialValues, existingImages, onSubmit, onCancel, submitLabel, saving, error }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [keptImages, setKeptImages] = useState(existingImages || [])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [newImages, setNewImages] = useState([]) // [{ file, previewUrl }]
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef(null)

  // Revoke object URLs for locally-picked photos when they're replaced/unmounted.
  useEffect(() => {
    return () => newImages.forEach(image => URL.revokeObjectURL(image.previewUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPhotoCount = keptImages.length + newImages.length

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // allow re-selecting the same file later
    if (files.length === 0) return

    setPhotoError('')

    const room = MAX_PHOTOS - totalPhotoCount
    if (room <= 0) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos`)
      return
    }

    const accepted = []
    for (const file of files.slice(0, room)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setPhotoError('Only JPEG, PNG, or WEBP images are allowed')
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setPhotoError('Each image must be smaller than 5MB')
        continue
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    if (accepted.length > 0) {
      setNewImages(prev => [...prev, ...accepted])
    }
  }

  const removeKeptImage = (imageId) => {
    setKeptImages(prev => prev.filter(image => image.id !== imageId))
    setRemovedImageIds(prev => [...prev, imageId])
  }

  const removeNewImage = (previewUrl) => {
    setNewImages(prev => prev.filter(image => {
      if (image.previewUrl === previewUrl) {
        URL.revokeObjectURL(image.previewUrl)
        return false
      }
      return true
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      intent,
      section,
      machine_category_id: section === 'SCRAP' ? null : (form.machine_category_id || null),
      title: form.title.trim(),
      description: form.description.trim() || null,
      condition: form.condition || null,
      price: form.price === '' ? null : parseFloat(form.price),
      quantity: form.quantity === '' ? 1 : parseInt(form.quantity, 10),
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      material_type: section === 'SCRAP' ? (form.material_type.trim() || null) : null,
      shape: section === 'SCRAP' ? (form.shape.trim() || null) : null,
      weight: section === 'SCRAP' && form.weight !== '' ? parseFloat(form.weight) : null,
      weight_unit: section === 'SCRAP' ? (form.weight_unit || null) : null
    }, {
      removedImageIds,
      newFiles: newImages.map(image => image.file),
      keptImageCount: keptImages.length
    })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="banner">{error}</div>}

      {copy.intro && <p className="entity-form__intro">{copy.intro}</p>}

      {section === 'MACHINERY' && (
        <CategoryPicker
          value={form.machine_category_id}
          onChange={(id) => setForm(prev => ({ ...prev, machine_category_id: id }))}
        />
      )}

      {section === 'TOOLS_ACCESSORIES' && (
        <CategoryPicker
          value={form.machine_category_id}
          onChange={(id) => setForm(prev => ({ ...prev, machine_category_id: id }))}
          required={false}
          label="Related machine category"
        />
      )}

      {section === 'SCRAP' && (
        <>
          <div className="field__row">
            <div className="field">
              <label className="field__label" htmlFor="material_type">Material Type</label>
              <input
                id="material_type"
                type="text"
                value={form.material_type}
                onChange={handleChange('material_type')}
                placeholder="e.g. Copper, Steel, Aluminum"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="shape">Shape</label>
              <input
                id="shape"
                type="text"
                value={form.shape}
                onChange={handleChange('shape')}
                placeholder="e.g. Sheet, Rod, Turnings"
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="weight">Weight</label>
            <input
              id="weight"
              type="number"
              className="input--mono"
              value={form.weight}
              onChange={handleChange('weight')}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="field">
            <span className="field__label">Weight Unit</span>
            <div className="entity-form__chip-toggle">
              {WEIGHT_UNITS.map(unit => (
                <button
                  type="button"
                  key={unit}
                  className={`entity-form__chip ${form.weight_unit === unit ? 'entity-form__chip--active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, weight_unit: unit }))}
                >
                  {WEIGHT_UNIT_LABELS[unit]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="field">
        <span className="field__label">Photos</span>
        <div className="entity-form__photos">
          {keptImages.map(image => (
            <div className="entity-form__photo" key={image.id}>
              <img src={getListingImageUrl(image.storage_path)} alt="" />
              <button
                type="button"
                className="entity-form__photo-remove"
                aria-label="Remove photo"
                onClick={() => removeKeptImage(image.id)}
              >
                ×
              </button>
            </div>
          ))}
          {newImages.map(image => (
            <div className="entity-form__photo" key={image.previewUrl}>
              <img src={image.previewUrl} alt="" />
              <button
                type="button"
                className="entity-form__photo-remove"
                aria-label="Remove photo"
                onClick={() => removeNewImage(image.previewUrl)}
              >
                ×
              </button>
            </div>
          ))}
          {totalPhotoCount < MAX_PHOTOS && (
            <button
              type="button"
              className="entity-form__photo-add"
              onClick={() => fileInputRef.current?.click()}
            >
              + Add
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={handleFilesSelected}
        />
        {photoError && <p className="entity-form__photo-error">{photoError}</p>}
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
