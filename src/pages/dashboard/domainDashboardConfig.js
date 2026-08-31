import { deleteListing, toggleListingAdvertise } from '../../domains/marketplace/api/listings'
import { deleteServiceRequirement } from '../../domains/services/api/serviceRequirements'
import { deleteJobWorkRequirement } from '../../domains/jobwork/api/jobworkRequirements'
import { deleteJobPost } from '../../domains/jobs/api/jobPosts'
import { formatListingPrice } from '../../lib/format'
import { INTENT_LABELS, SECTION_LABELS } from '../../lib/constants'

/**
 * Per-domain shape for Dashboard's "my activity" cards: what a record's
 * badge/meta line looks like, where "post new"/edit/view link to, how to
 * delete a record, and (where the domain has one) the label/setup route for
 * its capability profile. Mirrors DASHBOARD's use of DOMAIN_TABLES in
 * lib/api/activity.js — one entry per domain in lib/domains.jsx's DOMAINS.
 */
export const DASHBOARD_DOMAIN_CONFIG = {
  marketplace: {
    recordNounSingular: 'listing',
    newRecordPath: '/marketplace/sell/new',
    secondaryAction: { label: 'Looking to buy instead? Post a requirement ›', path: '/marketplace/requirements/new' },
    editRecordPath: id => `/marketplace/post/edit/${id}`,
    viewRecordPath: id => `/marketplace/${id}`,
    recordBadge: record => INTENT_LABELS[record.intent],
    recordMeta: record => `${record.machine_categories?.name || SECTION_LABELS[record.section]} · ${formatListingPrice(record)}`,
    deleteRecord: record => deleteListing(record.id, record.listing_images),
    canAdvertise: record => record.intent === 'SELL',
    toggleAdvertise: record => toggleListingAdvertise(record.id, !record.is_advertised)
  },
  services: {
    recordNounSingular: 'requirement',
    newRecordPath: '/services/requirements/new',
    editRecordPath: id => `/services/requirements/edit/${id}`,
    viewRecordPath: id => `/services/requirements/${id}`,
    recordMeta: record => [record.machine_categories?.name, record.city].filter(Boolean).join(' · '),
    deleteRecord: record => deleteServiceRequirement(record.id),
    capability: { label: 'Service provider profile', editPath: '/services/provider/setup' }
  },
  jobwork: {
    recordNounSingular: 'requirement',
    newRecordPath: '/job-work/requirements/new',
    editRecordPath: id => `/job-work/requirements/edit/${id}`,
    viewRecordPath: id => `/job-work/requirements/${id}`,
    recordMeta: record => [record.machine_categories?.name, record.city].filter(Boolean).join(' · '),
    deleteRecord: record => deleteJobWorkRequirement(record.id),
    capability: { label: 'Job work vendor profile', editPath: '/job-work/vendor/setup' }
  },
  jobs: {
    recordNounSingular: 'job opening',
    newRecordPath: '/jobs/new',
    editRecordPath: id => `/jobs/edit/${id}`,
    viewRecordPath: id => `/jobs/${id}`,
    recordMeta: record => [record.job_category, record.machine_categories?.name, record.city].filter(Boolean).join(' · '),
    deleteRecord: record => deleteJobPost(record.id),
    capability: { label: 'Job seeker profile', editPath: '/jobs/seeker/setup' }
  }
}
