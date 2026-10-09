begin;
alter table public.reiya_premium_orders add column if not exists legal_consent jsonb;
comment on column public.reiya_premium_orders.legal_consent is 'Versioned terms and recurring billing agreement, server timestamp, EUR plan amount, hashed request identifier. Not a consumer-rights waiver.';
commit;
