import { matchPath } from 'react-router-dom'

// Declares, for every non-Home route, where its back button goes — a real
// destination computed from the URL, not browser history. `navigate(-1)`
// silently breaks the moment there's no history to pop (a shared link, a
// home-screen shortcut into a specific item, or an installed PWA relaunch
// on a platform that doesn't restore history) — which matters a lot more
// here than in a regular website, since the installed PWA has no OS
// chrome back button to fall back on either.
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
