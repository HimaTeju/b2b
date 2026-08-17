import { useNavigate } from 'react-router-dom'
import './ComingSoonSection.css'

function ComingSoonSection({ code, title, accent, description, bullets }) {
  const navigate = useNavigate()

  return (
    <div className={`coming-soon coming-soon--${accent}`}>
      <button className="coming-soon__back btn btn--ghost btn--sm" onClick={() => navigate('/')}>
        &lsaquo; Home
      </button>

      <span className="coming-soon__code mono">{code}</span>
      <span className="stamp stamp--muted coming-soon__stamp">In progress</span>

      <h1 className="coming-soon__title">{title}</h1>
      <p className="coming-soon__desc">{description}</p>

      {bullets && bullets.length > 0 && (
        <ul className="coming-soon__list">
          {bullets.map(item => (
            <li key={item} className="coming-soon__list-item">{item}</li>
          ))}
        </ul>
      )}

      <button className="btn btn--primary" onClick={() => navigate('/marketplace')}>
        Go to Marketplace instead
      </button>
    </div>
  )
}

export default ComingSoonSection
