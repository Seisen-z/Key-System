begin;
create or replace function public.reiya_premium_key_state(p_hash text) returns jsonb language sql security definer set search_path=public as $$
select jsonb_build_object('premium',o.refunded_at is null and not l.revoked and l.status='active' and l.expires_at>now(),'state',case when o.refunded_at is not null then 'refunded' when l.revoked then 'disabled' when l.expires_at<=now() then 'expired' when l.status='active' then 'active' else 'inactive' end,'expires_at',l.expires_at,'server_now',now(),'profile_id',l.profile_id,'display_name',p.display_name)
from reiya_premium_licenses l join reiya_premium_orders o on o.id=l.order_id join reiya_premium_profiles p on p.id=l.profile_id where l.key_hash=p_hash;
$$;
revoke all on function public.reiya_premium_key_state(text) from public,anon,authenticated;
grant execute on function public.reiya_premium_key_state(text) to service_role;
commit;
