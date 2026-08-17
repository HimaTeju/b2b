import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './TopBar.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const isHome = location.pathname === '/'
  const displayName = profile?.company_name || user?.user_metadata?.full_name

  return (
    <header className="topbar">
      {isHome ? (
        <p className="topbar__greeting">
          {getGreeting()}{displayName ? `, ${displayName}` : ''}
        </p>
      ) : (
        <button className="topbar__mark" onClick={() => navigate('/')}>
          <span className="topbar__mark-main">B2B WORKS</span>
          <span className="topbar__mark-sub eyebrow">Industrial Exchange</span>
        </button>
      )}
    </header>
  )
}

export default TopBar
