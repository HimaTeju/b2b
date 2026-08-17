import ComingSoonSection from '../components/ComingSoonSection'

function Jobs() {
  return (
    <ComingSoonSection
      code="JC"
      title="Jobs / Career"
      accent="jobs"
      description="Post a vacancy to hire skilled operators and technicians, or enable a job seeker profile so employers in your trade can find you."
      bullets={[
        'Post a job vacancy',
        'Build a job seeker profile by machine category',
        'Get contacted directly by employers'
      ]}
    />
  )
}

export default Jobs
