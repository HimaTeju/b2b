import { useState, useEffect } from 'react'
import { isValidPincode, lookupPincode } from '../lib/pincode'

/**
 * Pincode + city + state row. Entering a valid 6-digit pincode autofills city
 * and state (both stay editable). The pincode is only a lookup aid — it is not
 * stored. `idPrefix`/`labelPrefix` let a form render two of these (pickup/drop).
 */
function LocationFields({ city, state, onChange, idPrefix = '', labelPrefix = '', cityPlaceholder = 'e.g. Coimbatore', statePlaceholder = 'e.g. Tamil Nadu' }) {
  const [pincode, setPincode] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | found | notfound | error

  useEffect(() => {
    if (!isValidPincode(pincode)) return undefined
    const controller = new AbortController()
    setStatus('loading')
    lookupPincode(pincode, { signal: controller.signal })
      .then(result => {
        if (result) {
          onChange({ city: result.city, state: result.state })
          setStatus('found')
        } else {
          setStatus('notfound')
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') setStatus('error')
      })
    return () => controller.abort()
    // onChange is a fresh closure each render; the lookup should re-run only when the pincode changes.
  }, [pincode])

  const handlePincode = (e) => {
    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
    setStatus('idle')
  }

  const label = (text) => (labelPrefix ? `${labelPrefix} ${text.toLowerCase()}` : text)
  const id = (name) => `${idPrefix}${name}`
  const hint = {
    loading: 'Looking up pincode…',
    found: 'City and state filled from pincode — edit if needed.',
    notfound: 'Pincode not found — enter city and state manually.',
    error: "Couldn't look up pincode — enter city and state manually."
  }[status]

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor={id('pincode')}>{label('Pincode')}</label>
        <input
          id={id('pincode')}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={pincode}
          onChange={handlePincode}
          placeholder="e.g. 560001"
        />
        {hint && <span className="field__hint" role="status">{hint}</span>}
      </div>
      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor={id('city')}>{label('City')}</label>
          <input id={id('city')} type="text" value={city} onChange={(e) => onChange({ city: e.target.value, state })} placeholder={cityPlaceholder} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor={id('state')}>{label('State')}</label>
          <input id={id('state')} type="text" value={state} onChange={(e) => onChange({ city, state: e.target.value })} placeholder={statePlaceholder} />
        </div>
      </div>
    </>
  )
}

export default LocationFields
