import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const { user, profile, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: profile?.company_name || '',
    city: profile?.city || '',
    state: profile?.state || '',
    website: profile?.website || '',
    about: profile?.about || ''
  })

  const displayName = profile?.company_name || user?.user_metadata?.full_name || 'Your business'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const resetForm = () => {
    setForm({
      company_name: profile?.company_name || '',
      city: profile?.city || '',
      state: profile?.state || '',
      website: profile?.website || '',
      about: profile?.about || ''
    })
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await updateProfile({
        company_name: form.company_name.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        website: form.website.trim() || null,
        about: form.about.trim() || null
      })
      setEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <div className="profile__avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="profile__name">{displayName}</h1>
            <p className="profile__email">{user?.email}</p>
          </div>
        </div>

        {error && <div className="banner">{error}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="profile__section">
            <h2 className="profile__section-title">Edit profile</h2>

            <div className="profile__form">
              <div className="field">
                <label className="field__label" htmlFor="company_name">Company name</label>
                <input id="company_name" type="text" value={form.company_name} onChange={handleChange('company_name')} />
              </div>

              <div className="field__row">
                <div className="field">
                  <label className="field__label" htmlFor="city">City</label>
                  <input id="city" type="text" value={form.city} onChange={handleChange('city')} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="state">State</label>
                  <input id="state" type="text" value={form.state} onChange={handleChange('state')} />
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="website">Website</label>
                <input id="website" type="url" value={form.website} onChange={handleChange('website')} placeholder="https://" />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="about">About</label>
                <textarea id="about" value={form.about} onChange={handleChange('about')} rows={4} />
              </div>

              <div className="profile__form-actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--block"
                  onClick={() => { setEditing(false); resetForm() }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile__section">
            <h2 className="profile__section-title">Account</h2>
            <div className="profile__menu">
              <button className="profile__menu-item" onClick={() => navigate('/dashboard')}>
                <span>Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button className="profile__menu-item" onClick={() => setEditing(true)}>
                <span>Edit profile</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button className="profile__menu-item" onClick={() => navigate('/help')}>
                <span>Help</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {(profile?.city || profile?.about || profile?.website) && (
              <div className="profile__summary">
                {(profile?.city || profile?.state) && (
                  <p className="profile__summary-line"><strong>Location:</strong> {[profile.city, profile.state].filter(Boolean).join(', ')}</p>
                )}
                {profile?.website && (
                  <p className="profile__summary-line"><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a></p>
                )}
                {profile?.about && (
                  <p className="profile__summary-line">{profile.about}</p>
                )}
              </div>
            )}
          </div>
        )}

        <button className="btn btn--danger btn--block profile__logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Profile
