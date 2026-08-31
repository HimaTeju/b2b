import { describe, it, expect } from 'vitest'
import { sanitizeTerm } from './searchUtil'

describe('sanitizeTerm', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeTerm('  lathe  ')).toBe('lathe')
  })

  it('strips PostgREST or-filter grammar characters', () => {
    expect(sanitizeTerm('lathe,cnc(mill)')).toBe('lathe cnc mill')
  })

  it('strips ilike wildcard characters', () => {
    expect(sanitizeTerm('100%off')).toBe('100 off')
  })

  it('collapses runs of whitespace left behind by stripped characters', () => {
    expect(sanitizeTerm('a,,,b')).toBe('a b')
  })

  it('returns an empty string for input that is only special characters', () => {
    expect(sanitizeTerm('(),%')).toBe('')
  })

  it('leaves an ordinary search term unchanged', () => {
    expect(sanitizeTerm('CNC Milling Machine')).toBe('CNC Milling Machine')
  })
})
