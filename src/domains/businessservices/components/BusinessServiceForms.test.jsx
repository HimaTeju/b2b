import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BusinessServiceCapabilityForm from './BusinessServiceCapabilityForm'
import BusinessServiceRequirementForm, { REQUIREMENT_COPY } from './BusinessServiceRequirementForm'

const CAPABILITY_COPY = {
  titleLabel: 'Business / practice name *',
  titlePlaceholder: '',
  descriptionLabel: 'About your services',
  descriptionPlaceholder: '',
  activeLabel: 'Visible'
}

describe('BusinessServiceCapabilityForm', () => {
  function renderForm(props = {}) {
    const onSubmit = vi.fn()
    render(
      <BusinessServiceCapabilityForm
        copy={CAPABILITY_COPY}
        submitLabel="Create profile"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        saving={false}
        error={null}
        {...props}
      />
    )
    return { onSubmit }
  }

  it('submits the selected service types with trimmed fields', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Audit' }))
    await user.click(screen.getByRole('button', { name: 'Tax Services' }))
    await user.type(screen.getByLabelText(/Business \/ practice name/), '  Sharma & Co  ')
    await user.click(screen.getByRole('button', { name: 'Create profile' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Sharma & Co',
      description: null,
      city: null,
      state: null,
      isActive: true,
      serviceTypes: ['Audit', 'Tax Services']
    })
  })

  it('requires at least one service type', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(/Business \/ practice name/), 'Sharma & Co')
    await user.click(screen.getByRole('button', { name: 'Create profile' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Select at least one service.')).toBeInTheDocument()
  })

  it('toggles a service type off again and prefills from initial values', async () => {
    const user = userEvent.setup()
    renderForm({ initialValues: { title: 'X', serviceTypes: ['Audit'] } })

    const audit = screen.getByRole('button', { name: 'Audit' })
    expect(audit).toHaveAttribute('aria-pressed', 'true')
    await user.click(audit)
    expect(audit).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('BusinessServiceRequirementForm', () => {
  it('submits the chosen service type with trimmed fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <BusinessServiceRequirementForm
        copy={REQUIREMENT_COPY}
        submitLabel="Post requirement"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        saving={false}
        error={null}
      />
    )

    await user.selectOptions(screen.getByLabelText(/Service needed/), 'Import-Export Advice')
    await user.type(screen.getByLabelText(/What do you need help with/), '  First-time exporter  ')
    await user.type(screen.getByLabelText('City'), 'Chennai')
    await user.click(screen.getByRole('button', { name: 'Post requirement' }))

    expect(onSubmit).toHaveBeenCalledWith({
      service_type: 'Import-Export Advice',
      title: 'First-time exporter',
      description: null,
      city: 'Chennai',
      state: null
    })
  })
})
