import { NavLink } from 'react-router-dom'
import { Icon } from '../icons'

const TABS = [
  { to: '/', label: 'Home', icon: Icon.home, end: true },
  { to: '/explore', label: 'Explore', icon: Icon.grid },
  { to: '/enquiries', label: 'Enquiries', icon: Icon.inbox },
  { to: '/profile', label: 'Profile', icon: Icon.profile }
]

function BottomNav() {
  return (
    <nav className="bottomnav">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bottomnav__item${isActive ? ' bottomnav__item--active' : ''}`}
        >
          <span className="bottomnav__icon"><tab.icon width={22} height={22} /></span>
          <span className="bottomnav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
