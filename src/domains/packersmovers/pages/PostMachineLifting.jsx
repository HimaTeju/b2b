import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPackersMoversRequirement } from '../api/packersMoversRequirements'
import { useAuth } from '../../../context/AuthContext'
import PackersMoversRequirementForm from '../../../components/PackersMoversRequirementForm'
import '../../../pages/Post.css'

const COPY = {
  intro: 'Tell movers which machine needs lifting — they’ll reach out with an offer.',
  titleLabel: 'What needs lifting? *',
  titlePlaceholder: 'e.g. Lathe machine, 2 tonnes',
  descriptionLabel: 'More details',
  descriptionPlaceholder: 'Weight, dimensions, access constraints…',
  savingLabel: 'Posting…'
}

function PostMachineLifting() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setSaving(true)
    setError('')

    try {
      const requirement = await createPackersMoversRequirement({ ...data, request_type: 'MACHINE_LIFTING', profile_id: user.id })
      navigate(`/packers-movers/requirements/${requirement.id}`)
    } catch (err) {
      console.error('Error posting requirement:', err)
      setError(err.message || 'Failed to post requirement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="post">
      <div className="post__container">
        <span className="eyebrow">PM · Packers &amp; Movers</span>
        <h1 className="post__title">Request machine lifting</h1>

        <PackersMoversRequirementForm
          requestType="MACHINE_LIFTING"
          copy={COPY}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Post requirement"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  )
}

export default PostMachineLifting
