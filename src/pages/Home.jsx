import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListingTypes } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './Home.css'

function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [listingTypes, setListingTypes] = useState([])

  useEffect(() => {
    loadListingTypes()
  }, [])

  const loadListingTypes = async () => {
    try {
      const types = await getListingTypes()
      setListingTypes(types)
    } catch (err) {
      console.error('Error loading listing types:', err)
    }
  }

  const categoryTiles = [
    {
      id: 'machinery-used',
      icon: '🏗️',
      title: 'Used Machines',
      subtitle: 'Buy & sell',
      color: 'var(--tile-orange)',
      filter: { typeCode: 'machinery', mode: 'sell', subcategory: 'used' }
    },
    {
      id: 'accessories',
      icon: '🔧',
      title: 'Accessories & Tools',
      subtitle: 'Essential parts',
      color: 'var(--tile-blue)',
      filter: { typeCode: 'accessories', mode: null, subcategory: null }
    },
    {
      id: 'repair',
      icon: '⚙️',
      title: 'Service & Repair',
      subtitle: 'Professional help',
      color: 'var(--tile-green)',
      filter: { typeCode: 'repair', mode: null, subcategory: null }
    },
    {
      id: 'job',
      icon: '👥',
      title: 'Hire Technicians',
      subtitle: 'Find skilled labor',
      color: 'var(--tile-yellow)',
      filter: { typeCode: 'job', mode: 'sell', subcategory: 'contract' }
    },
    {
      id: 'rental',
      icon: '📦',
      title: 'Machine Rentals',
      subtitle: 'Rent equipment',
      color: 'var(--tile-teal)',
      filter: { typeCode: 'rental', mode: 'sell', subcategory: null }
    },
    {
      id: 'machinery-new',
      icon: '✨',
      title: 'New Machines',
      subtitle: 'Latest models',
      color: 'var(--tile-purple)',
      filter: { typeCode: 'machinery', mode: 'sell', subcategory: 'new' }
    }
  ]

  const handleTileClick = (tile) => {
    const type = listingTypes.find(t => t.code.toLowerCase() === tile.filter.typeCode)

    const params = new URLSearchParams()
    if (type) params.append('type', type.id)
    if (tile.filter.mode) params.append('mode', tile.filter.mode)
    if (tile.filter.subcategory) params.append('subcategory', tile.filter.subcategory)

    navigate(`/browse?${params.toString()}`)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="home">
      <header className="home__hero">
        <p className="home__eyebrow">ALL SERVICES</p>
        <h1 className="home__title">What do you need today?</h1>
        <p className="home__subtitle">
          Every industrial need covered — buy, sell, hire, rent, repair, or advertise.
        </p>
      </header>

      <div className="home__grid">
        {categoryTiles.map(tile => (
          <button
            key={tile.id}
            className="category-tile"
            onClick={() => handleTileClick(tile)}
            style={{ '--tile-color': tile.color }}
          >
            <div className="category-tile__icon">{tile.icon}</div>
            <h3 className="category-tile__title">{tile.title}</h3>
            <p className="category-tile__subtitle">{tile.subtitle}</p>
          </button>
        ))}
      </div>

      <section className="home__quick-actions">
        <h2 className="home__section-title">Quick actions</h2>
        <div className="home__actions">
          <button
            className="action-card"
            onClick={() => navigate('/browse')}
          >
            <span className="action-card__icon">🔍</span>
            <span className="action-card__label">Browse all</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate('/post')}
          >
            <span className="action-card__icon">➕</span>
            <span className="action-card__label">Post listing</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate('/dashboard')}
          >
            <span className="action-card__icon">📊</span>
            <span className="action-card__label">My dashboard</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home
