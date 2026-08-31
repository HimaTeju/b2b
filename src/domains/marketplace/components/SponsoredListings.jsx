import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSponsoredListings } from '../api/listings'
import ListingCard from './ListingCard'
import './SponsoredListings.css'

/**
 * Mandatory Home page section for boosted (is_advertised) SELL listings —
 * always rendered, including its empty state, so sellers always know boosting
 * exists. Horizontal-scroll strip rather than BrowseGrid's 2-col grid since
 * this is a small, unfiltered, unsearchable set.
 */
function SponsoredListings() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSponsoredListings()
      setListings(data || [])
    } catch (err) {
      console.error('Error loading sponsored listings:', err)
      setError('Failed to load sponsored listings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sponsored">
      <h2 className="sponsored__title">
        <span className="stamp stamp--ink">AD</span> Sponsored
      </h2>

      {error ? (
        <div className="banner sponsored__error">
          <p>{error}</p>
          <button className="btn btn--sm" onClick={loadListings}>Retry</button>
        </div>
      ) : loading ? (
        <div className="sponsored__loading">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="sponsored__empty">No sponsored listings yet — boost your listing from Dashboard to feature it here.</div>
      ) : (
        <div className="sponsored__strip">
          {listings.map(listing => (
            <article
              key={listing.id}
              className="sponsored__item"
              onClick={() => navigate(`/marketplace/${listing.id}`)}
            >
              <ListingCard listing={listing} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default SponsoredListings
