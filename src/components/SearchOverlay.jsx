import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUniversalSearchResults } from '../lib/api/search'
import { DOMAINS, DOMAIN_LIST } from '../lib/domains'
import ListingCard from './ListingCard'
import RequirementCard from './RequirementCard'
import ProviderCard from './ProviderCard'
import SeekerCard from './SeekerCard'
import './SearchOverlay.css'

const LISTING_SURFACES = new Set(['marketplace-listings', 'marketplace-requirements'])
const REQUIREMENT_SURFACES = new Set(['service-requirements', 'jobwork-requirements', 'job-posts'])
const PROVIDER_SURFACES = new Set(['service-providers', 'jobwork-vendors'])

function renderPreview(surfaceKey, item) {
  if (LISTING_SURFACES.has(surfaceKey)) return <ListingCard listing={item} />
  if (REQUIREMENT_SURFACES.has(surfaceKey)) return <RequirementCard item={item} />
  if (PROVIDER_SURFACES.has(surfaceKey)) return <ProviderCard provider={item} />
  return <SeekerCard seeker={item} />
}

/**
 * Full-screen search takeover triggered from Home's search bar. Live,
 * debounced results grouped by surface (see lib/api/search.js — 8 surfaces
 * across the 4 domains), each with its own colored stamp header so a term
 * that hits Marketplace, Services and Jobs at once reads clearly at a
 * glance. Tapping a preview card jumps straight to that item; "See all"
 * hands the term off to that surface's real browse page via ?search=.
 */
function SearchOverlay({ onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setTerm(query.trim()), 350)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (term.length < 2) {
      setResults([])
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getUniversalSearchResults(term, { excludeProfileId: user?.id })
      .then(data => {
        if (cancelled) return
        setResults(data)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Error running universal search:', err)
        setError('Search failed. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [term, user])

  const goToSurface = (result) => {
    navigate(`${result.path}?search=${encodeURIComponent(term)}`)
    onClose()
  }

  const goToItem = (result, item) => {
    navigate(result.detailPath(item))
    onClose()
  }

  const orderedResults = DOMAIN_LIST.flatMap(domain => results.filter(r => r.group === domain.key))

  return (
    <div className="search-overlay">
      <div className="search-overlay__header">
        <button type="button" className="search-overlay__close" onClick={onClose} aria-label="Close search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="search"
          className="search-overlay__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search machinery, services, jobs…"
        />
      </div>

      <div className="search-overlay__body">
        {term.length < 2 && (
          <p className="search-overlay__hint">
            Keep typing — matches from Marketplace, Services, Job Work and Jobs all show up here as you go.
          </p>
        )}

        {error && <div className="banner">{error}</div>}

        {loading && <div className="search-overlay__loading">Searching…</div>}

        {!loading && !error && term.length >= 2 && orderedResults.length === 0 && (
          <p className="search-overlay__empty">No matches for "{term}" anywhere on the platform.</p>
        )}

        {orderedResults.map(result => {
          const domain = DOMAINS[result.group]
          return (
            <div key={result.key} className="search-overlay__group">
              <span className={`stamp stamp--solid stamp--${domain.accent} search-overlay__group-label`}>
                {result.label}
              </span>
              <div className="search-overlay__items">
                {result.items.map(item => (
                  <button
                    key={result.itemKey(item)}
                    type="button"
                    className="search-overlay__card"
                    onClick={() => goToItem(result, item)}
                  >
                    {renderPreview(result.key, item)}
                  </button>
                ))}
              </div>
              <button type="button" className="search-overlay__see-all" onClick={() => goToSurface(result)}>
                {result.count > result.items.length
                  ? `See all ${result.count} in ${result.label} ›`
                  : `Open ${result.label} ›`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SearchOverlay
