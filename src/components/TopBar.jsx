import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canGoBack, getBackPath } from '../lib/backNav'
import './TopBar.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Every non-Home page gets the same back button here, instead of each page
 * rolling its own — see lib/backNav.js for how it picks between real
 * history and a declared parent path.
 */
function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const isHome = location.pathname === '/'
  const displayName = profile?.company_name || user?.user_metadata?.full_name

  const handleBack = () => {
    if (canGoBack()) {
      navigate(-1)
    } else {
      navigate(getBackPath(location.pathname))
    }
  }

  return (
    <header className="topbar">
      {isHome ? (
        <p className="topbar__greeting">
          {getGreeting()}{displayName ? `, ${displayName}` : ''}
        </p>
      ) : (
        <button
          className="topbar__back"
          onClick={handleBack}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      )}
    </header>
  )
}

export default TopBar
