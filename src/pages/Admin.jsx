import { useState } from 'react'
import './Admin.css'

// Grounded in the moderation actions the schema actually supports today —
// profiles.status (ACTIVE/SUSPENDED) and the ACTIVE/INACTIVE or is_active
// flag every listing/requirement/post/capability table has. No
// approve/reject workflow exists anywhere else in the app, so this page
// doesn't invent one. Each section is data-ready but unwired — see the
// admin role migration issue for the follow-up that connects real data.
const TABS = [
  {
    id: 'users',
    label: 'Users',
    sections: [
      {
        title: 'Users',
        description: "Suspend or reactivate a user's account.",
        emptyLabel: 'No users to review yet.'
      }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    sections: [
      {
        title: 'Listings',
        description: 'Deactivate or reactivate a listing across Machinery, Tools & Accessories, and Scrap.',
        emptyLabel: 'No listings to review yet.'
      }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    sections: [
      {
        title: 'Service providers',
        description: 'Deactivate or reactivate a service provider profile.',
        emptyLabel: 'No service providers to review yet.'
      },
      {
        title: 'Service requirements',
        description: 'Deactivate or reactivate a posted service requirement.',
        emptyLabel: 'No service requirements to review yet.'
      }
    ]
  },
  {
    id: 'jobs',
    label: 'Jobs',
    sections: [
      {
        title: 'Job posts',
        description: 'Deactivate or reactivate a job vacancy.',
        emptyLabel: 'No job posts to review yet.'
      },
      {
        title: 'Job seekers',
        description: 'Deactivate or reactivate a job seeker profile.',
        emptyLabel: 'No job seekers to review yet.'
      }
    ]
  },
  {
    id: 'jobwork',
    label: 'Job work',
    sections: [
      {
        title: 'Job work vendors',
        description: 'Deactivate or reactivate a job work vendor profile.',
        emptyLabel: 'No job work vendors to review yet.'
      },
      {
        title: 'Job work requirements',
        description: 'Deactivate or reactivate a posted job work requirement.',
        emptyLabel: 'No job work requirements to review yet.'
      }
    ]
  }
]

function AdminSection({ title, description, emptyLabel }) {
  return (
    <div className="admin__section">
      <h2 className="admin__section-title">{title}</h2>
      <p className="admin__section-description">{description}</p>
      <div className="admin__empty">{emptyLabel}</div>
    </div>
  )
}

function Admin() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const currentTab = TABS.find(tab => tab.id === activeTab)

  return (
    <div className="admin">
      <div className="admin__container">
        <span className="eyebrow">Admin</span>
        <h1 className="admin__title">Admin panel</h1>

        <div className="admin__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin__tab ${activeTab === tab.id ? 'admin__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentTab.sections.map(section => (
          <AdminSection key={section.title} {...section} />
        ))}
      </div>
    </div>
  )
}

export default Admin
