import TagCapabilityForm from '../../../components/TagCapabilityForm'
import { BUSINESS_SERVICE_TYPES, BUSINESS_SERVICES_DISCLAIMER } from '../../../lib/constants'

/**
 * Business Services provider profile form: a provider picks the service
 * types they offer. Thin wrapper over the shared TagCapabilityForm.
 */
function BusinessServiceCapabilityForm({ initialValues, onSubmit, ...props }) {
  return (
    <TagCapabilityForm
      {...props}
      options={BUSINESS_SERVICE_TYPES}
      selectedLabel="Services you offer *"
      emptyError="Select at least one service."
      disclaimer={BUSINESS_SERVICES_DISCLAIMER}
      initialValues={initialValues && { ...initialValues, selected: initialValues.serviceTypes }}
      onSubmit={({ selected, ...rest }) => onSubmit({ ...rest, serviceTypes: selected })}
    />
  )
}

export default BusinessServiceCapabilityForm
