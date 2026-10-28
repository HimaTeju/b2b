const PINCODE_API = 'https://api.postalpincode.in/pincode'

export function isValidPincode(value) {
  return /^[1-9][0-9]{5}$/.test(value)
}

/**
 * Resolve an Indian PIN code to { city, state } via the India Post API.
 * city is the postal district (the closest match to what users enter as
 * "city"). Resolves to null when the PIN is unknown; rejects on network
 * errors so callers can tell "not found" from "couldn't check".
 */
export async function lookupPincode(pincode, { signal } = {}) {
  if (!isValidPincode(pincode)) return null
  const res = await fetch(`${PINCODE_API}/${pincode}`, { signal })
  if (!res.ok) throw new Error(`Pincode lookup failed (${res.status})`)
  const data = await res.json()
  const entry = Array.isArray(data) ? data[0] : null
  const office = entry?.Status === 'Success' ? entry.PostOffice?.[0] : null
  if (!office?.District || !office?.State) return null
  return { city: office.District, state: office.State }
}
