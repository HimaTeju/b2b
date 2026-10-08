import { useNavigate } from 'react-router-dom'
import { DOMAINS } from '../data'
import { Icon } from '../icons'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home__activity">
        <span className="pill pill--ink">3 active listings</span>
        <button className="pill pill--accent" onClick={() => navigate('/enquiries')}>2 new enquiries</button>
      </div>

      <button type="button" className="home__search" onClick={() => {}}>
        <Icon.search width={18} height={18} />
        <span>Search machinery, services, jobs…</span>
      </button>

      <div className="home__quicklinks">
        {DOMAINS.map(d => {
          const DomainIcon = Icon[d.key]
          return (
            <button key={d.key} className={`quicklink quicklink--${d.key}`} onClick={() => navigate(d.to)}>
              <span className="quicklink__icon"><DomainIcon width={22} height={22} /></span>
              <span className="quicklink__label">{d.label}</span>
            </button>
          )
        })}
      </div>

      <section className="home__featured">
        <h2 className="home__section-title">Near you</h2>
        <p className="home__section-sub">Fresh listings in Marketplace</p>
      </section>
    </div>
  )
}

export default Home
