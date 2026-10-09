begin;
alter table public.reiya_premium_orders add column if not exists payer_email text;
alter table public.reiya_premium_orders add column if not exists payer_id text;
create or replace function public.reiya_admin_snapshot(p_hash text) returns jsonb language plpgsql security definer set search_path=public as $$
declare a jsonb;result jsonb;begin
 a:=reiya_admin_authorize(p_hash);if a is null then raise exception 'Admin session expired';end if;
 insert into reiya_admin_audit(key_id,action) values((a->>'id')::uuid,'dashboard.view');
 select jsonb_build_object(
 'as_of',now(),'admin',jsonb_build_object('label',a->>'label','expires_at',a->>'expires_at'),
 'metrics',jsonb_build_object(
  'profiles',(select count(*) from reiya_premium_profiles),
  'active',(select count(*) from reiya_premium_licenses where status='active' and not revoked and expires_at>now()),
  'revoked',(select count(*) from reiya_premium_licenses where revoked),
  'expired',(select count(*) from reiya_premium_licenses where not revoked and expires_at<=now()),
  'devices',(select count(*) from reiya_premium_devices),
  'backups',(select count(*) from reiya_premium_backups),
  'backup_bytes',(select coalesce(sum(octet_length(ciphertext)),0) from reiya_premium_backups),
  'orders',(select count(*) from reiya_premium_orders),
  'delivered',(select count(*) from reiya_premium_orders where delivered_at is not null)),
 'plans',jsonb_build_object('monthly',(select count(*) from reiya_premium_licenses l join reiya_premium_orders o on o.id=l.order_id where o.plan='monthly' and l.status='active' and not l.revoked and l.expires_at>now()),'yearly',(select count(*) from reiya_premium_licenses l join reiya_premium_orders o on o.id=l.order_id where o.plan='yearly' and l.status='active' and not l.revoked and l.expires_at>now())),
 'subscriptions',coalesce((select jsonb_agg(row_to_json(x)) from (select l.id,l.profile_id,p.display_name,o.payer_email,o.payer_id,o.paypal_subscription_id,o.plan,l.status,l.revoked,l.expires_at,(select count(*) from reiya_premium_devices d where d.license_id=l.id) as devices,(select count(*) from reiya_premium_backups b where b.profile_id=l.profile_id) as backups from reiya_premium_licenses l join reiya_premium_profiles p on p.id=l.profile_id join reiya_premium_orders o on o.id=l.order_id order by o.created_at desc limit 100) x),'[]'::jsonb),
 'activity',coalesce((select jsonb_agg(row_to_json(x)) from (select day::date as day,(select count(*) from reiya_premium_profiles p where p.created_at>=day and p.created_at<day+interval '1 day') as profiles from generate_series(date_trunc('day',now())-interval '13 days',date_trunc('day',now()),interval '1 day') day order by day) x),'[]'::jsonb),
 'audit',coalesce((select jsonb_agg(row_to_json(x)) from (select action,target_id,detail,created_at from reiya_admin_audit order by created_at desc,id desc limit 30) x),'[]'::jsonb)
 ) into result;return result;end $$;

revoke all on function public.reiya_admin_snapshot(text) from public,anon,authenticated;
grant execute on function public.reiya_admin_snapshot(text) to service_role;
commit;
