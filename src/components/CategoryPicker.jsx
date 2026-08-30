import { useState, useEffect } from 'react'
import { getMachineCategories, buildCategoryTree } from '../lib/api/categories'

/**
 * Two-level category picker (top-level + sub-category). Reports the resolved
 * leaf (or top-level, if it has no children) machine_category_id via onChange.
 */
function CategoryPicker({ value, onChange, required = true, label = 'Category' }) {
  const [categoryTree, setCategoryTree] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [topCategoryId, setTopCategoryId] = useState('')

  useEffect(() => {
    getMachineCategories()
      .then(data => {
        setCategories(data)
        setCategoryTree(buildCategoryTree(data))
        setCategoriesLoaded(true)
      })
      .catch(err => console.error('Error loading categories:', err))
  }, [])

  // Resolve an incoming value (edit mode) to its top-level parent once categories load
  useEffect(() => {
    if (!categoriesLoaded || !value || topCategoryId) return
    const selected = categories.find(c => c.id === value)
    if (!selected) return
    setTopCategoryId(selected.parent_id || selected.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesLoaded, value, categories])

  const activeTop = categoryTree.find(c => c.id === topCategoryId)
  const hasSubcategories = activeTop && activeTop.children.length > 0

  const handleTopChange = (e) => {
    const id = e.target.value
    setTopCategoryId(id)
    const top = categoryTree.find(c => c.id === id)
    // Auto-select the category itself when it has no sub-categories, otherwise wait for a sub-category pick
    onChange(top && top.children.length === 0 ? id : '')
  }

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="topCategory">{label}{required ? ' *' : ' (optional)'}</label>
        <select id="topCategory" value={topCategoryId} onChange={handleTopChange} required={required}>
          <option value="" disabled={required}>Select a category</option>
          {categoryTree.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {hasSubcategories && (
        <div className="field">
          <label className="field__label" htmlFor="subCategory">Sub-category{required ? ' *' : ' (optional)'}</label>
          <select
            id="subCategory"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          >
            <option value="" disabled={required}>Select a sub-category</option>
            {activeTop.children.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}

export default CategoryPicker
