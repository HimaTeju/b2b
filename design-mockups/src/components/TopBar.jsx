import { useNavigate } from 'react-router-dom'
import { Icon } from '../icons'

function TopBar({ isHome }) {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      {isHome ? (
        <p className="topbar__greeting">Good morning, Suresh</p>
      ) : (
        <button className="topbar__back" onClick={() => navigate(-1)} aria-label="Back">
          <Icon.back width={22} height={22} />
        </button>
      )}
    </header>
  )
}

export default TopBar
