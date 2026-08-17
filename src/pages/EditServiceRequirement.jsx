import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getServiceRequirement, updateServiceRequirement } from '../lib/api/serviceRequirements'
import { useAuth } from '../context/AuthContext'
import EntityRequirementForm from '../components/EntityRequirementForm'
import './Post.css'

const COPY = {
  titleLabel: 'What needs repair? *',
  titlePlaceholder: 'e.g. CNC spindle motor repair',
  descriptionLabel: 'More details',
  descriptionPlaceholder: 'Symptoms, machine model, urgency…',
  savingLabel: 'Saving…'
}

function EditServiceRequirement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requirement, setRequirement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRequirement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadRequirement = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getServiceRequirement(id)

      if (data.profile_id !== user.id) {
        setError('You do not have permission to edit this requirement')
        return
      }

      setRequirement(data)
    } catch (err) {
      console.error('Error loading requirement:', err)
      setError('Failed to load requirement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (updates) => {
    setSaving(true)
    setError('')

    try {
      await updateServiceRequirement(id, updates)
      navigate(`/services/requirements/${id}`)
    } catch (err) {
      console.error('Error updating requirement:', err)
      setError(err.message || 'Failed to update requirement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="post">
        <div className="post__container">Loading…</div>
      </div>
    )
  }

  if (error && !requirement) {
    return (
      <div className="post">
        <div className="post__container">
          <div className="banner">{error}</div>
          <button className="btn btn--primary post__back" onClick={() => navigate('/services/requirements')}>
            Back to requirements
          </button>
        </div>
      </div>
    )
  }

  const initialValues = {
    machine_category_id: requirement.machine_category_id || '',
    title: requirement.title,
    description: requirement.description || '',
    city: requirement.city || '',
    state: requirement.state || ''
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">SV · Services</span>
        <h1 className="post__title">Edit requirement</h1>

        <EntityRequirementForm
          copy={COPY}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/services/requirements/${id}`)}
          submitLabel="Save changes"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default EditServiceRequirement
