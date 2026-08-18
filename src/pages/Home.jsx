import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings } from '../lib/api/listings'
import { getEnquiryCounts } from '../lib/api/enquiries'
import { getDomainActivity } from '../lib/api/activity'
import { DOMAIN_LIST, rankDomains } from '../lib/domains'
import './Home.css'

function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [domainOrder, setDomainOrder] = useState(DOMAIN_LIST)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    Promise.all([getMyListings(user.id), getEnquiryCounts(user.id)])
      .then(([listings, counts]) => {
        if (cancelled) return
        setActivity({
          activeListings: listings.filter(l => l.status === 'ACTIVE').length,
          unreadEnquiries: counts.unread
        })
      })
      .catch(err => console.error('Error loading home activity:', err))

    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user || !profile) return

    let cancelled = false

    getDomainActivity(user.id)
      .then(domainActivity => {
        if (cancelled) return
        setDomainOrder(rankDomains(profile.interests, domainActivity))
      })
      .catch(err => console.error('Error loading domain activity:', err))

    return () => { cancelled = true }
  }, [user, profile])

  return (
    <div className="home">
      {activity && (activity.activeListings > 0 || activity.unreadEnquiries > 0) && (
        <div className="home__activity">
          {activity.activeListings > 0 && (
            <span className="stamp stamp--ink">{activity.activeListings} active listing{activity.activeListings === 1 ? '' : 's'}</span>
          )}
          {activity.unreadEnquiries > 0 && (
            <button className="stamp stamp--solid stamp--marketplace" onClick={() => navigate('/enquiries')}>
              {activity.unreadEnquiries} unread enquir{activity.unreadEnquiries === 1 ? 'y' : 'ies'}
            </button>
          )}
        </div>
      )}

      <div className="home__quicklinks">
        {domainOrder.map(domain => (
          <button
            key={domain.code}
            className={`quicklink quicklink--${domain.accent}`}
            onClick={() => navigate(domain.to)}
          >
            <span className="quicklink__icon">{domain.icon}</span>
            <span className="quicklink__label">{domain.label}</span>
            {!domain.ready && <span className="quicklink__soon">Soon</span>}
          </button>
        ))}
      </div>

      <label className="home__search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input type="search" placeholder="Search machinery, tools, services..." />
      </label>
    </div>
  )
}

export default Home
