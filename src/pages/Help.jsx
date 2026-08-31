import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DOMAINS } from '../lib/domains'
import './Help.css'

const SECTIONS = [
  {
    key: 'start',
    accent: 'ink',
    title: 'How this app works',
    body: [
      'One account does everything — there is no separate buyer or seller sign-up. You can look for things and post things at the same time.',
      'Tap Explore at the bottom of the screen any time to see everything you can do, all in one place.'
    ]
  },
  {
    key: 'marketplace',
    accent: 'marketplace',
    icon: DOMAINS.marketplace.icon,
    title: 'Marketplace — machines, tools & scrap',
    body: [
      'Looking for something? Open Marketplace and search or filter by category to find machines, tools, or scrap for sale.',
      'Have something to sell? Tap Post to put it up with a few photos and details — it takes about a minute.',
      'Need something you can’t find? Post a Requirement instead, and sellers can reach out to you.',
      'Found the right listing? Tap Enquire on it to message the seller directly.'
    ],
    cta: [{ label: 'Go to Marketplace', to: '/marketplace' }]
  },
  {
    key: 'services',
    accent: 'services',
    icon: DOMAINS.services.icon,
    title: 'Services — repairs & maintenance',
    body: [
      'Need a repair done? Open Services to find repair providers near you and message them.',
      'Can’t find the right fit? Post a Requirement describing the work, and providers can reach out to you.',
      'Do repair work yourself? Turn on Offer Repair Services from your Profile to be listed as a provider.'
    ],
    cta: [
      { label: 'Go to Services', to: '/services' },
      { label: 'Offer repair services', to: '/services/provider/setup' }
    ]
  },
  {
    key: 'jobwork',
    accent: 'jobwork',
    icon: DOMAINS.jobwork.icon,
    title: 'Job Work — get it made, or make it for others',
    body: [
      'Need a job work order done — like machining, fabrication, or job processing? Open Job Work to find vendors and message them.',
      'Can’t find the right vendor? Post a Requirement describing the job, and vendors can reach out to you.',
      'Take up job work yourself? Turn on Offer Job Work Capacity from your Profile to be listed as a vendor.'
    ],
    cta: [
      { label: 'Go to Job Work', to: '/job-work' },
      { label: 'Offer job work capacity', to: '/job-work/vendor/setup' }
    ]
  },
  {
    key: 'jobs',
    accent: 'jobs',
    icon: DOMAINS.jobs.icon,
    title: 'Jobs & Careers — hire or get hired',
    body: [
      'Hiring? Open Jobs & Careers and tap Post to put up an opening.',
      'Looking for work? Browse job openings, or turn on Become a Job Seeker from your Profile so employers can find you.'
    ],
    cta: [
      { label: 'Go to Jobs & Careers', to: '/jobs' },
      { label: 'Become a job seeker', to: '/jobs/seeker/setup' }
    ]
  },
  {
    key: 'activity',
    accent: 'ink',
    title: 'Your posts & messages',
    body: [
      'Dashboard shows everything you have posted — listings, requirements, and job posts — in one place.',
      'Enquiries shows every message you have sent or received, across Marketplace, Services, Job Work, and Jobs.'
    ],
    cta: [
      { label: 'Go to Dashboard', to: '/dashboard' },
      { label: 'Go to Enquiries', to: '/enquiries' }
    ]
  },
  {
    key: 'account',
    accent: 'ink',
    title: 'Your account',
    body: [
      'Profile is where you edit your business details, and turn extra options on or off — like offering repair services, job work, or looking for a job.'
    ],
    cta: [{ label: 'Go to Profile', to: '/profile' }]
  }
]

function Help() {
  const navigate = useNavigate()
  const [openKey, setOpenKey] = useState(SECTIONS[0].key)

  return (
    <div className="help">
      <div className="help__container">
        <h1 className="help__title">Help</h1>
        <p className="help__subtitle">A quick guide to everything in the app.</p>

        <div className="help__list">
          {SECTIONS.map(section => {
            const isOpen = openKey === section.key
            return (
              <div key={section.key} className={`help__item help__item--${section.accent}`}>
                <button
                  type="button"
                  className="help__item-header"
                  onClick={() => setOpenKey(isOpen ? null : section.key)}
                  aria-expanded={isOpen}
                >
                  {section.icon && <span className="help__item-icon">{section.icon}</span>}
                  <span className="help__item-title">{section.title}</span>
                  <svg
                    className={`help__item-chevron ${isOpen ? 'help__item-chevron--open' : ''}`}
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="help__item-body">
                    {section.body.map((line, i) => <p key={i}>{line}</p>)}
                    {section.cta && (
                      <div className="help__item-actions">
                        {section.cta.map(action => (
                          <button
                            key={action.to}
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => navigate(action.to)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Help
