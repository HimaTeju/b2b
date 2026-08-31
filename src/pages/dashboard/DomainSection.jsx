import { useNavigate } from 'react-router-dom'
import { DOMAINS } from '../../lib/domains'
import { DASHBOARD_DOMAIN_CONFIG } from './domainDashboardConfig'

/**
 * One "my activity" card for a single domain on Dashboard — only rendered
 * for domains the user actually has something in (see Dashboard.jsx's
 * visibility check), so what shows is driven by what the user has done,
 * not a fixed set of sections.
 */
function DomainSection({ domainKey, records, capability, onDeleteRecord, onToggleAdvertise }) {
  const navigate = useNavigate()
  const domain = DOMAINS[domainKey]
  const config = DASHBOARD_DOMAIN_CONFIG[domainKey]

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2 className="dashboard__section-title">
          <span className={`stamp stamp--${domain.accent}`}>{domain.code}</span> {domain.label}
        </h2>
        <button className="btn btn--sm btn--primary" onClick={() => navigate(config.newRecordPath)}>
          + Post new
        </button>
      </div>

      {config.secondaryAction && (
        <button className="dashboard__secondary-link" onClick={() => navigate(config.secondaryAction.path)}>
          {config.secondaryAction.label}
        </button>
      )}

      {config.capability && capability && (
        <button className="capability-row" onClick={() => navigate(config.capability.editPath)}>
          <span>{config.capability.label}</span>
          <span className={`stamp ${capability.is_active ? 'stamp--positive' : 'stamp--muted'}`}>
            {capability.is_active ? 'Active' : 'Paused'}
          </span>
        </button>
      )}

      {records.length === 0 ? (
        !capability && (
          <div className="dashboard__empty">
            <p>You haven't posted a {config.recordNounSingular} yet.</p>
          </div>
        )
      ) : (
        <div className="dashboard__listings">
          {records.map(record => (
            <div key={record.id} className="listing-row">
              <div className="listing-row__main" onClick={() => navigate(config.viewRecordPath(record.id))}>
                <div className="listing-row__badges">
                  {config.recordBadge && <span className="stamp stamp--ink">{config.recordBadge(record)}</span>}
                  <span className={`stamp ${record.status === 'ACTIVE' ? 'stamp--positive' : 'stamp--muted'}`}>
                    {record.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="listing-row__title">{record.title}</h3>
                <p className="listing-row__meta mono">{config.recordMeta(record)}</p>
              </div>
              <div className="listing-row__actions">
                {config.canAdvertise?.(record) && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => onToggleAdvertise(record)}
                  >
                    {record.is_advertised ? 'Un-boost' : 'Boost this post'}
                  </button>
                )}
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => navigate(config.editRecordPath(record.id))}
                >
                  Edit
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => onDeleteRecord(record)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DomainSection
