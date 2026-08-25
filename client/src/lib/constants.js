export const BRAND = {
  name: 'SMORS',
  motto: ['HUSTLE', 'LIFESTYLE', 'BALANCE'],
  tagline: 'Thrifted & pre-loved essentials, revived in Polangui.',
  email: 'hello@smors.ph',
  location: 'Candaba St. Magurang, Polangui, Philippines'
}

export const SOCIALS = {
  collection: 'https://www.facebook.com/smorscollection',
  customs: 'https://www.facebook.com/smorscustoms'
}

export const CATEGORIES = [
  { id: 'tees', label: 'Tees' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'pants', label: 'Pants' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'jackets', label: 'Jackets' }
]

export const CONDITIONS = ['thrifted', 'pre-loved', 'like-new', 'brand-new']

export const PAYMENT_METHODS = [
  {
    id: 'gcash',
    label: 'GCash',
    accountName: 'Al Joshua Santor',
    accountNumber: '0917-123-4567',
    steps: [
      'Open GCash and send the exact total to the number above.',
      'Screenshot your receipt.',
      'Upload the screenshot on checkout so we can verify fast.'
    ]
  },
  {
    id: 'bdo',
    label: 'BDO Transfer',
    accountName: 'SMORS Collection',
    accountNumber: '0012-3456-7890',
    steps: [
      'Send via BDO Online or any BDO branch.',
      'Keep the transfer reference number.',
      'Upload proof of transfer to confirm your order.'
    ]
  },
  {
    id: 'bpi',
    label: 'BPI Transfer',
    accountName: 'SMORS Collection',
    accountNumber: '1234-5678-90',
    steps: [
      'Send via BPI Online or InstaPay.',
      'Keep the transfer reference number.',
      'Upload proof of transfer to confirm your order.'
    ]
  }
]

export const SHIPPING_METHODS = [
  {
    id: 'jt',
    label: 'J&T Express',
    fee: 120,
    eta: '2–5 days · nationwide',
    note: 'Tracking number sent once packed.'
  },
  {
    id: 'door2door',
    label: 'Seller Door-to-Door',
    fee: 0,
    eta: 'Same week · Metro Manila',
    note: 'Our rider coordinates meet-up details via Messenger.'
  }
]

export const FREE_SHIPPING_THRESHOLD = 3500

export const ORDER_STATUS_META = {
  payment_review: { label: 'Payment Review', tone: 'badge-info' },
  confirmed: { label: 'Confirmed', tone: 'badge-success' },
  shipped: { label: 'Shipped', tone: 'badge-primary' },
  delivered: { label: 'Delivered', tone: 'badge-accent' },
  cancelled: { label: 'Cancelled', tone: 'badge-error' }
}

export const ORDER_TIMELINE = ['payment_review', 'confirmed', 'shipped', 'delivered']

export const REQUEST_STATUS_META = {
  received: { label: 'Received' },
  quoting: { label: 'Quoting' },
  in_progress: { label: 'In Progress' },
  ready: { label: 'Ready for Pickup' },
  completed: { label: 'Completed' },
  declined: { label: 'Declined' }
}
