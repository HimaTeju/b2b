import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createFundingRequirement } from '../api/fundingRequirements'
import { useAuth } from '../../../context/AuthContext'
import FundingRequirementForm, { FUNDING_COPY } from '../components/FundingRequirementForm'
import '../../../pages/Post.css'

function PostFundingRequirement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const requirement = await createFundingRequirement({ ...data, profile_id: user.id })
      navigate(`/investors/requirements/${requirement.id}`)
    } catch (err) {
      console.error('Error posting project:', err)
      setError(err.message || 'Failed to post project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">IN · Investors</span>
        <h1 className="post__title">Post a project for funding</h1>

        <FundingRequirementForm
          copy={FUNDING_COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post project"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default PostFundingRequirement
