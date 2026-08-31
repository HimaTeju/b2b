// Shared identity (code, label, route, accent color, icon) for the app's 4
// marketplace domains. Single source of truth for anything that renders the
// domain list — Home quicklinks, the Browse hub rail, etc.

export const DOMAINS = {
  marketplace: {
    key: 'marketplace',
    code: 'MP',
    label: 'Marketplace',
    blurb: 'Buy and sell machines, tools, and scrap',
    to: '/marketplace',
    accent: 'marketplace',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M6 8V6a6 6 0 0 1 12 0v2" />
        <path d="M4 8h16l-1.2 12.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" />
      </svg>
    )
  },
  services: {
    key: 'services',
    code: 'SV',
    label: 'Services',
    blurb: 'Get repair work done, or offer your repair service',
    to: '/services',
    accent: 'services',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L14.7 12z" />
        <path d="M14.7 6.3 18 3l3 3-3.3 3.3" />
      </svg>
    )
  },
  jobs: {
    key: 'jobs',
    code: 'JC',
    label: 'Jobs & Careers',
    blurb: 'Put up a job opening, or look for one',
    to: '/jobs',
    accent: 'jobs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    )
  },
  jobwork: {
    key: 'jobwork',
    code: 'JW',
    label: 'Job Work',
    blurb: 'Get job work done by someone, or take up job work',
    to: '/job-work',
    accent: 'jobwork',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
}

export const DOMAIN_LIST = Object.values(DOMAINS)

/**
 * Reorders DOMAIN_LIST for a given user — never removes a domain, only
 * changes prominence. Priority: domains with real recent activity (posted/
 * set up something there) rank by recency first, since actually doing
 * something is the strongest signal; domains only declared during
 * onboarding (no activity yet) come next in their default order; anything
 * neither declared nor used keeps the default order at the end.
 */
export function rankDomains(interests = [], activity = {}) {
  const interestSet = new Set(interests)

  return [...DOMAIN_LIST].sort((a, b) => {
    const aActivity = activity[a.key]
    const bActivity = activity[b.key]

    if (aActivity && bActivity) return aActivity < bActivity ? 1 : -1
    if (aActivity || bActivity) return aActivity ? -1 : 1

    const aInterested = interestSet.has(a.key)
    const bInterested = interestSet.has(b.key)
    if (aInterested !== bInterested) return aInterested ? -1 : 1

    return 0
  })
}
