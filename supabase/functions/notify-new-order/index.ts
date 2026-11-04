// Sends an Expo push notification to every registered admin device for each
// order that hasn't been announced yet. Called by the orders_notify_new trigger.
//
// It is deployed without JWT verification (see supabase/config.toml), so it
// never trusts the request body: it only announces real orders whose
// `notified_at` is still null, and marks them as it goes. Calling it again, or
// by anyone, can't send duplicates or fake orders.

import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_BATCH = 100; // Expo's max messages per request

type Order = { id: string; ref: string | null; customer_name: string | null; total: number | string };
type PushMessage = {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: 'default';
  channelId: string;
  priority: 'high';
};
type PushTicket = { status: 'ok' | 'error'; details?: { error?: string } };

function adminKey(): string {
  // New API keys come as a JSON map; fall back to the legacy service_role key.
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (keys) {
    const parsed = JSON.parse(keys) as Record<string, string>;
    if (parsed.default) return parsed.default;
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

function money(total: number | string): string {
  const n = Number(total);
  return `${(Number.isFinite(n) ? n : 0).toFixed(3)} TND`;
}

Deno.serve(async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, adminKey(), {
    auth: { persistSession: false },
  });

  // Claim every unannounced order in one statement; a parallel run gets none.
  const { data: orders, error: claimError } = await db
    .from('orders')
    .update({ notified_at: new Date().toISOString() })
    .is('notified_at', null)
    .select('id, ref, customer_name, total');
  if (claimError) {
    console.error('claim failed', claimError);
    return Response.json({ error: 'claim failed' }, { status: 500 });
  }
  if (!orders?.length) return Response.json({ sent: 0 });

  const { data: devices, error: tokenError } = await db.from('push_tokens').select('token');
  if (tokenError) {
    console.error('token read failed', tokenError);
    return Response.json({ error: 'token read failed' }, { status: 500 });
  }
  if (!devices?.length) return Response.json({ sent: 0, orders: orders.length });

  const messages: PushMessage[] = (orders as Order[]).flatMap((order) =>
    devices.map(({ token }) => ({
      to: token,
      title: `New order ${order.ref ?? ''}`.trim(),
      body: `${order.customer_name?.trim() || 'Customer'} · ${money(order.total)}`,
      data: { orderId: order.id },
      sound: 'default' as const,
      channelId: 'orders',
      priority: 'high' as const,
    })),
  );

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  // Optional: only needed if "enhanced push security" is on in the Expo project.
  const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  if (expoToken) headers.Authorization = `Bearer ${expoToken}`;

  let sent = 0;
  const deadTokens = new Set<string>();
  for (let i = 0; i < messages.length; i += EXPO_BATCH) {
    const batch = messages.slice(i, i + EXPO_BATCH);
    const res = await fetch(EXPO_PUSH_URL, { method: 'POST', headers, body: JSON.stringify(batch) });
    if (!res.ok) {
      console.error('expo push failed', res.status, await res.text());
      continue;
    }
    const { data: tickets } = (await res.json()) as { data: PushTicket[] };
    tickets.forEach((ticket, j) => {
      if (ticket.status === 'ok') sent++;
      // The app was uninstalled or notifications turned off: stop sending to it.
      else if (ticket.details?.error === 'DeviceNotRegistered') deadTokens.add(batch[j].to);
      else console.error('push ticket error', ticket);
    });
  }

  if (deadTokens.size) {
    await db.from('push_tokens').delete().in('token', [...deadTokens]);
  }

  return Response.json({ sent, orders: orders.length, removedDevices: deadTokens.size });
});
