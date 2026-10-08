import { DOMAINS } from '../data'
import DomainCard from '../components/DomainCard'

/**
 * Replaces the real app's rail + panel BrowseHub: one flat, scrollable
 * list of domain cards, each exposing both actions directly. No sidebar,
 * no intermediate tap to reveal options.
 */
function Explore() {
  return (
    <div className="explore">
      <h1 className="explore__title">Explore</h1>
      <p className="explore__sub">Pick what you need — browse or post, right from here.</p>
      <div className="explore__list">
        {DOMAINS.map(d => <DomainCard key={d.key} domain={d} />)}
      </div>
    </div>
  )
}

export default Explore
