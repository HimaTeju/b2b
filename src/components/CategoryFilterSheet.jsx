import { useEffect, useState } from 'react'
import './CategoryFilterSheet.css'

/**
 * Compact trigger + bottom sheet for picking a category/sub-category filter.
 * Replaces the old two-row horizontal-scroll chip filter across every browse
 * page (Marketplace, Services, and Job Work/Jobs once built) — the only
 * consumer is BrowseGrid, but this stays a separate component since the
 * picker UI (trigger, sheet, expand/select rows) is a self-contained concern
 * distinct from BrowseGrid's fetch/search/grid responsibilities.
 *
 * Tapping a category name selects "this whole category" (parent + all its
 * descendants) and closes the sheet. Tapping the chevron only expands the
 * row to reveal sub-categories, without changing the selection — so both
 * "all of Air Compressor" and "just Reciprocating Compressor" stay reachable.
 */
function CategoryFilterSheet({ categoryTree, activeTopId, activeSubId, onSelect }) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  const activeTop = categoryTree.find(c => c.id === activeTopId)
  const activeSub = activeTop?.children.find(c => c.id === activeSubId)
  const triggerLabel = activeSub?.name || activeTop?.name || 'All categories'
  const hasSelection = activeTopId != null

  const selectTop = (id) => {
    onSelect(id, null)
    setOpen(false)
  }

  const selectSub = (topId, subId) => {
    onSelect(topId, subId)
    setOpen(false)
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <>
      <div className="category-filter-sheet__trigger-row">
        <button type="button" className="category-filter-sheet__trigger" onClick={() => setOpen(true)}>
          <span className="category-filter-sheet__trigger-label">
            <span className="category-filter-sheet__trigger-icon" aria-hidden="true">&#9636;</span>
            {triggerLabel}
          </span>
          <span className="category-filter-sheet__trigger-chevron" aria-hidden="true">&#9662;</span>
        </button>
        {hasSelection && (
          <button
            type="button"
            className="category-filter-sheet__clear"
            onClick={() => onSelect(null, null)}
            aria-label="Clear category filter"
          >
            &#10005;
          </button>
        )}
      </div>

      <div className={`category-filter-sheet__backdrop ${open ? 'category-filter-sheet__backdrop--open' : ''}`} onClick={() => setOpen(false)} />

      <div className={`category-filter-sheet ${open ? 'category-filter-sheet--open' : ''}`} role="dialog" aria-label="Select category">
        <div className="category-filter-sheet__handle" />
        <div className="category-filter-sheet__head">
          <h3>Select category</h3>
          <button type="button" className="category-filter-sheet__close" onClick={() => setOpen(false)} aria-label="Close">
            &#10005;
          </button>
        </div>
        <p className="category-filter-sheet__hint">
          Tap a name to filter all of that category &middot; tap &rsaquo; to narrow to one sub-category
        </p>
        <div className="category-filter-sheet__list">
          <button
            type="button"
            className={`category-filter-sheet__row-main ${activeTopId === null ? 'category-filter-sheet__row-main--active' : ''}`}
            onClick={() => selectTop(null)}
          >
            <span className="category-filter-sheet__radio" />
            <span className="category-filter-sheet__row-name">All categories</span>
          </button>

          {categoryTree.map(top => {
            const hasChildren = top.children.length > 0
            const isActive = activeTopId === top.id
            const isExpanded = expandedId === top.id

            return (
              <div key={top.id} className="category-filter-sheet__row-wrap">
                <div className="category-filter-sheet__row">
                  <button
                    type="button"
                    className={`category-filter-sheet__row-main ${isActive ? 'category-filter-sheet__row-main--active' : ''}`}
                    onClick={() => selectTop(top.id)}
                  >
                    <span className="category-filter-sheet__radio" />
                    <span className="category-filter-sheet__row-name">{top.name}</span>
                    {isActive && hasChildren && !activeSubId && (
                      <span className="category-filter-sheet__row-hint">ALL</span>
                    )}
                  </button>
                  {hasChildren && (
                    <button
                      type="button"
                      className="category-filter-sheet__chevron-btn"
                      onClick={() => toggleExpand(top.id)}
                      aria-label={isExpanded ? `Collapse ${top.name}` : `Show sub-categories of ${top.name}`}
                    >
                      <span className={`category-filter-sheet__chevron ${isExpanded ? 'category-filter-sheet__chevron--open' : ''}`}>&rsaquo;</span>
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="category-filter-sheet__children">
                    {top.children.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        className={`category-filter-sheet__child ${activeTopId === top.id && activeSubId === sub.id ? 'category-filter-sheet__child--active' : ''}`}
                        onClick={() => selectSub(top.id, sub.id)}
                      >
                        <span className="category-filter-sheet__dot" />
                        <span>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default CategoryFilterSheet
