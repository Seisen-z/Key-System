begin;
create extension if not exists pg_cron;
create index if not exists reiya_premium_backup_expiry on public.reiya_premium_backups(created_at);
create or replace function public.reiya_premium_purge_backups()
returns bigint language plpgsql security definer set search_path=public as $$
declare removed bigint;begin
 delete from public.reiya_premium_backups where created_at <= now()-interval '15 days';
 get diagnostics removed = row_count;
 return removed;
end $$;
revoke all on function public.reiya_premium_purge_backups() from public,anon,authenticated;
grant execute on function public.reiya_premium_purge_backups() to service_role;
create or replace function public.reiya_premium_save_backup(p_profile uuid,p_cipher text,p_metadata jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare bid uuid;begin
 perform 1 from reiya_premium_profiles where id=p_profile for update;
 delete from reiya_premium_backups where profile_id=p_profile and created_at <= now()-interval '15 days';
 insert into reiya_premium_backups(profile_id,ciphertext,metadata) values(p_profile,p_cipher,p_metadata) returning id into bid;
 delete from reiya_premium_backups where profile_id=p_profile and id not in
 (select id from reiya_premium_backups where profile_id=p_profile order by created_at desc,id desc limit 5);
 return bid;
end $$;
revoke all on function public.reiya_premium_save_backup(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.reiya_premium_save_backup(uuid,text,jsonb) to service_role;
select cron.schedule('reiya-backup-retention-15-days','0 * * * *',
 $$select public.reiya_premium_purge_backups(); delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='reiya-backup-retention-15-days') and end_time < now()-interval '7 days';$$);
commit;
