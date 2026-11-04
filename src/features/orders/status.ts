import { strings } from '@/strings';

// Must match orders_status_check in supabase/migrations (also written by the
// happy_store checkout, which inserts every order as 'new').
export const ORDER_STATUSES = ['new', 'paid', 'sent', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

// Filter chips on the list screen ("all" = no status filter).
export const STATUS_FILTERS = ['all', ...ORDER_STATUSES] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

// Pill colours: new amber, paid blue, sent green, cancelled red.
export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  new: { bg: '#FFF1D6', text: '#7A4A00' },
  paid: { bg: '#DCE9FF', text: '#12408F' },
  sent: { bg: '#D8F3E2', text: '#14602F' },
  cancelled: { bg: '#FDE0E0', text: '#8F1D1D' },
};

export function statusLabel(status: string): string {
  return isOrderStatus(status) ? strings.status[status] : status;
}
