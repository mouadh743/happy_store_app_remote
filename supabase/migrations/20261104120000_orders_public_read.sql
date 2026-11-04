-- DEV ONLY: lets the app's anon/publishable key read orders without signing in.
-- RLS is on for public.orders, and with no policy every read returned 0 rows.
-- Before production, replace this with an authenticated/admin-only policy:
-- anyone with the key (it ships inside the app) can read customer names,
-- phones and emails.
create policy "orders_public_read_dev"
  on public.orders
  for select
  to anon, authenticated
  using (true);
