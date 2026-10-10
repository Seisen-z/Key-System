begin;
create table public.reiya_customer_sessions(token_hash text primary key,email text not null,expires_at timestamptz not null);
create index reiya_customer_session_expiry on public.reiya_customer_sessions(expires_at);
create table public.reiya_refund_requests(id uuid primary key default gen_random_uuid(),order_id uuid not null unique references public.reiya_premium_orders(id),email text not null,reason text not null check(length(reason) between 10 and 500),status text not null default 'pending' check(status in ('pending','processing','refunded','rejected','failed')),created_at timestamptz not null default now(),resolved_at timestamptz,refund_id text);
alter table public.reiya_customer_sessions enable row level security;
alter table public.reiya_refund_requests enable row level security;
revoke all on public.reiya_customer_sessions,public.reiya_refund_requests from public,anon,authenticated;
grant all on public.reiya_customer_sessions,public.reiya_refund_requests to service_role;
commit;
alter table public.reiya_premium_orders add column email_delivery_status text;

alter table public.reiya_refund_requests add column sale_id text;
update public.reiya_premium_orders set payer_email=lower(payer_email) where payer_email is not null;
