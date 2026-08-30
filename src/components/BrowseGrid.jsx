import { useState, useEffect } from 'react'
import { getMachineCategories, buildCategoryTree, categoryAndDescendantIds } from '../lib/api/categories'
import CategoryFilterSheet from './CategoryFilterSheet'
import './BrowseGrid.css'

/**
 * Generic category-filterable, searchable browse grid. Caller owns the data
 * fetch (`fetchItems`), navigation (`onItemClick`), and card content
 * (`renderItem`) — this component owns category drill-down, debounced
 * search, and loading/error/empty states only.
 */
function BrowseGrid({ fetchItems, excludeProfileId, searchPlaceholder, emptyMessage, getItemKey = item => item.id, onItemClick, renderItem, initialSearch = '', showCategoryFilter = true }) {
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [activeTopId, setActiveTopId] = useState(null)
  const [activeSubId, setActiveSubId] = useState(null)

  const [searchInput, setSearchInput] = useState(initialSearch)
  const [search, setSearch] = useState(initialSearch)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!showCategoryFilter) return
    getMachineCategories()
      .then(data => {
        setCategories(data)
        setCategoryTree(buildCategoryTree(data))
      })
      .catch(err => {
        console.error('Error loading categories:', err)
        setError('Failed to load categories')
      })
  }, [showCategoryFilter])

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopId, activeSubId, search])

  const loadItems = async () => {
    setLoading(true)
    setError('')
    try {
      let categoryIds
      if (activeSubId) {
        categoryIds = [activeSubId]
      } else if (activeTopId) {
        categoryIds = categoryAndDescendantIds(activeTopId, categories)
      }

      const data = await fetchItems({ categoryIds, search: search || undefined, excludeProfileId })
      setItems(data || [])
    } catch (err) {
      console.error('Error loading items:', err)
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (topId, subId) => {
    setActiveTopId(topId)
    setActiveSubId(subId)
  }

  return (
    <div className="browse-grid">
      <input
        type="search"
        className="browse-grid__search"
        placeholder={searchPlaceholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {showCategoryFilter && (
        <CategoryFilterSheet
          categoryTree={categoryTree}
          activeTopId={activeTopId}
          activeSubId={activeSubId}
          onSelect={handleCategorySelect}
        />
      )}

      <div className="browse-grid__content">
        {error && (
          <div className="banner browse-grid__error">
            <p>{error}</p>
            <button className="btn btn--sm" onClick={loadItems}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="browse-grid__loading">Loading…</div>
        ) : items.length === 0 ? (
          <div className="browse-grid__empty">{emptyMessage}</div>
        ) : (
          <div className="browse-grid__grid">
            {items.map(item => (
              <article
                key={getItemKey(item)}
                className="browse-grid__item"
                onClick={() => onItemClick(item)}
              >
                {renderItem(item)}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseGrid
