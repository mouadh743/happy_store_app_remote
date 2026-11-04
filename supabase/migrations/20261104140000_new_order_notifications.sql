-- New-order alerts for the admin app.
--
-- Flow: the store inserts an order -> trigger below calls the
-- `notify-new-order` Edge Function (pg_net, async, after commit) -> the
-- function sends an Expo push to every device in push_tokens.
-- The app also listens on Realtime to refresh its list while open.

-- 1. Devices that want alerts. The app registers its Expo push token here.
create table public.push_tokens (
  token text primary key,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

-- Default privileges grant ALL on new tables to anon; the app may only add a
-- token, never read the list of devices or change/delete one.
revoke all on public.push_tokens from anon, authenticated;
grant insert (token, platform) on public.push_tokens to anon, authenticated;

-- DEV ONLY (like the orders policies): restrict to signed-in admins later.
create policy "push_tokens_register_dev"
  on public.push_tokens
  for insert
  to anon, authenticated
  with check (true);

-- 2. When the push for an order went out. The function claims rows where this
-- is null, so each order is announced once even if the function runs twice.
alter table public.orders add column notified_at timestamptz;

-- Don't announce orders that already exist.
update public.orders set notified_at = now() where notified_at is null;

-- 3. Live inserts for the open app (Realtime still applies the RLS policies).
alter publication supabase_realtime add table public.orders;

-- 4. Call the Edge Function for each new order.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://mqblaehqgbokpnvaqwzx.supabase.co/functions/v1/notify-new-order',
    body := jsonb_build_object('order_id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

-- Trigger-only; nobody should call it through the API.
revoke execute on function public.notify_new_order() from public, anon, authenticated;

create trigger orders_notify_new
  after insert on public.orders
  for each row
  execute function public.notify_new_order();
