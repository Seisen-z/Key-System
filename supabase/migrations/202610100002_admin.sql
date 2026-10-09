begin;
create table if not exists public.reiya_admin_keys (id uuid primary key default gen_random_uuid(),label text not null default 'Reiya administrator',login_uuid uuid not null unique,enabled boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.reiya_admin_sessions (token_hash text primary key,key_id uuid not null references public.reiya_admin_keys(id) on delete cascade,expires_at timestamptz not null default now()+interval '20 minutes');
create table if not exists public.reiya_admin_audit (id bigint generated always as identity primary key,key_id uuid references public.reiya_admin_keys(id) on delete set null,action text not null,target_id uuid,detail text,created_at timestamptz not null default now());
alter table public.reiya_admin_keys enable row level security;
alter table public.reiya_admin_sessions enable row level security;
alter table public.reiya_admin_audit enable row level security;
revoke all on public.reiya_admin_keys,public.reiya_admin_sessions,public.reiya_admin_audit from anon,authenticated;
grant all on public.reiya_admin_keys,public.reiya_admin_sessions,public.reiya_admin_audit to service_role;
grant usage,select on sequence public.reiya_admin_audit_id_seq to service_role;
create or replace function public.reiya_admin_rotate() returns trigger language plpgsql security definer set search_path=public as $$ begin delete from reiya_admin_sessions where key_id=new.id;return new;end $$;
drop trigger if exists reiya_admin_rotate_sessions on public.reiya_admin_keys;
create trigger reiya_admin_rotate_sessions after update of login_uuid,enabled on public.reiya_admin_keys for each row execute function public.reiya_admin_rotate();
create or replace function public.reiya_admin_login(p_uuid uuid,p_hash text) returns jsonb language plpgsql security definer set search_path=public as $$
declare k reiya_admin_keys;begin
 select * into k from reiya_admin_keys where login_uuid=p_uuid and enabled for update;
 if not found then return null;end if;
 delete from reiya_admin_sessions where expires_at<now();
 insert into reiya_admin_sessions(token_hash,key_id) values(p_hash,k.id);
 insert into reiya_admin_audit(key_id,action) values(k.id,'login');
 return jsonb_build_object('label',k.label,'expires_at',now()+interval '20 minutes');end $$;
create or replace function public.reiya_admin_authorize(p_hash text) returns jsonb language sql security definer set search_path=public as $$
 select jsonb_build_object('id',k.id,'label',k.label,'expires_at',s.expires_at) from reiya_admin_sessions s join reiya_admin_keys k on k.id=s.key_id where s.token_hash=p_hash and s.expires_at>now() and k.enabled
$$;
create or replace function public.reiya_admin_logout(p_hash text) returns void language plpgsql security definer set search_path=public as $$
declare kid uuid;begin select key_id into kid from reiya_admin_sessions where token_hash=p_hash;delete from reiya_admin_sessions where token_hash=p_hash;if kid is not null then insert into reiya_admin_audit(key_id,action) values(kid,'logout');end if;end $$;
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
 'subscriptions',coalesce((select jsonb_agg(row_to_json(x)) from (select l.id,l.profile_id,p.display_name,o.plan,l.status,l.revoked,l.expires_at,(select count(*) from reiya_premium_devices d where d.license_id=l.id) as devices,(select count(*) from reiya_premium_backups b where b.profile_id=l.profile_id) as backups from reiya_premium_licenses l join reiya_premium_profiles p on p.id=l.profile_id join reiya_premium_orders o on o.id=l.order_id order by o.created_at desc limit 100) x),'[]'::jsonb),
 'activity',coalesce((select jsonb_agg(row_to_json(x)) from (select day::date as day,(select count(*) from reiya_premium_profiles p where p.created_at>=day and p.created_at<day+interval '1 day') as profiles from generate_series(date_trunc('day',now())-interval '13 days',date_trunc('day',now()),interval '1 day') day order by day) x),'[]'::jsonb),
 'audit',coalesce((select jsonb_agg(row_to_json(x)) from (select action,target_id,detail,created_at from reiya_admin_audit order by created_at desc,id desc limit 30) x),'[]'::jsonb)
 ) into result;return result;end $$;
create or replace function public.reiya_admin_manage(p_hash text,p_license uuid,p_action text,p_days integer default 0,p_reason text default '') returns jsonb language plpgsql security definer set search_path=public as $$
declare a jsonb;l reiya_premium_licenses;result jsonb;begin
 a:=reiya_admin_authorize(p_hash);if a is null then raise exception 'Admin session expired';end if;
 select * into l from reiya_premium_licenses where id=p_license for update;if not found then raise exception 'License not found';end if;
 if p_action='key' then
  select jsonb_build_object('order_id',o.id,'key_ciphertext',o.key_ciphertext) into result from reiya_premium_orders o where o.id=l.order_id;
 elsif p_action='adjust' then
  if p_days=0 or abs(p_days)>3650 or length(trim(p_reason))<3 or length(p_reason)>200 then raise exception 'Invalid access adjustment';end if;
  update reiya_premium_licenses set expires_at=(case when p_days>0 then greatest(expires_at,now()) else expires_at end)+make_interval(days=>p_days) where id=p_license;
  select jsonb_build_object('expires_at',expires_at,'revoked',revoked) into result from reiya_premium_licenses where id=p_license;
 elsif p_action in ('disable','enable') then
  if length(trim(p_reason))<3 or length(p_reason)>200 then raise exception 'Reason required';end if;
  update reiya_premium_licenses set revoked=(p_action='disable'),status=case when p_action='enable' then 'active' else status end where id=p_license;
  if p_action='disable' then delete from reiya_premium_sessions where license_id=p_license;end if;
  result:=jsonb_build_object('changed',true);
 else raise exception 'Unknown admin action';end if;
 insert into reiya_admin_audit(key_id,action,target_id,detail) values((a->>'id')::uuid,'license.'||p_action,p_license,case when p_action='key' then null else left(trim(p_reason),200)||case when p_action='adjust' then ' / days='||p_days else '' end end);
 return result;end $$;
revoke all on function public.reiya_admin_manage(text,uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.reiya_admin_manage(text,uuid,text,integer,text) to service_role;
revoke all on function public.reiya_admin_rotate(),public.reiya_admin_login(uuid,text),public.reiya_admin_authorize(text),public.reiya_admin_logout(text),public.reiya_admin_snapshot(text) from public,anon,authenticated;
grant execute on function public.reiya_admin_login(uuid,text),public.reiya_admin_authorize(text),public.reiya_admin_logout(text),public.reiya_admin_snapshot(text) to service_role;
commit;
