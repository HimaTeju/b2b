import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingForm, { SELL_COPY } from './ListingForm'

// CategoryPicker fetches categories from Supabase on mount; stub it out so
// these tests exercise ListingForm's own submit-shaping logic in isolation.
vi.mock('../../../components/CategoryPicker', () => ({
  default: ({ value, onChange }) => (
    <select data-testid="category-picker" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select a category</option>
      <option value="cat-lathes">Lathes</option>
    </select>
  )
}))

function renderForm(props = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <ListingForm
      section="SCRAP"
      intent="SELL"
      copy={SELL_COPY}
      submitLabel="Post Listing"
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={false}
      error={null}
      {...props}
    />
  )
  return { onSubmit, onCancel }
}

describe('ListingForm', () => {
  it('submits trimmed title/description and parsed numeric fields', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(/Title/), '  CNC Lathe  ')
    await user.type(screen.getByLabelText(/Description/), '  Good condition  ')
    await user.clear(screen.getByLabelText(/Price/))
    await user.type(screen.getByLabelText(/Price/), '15000')
    await user.clear(screen.getByLabelText(/Quantity/))
    await user.type(screen.getByLabelText(/Quantity/), '3')

    await user.click(screen.getByRole('button', { name: 'Post Listing' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const [payload, meta] = onSubmit.mock.calls[0]
    expect(payload).toMatchObject({
      title: 'CNC Lathe',
      description: 'Good condition',
      price: 15000,
      quantity: 3,
      intent: 'SELL',
      section: 'SCRAP'
    })
    expect(meta).toEqual({ removedImageIds: [], newFiles: [], keptImageCount: 0 })
  })

  it('defaults price to null and quantity to 1 when left blank', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(/Title/), 'Scrap Copper')
    await user.clear(screen.getByLabelText(/Quantity/))
    await user.click(screen.getByRole('button', { name: 'Post Listing' }))

    const [payload] = onSubmit.mock.calls[0]
    expect(payload.price).toBeNull()
    expect(payload.quantity).toBe(1)
  })

  it('nulls out machinery category and scrap fields for a SCRAP listing', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ section: 'SCRAP' })

    await user.type(screen.getByLabelText(/Title/), 'Mixed scrap')
    await user.selectOptions(screen.getByLabelText('Material Type'), 'Metal')
    await user.selectOptions(screen.getByLabelText('Metal Type'), 'Copper')
    await user.selectOptions(screen.getByLabelText('Shape'), 'Sheet')
    await user.type(screen.getByLabelText('Weight'), '12.5')
    await user.click(screen.getByRole('button', { name: 'Post Listing' }))

    const [payload] = onSubmit.mock.calls[0]
    expect(payload).toMatchObject({
      machine_category_id: null,
      material_type: 'Copper',
      shape: 'Sheet',
      weight: 12.5,
      weight_unit: 'KG'
    })
  })

  it('collects the selected machine category and leaves scrap fields null for a MACHINERY listing', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ section: 'MACHINERY' })

    await user.selectOptions(screen.getByTestId('category-picker'), 'cat-lathes')
    await user.type(screen.getByLabelText(/Title/), 'CNC Lathe')
    await user.click(screen.getByRole('button', { name: 'Post Listing' }))

    const [payload] = onSubmit.mock.calls[0]
    expect(payload).toMatchObject({
      machine_category_id: 'cat-lathes',
      material_type: null,
      shape: null,
      weight: null,
      weight_unit: null
    })
  })

  it('shows the error banner when an error is passed', () => {
    renderForm({ error: 'Something went wrong' })
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('disables both buttons and shows the saving label while saving', () => {
    renderForm({ saving: true })
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  describe('spec suggestions (machinery sell only)', () => {
    it('shows spec suggestion chips for a MACHINERY sell listing', () => {
      renderForm({ section: 'MACHINERY', intent: 'SELL' })
      expect(screen.getByRole('button', { name: 'Make' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Year' })).toBeInTheDocument()
    })

    it('does not show spec suggestion chips for SCRAP or REQUIREMENT listings', () => {
      renderForm({ section: 'SCRAP', intent: 'SELL' })
      expect(screen.queryByRole('button', { name: 'Make' })).not.toBeInTheDocument()

      renderForm({ section: 'MACHINERY', intent: 'REQUIREMENT' })
      expect(screen.queryAllByRole('button', { name: 'Make' })).toHaveLength(0)
    })

    it('inserts and removes a spec placeholder line in the description on toggle', async () => {
      const user = userEvent.setup()
      renderForm({ section: 'MACHINERY', intent: 'SELL' })

      const makeChip = screen.getByRole('button', { name: 'Make' })
      await user.click(makeChip)
      expect(screen.getByLabelText(/Description/)).toHaveValue('Make: ')
      expect(makeChip).toHaveClass('entity-form__chip--active')

      await user.click(makeChip)
      expect(screen.getByLabelText(/Description/)).toHaveValue('')
      expect(makeChip).not.toHaveClass('entity-form__chip--active')
    })

    it('does not make the spec optional fields mandatory on submit', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm({ section: 'MACHINERY', intent: 'SELL' })

      await user.type(screen.getByLabelText(/Title/), 'CNC Lathe')
      await user.click(screen.getByRole('button', { name: 'Post Listing' }))

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0].description).toBeNull()
    })

    it('adds a custom spec label via the "+ Other spec" input', async () => {
      const user = userEvent.setup()
      renderForm({ section: 'MACHINERY', intent: 'SELL' })

      await user.click(screen.getByRole('button', { name: '+ Other spec' }))
      await user.type(screen.getByPlaceholderText('Spec name'), 'Voltage{Enter}')

      expect(screen.getByLabelText(/Description/)).toHaveValue('Voltage: ')
    })
  })

  describe('scrap-specific title and condition', () => {
    it('hides the Condition field for a SCRAP listing but shows it otherwise', () => {
      renderForm({ section: 'SCRAP' })
      expect(screen.queryByText('Condition')).not.toBeInTheDocument()

      renderForm({ section: 'MACHINERY' })
      expect(screen.getByText('Condition')).toBeInTheDocument()
    })

    it('always submits a null condition for a SCRAP listing', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm({ section: 'SCRAP' })

      await user.type(screen.getByLabelText(/Title/), 'Mixed scrap')
      await user.click(screen.getByRole('button', { name: 'Post Listing' }))

      expect(onSubmit.mock.calls[0][0].condition).toBeNull()
    })

    it('auto-generates the SCRAP title from material/metal type and shape', async () => {
      const user = userEvent.setup()
      renderForm({ section: 'SCRAP' })

      await user.selectOptions(screen.getByLabelText('Material Type'), 'Metal')
      await user.selectOptions(screen.getByLabelText('Metal Type'), 'Copper')
      await user.selectOptions(screen.getByLabelText('Shape'), 'Sheet')

      expect(screen.getByLabelText(/Title/)).toHaveValue('Copper Sheet Scrap')
    })

    it('stops auto-generating the title once the user edits it directly', async () => {
      const user = userEvent.setup()
      renderForm({ section: 'SCRAP' })

      await user.selectOptions(screen.getByLabelText('Material Type'), 'Metal')
      await user.selectOptions(screen.getByLabelText('Metal Type'), 'Copper')
      await user.type(screen.getByLabelText(/Title/), ' - 50kg')
      await user.selectOptions(screen.getByLabelText('Shape'), 'Sheet')

      expect(screen.getByLabelText(/Title/)).toHaveValue('Copper Scrap - 50kg')
    })
  })
})
