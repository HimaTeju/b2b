import { useState, useEffect, useCallback } from 'react'
import {
  getAllUsers, setUserActive,
  getAllListings, setListingActive,
  getAllServiceProviders, setServiceProviderActive,
  getAllServiceRequirements, setServiceRequirementActive,
  getAllJobPosts, setJobPostActive,
  getAllJobSeekers, setJobSeekerActive,
  getAllJobWorkVendors, setJobWorkVendorActive,
  getAllJobWorkRequirements, setJobWorkRequirementActive
} from '../lib/api/admin'
import './Admin.css'

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'services', label: 'Services' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'jobwork', label: 'Job work' }
]

const companyMeta = row => {
  const location = [row.city, row.state].filter(Boolean).join(', ') || '—'
  const company = row.profiles?.company_name || 'Unknown business'
  return `${company} · ${location}`
}

// Grounded in the moderation actions the schema actually supports —
// profiles.status (ACTIVE/SUSPENDED) and the ACTIVE/INACTIVE or is_active
// flag every listing/requirement/capability table has. Wired to Supabase via
// lib/api/admin.js, gated by the admin-only RLS policies in
// 021_admin_role.sql.
const SECTIONS = [
  {
    id: 'users',
    tab: 'users',
    title: 'Users',
    description: "Suspend or reactivate a user's account.",
    emptyLabel: 'No users to review yet.',
    idField: 'id',
    getAll: getAllUsers,
    setActive: setUserActive,
    isActive: row => row.status === 'ACTIVE',
    inactiveLabel: 'Suspended',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Suspend',
    getRowTitle: row => row.company_name || 'Unnamed account',
    getRowMeta: row => [row.city, row.state].filter(Boolean).join(', ') || '—'
  },
  {
    id: 'listings',
    tab: 'marketplace',
    title: 'Listings',
    description: 'Deactivate or reactivate a listing across Machinery, Tools & Accessories, and Scrap.',
    emptyLabel: 'No listings to review yet.',
    idField: 'id',
    getAll: getAllListings,
    setActive: setListingActive,
    isActive: row => row.status === 'ACTIVE',
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  },
  {
    id: 'service-providers',
    tab: 'services',
    title: 'Service providers',
    description: 'Deactivate or reactivate a service provider profile.',
    emptyLabel: 'No service providers to review yet.',
    idField: 'profile_id',
    getAll: getAllServiceProviders,
    setActive: setServiceProviderActive,
    isActive: row => row.is_active,
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  },
  {
    id: 'service-requirements',
    tab: 'services',
    title: 'Service requirements',
    description: 'Deactivate or reactivate a posted service requirement.',
    emptyLabel: 'No service requirements to review yet.',
    idField: 'id',
    getAll: getAllServiceRequirements,
    setActive: setServiceRequirementActive,
    isActive: row => row.status === 'ACTIVE',
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  },
  {
    id: 'job-posts',
    tab: 'jobs',
    title: 'Job posts',
    description: 'Deactivate or reactivate a job vacancy.',
    emptyLabel: 'No job posts to review yet.',
    idField: 'id',
    getAll: getAllJobPosts,
    setActive: setJobPostActive,
    isActive: row => row.status === 'ACTIVE',
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  },
  {
    id: 'job-seekers',
    tab: 'jobs',
    title: 'Job seekers',
    description: 'Deactivate or reactivate a job seeker profile.',
    emptyLabel: 'No job seekers to review yet.',
    idField: 'profile_id',
    getAll: getAllJobSeekers,
    setActive: setJobSeekerActive,
    isActive: row => row.is_active,
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.headline || 'Job seeker',
    getRowMeta: companyMeta
  },
  {
    id: 'jobwork-vendors',
    tab: 'jobwork',
    title: 'Job work vendors',
    description: 'Deactivate or reactivate a job work vendor profile.',
    emptyLabel: 'No job work vendors to review yet.',
    idField: 'profile_id',
    getAll: getAllJobWorkVendors,
    setActive: setJobWorkVendorActive,
    isActive: row => row.is_active,
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  },
  {
    id: 'jobwork-requirements',
    tab: 'jobwork',
    title: 'Job work requirements',
    description: 'Deactivate or reactivate a posted job work requirement.',
    emptyLabel: 'No job work requirements to review yet.',
    idField: 'id',
    getAll: getAllJobWorkRequirements,
    setActive: setJobWorkRequirementActive,
    isActive: row => row.status === 'ACTIVE',
    inactiveLabel: 'Inactive',
    activateLabel: 'Reactivate',
    deactivateLabel: 'Deactivate',
    getRowTitle: row => row.title,
    getRowMeta: companyMeta
  }
]

function AdminSection({ section, rows, pendingKey, onToggle }) {
  return (
    <div className="admin__section">
      <h2 className="admin__section-title">{section.title}</h2>
      <p className="admin__section-description">{section.description}</p>

      {rows.length === 0 ? (
        <div className="admin__empty">{section.emptyLabel}</div>
      ) : (
        <div className="admin__rows">
          {rows.map(row => {
            const id = row[section.idField]
            const key = `${section.id}:${id}`
            const active = section.isActive(row)
            const isPending = pendingKey === key

            return (
              <div key={id} className="admin-row">
                <div className="admin-row__main">
                  <div className="admin-row__badges">
                    <span className={`stamp ${active ? 'stamp--positive' : 'stamp--muted'}`}>
                      {active ? 'Active' : section.inactiveLabel}
                    </span>
                  </div>
                  <h3 className="admin-row__title">{section.getRowTitle(row)}</h3>
                  <p className="admin-row__meta mono">{section.getRowMeta(row)}</p>
                </div>
                <div className="admin-row__actions">
                  <button
                    className={`btn btn--sm ${active ? 'btn--danger' : 'btn--primary'}`}
                    disabled={isPending}
                    onClick={() => onToggle(section, row)}
                  >
                    {isPending ? '…' : active ? section.deactivateLabel : section.activateLabel}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Admin() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [dataBySection, setDataBySection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingKey, setPendingKey] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.all(SECTIONS.map(section => section.getAll()))
      const next = {}
      SECTIONS.forEach((section, i) => { next[section.id] = results[i] || [] })
      setDataBySection(next)
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = async (section, row) => {
    const id = row[section.idField]
    const key = `${section.id}:${id}`

    setActionError('')
    setPendingKey(key)
    try {
      const updated = await section.setActive(id, !section.isActive(row))
      setDataBySection(prev => ({
        ...prev,
        [section.id]: prev[section.id].map(r => (r[section.idField] === id ? { ...r, ...updated } : r))
      }))
    } catch (err) {
      console.error('Error updating status:', err)
      setActionError('Failed to update status. Please try again.')
    } finally {
      setPendingKey(null)
    }
  }

  const currentSections = SECTIONS.filter(section => section.tab === activeTab)

  return (
    <div className="admin">
      <div className="admin__container">
        <span className="eyebrow">Admin</span>
        <h1 className="admin__title">Admin panel</h1>

        <div className="admin__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin__tab ${activeTab === tab.id ? 'admin__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="banner">{error}</div>}
        {actionError && <div className="banner">{actionError}</div>}

        {loading ? (
          <div className="admin__loading">Loading…</div>
        ) : (
          currentSections.map(section => (
            <AdminSection
              key={section.id}
              section={section}
              rows={dataBySection[section.id] || []}
              pendingKey={pendingKey}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Admin
