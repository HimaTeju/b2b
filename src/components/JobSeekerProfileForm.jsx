import { useState } from 'react'
import CategoryTagPicker from './CategoryTagPicker'
import './EntityForm.css'

const EMPTY_FORM = {
  headline: '',
  about: '',
  experience_years: '',
  resume_url: '',
  city: '',
  state: '',
  is_active: true,
  categoryIds: []
}

/**
 * One-time-setup, editable-anytime job seeker profile form. Different field
 * set from CapabilityProfileForm (headline/experience/resume instead of
 * title/description) since a job seeker profile describes a person's
 * candidacy, not a business's service offering — see CapabilityProfileForm
 * for the shared shape used by Services/Job Work.
 */
function JobSeekerProfileForm({ copy, initialValues, onSubmit, onCancel, submitLabel, saving, error }) {
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
      headline: form.headline.trim(),
      about: form.about.trim() || null,
      experienceYears: form.experience_years === '' ? 0 : Number(form.experience_years),
      resumeUrl: form.resume_url.trim() || null,
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
        <label className="field__label" htmlFor="headline">Professional headline *</label>
        <input
          id="headline"
          type="text"
          value={form.headline}
          onChange={handleChange('headline')}
          placeholder="e.g. CNC Machine Operator, 6 years experience"
          maxLength={255}
          required
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="about">About you</label>
        <textarea
          id="about"
          value={form.about}
          onChange={handleChange('about')}
          placeholder="Machines you've operated, certifications, notice period…"
          rows={5}
        />
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="experience_years">Years of experience</label>
          <input
            id="experience_years"
            type="number"
            min="0"
            value={form.experience_years}
            onChange={handleChange('experience_years')}
            placeholder="0"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="resume_url">Resume link</label>
          <input
            id="resume_url"
            type="url"
            value={form.resume_url}
            onChange={handleChange('resume_url')}
            placeholder="https://"
          />
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

      <div className="field">
        <span className="field__label">Categories you work in *</span>
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
        Visible to employers browsing Jobs
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

export default JobSeekerProfileForm
