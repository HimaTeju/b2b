import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <BottomNav />
      <div className="layout__main">
        <TopBar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
