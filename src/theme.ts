// Design tokens taken from the "Orders Manager – Mobile App Design" mockup.
// Use these instead of hard-coded values so the look stays consistent.

export const colors = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#E4E7EC',
  text: '#1A1D23',
  textMuted: '#5B6270',
  primary: '#2F5BEA',
  primarySoft: '#EEF3FF',
  onPrimary: '#FFFFFF',
  radioIdle: '#98A0AE',
  // Feedback banners reuse the delivered/cancelled pill colours.
  successBg: '#D8F3E2',
  successText: '#14602F',
  errorBg: '#FDE0E0',
  errorText: '#8F1D1D',
  // Reuses the pending pill colours.
  warningBg: '#FFF1D6',
  warningText: '#7A4A00',
} as const;

export const radius = {
  card: 14,
  control: 12,
  pill: 99,
} as const;

export const spacing = {
  screen: 16, // horizontal screen padding
  headerTop: 12, // extra space below the safe-area top inset
} as const;

// Minimum touch target (Apple HIG / WCAG): 44×44.
export const TOUCH_TARGET = 44;

export const type = {
  screenTitle: { fontSize: 28, fontWeight: '700' },
  detailTitle: { fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14 },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12 },
  chip: { fontSize: 14, fontWeight: '600' },
  pill: { fontSize: 12, fontWeight: '600' },
  button: { fontSize: 16, fontWeight: '700' },
} as const;
