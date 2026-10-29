import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFundingRequirement, updateFundingRequirement } from '../api/fundingRequirements'
import { useAuth } from '../../../context/AuthContext'
import FundingRequirementForm, { FUNDING_COPY } from '../components/FundingRequirementForm'
import '../../../pages/Post.css'

function EditFundingRequirement() {
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
      const data = await getFundingRequirement(id)

      if (data.profile_id !== user.id) {
        setError('You do not have permission to edit this project')
        return
      }

      setRequirement(data)
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (updates) => {
    setSaving(true)
    setError('')

    try {
      await updateFundingRequirement(id, updates)
      navigate(`/investors/requirements/${id}`)
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err.message || 'Failed to update project')
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
          <button className="btn btn--primary post__back" onClick={() => navigate('/investors/requirements')}>
            Back to projects
          </button>
        </div>
      </div>
    )
  }

  const initialValues = {
    sector: requirement.sector,
    stage: requirement.stage,
    amount_sought: requirement.amount_sought ?? '',
    title: requirement.title,
    description: requirement.description || '',
    city: requirement.city || '',
    state: requirement.state || ''
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">IN · Investors</span>
        <h1 className="post__title">Edit project</h1>

        <FundingRequirementForm
          copy={{ ...FUNDING_COPY, intro: undefined, savingLabel: 'Saving…' }}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/investors/requirements/${id}`)}
          submitLabel="Save changes"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default EditFundingRequirement
