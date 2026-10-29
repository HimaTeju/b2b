import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvestorCapabilityForm from './InvestorCapabilityForm'
import FundingRequirementForm, { FUNDING_COPY } from './FundingRequirementForm'

const CAPABILITY_COPY = {
  titleLabel: 'Investor / firm name *',
  titlePlaceholder: '',
  descriptionLabel: 'About your investing',
  descriptionPlaceholder: '',
  activeLabel: 'Visible'
}

describe('InvestorCapabilityForm', () => {
  function renderForm(props = {}) {
    const onSubmit = vi.fn()
    render(
      <InvestorCapabilityForm
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

  it('submits the selected sectors', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Manufacturing' }))
    await user.click(screen.getByRole('button', { name: 'Export & Trade' }))
    await user.type(screen.getByLabelText(/Investor \/ firm name/), 'Coastal Ventures')
    await user.click(screen.getByRole('button', { name: 'Create profile' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Coastal Ventures',
      description: null,
      city: null,
      state: null,
      isActive: true,
      sectors: ['Manufacturing', 'Export & Trade']
    })
  })

  it('requires at least one sector and prefills from initial values', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ initialValues: { title: 'X', sectors: ['Manufacturing'] } })

    const chip = screen.getByRole('button', { name: 'Manufacturing' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    await user.click(chip)
    await user.click(screen.getByRole('button', { name: 'Create profile' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Select at least one sector.')).toBeInTheDocument()
  })
})

describe('FundingRequirementForm', () => {
  function renderForm() {
    const onSubmit = vi.fn()
    render(
      <FundingRequirementForm
        copy={FUNDING_COPY}
        submitLabel="Post project"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        saving={false}
        error={null}
      />
    )
    return { onSubmit }
  }

  it('submits sector, stage and a parsed amount', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.selectOptions(screen.getByLabelText(/Sector/), 'Manufacturing')
    await user.selectOptions(screen.getByLabelText(/Project stage/), 'Expansion')
    await user.type(screen.getByLabelText(/Project title/), '  Unit expansion  ')
    await user.type(screen.getByLabelText(/Amount sought/), '2500000')
    await user.click(screen.getByRole('button', { name: 'Post project' }))

    expect(onSubmit).toHaveBeenCalledWith({
      sector: 'Manufacturing',
      stage: 'Expansion',
      amount_sought: 2500000,
      title: 'Unit expansion',
      description: null,
      city: null,
      state: null
    })
  })

  it('sends a null amount when left blank', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.selectOptions(screen.getByLabelText(/Sector/), 'Other')
    await user.selectOptions(screen.getByLabelText(/Project stage/), 'Idea')
    await user.type(screen.getByLabelText(/Project title/), 'Idea')
    await user.click(screen.getByRole('button', { name: 'Post project' }))

    expect(onSubmit.mock.calls[0][0].amount_sought).toBeNull()
  })
})
