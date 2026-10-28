import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListings } from '../api/listings'
import { useAuth } from '../../../context/AuthContext'
import BrowseGrid from '../../../components/BrowseGrid'
import ListingCard from './ListingCard'
import { PROPERTY_TYPES } from '../../../lib/constants'

const COPY = {
  SELL: {
    searchPlaceholder: 'Search machinery, tools, accessories…',
    propertySearchPlaceholder: 'Search sheds, warehouses, godowns, shops…',
    empty: 'No listings match these filters.'
  },
  REQUIREMENT: {
    searchPlaceholder: 'Search buyer requirements…',
    propertySearchPlaceholder: 'Search property requirements…',
    empty: 'No requirements match these filters.'
  }
}

function MarketplaceGrid({ section = 'MACHINERY', intent, initialSearch }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const copy = COPY[intent]
  const isProperty = section === 'PROPERTY'
  const [dealType, setDealType] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const extraFilters = useMemo(() => ({ dealType, propertyType }), [dealType, propertyType])

  return (
    <BrowseGrid
      fetchItems={({ categoryIds, search, excludeProfileId, dealType, propertyType }) =>
        getListings({ categoryIds, intent, section, search, excludeProfileId, dealType, propertyType })
      }
      excludeProfileId={user?.id}
      searchPlaceholder={isProperty ? copy.propertySearchPlaceholder : copy.searchPlaceholder}
      emptyMessage={copy.empty}
      onItemClick={(listing) => navigate(`/marketplace/${listing.id}`)}
      renderItem={(listing) => <ListingCard listing={listing} />}
      initialSearch={initialSearch}
      showCategoryFilter={section !== 'SCRAP' && !isProperty}
      extraFilters={isProperty ? extraFilters : undefined}
      renderExtraFilter={isProperty ? (
        <div className="field__row">
          <select
            className="browse-grid__extra-filter"
            value={dealType}
            onChange={(e) => setDealType(e.target.value)}
            aria-label="Filter by rent or sale"
          >
            <option value="">{intent === 'REQUIREMENT' ? 'Rent or buy' : 'Rent or sale'}</option>
            <option value="RENT">{intent === 'REQUIREMENT' ? 'Rent' : 'For rent'}</option>
            <option value="SALE">{intent === 'REQUIREMENT' ? 'Buy' : 'For sale'}</option>
          </select>
          <select
            className="browse-grid__extra-filter"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            aria-label="Filter by property type"
          >
            <option value="">All property types</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      ) : undefined}
      hasImage
    />
  )
}

export default MarketplaceGrid
