import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { OrderStatus } from '@/features/orders/status';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/** The columns the list screen needs from the remote `orders` table. */
export type OrderSummary = {
  id: string; // uuid
  ref: string | null; // customer-facing number from the store, e.g. "HS-7K3Q9P"
  customer_name: string | null;
  total: number | string; // numeric
  status: string;
  created_at: string; // timestamptz, ISO string
};

/** One line of `orders.items`, as written by the store checkout. */
export type OrderItem = { slug?: string; name?: string; price?: number | string };

export type OrderDetail = OrderSummary & {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  governorate: string | null;
  city: string | null;
  payment_method: string | null;
  note: string | null;
  product: string | null; // product slug, or "bundle"
  quantity: number | null;
  items: OrderItem[] | null; // jsonb
  delivery_fee: number | string | null; // numeric
  notified_at: string | null; // timestamptz, when the push went out
};

const SUMMARY_COLUMNS = 'id, ref, customer_name, total, status, created_at';
const DETAIL_COLUMNS =
  `${SUMMARY_COLUMNS}, first_name, last_name, phone, email, governorate, city, payment_method, ` +
  'note, product, quantity, items, delivery_fee, notified_at';

// Newest orders first. Status filter and search run on the device over this
// set, so switching chips is instant; raise the cap if the store outgrows it.
const LIST_LIMIT = 500;

export const ordersKeys = {
  all: ['orders'] as const,
  list: () => [...ordersKeys.all, 'list'] as const,
  detail: (id: string) => [...ordersKeys.all, 'detail', id] as const,
};

async function fetchOrders(): Promise<OrderSummary[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(SUMMARY_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(LIST_LIMIT);
  if (error) throw error;
  return data ?? [];
}

export function useOrders() {
  return useQuery({
    queryKey: ordersKeys.list(),
    queryFn: fetchOrders,
    enabled: isSupabaseConfigured,
  });
}

/** Resolves to null when the order doesn't exist (or RLS hides it). */
async function fetchOrder(id: string): Promise<OrderDetail | null> {
  const { data, error } = await supabase.from('orders').select(DETAIL_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as OrderDetail | null;
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: isSupabaseConfigured && id.length > 0,
  });
}

/** Thrown when the database refuses the update (no RLS policy / column grant). */
export class NotAllowedError extends Error {}

async function updateOrderStatus({ id, status }: { id: string; status: OrderStatus }) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .maybeSingle();
  // 42501 = permission denied (missing column grant).
  if (error?.code === '42501') throw new NotAllowedError(error.message);
  if (error) throw error;
  // RLS doesn't error on a blocked update, it just matches no rows.
  if (!data) throw new NotAllowedError('No row updated');
  return data as { id: string; status: string };
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: ({ id, status }) => {
      // Patch both caches so the list and detail screen agree straight away.
      queryClient.setQueryData<OrderDetail | null>(ordersKeys.detail(id), (old) =>
        old ? { ...old, status } : old,
      );
      queryClient.setQueryData<OrderSummary[]>(ordersKeys.list(), (old) =>
        old?.map((order) => (order.id === id ? { ...order, status } : order)),
      );
    },
  });
}

/** "First Last" from the new columns, falling back to the older `customer_name`. */
export function customerName(order: Pick<OrderDetail, 'first_name' | 'last_name' | 'customer_name'>): string {
  const full = [order.first_name, order.last_name].map((p) => p?.trim()).filter(Boolean).join(' ');
  return full || order.customer_name?.trim() || '';
}

/** Order number shown to the admin: the store's ref ("HS-7K3Q9P"), else a short uuid. */
export function orderCode(order: Pick<OrderSummary, 'id' | 'ref'>): string {
  return order.ref?.trim() || `#${order.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
