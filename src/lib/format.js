export function formatPrice(price) {
  if (price === null || price === undefined) return 'Contact for price'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price)
}

export function formatListingPrice(listing) {
  // Rent prices are monthly; every other section is a one-off price.
  const perMonth = listing.deal_type === 'RENT' ? '/month' : ''
  if (listing.intent === 'REQUIREMENT') {
    return listing.price ? `Budget ${formatPrice(listing.price)}${perMonth}` : 'Budget: open to offers'
  }
  return listing.price === null || listing.price === undefined
    ? formatPrice(listing.price)
    : `${formatPrice(listing.price)}${perMonth}`
}

export function formatLocation({ city, state } = {}) {
  if (city && state) return `${city}, ${state}`
  return city || state || 'Location not specified'
}

export function formatRelativeDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return '1d ago'
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}
