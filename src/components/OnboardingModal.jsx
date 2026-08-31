import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DOMAIN_LIST } from '../lib/domains'
import './OnboardingModal.css'

const STEP_COUNT = 3

/**
 * Skippable, one-time first-visit walkthrough. Shown by Layout when
 * profile.onboarded_at is null. Three short screens (what the app does, how
 * the four sections work, what you're here for) instead of one, so a
 * first-time user gets a plain-language intro before the interest picker
 * that used to be the whole modal. Writes a soft interest signal to
 * profiles.interests (used by Home's rankDomains, not a capability grant),
 * and always stamps onboarded_at so it never reappears — skip and submit
 * both count as "shown."
 */
function OnboardingModal() {
  const { user, updateProfile } = useAuth()
  const [step, setStep] = useState(0)
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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="onboarding-modal__backdrop">
      <div className="onboarding-modal" role="dialog" aria-label="Welcome to B2B Works">
        <div className="onboarding-modal__dots">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span key={i} className={`onboarding-modal__dot ${i === step ? 'onboarding-modal__dot--active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <>
            <span className="eyebrow">B2B Works</span>
            <h1 className="onboarding-modal__title">Welcome, {firstName}</h1>
            <p className="onboarding-modal__hint">
              One app to buy, sell, get work done, and find work — machines, tools, repairs, and jobs, all from your phone.
            </p>
            <div className="onboarding-modal__actions">
              <button type="button" className="onboarding-modal__skip" onClick={() => finish([])} disabled={saving}>
                Skip
              </button>
              <button type="button" className="btn btn--primary btn--block" onClick={() => setStep(1)}>
                Get started
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <span className="eyebrow">How it works</span>
            <h1 className="onboarding-modal__title">4 things you can do here</h1>
            <div className="onboarding-modal__info-list">
              {DOMAIN_LIST.map(domain => (
                <div key={domain.key} className={`onboarding-modal__info-row onboarding-modal__info-row--${domain.accent}`}>
                  <span className="onboarding-modal__info-icon">{domain.icon}</span>
                  <div>
                    <p className="onboarding-modal__info-label">{domain.label}</p>
                    <p className="onboarding-modal__info-blurb">{domain.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="onboarding-modal__actions">
              <button type="button" className="onboarding-modal__skip" onClick={() => finish([])} disabled={saving}>
                Skip
              </button>
              <button type="button" className="btn btn--primary btn--block" onClick={() => setStep(2)}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <span className="eyebrow">Almost done</span>
            <h1 className="onboarding-modal__title">What are you here for?</h1>
            <p className="onboarding-modal__hint">
              Pick anything that applies — this just helps us show you the right things first. You can still reach everything else from Explore.
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
          </>
        )}
      </div>
    </div>
  )
}

export default OnboardingModal
