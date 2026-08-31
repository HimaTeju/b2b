import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPackersMoversRequirement, updatePackersMoversRequirement } from '../api/packersMoversRequirements'
import { useAuth } from '../../../context/AuthContext'
import { PACKERS_MOVERS_REQUEST_TYPE_LABELS } from '../../../lib/constants'
import PackersMoversRequirementForm from '../../../components/PackersMoversRequirementForm'
import '../../../pages/Post.css'

function EditPackersMoversRequirement() {
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
      const data = await getPackersMoversRequirement(id)

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
      await updatePackersMoversRequirement(id, updates)
      navigate(`/packers-movers/requirements/${id}`)
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
          <button className="btn btn--primary post__back" onClick={() => navigate('/packers-movers/requirements')}>
            Back to requirements
          </button>
        </div>
      </div>
    )
  }

  const copy = {
    titleLabel: requirement.request_type === 'MACHINE_LIFTING' ? 'What needs lifting? *' : 'What needs moving? *',
    titlePlaceholder: requirement.request_type === 'MACHINE_LIFTING' ? 'e.g. Lathe machine, 2 tonnes' : 'e.g. Full workshop relocation, 2000 sq ft',
    descriptionLabel: 'More details',
    descriptionPlaceholder: 'Weight, dimensions, access constraints, timeline…',
    savingLabel: 'Saving…'
  }

  const initialValues = {
    machine_category_id: requirement.machine_category_id || '',
    title: requirement.title,
    description: requirement.description || '',
    pickup_city: requirement.pickup_city || '',
    pickup_state: requirement.pickup_state || '',
    drop_city: requirement.drop_city || '',
    drop_state: requirement.drop_state || ''
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">PM · Packers &amp; Movers</span>
        <h1 className="post__title">Edit {PACKERS_MOVERS_REQUEST_TYPE_LABELS[requirement.request_type].toLowerCase()} requirement</h1>

        <PackersMoversRequirementForm
          requestType={requirement.request_type}
          copy={copy}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/packers-movers/requirements/${id}`)}
          submitLabel="Save changes"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default EditPackersMoversRequirement
