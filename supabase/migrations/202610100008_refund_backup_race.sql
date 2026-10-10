begin;
create or replace function public.reiya_premium_refund_finalize(p_order uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare o reiya_premium_orders; l reiya_premium_licenses; consent boolean; removed int;
begin
 select * into o from reiya_premium_orders where id=p_order for update;
 if not found then raise exception 'Unknown refunded purchase'; end if;
 select * into l from reiya_premium_licenses where order_id=p_order for update;
 if not found then raise exception 'Unknown refunded license'; end if;
 perform 1 from reiya_premium_profiles where id=l.profile_id for update;
 select coalesce(bool_or(erase_local_data and erase_consent_at is not null and status<>'rejected'),false) into consent from reiya_refund_requests where order_id=p_order;
 update reiya_premium_licenses set revoked=true,status='inactive' where id=l.id;
 delete from reiya_premium_sessions where license_id=l.id;
 delete from reiya_premium_backups where profile_id=l.profile_id;
 get diagnostics removed=row_count;
 update reiya_premium_profiles set cloud_key_ciphertext='',display_name='Refunded profile' where id=l.profile_id;
 update reiya_premium_orders set refunded_at=coalesce(refunded_at,now()),local_wipe_requested=local_wipe_requested or consent,key_ciphertext=null where id=p_order;
 update reiya_refund_requests set status='refunded',resolved_at=coalesce(resolved_at,now()) where order_id=p_order;
 return jsonb_build_object('refunded',true,'erase_local_data',consent,'cloud_backups_deleted',removed);
end $$;
revoke all on function public.reiya_premium_refund_finalize(uuid) from public,anon,authenticated;
grant execute on function public.reiya_premium_refund_finalize(uuid) to service_role;
create or replace function public.reiya_premium_save_backup(p_profile uuid,p_cipher text,p_metadata jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare bid uuid;begin
 perform 1 from reiya_premium_profiles where id=p_profile for update;
 if not exists(select 1 from reiya_premium_licenses l join reiya_premium_orders o on o.id=l.order_id where l.profile_id=p_profile and l.status='active' and not l.revoked and l.expires_at>now() and o.refunded_at is null) then raise exception 'Refunded or inactive profile'; end if;
 insert into reiya_premium_backups(profile_id,ciphertext,metadata) values(p_profile,p_cipher,p_metadata) returning id into bid;
 delete from reiya_premium_backups where profile_id=p_profile and id not in(select id from reiya_premium_backups where profile_id=p_profile order by created_at desc,id desc limit 5);
 return bid;end $$;
revoke all on function public.reiya_premium_save_backup(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.reiya_premium_save_backup(uuid,text,jsonb) to service_role;
commit;
