export const DOMAINS = [
  {
    key: 'marketplace',
    label: 'Marketplace',
    blurb: 'Buy and sell machines, tools and scrap',
    primaryAction: 'Browse listings',
    secondaryAction: 'Post something to sell',
    to: '/browse/marketplace'
  },
  {
    key: 'services',
    label: 'Services',
    blurb: 'Get repair work done, or offer your repair service',
    primaryAction: 'Find a provider',
    secondaryAction: 'Offer your service',
    to: '/browse/services'
  },
  {
    key: 'jobwork',
    label: 'Job Work',
    blurb: 'Get job work done, or take up job work',
    primaryAction: 'Find a vendor',
    secondaryAction: 'Offer job work capacity',
    to: '/browse/jobwork'
  },
  {
    key: 'jobs',
    label: 'Jobs & Careers',
    blurb: 'Put up a job opening, or look for one',
    primaryAction: 'Browse job posts',
    secondaryAction: 'Post a job opening',
    to: '/browse/jobs'
  },
  {
    key: 'packersmovers',
    label: 'Packers & Movers',
    blurb: 'Get a machine or shop lifted and moved',
    primaryAction: 'Find a mover',
    secondaryAction: 'Offer lifting services',
    to: '/browse/packersmovers'
  }
]

export const LISTINGS = [
  {
    id: 1,
    domain: 'marketplace',
    title: 'Lathe Machine — 6 Feet Bed, Geared Head',
    category: 'Lathe Machines',
    price: '₹1,85,000',
    location: 'Peenya, Bengaluru',
    posted: '2 days ago',
    desc: 'Well-maintained geared lathe, single phase to three phase convertible. Minor rust on bed, fully functional.'
  },
  {
    id: 2,
    domain: 'marketplace',
    title: 'Hydraulic Shearing Machine 8x10',
    category: 'Sheet Metal',
    price: '₹4,20,000',
    location: 'Rajkot, Gujarat',
    posted: '5 hours ago',
    desc: 'Heavy duty shearing machine, 2021 model, barely used. Includes back gauge and foot pedal.'
  },
  {
    id: 3,
    domain: 'marketplace',
    title: 'Air Compressor 10HP — Elgi',
    category: 'Compressors',
    price: '₹95,000',
    location: 'Coimbatore',
    posted: '1 week ago',
    desc: 'Screw compressor, recently serviced, tank and pipeline included.'
  },
  {
    id: 4,
    domain: 'marketplace',
    title: 'CNC Milling Machine — 3 Axis',
    category: 'CNC',
    price: '₹6,75,000',
    location: 'Pune',
    posted: '3 days ago',
    desc: 'Fanuc controller, good working condition, tooling available separately.'
  }
]

export const ACCENT_BY_DOMAIN = {
  marketplace: 'amber',
  services: 'teal',
  jobwork: 'green',
  jobs: 'rust',
  packersmovers: 'blue'
}
