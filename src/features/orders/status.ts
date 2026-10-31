import { strings } from '@/strings';

// Must match the CHECK constraint in supabase/migrations (step 2).
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

// Filter chips on the list screen ("all" = no status filter).
export const STATUS_FILTERS = ['all', 'pending', 'shipped', 'delivered'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

// Pill colours from the mockup: pending amber, confirmed blue, shipped purple,
// delivered green, cancelled red.
export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FFF1D6', text: '#7A4A00' },
  confirmed: { bg: '#DCE9FF', text: '#12408F' },
  shipped: { bg: '#E9E1FF', text: '#4A2A9B' },
  delivered: { bg: '#D8F3E2', text: '#14602F' },
  cancelled: { bg: '#FDE0E0', text: '#8F1D1D' },
};

export function statusLabel(status: string): string {
  return isOrderStatus(status) ? strings.status[status] : status;
}
