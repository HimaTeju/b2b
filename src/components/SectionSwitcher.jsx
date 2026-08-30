import { useNavigate } from 'react-router-dom'
import { SECTIONS, SECTION_LABELS, SECTION_PATH } from '../lib/constants'
import './SectionSwitcher.css'

function SectionSwitcher({ section, suffix = '' }) {
  const navigate = useNavigate()

  return (
    <div className="section-switcher">
      {SECTIONS.map(s => (
        <button
          key={s}
          type="button"
          className={`section-switcher__item${s === section ? ' section-switcher__item--active' : ''}`}
          onClick={() => s !== section && navigate(`/marketplace${SECTION_PATH[s]}${suffix}`)}
        >
          {SECTION_LABELS[s]}
        </button>
      ))}
    </div>
  )
}

export default SectionSwitcher
