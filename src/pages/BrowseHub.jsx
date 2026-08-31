import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DOMAINS } from '../lib/domains'
import { SECTIONS, SECTION_LABELS, SECTION_PATH } from '../lib/constants'
import './BrowseHub.css'

const ICONS = {
  browse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  post: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  list: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  badge: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  signout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  placeholder: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 3" />
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.6-2.4 2-2.4 3.4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

const RAIL_ICONS = {
  top: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
  activity: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  provider: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" />
    </svg>
  ),
  account: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function RAIL(logout, navigate) {
  const marketplaceRailItems = SECTIONS.map(section => {
    const base = `/marketplace${SECTION_PATH[section]}`

    return {
      key: `marketplace-${section}`,
      code: DOMAINS.marketplace.code,
      label: SECTION_LABELS[section],
      accent: DOMAINS.marketplace.accent,
      icon: DOMAINS.marketplace.icon,
      groups: [
        {
          question: 'Looking to buy?',
          tiles: [
            { label: 'Browse Listings', icon: ICONS.browse, to: base },
            { label: 'Post a Requirement', icon: ICONS.post, to: `${base}/requirements/new` }
          ]
        },
        {
          question: 'Looking to sell?',
          tiles: [
            { label: 'Sell Something', icon: ICONS.post, to: `${base}/sell/new` },
            { label: 'Browse Requirements', icon: ICONS.browse, to: `${base}/requirements` }
          ]
        }
      ]
    }
  })

  return [
    {
      key: 'top',
      code: 'TP',
      label: 'Top Picks',
      accent: 'ink',
      icon: RAIL_ICONS.top,
      tiles: [
        { label: 'Placeholder 1', icon: ICONS.placeholder, placeholder: true },
        { label: 'Placeholder 2', icon: ICONS.placeholder, placeholder: true },
        { label: 'Placeholder 3', icon: ICONS.placeholder, placeholder: true },
        { label: 'Placeholder 4', icon: ICONS.placeholder, placeholder: true }
      ]
    },
    ...marketplaceRailItems,
    {
      key: 'services',
      code: DOMAINS.services.code,
      label: DOMAINS.services.label,
      accent: DOMAINS.services.accent,
      icon: DOMAINS.services.icon,
      groups: [
        {
          question: 'Need a service?',
          tiles: [
            { label: 'Find a Provider', icon: ICONS.browse, to: '/services' },
            { label: 'Post a Repair Requirement', icon: ICONS.post, to: '/services/requirements/new' }
          ]
        },
        {
          question: 'Offer a service?',
          tiles: [
            { label: 'Offer Repair Services', icon: ICONS.badge, to: '/services/provider/setup' },
            { label: 'Browse Requirements', icon: ICONS.browse, to: '/services/requirements' }
          ]
        }
      ]
    },
    {
      key: 'jobs',
      code: DOMAINS.jobs.code,
      label: DOMAINS.jobs.label,
      accent: DOMAINS.jobs.accent,
      icon: DOMAINS.jobs.icon,
      groups: [
        {
          question: 'Looking for work?',
          tiles: [
            { label: 'Browse Job Posts', icon: ICONS.browse, to: '/jobs' },
            { label: 'Build a Job Seeker Profile', icon: ICONS.badge, to: '/jobs/seeker/setup' }
          ]
        },
        {
          question: 'Hiring?',
          tiles: [
            { label: 'Post a Job', icon: ICONS.post, to: '/jobs/new' },
            { label: 'Browse Job Seekers', icon: ICONS.browse, to: '/jobs/seekers' }
          ]
        }
      ]
    },
    {
      key: 'jobwork',
      code: DOMAINS.jobwork.code,
      label: DOMAINS.jobwork.label,
      accent: DOMAINS.jobwork.accent,
      icon: DOMAINS.jobwork.icon,
      groups: [
        {
          question: 'Need work done?',
          tiles: [
            { label: 'Find a Vendor', icon: ICONS.browse, to: '/job-work' },
            { label: 'Post Job Work', icon: ICONS.post, to: '/job-work/requirements/new' }
          ]
        },
        {
          question: 'Can you take on work?',
          tiles: [
            { label: 'Offer Job Work Capacity', icon: ICONS.badge, to: '/job-work/vendor/setup' },
            { label: 'Browse Requirements', icon: ICONS.browse, to: '/job-work/requirements' }
          ]
        }
      ]
    },
    {
      key: 'packersmovers',
      code: DOMAINS.packersmovers.code,
      label: DOMAINS.packersmovers.label,
      accent: DOMAINS.packersmovers.accent,
      icon: DOMAINS.packersmovers.icon,
      groups: [
        {
          question: 'Need something moved?',
          tiles: [
            { label: 'Find a Mover', icon: ICONS.browse, to: '/packers-movers' },
            { label: 'Request Machine Lifting', icon: ICONS.post, to: '/packers-movers/requirements/machine-lifting/new' },
            { label: 'Request Shop Lifting', icon: ICONS.post, to: '/packers-movers/requirements/shop-lifting/new' }
          ]
        },
        {
          question: 'Can you move things?',
          tiles: [
            { label: 'Offer Lifting Services', icon: ICONS.badge, to: '/packers-movers/vendor/setup' },
            { label: 'Browse Requirements', icon: ICONS.browse, to: '/packers-movers/requirements' }
          ]
        }
      ]
    },
    {
      key: 'activity',
      code: 'MA',
      label: 'My Activity',
      accent: 'ink',
      icon: RAIL_ICONS.activity,
      tiles: [
        { label: 'My Listings', icon: ICONS.list, to: '/dashboard' },
        { label: 'Enquiries', icon: ICONS.inbox, to: '/enquiries' }
      ]
    },
    {
      key: 'provider',
      code: 'BP',
      label: 'Become a Provider',
      accent: 'ink',
      icon: RAIL_ICONS.provider,
      tiles: [
        { label: 'Offer Repair Services', icon: ICONS.badge, to: '/services/provider/setup' },
        { label: 'Offer Job Work Capacity', icon: ICONS.badge, to: '/job-work/vendor/setup' },
        { label: 'Become a Job Seeker', icon: ICONS.badge, to: '/jobs/seeker/setup' },
        { label: 'Offer Lifting Services', icon: ICONS.badge, to: '/packers-movers/vendor/setup' }
      ]
    },
    {
      key: 'account',
      code: 'AH',
      label: 'Account & Help',
      accent: 'ink',
      icon: RAIL_ICONS.account,
      tiles: [
        { label: 'Profile', icon: ICONS.profile, to: '/profile' },
        { label: 'Help', icon: ICONS.help, to: '/help' },
        { label: 'Sign Out', icon: ICONS.signout, action: async () => { await logout(); navigate('/login') } }
      ]
    }
  ]
}

function BrowseHub() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeKey, setActiveKey] = useState('top')

  const rail = RAIL(logout, navigate)
  const activeSection = rail.find(section => section.key === activeKey)

  const handleTile = (tile) => {
    if (tile.placeholder) return
    if (tile.action) {
      tile.action()
    } else if (tile.to) {
      navigate(tile.to)
    }
  }

  return (
    <div className="browse-hub">
      <nav className="browse-hub__rail">
        {rail.map(section => (
          <button
            key={section.key}
            className={`browse-hub__rail-item browse-hub__rail-item--${section.accent}${activeKey === section.key ? ' browse-hub__rail-item--active' : ''}`}
            onClick={() => setActiveKey(section.key)}
          >
            <span className="browse-hub__rail-icon">{section.icon}</span>
            <span className="browse-hub__rail-label">{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="browse-hub__panel">
        <h2 className="browse-hub__panel-title">{activeSection.label}</h2>

        {activeSection.groups ? (
          activeSection.groups.map(group => (
            <div key={group.question} className="browse-hub__group">
              <p className="browse-hub__question">{group.question}</p>
              <div className="browse-hub__tiles">
                {group.tiles.map(tile => (
                  <button
                    key={tile.label}
                    className="browse-hub__tile"
                    onClick={() => handleTile(tile)}
                  >
                    <span className={`browse-hub__tile-icon browse-hub__tile-icon--${activeSection.accent}`}>{tile.icon}</span>
                    <span className="browse-hub__tile-label">{tile.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="browse-hub__tiles">
            {activeSection.tiles.map(tile => (
              <button
                key={tile.label}
                className={`browse-hub__tile${tile.placeholder ? ' browse-hub__tile--placeholder' : ''}`}
                onClick={() => handleTile(tile)}
              >
                <span className={`browse-hub__tile-icon browse-hub__tile-icon--${activeSection.accent}`}>{tile.icon}</span>
                <span className="browse-hub__tile-label">{tile.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseHub
