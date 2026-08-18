import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import OnboardingModal from './OnboardingModal'
import './Layout.css'

function Layout() {
  const { profile } = useAuth()

  return (
    <div className="layout">
      <BottomNav />
      <div className="layout__main">
        <TopBar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      {profile && !profile.onboarded_at && <OnboardingModal />}
    </div>
  )
}

export default Layout
