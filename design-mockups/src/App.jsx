import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Browse from './pages/Browse'
import ListingDetail from './pages/ListingDetail'
import Placeholder from './pages/Placeholder'

function App() {
  const [theme, setTheme] = useState('a')

  return (
    <Routes>
      <Route path="/" element={<Shell theme={theme} setTheme={setTheme} />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="browse/:domainKey" element={<Browse />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="enquiries" element={<Placeholder title="Enquiries" />} />
        <Route path="profile" element={<Placeholder title="Profile" />} />
      </Route>
    </Routes>
  )
}

export default App
