import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import ThemeSwitcher from './ThemeSwitcher'

function Shell({ theme, setTheme }) {
  const location = useLocation()

  return (
    <div className="phone">
      <div className="app" data-theme={theme}>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
        <TopBar isHome={location.pathname === '/'} />
        <main className="app__content">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

export default Shell
