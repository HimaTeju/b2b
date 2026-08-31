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
    await user.type(screen.getByLabelText('Material Type'), 'Copper')
    await user.type(screen.getByLabelText('Shape'), 'Rod')
    await user.type(screen.getByLabelText('Weight'), '12.5')
    await user.click(screen.getByRole('button', { name: 'Post Listing' }))

    const [payload] = onSubmit.mock.calls[0]
    expect(payload).toMatchObject({
      machine_category_id: null,
      material_type: 'Copper',
      shape: 'Rod',
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
})
