import { describe, it, expect } from 'vitest'
import { getBackPath } from './backNav'

describe('getBackPath', () => {
  it('sends a listing edit page back to the listing detail page (parent resolved from params)', () => {
    expect(getBackPath('/marketplace/post/edit/abc-123')).toBe('/marketplace/abc-123')
  })

  it('sends the new-requirement form back to the requirements browse page', () => {
    expect(getBackPath('/marketplace/requirements/new')).toBe('/marketplace/requirements')
  })

  it('does not let the dynamic listing-detail route swallow a literal sibling route', () => {
    // /marketplace/requirements must match its own literal entry, not the
    // dynamic /marketplace/:id pattern earlier route ordering would produce.
    expect(getBackPath('/marketplace/requirements')).toBe('/marketplace')
  })

  it('resolves a dynamic listing detail route to the browse page', () => {
    expect(getBackPath('/marketplace/some-listing-id')).toBe('/marketplace')
  })

  it('resolves a job-work requirement edit route with an id param', () => {
    expect(getBackPath('/job-work/requirements/edit/req-1')).toBe('/job-work/requirements/req-1')
  })

  it('falls back to Home for an unrecognized path', () => {
    expect(getBackPath('/some/unknown/route')).toBe('/')
  })

  it('sends the admin page back to the dashboard', () => {
    expect(getBackPath('/admin')).toBe('/dashboard')
  })
})
