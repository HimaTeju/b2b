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

  it('submits only free-text fields, trimmed', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(/Project title/), '  Unit expansion  ')
    await user.type(screen.getByLabelText(/Project details/), '  Need about 25 lakh for new CNC line  ')
    await user.type(screen.getByLabelText('City'), 'Coimbatore')
    await user.click(screen.getByRole('button', { name: 'Post project' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Unit expansion',
      description: 'Need about 25 lakh for new CNC line',
      city: 'Coimbatore',
      state: null
    })
  })

  it('has no structured sector, stage or amount fields', () => {
    renderForm()
    expect(screen.queryByLabelText(/Sector/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/stage/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Amount/)).not.toBeInTheDocument()
  })
})
