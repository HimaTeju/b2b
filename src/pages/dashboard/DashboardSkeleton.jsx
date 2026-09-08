import Skeleton from '../../components/Skeleton'

/**
 * Loading placeholder for Dashboard, shaped like its stat row + activity
 * list so the layout doesn't jump once real data arrives.
 */
function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="dashboard__stats">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="stat-card">
            <Skeleton style={{ width: '2.5em', height: 28, marginBottom: 2 }} />
            <Skeleton style={{ width: '70%', height: 12 }} />
          </div>
        ))}
      </div>

      <div className="dashboard__section">
        <Skeleton style={{ width: 160, height: 18, marginBottom: 'var(--spacing-sm)' }} />
        <div className="dashboard__listings">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="listing-row">
              <Skeleton style={{ width: '50%', height: 15, marginBottom: 6 }} />
              <Skeleton style={{ width: '35%', height: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
