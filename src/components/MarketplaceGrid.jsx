import { useNavigate } from 'react-router-dom'
import { getListings } from '../lib/api/listings'
import { useAuth } from '../context/AuthContext'
import BrowseGrid from './BrowseGrid'
import ListingCard from './ListingCard'

const COPY = {
  SELL: {
    searchPlaceholder: 'Search machinery, tools, accessories…',
    empty: 'No listings match these filters.'
  },
  REQUIREMENT: {
    searchPlaceholder: 'Search buyer requirements…',
    empty: 'No requirements match these filters.'
  }
}

function MarketplaceGrid({ intent }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const copy = COPY[intent]

  return (
    <BrowseGrid
      fetchItems={({ categoryIds, search, excludeProfileId }) =>
        getListings({ categoryIds, intent, search, excludeProfileId })
      }
      excludeProfileId={user?.id}
      searchPlaceholder={copy.searchPlaceholder}
      emptyMessage={copy.empty}
      onItemClick={(listing) => navigate(`/marketplace/${listing.id}`)}
      renderItem={(listing) => <ListingCard listing={listing} />}
    />
  )
}

export default MarketplaceGrid
