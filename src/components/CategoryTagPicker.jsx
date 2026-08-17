import { useState, useEffect } from 'react'
import { getMachineCategories, buildCategoryTree } from '../lib/api/categories'
import './CategoryTagPicker.css'

/**
 * Multi-select category tagging for capability profiles (a provider/vendor
 * can cover several categories, unlike a listing's single leaf category —
 * see CategoryPicker for that single-select case). Top-level categories with
 * children expand to show per-sub-category checkboxes; top-level categories
 * with no children are themselves checkable.
 */
function CategoryTagPicker({ value = [], onChange }) {
  const [categoryTree, setCategoryTree] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getMachineCategories()
      .then(data => setCategoryTree(buildCategoryTree(data)))
      .catch(err => console.error('Error loading categories:', err))
  }, [])

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="category-tag-picker">
      {categoryTree.map(top => {
        const hasChildren = top.children.length > 0
        const isExpanded = expandedId === top.id
        const selectedCount = hasChildren
          ? top.children.filter(c => value.includes(c.id)).length
          : (value.includes(top.id) ? 1 : 0)

        return (
          <div key={top.id} className="category-tag-picker__group">
            <button
              type="button"
              className="category-tag-picker__group-header"
              onClick={() => (hasChildren ? toggleExpand(top.id) : toggle(top.id))}
            >
              {!hasChildren && (
                <span className={`category-tag-picker__checkbox ${value.includes(top.id) ? 'category-tag-picker__checkbox--checked' : ''}`} />
              )}
              <span className="category-tag-picker__group-name">{top.name}</span>
              {selectedCount > 0 && (
                <span className="stamp stamp--ink category-tag-picker__count">{selectedCount}</span>
              )}
              {hasChildren && (
                <span className={`category-tag-picker__chevron ${isExpanded ? 'category-tag-picker__chevron--open' : ''}`}>&rsaquo;</span>
              )}
            </button>

            {hasChildren && isExpanded && (
              <div className="category-tag-picker__children">
                {top.children.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    className="category-tag-picker__child"
                    onClick={() => toggle(sub.id)}
                  >
                    <span className={`category-tag-picker__checkbox ${value.includes(sub.id) ? 'category-tag-picker__checkbox--checked' : ''}`} />
                    <span>{sub.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryTagPicker
