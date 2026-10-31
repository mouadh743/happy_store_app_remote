// Every piece of text the user sees lives here, so adding Arabic later means
// adding a second object with the same shape (and switching `locale`).

export const locale = 'en-GB';

export const strings = {
  appName: 'Orders Admin',

  tabs: {
    orders: 'Orders',
    settings: 'Settings',
  },

  login: {
    title: 'Sign in',
    subtitle: 'Admin access only',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    missingFields: 'Enter your email and password.',
    failed: 'Could not sign in. Check your email and password.',
  },

  orders: {
    title: 'Orders',
    searchLabel: 'Search orders',
    searchPlaceholder: 'Order number or customer name',
    clearSearch: 'Clear search',
    empty: 'No orders yet.',
    emptyHint: 'New orders from the store will show up here.',
    emptyFiltered: 'No orders match these filters.',
    emptyFilteredHint: 'Try another status or a different search.',
    clearFilters: 'Clear filters',
    loadError: 'Could not load orders.',
    retry: 'Try again',
  },

  filters: {
    all: 'All',
    pending: 'Pending',
    shipped: 'Shipped',
    delivered: 'Delivered',
  },

  status: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },

  detail: {
    titlePrefix: 'Order ',
    back: 'Back to orders',
    items: 'Items',
    total: 'Total',
    payment: 'Payment',
    note: 'Note',
    updateStatus: 'Update status',
    save: 'Save status',
    saving: 'Saving…',
    saved: 'Status updated.',
    saveFailed: 'Could not update the status. Please try again.',
    notAllowed: 'You are not allowed to update this order.',
    notFound: 'Order not found.',
    loadError: 'Could not load this order.',
  },

  date: {
    today: 'Today',
    yesterday: 'Yesterday',
  },

  settings: {
    title: 'Settings',
    signedInAs: 'Signed in as',
    signOut: 'Sign out',
    connection: 'Connection',
    supabaseProject: 'Supabase project',
    notConfigured: 'Not set up',
    notConfiguredHint:
      'Copy .env.example to .env, add your Supabase URL and anon key, then restart with "npx expo start --clear".',
    about: 'About',
    app: 'App',
    version: 'Version',
  },

  currency: 'TND',
} as const;
