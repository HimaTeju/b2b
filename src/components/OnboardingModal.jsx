import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DOMAIN_LIST } from '../lib/domains'
import './OnboardingModal.css'

/**
 * Skippable, one-time "what are you here for" prompt. Shown by Layout when
 * profile.onboarded_at is null. Writes a soft interest signal to
 * profiles.interests (used by Home's rankDomains, not a capability grant),
 * and always stamps onboarded_at so it never reappears — skip and submit
 * both count as "shown."
 */
function OnboardingModal() {
  const { user, updateProfile } = useAuth()
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const finish = async (interests) => {
    setSaving(true)
    try {
      await updateProfile({ interests, onboarded_at: new Date().toISOString() })
    } catch (err) {
      console.error('Error saving onboarding preferences:', err)
      setSaving(false)
    }
  }

  return (
    <div className="onboarding-modal__backdrop">
      <div className="onboarding-modal" role="dialog" aria-label="What are you here for?">
        <span className="eyebrow">B2B Works</span>
        <h1 className="onboarding-modal__title">What are you here for?</h1>
        <p className="onboarding-modal__hint">
          Pick anything that applies, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} — this just helps us
          show you the right things first. You can still reach everything else from Explore.
        </p>

        <div className="onboarding-modal__grid">
          {DOMAIN_LIST.map(domain => (
            <button
              key={domain.key}
              type="button"
              className={`onboarding-modal__tile onboarding-modal__tile--${domain.accent} ${selected.includes(domain.key) ? 'onboarding-modal__tile--selected' : ''}`}
              onClick={() => toggle(domain.key)}
              disabled={saving}
            >
              <span className="onboarding-modal__tile-icon">{domain.icon}</span>
              <span className="onboarding-modal__tile-label">{domain.label}</span>
            </button>
          ))}
        </div>

        <div className="onboarding-modal__actions">
          <button type="button" className="onboarding-modal__skip" onClick={() => finish([])} disabled={saving}>
            Skip for now
          </button>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => finish(selected)}
            disabled={saving || selected.length === 0}
          >
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
