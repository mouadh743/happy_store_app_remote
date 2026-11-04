-- DEV ONLY: lets the app's anon/publishable key change an order's status
-- without signing in. Replace with an authenticated/admin-only policy before
-- production (see 20261104120000_orders_public_read.sql).

create policy "orders_public_update_status_dev"
  on public.orders
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- The policy is row-level; limit the columns too, so the app's key can change
-- `status` and nothing else (not totals, customer details or items).
-- Allowed values are still enforced by orders_status_check.
revoke update on public.orders from anon, authenticated;
grant update (status) on public.orders to anon, authenticated;
