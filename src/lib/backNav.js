import { matchPath } from 'react-router-dom'

// The back button prefers real browser/router history (see canGoBack below)
// so it retraces the actual path the user followed — e.g. Browse
// Requirements > Post Requirement > back lands on Browse Requirements, not
// on whatever this route's parent is declared to be. BACK_ROUTES below is
// only the fallback for when there's no in-app history to pop: a shared
// link, a home-screen shortcut into a specific item, or an installed PWA
// relaunch on a platform that doesn't restore history. It declares, for
// every non-Home route, a sensible parent destination computed from the URL.
//
// Order matters within each group: a literal path (e.g. '/jobs/new') must
// come before a same-depth dynamic one ('/jobs/:id'), or the dynamic
// pattern would swallow the literal segment as if it were a param.
const BACK_ROUTES = [
  { path: '/marketplace/post/edit/:id', parent: ({ id }) => `/marketplace/${id}` },
  { path: '/marketplace/requirements/new', parent: '/marketplace/requirements' },
  { path: '/marketplace/sell/new', parent: '/marketplace' },
  { path: '/marketplace/requirements', parent: '/marketplace' },
  { path: '/marketplace/:id', parent: '/marketplace' },
  { path: '/marketplace', parent: '/' },

  { path: '/services/providers/:profileId', parent: '/services' },
  { path: '/services/provider/setup', parent: '/services' },
  { path: '/services/requirements/new', parent: '/services/requirements' },
  { path: '/services/requirements/edit/:id', parent: ({ id }) => `/services/requirements/${id}` },
  { path: '/services/requirements/:id', parent: '/services/requirements' },
  { path: '/services/requirements', parent: '/services' },
  { path: '/services', parent: '/' },

  { path: '/jobs/new', parent: '/jobs' },
  { path: '/jobs/edit/:id', parent: ({ id }) => `/jobs/${id}` },
  { path: '/jobs/seeker/setup', parent: '/jobs/seekers' },
  { path: '/jobs/seekers/:profileId', parent: '/jobs/seekers' },
  { path: '/jobs/seekers', parent: '/jobs' },
  { path: '/jobs/:id', parent: '/jobs' },
  { path: '/jobs', parent: '/' },

  { path: '/job-work/vendors/:profileId', parent: '/job-work' },
  { path: '/job-work/vendor/setup', parent: '/job-work' },
  { path: '/job-work/requirements/new', parent: '/job-work/requirements' },
  { path: '/job-work/requirements/edit/:id', parent: ({ id }) => `/job-work/requirements/${id}` },
  { path: '/job-work/requirements/:id', parent: '/job-work/requirements' },
  { path: '/job-work/requirements', parent: '/job-work' },
  { path: '/job-work', parent: '/' },

  { path: '/enquiries/:id', parent: '/enquiries' },
  { path: '/enquiries', parent: '/' },
  { path: '/dashboard', parent: '/' },
  { path: '/profile', parent: '/' },
  { path: '/browse', parent: '/' },
  { path: '/admin', parent: '/dashboard' }
]

/**
 * Resolves the back-button destination for a given pathname. Falls back to
 * Home for any route not explicitly listed (shouldn't happen for a route
 * that actually exists in App.jsx, but a safe default beats a dead button).
 */
export function getBackPath(pathname) {
  for (const route of BACK_ROUTES) {
    const match = matchPath({ path: route.path, end: true }, pathname)
    if (match) {
      return typeof route.parent === 'function' ? route.parent(match.params) : route.parent
    }
  }
  return '/'
}

/**
 * Whether there's an actual in-app history entry to pop back to. React
 * Router's history stack tags every entry it pushes with an incrementing
 * `idx` in `window.history.state`, starting at 0 for the first entry it
 * creates in this tab. `idx > 0` means the current entry was reached via at
 * least one in-app navigation, so `navigate(-1)` has something real to
 * return to. `idx === 0` (or missing, e.g. no window) means this is the
 * first entry — a shared link, a home-screen shortcut, or a fresh PWA
 * launch — so there's nothing to pop and callers should fall back to
 * `getBackPath`.
 */
export function canGoBack() {
  if (typeof window === 'undefined') return false
  const idx = window.history.state?.idx
  return typeof idx === 'number' && idx > 0
}
