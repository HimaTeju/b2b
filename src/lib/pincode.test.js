import { describe, it, expect, vi, afterEach } from 'vitest'
import { isValidPincode, lookupPincode } from './pincode'

afterEach(() => vi.unstubAllGlobals())

const stubFetch = (body, ok = true) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body }))

describe('isValidPincode', () => {
  it('accepts 6 digits not starting with 0', () => {
    expect(isValidPincode('560001')).toBe(true)
    expect(isValidPincode('060001')).toBe(false)
    expect(isValidPincode('56000')).toBe(false)
    expect(isValidPincode('56000a')).toBe(false)
  })
})

describe('lookupPincode', () => {
  it('returns district and state on success', async () => {
    stubFetch([{ Status: 'Success', PostOffice: [{ District: 'Bengaluru Urban', State: 'Karnataka' }] }])
    expect(await lookupPincode('560001')).toEqual({ city: 'Bengaluru Urban', state: 'Karnataka' })
  })

  it('returns null for an unknown pincode', async () => {
    stubFetch([{ Status: 'Error', PostOffice: null }])
    expect(await lookupPincode('999999')).toBeNull()
  })

  it('returns null without fetching for an invalid pincode', async () => {
    stubFetch([])
    expect(await lookupPincode('12')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects on a failed response', async () => {
    stubFetch({}, false)
    await expect(lookupPincode('560001')).rejects.toThrow()
  })
})
