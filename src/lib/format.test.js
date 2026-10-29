import { describe, it, expect } from 'vitest'
import { formatPrice, formatListingPrice, formatFundingAmount, formatLocation, formatRelativeDate } from './format'

describe('formatPrice', () => {
  it('formats a number as INR currency with no decimals', () => {
    expect(formatPrice(150000)).toBe('₹1,50,000')
  })

  it('falls back to "Contact for price" for null', () => {
    expect(formatPrice(null)).toBe('Contact for price')
  })

  it('falls back to "Contact for price" for undefined', () => {
    expect(formatPrice(undefined)).toBe('Contact for price')
  })

  it('formats zero as a real price, not a fallback', () => {
    expect(formatPrice(0)).toBe('₹0')
  })
})

describe('formatListingPrice', () => {
  it('shows rent prices per month', () => {
    expect(formatListingPrice({ intent: 'SELL', deal_type: 'RENT', price: 25000 })).toBe('₹25,000/month')
  })

  it('shows a monthly requirement budget for rent', () => {
    expect(formatListingPrice({ intent: 'REQUIREMENT', deal_type: 'RENT', price: 25000 })).toBe('Budget ₹25,000/month')
  })

  it('does not add /month to a rent listing with no price', () => {
    expect(formatListingPrice({ intent: 'SELL', deal_type: 'RENT', price: null })).toBe('Contact for price')
  })

  it('prefixes a requirement price with "Budget"', () => {
    expect(formatListingPrice({ intent: 'REQUIREMENT', price: 5000 })).toBe('Budget ₹5,000')
  })

  it('shows an open-to-offers message for a requirement with no price', () => {
    expect(formatListingPrice({ intent: 'REQUIREMENT', price: null })).toBe('Budget: open to offers')
  })

  it('formats a sell listing price directly, without the Budget prefix', () => {
    expect(formatListingPrice({ intent: 'SELL', price: 20000 })).toBe('₹20,000')
  })
})

describe('formatFundingAmount', () => {
  it('shows the amount sought', () => {
    expect(formatFundingAmount(5000000)).toBe('Seeking ₹50,00,000')
  })

  it('falls back to open-to-discuss for no amount', () => {
    expect(formatFundingAmount(null)).toBe('Amount: open to discuss')
  })
})

describe('formatLocation', () => {
  it('joins city and state', () => {
    expect(formatLocation({ city: 'Coimbatore', state: 'Tamil Nadu' })).toBe('Coimbatore, Tamil Nadu')
  })

  it('falls back to just the city when state is missing', () => {
    expect(formatLocation({ city: 'Coimbatore' })).toBe('Coimbatore')
  })

  it('falls back to just the state when city is missing', () => {
    expect(formatLocation({ state: 'Tamil Nadu' })).toBe('Tamil Nadu')
  })

  it('falls back to a placeholder when neither is set', () => {
    expect(formatLocation({})).toBe('Location not specified')
  })

  it('falls back to a placeholder when called with no argument', () => {
    expect(formatLocation()).toBe('Location not specified')
  })
})

describe('formatRelativeDate', () => {
  it('reports "Just now" for a timestamp under an hour old', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000)
    expect(formatRelativeDate(date.toISOString())).toBe('Just now')
  })

  it('reports hours ago for a timestamp under a day old', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000)
    expect(formatRelativeDate(date.toISOString())).toBe('5h ago')
  })

  it('reports "1d ago" for a timestamp between 1 and 2 days old', () => {
    const date = new Date(Date.now() - 30 * 60 * 60 * 1000)
    expect(formatRelativeDate(date.toISOString())).toBe('1d ago')
  })

  it('reports days ago for a timestamp under a week old', () => {
    const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    expect(formatRelativeDate(date.toISOString())).toBe('4d ago')
  })

  it('falls back to a locale date string for anything a week or older', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    expect(formatRelativeDate(date.toISOString())).toBe(date.toLocaleDateString())
  })
})
