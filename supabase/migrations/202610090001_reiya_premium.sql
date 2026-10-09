
begin;
create table if not exists public.reiya_premium_orders (
 id uuid primary key, claim_hash text not null, plan text not null check(plan in ('monthly','yearly')),
 paypal_subscription_id text unique, license_id uuid, key_ciphertext text,
 created_at timestamptz not null default now(), delivered_at timestamptz
);
create table if not exists public.reiya_premium_profiles (
 id uuid primary key default gen_random_uuid(), display_name text not null default 'Premium user',
 cloud_key_ciphertext text not null, created_at timestamptz not null default now()
);
create table if not exists public.reiya_premium_licenses (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.reiya_premium_profiles(id),
 order_id uuid not null unique references public.reiya_premium_orders(id), key_hash text not null unique,
 paypal_subscription_id text not null unique, status text not null default 'active', revoked boolean not null default false,
 expires_at timestamptz not null, max_devices integer not null default 3 check(max_devices between 1 and 10)
);
create table if not exists public.reiya_premium_devices (
 license_id uuid references public.reiya_premium_licenses(id) on delete cascade, device_hash text not null,
 last_seen timestamptz not null default now(), primary key(license_id,device_hash)
);
create table if not exists public.reiya_premium_sessions (
 token_hash text primary key, license_id uuid not null references public.reiya_premium_licenses(id) on delete cascade,
 device_hash text not null, expires_at timestamptz not null default now()+interval '15 minutes'
);
create table if not exists public.reiya_premium_backups (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.reiya_premium_profiles(id),
 ciphertext text not null check(octet_length(ciphertext)<=3000000), metadata jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create index if not exists reiya_premium_backup_owner on public.reiya_premium_backups(profile_id,created_at desc);
create table if not exists public.reiya_premium_rates (
 bucket text primary key, hits integer not null, until_at timestamptz not null
);
-- These tables and RPCs are exclusively server-accessible. Desktop/browser has no direct data access.
do $$ declare t text; begin
 foreach t in array array['orders','profiles','licenses','devices','sessions','backups','rates'] loop
 execute format('alter table public.reiya_premium_%I enable row level security',t);
 execute format('revoke all on public.reiya_premium_%I from anon, authenticated',t);
 execute format('grant all on public.reiya_premium_%I to service_role',t);
 end loop;
end $$;
create or replace function public.reiya_premium_rate(p_bucket text,p_limit int,p_seconds int)
returns boolean language plpgsql security definer set search_path=public as $$
declare n int; begin
 insert into reiya_premium_rates values(p_bucket,1,now()+make_interval(secs=>p_seconds))
 on conflict(bucket) do update set hits=case when reiya_premium_rates.until_at<now() then 1 else reiya_premium_rates.hits+1 end,
 until_at=case when reiya_premium_rates.until_at<now() then now()+make_interval(secs=>p_seconds) else reiya_premium_rates.until_at end
 returning hits into n;
 delete from reiya_premium_rates where until_at<now()-interval '1 day';
 return n<=p_limit; end $$;
create or replace function public.reiya_premium_fulfill(p_order uuid,p_subscription text,p_key_hash text,p_key_cipher text,p_cloud_cipher text,p_expires timestamptz)
returns uuid language plpgsql security definer set search_path=public as $$
declare o reiya_premium_orders; pid uuid; lid uuid; begin
 select * into o from reiya_premium_orders where id=p_order for update;
 if not found or o.paypal_subscription_id is distinct from p_subscription then raise exception 'Unknown purchase'; end if;
 if o.license_id is not null then return o.license_id; end if;
 if p_expires<=now() then raise exception 'Paid period expired'; end if;
 insert into reiya_premium_profiles(cloud_key_ciphertext) values(p_cloud_cipher) returning id into pid;
 insert into reiya_premium_licenses(profile_id,order_id,key_hash,paypal_subscription_id,expires_at)
 values(pid,p_order,p_key_hash,p_subscription,p_expires) returning id into lid;
 update reiya_premium_orders set license_id=lid,key_ciphertext=p_key_cipher where id=p_order;
 return lid; end $$;
create or replace function public.reiya_premium_activate(p_hash text,p_device text,p_token text,p_name text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare l reiya_premium_licenses; p reiya_premium_profiles; begin
 select * into l from reiya_premium_licenses where key_hash=p_hash for update;
 if not found or l.revoked or l.status<>'active' or l.expires_at<=now() then raise exception 'Invalid or inactive Premium key'; end if;
 if not exists(select 1 from reiya_premium_devices where license_id=l.id and device_hash=p_device) and
 (select count(*) from reiya_premium_devices where license_id=l.id)>=l.max_devices then raise exception 'Device limit reached; deactivate another device'; end if;
 insert into reiya_premium_devices(license_id,device_hash) values(l.id,p_device)
 on conflict(license_id,device_hash) do update set last_seen=now();
 delete from reiya_premium_sessions where expires_at<now();
 insert into reiya_premium_sessions(token_hash,license_id,device_hash) values(p_token,l.id,p_device);
 if p_name<>'' then update reiya_premium_profiles set display_name=left(p_name,48) where id=l.profile_id and display_name='Premium user'; end if;
 select * into p from reiya_premium_profiles where id=l.profile_id;
 return jsonb_build_object('license_id',l.id,'profile_id',p.id,'display_name',p.display_name,'expires_at',l.expires_at,'cloud_key_ciphertext',p.cloud_key_ciphertext);
 end $$;
create or replace function public.reiya_premium_authorize(p_hash text)
returns jsonb language sql security definer set search_path=public as $$
 select jsonb_build_object('license_id',l.id,'profile_id',l.profile_id,'device_hash',s.device_hash,'expires_at',l.expires_at)
 from reiya_premium_sessions s join reiya_premium_licenses l on l.id=s.license_id
 where s.token_hash=p_hash and s.expires_at>now() and l.expires_at>now() and l.status='active' and not l.revoked
$$;
create or replace function public.reiya_premium_save_backup(p_profile uuid,p_cipher text,p_metadata jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare bid uuid; begin
 perform 1 from reiya_premium_profiles where id=p_profile for update;
 insert into reiya_premium_backups(profile_id,ciphertext,metadata) values(p_profile,p_cipher,p_metadata) returning id into bid;
 delete from reiya_premium_backups where profile_id=p_profile and id not in
 (select id from reiya_premium_backups where profile_id=p_profile order by created_at desc,id desc limit 5);
 return bid; end $$;
revoke all on function public.reiya_premium_rate(text,int,int),public.reiya_premium_fulfill(uuid,text,text,text,text,timestamptz),public.reiya_premium_activate(text,text,text,text),public.reiya_premium_authorize(text),public.reiya_premium_save_backup(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.reiya_premium_rate(text,int,int),public.reiya_premium_fulfill(uuid,text,text,text,text,timestamptz),public.reiya_premium_activate(text,text,text,text),public.reiya_premium_authorize(text),public.reiya_premium_save_backup(uuid,text,jsonb) to service_role;
commit;
