import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings } from '../domains/marketplace/api/listings'
import { getMyServiceRequirements } from '../domains/services/api/serviceRequirements'
import { getMyServiceCapability } from '../domains/services/api/serviceCapabilities'
import { getMyJobWorkRequirements } from '../domains/jobwork/api/jobworkRequirements'
import { getMyJobWorkCapability } from '../domains/jobwork/api/jobworkCapabilities'
import { getMyJobPosts } from '../domains/jobs/api/jobPosts'
import { getMyJobSeekerProfile } from '../domains/jobs/api/jobSeekerProfiles'
import { getEnquiryCounts } from '../lib/api/enquiries'
import { getDomainActivity } from '../lib/api/activity'
import { DOMAINS, rankDomains } from '../lib/domains'
import { DASHBOARD_DOMAIN_CONFIG } from './dashboard/domainDashboardConfig'
import DomainSection from './dashboard/DomainSection'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [counts, setCounts] = useState({ sent: 0, received: 0, unread: 0 })
  const [domainData, setDomainData] = useState(null)
  const [domainOrder, setDomainOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [
        listings,
        serviceRequirements,
        serviceCapability,
        jobworkRequirements,
        jobworkCapability,
        jobPosts,
        jobSeekerProfile,
        countsData,
        activity
      ] = await Promise.all([
        getMyListings(user.id),
        getMyServiceRequirements(user.id),
        getMyServiceCapability(user.id),
        getMyJobWorkRequirements(user.id),
        getMyJobWorkCapability(user.id),
        getMyJobPosts(user.id),
        getMyJobSeekerProfile(user.id),
        getEnquiryCounts(user.id),
        getDomainActivity(user.id)
      ])

      const data = {
        marketplace: { records: listings || [], capability: null },
        services: { records: serviceRequirements || [], capability: serviceCapability },
        jobwork: { records: jobworkRequirements || [], capability: jobworkCapability },
        jobs: { records: jobPosts || [], capability: jobSeekerProfile }
      }

      setDomainData(data)
      setCounts(countsData)

      const visibleKeys = Object.keys(data).filter(
        key => data[key].records.length > 0 || !!data[key].capability
      )
      const ranked = rankDomains(profile?.interests, activity)
        .map(d => d.key)
        .filter(key => visibleKeys.includes(key))
      setDomainOrder(ranked)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleDeleteRecord = async (domainKey, record) => {
    const confirmed = window.confirm(`Delete "${record.title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      await DASHBOARD_DOMAIN_CONFIG[domainKey].deleteRecord(record)
      await loadDashboard()
    } catch (err) {
      console.error('Error deleting record:', err)
      setDeleteError('Failed to delete. Please try again.')
    }
  }

  const activeCount = domainData
    ? Object.values(domainData).reduce(
        (sum, { records }) => sum + records.filter(r => r.status === 'ACTIVE').length,
        0
      )
    : 0

  const topDomainKey = domainOrder[0] ?? 'marketplace'
  const topDomain = DOMAINS[topDomainKey]
  const topDomainConfig = DASHBOARD_DOMAIN_CONFIG[topDomainKey]

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <span className="eyebrow">Dashboard</span>
        <h1 className="dashboard__title">Your dashboard</h1>

        {error && <div className="banner">{error}</div>}
        {deleteError && <div className="banner">{deleteError}</div>}

        {loading ? (
          <div className="dashboard__loading">Loading…</div>
        ) : (
          <>
            <div className="dashboard__stats">
              <div className="stat-card">
                <div className="stat-card__value mono">{activeCount}</div>
                <div className="stat-card__label">Active posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value mono">{counts.received}</div>
                <div className="stat-card__label">Enquiries received</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value mono">{counts.sent}</div>
                <div className="stat-card__label">Enquiries sent</div>
              </div>
              <div className="stat-card stat-card--accent">
                <div className="stat-card__value mono">{counts.unread}</div>
                <div className="stat-card__label">Unread</div>
              </div>
            </div>

            {domainOrder.length === 0 ? (
              <div className="dashboard__section">
                <div className="dashboard__empty">
                  <p>You haven't posted anything yet.</p>
                  <button className="btn btn--primary" onClick={() => navigate('/marketplace/sell/new')}>
                    Create your first listing
                  </button>
                </div>
              </div>
            ) : (
              domainOrder.map(key => (
                <DomainSection
                  key={key}
                  domainKey={key}
                  records={domainData[key].records}
                  capability={domainData[key].capability}
                  onDeleteRecord={record => handleDeleteRecord(key, record)}
                />
              ))
            )}

            <div className="dashboard__section">
              <h2 className="dashboard__section-title">Quick actions</h2>
              <div className="dashboard__actions">
                <button className="action-card" onClick={() => navigate(topDomainConfig.newRecordPath)}>
                  <span>Post a {topDomainConfig.recordNounSingular}</span>
                </button>
                <button className="action-card" onClick={() => navigate('/enquiries')}>
                  <span>View enquiries</span>
                </button>
                <button className="action-card" onClick={() => navigate(topDomain.to)}>
                  <span>Browse {topDomain.label}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
