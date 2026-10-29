import TagCapabilityForm from '../../../components/TagCapabilityForm'
import { INVESTMENT_SECTORS, INVESTORS_DISCLAIMER } from '../../../lib/constants'

/**
 * Investor profile form: an investor picks the sectors they invest in.
 * Thin wrapper over the shared TagCapabilityForm.
 */
function InvestorCapabilityForm({ initialValues, onSubmit, ...props }) {
  return (
    <TagCapabilityForm
      {...props}
      options={INVESTMENT_SECTORS}
      selectedLabel="Sectors you invest in *"
      emptyError="Select at least one sector."
      disclaimer={INVESTORS_DISCLAIMER}
      initialValues={initialValues && { ...initialValues, selected: initialValues.sectors }}
      onSubmit={({ selected, ...rest }) => onSubmit({ ...rest, sectors: selected })}
    />
  )
}

export default InvestorCapabilityForm
