import Skeleton from '../../../components/Skeleton'

function ListingDetailSkeleton() {
  return (
    <div className="listing-detail" aria-hidden="true">
      <div className="listing-detail__layout">
        <div className="listing-detail__gallery">
          <Skeleton style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: 0 }} />
        </div>

        <div className="listing-detail__content">
          <div className="listing-detail__header">
            <Skeleton style={{ width: 90, height: 20 }} />
            <Skeleton style={{ width: '80%', height: 26, marginTop: 8 }} />
            <Skeleton style={{ width: '45%', height: 14, marginTop: 8 }} />
            <Skeleton style={{ width: '35%', height: 26, marginTop: 'var(--spacing-sm)' }} />
          </div>

          <div className="listing-detail__section">
            <Skeleton style={{ width: 120, height: 16, marginBottom: 'var(--spacing-md)' }} />
            <Skeleton style={{ width: '100%', height: 12, marginBottom: 6 }} />
            <Skeleton style={{ width: '90%', height: 12, marginBottom: 6 }} />
            <Skeleton style={{ width: '60%', height: 12 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailSkeleton
