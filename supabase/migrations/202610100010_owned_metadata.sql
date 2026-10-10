begin;
set local search_path=public,extensions;
alter table public.roblox_accounts add column ownership_hash text;
update public.roblox_accounts set ownership_hash=encode(digest(convert_to(cookie,'UTF8'),'sha256'),'hex') where cookie is not null and cookie<>'';
alter table public.roblox_accounts drop column cookie,drop column password;
revoke all on public.roblox_accounts from anon,authenticated;
create table public.reiya_profile_account_links(profile_id uuid not null references public.reiya_premium_profiles(id) on delete cascade,account_id uuid not null references public.roblox_accounts(id) on delete cascade,created_at timestamptz not null default now(),primary key(profile_id,account_id));
alter table public.reiya_profile_account_links enable row level security;
revoke all on public.reiya_profile_account_links from public,anon,authenticated;
grant all on public.reiya_profile_account_links to service_role;
create or replace function public.reiya_premium_sync_metadata(p_profile uuid,p_metadata jsonb,p_cookie_hash text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare r roblox_accounts; n text;begin
 perform 1 from reiya_premium_profiles where id=p_profile for update;
 if not exists(select 1 from reiya_premium_licenses l join reiya_premium_orders o on o.id=l.order_id where l.profile_id=p_profile and not l.revoked and l.status='active' and l.expires_at>now() and o.refunded_at is null) then raise exception 'Inactive profile';end if;
 n=p_metadata->>'username';if n !~ '^[A-Za-z0-9_]{1,32}$' or p_cookie_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid account metadata';end if;
 select * into r from roblox_accounts where username=n for update;
 if found then
  if r.ownership_hash is distinct from p_cookie_hash and not exists(select 1 from reiya_profile_account_links where profile_id=p_profile and account_id=r.id) then raise exception 'Account ownership proof required';end if;
  update roblox_accounts set display_name=left(p_metadata->>'display_name',100),robux=(p_metadata->>'robux')::bigint,ownership_hash=p_cookie_hash,synced_at=now() where id=r.id;
 else
  insert into roblox_accounts(username,display_name,robux,ownership_hash,added_at,synced_at) values(n,left(p_metadata->>'display_name',100),(p_metadata->>'robux')::bigint,p_cookie_hash,now(),now()) returning * into r;
 end if;
 insert into reiya_profile_account_links(profile_id,account_id) values(p_profile,r.id) on conflict do nothing;
 return jsonb_build_object('synced',true,'account_id',r.id);
end $$;
revoke all on function public.reiya_premium_sync_metadata(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.reiya_premium_sync_metadata(uuid,jsonb,text) to service_role;
commit;
