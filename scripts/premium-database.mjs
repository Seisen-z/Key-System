
import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const vars={};for(const line of readFileSync(resolve(root,'.env'),'utf8').split('\n')){const i=line.indexOf('=');if(i>0&&!line.startsWith('#'))vars[line.slice(0,i).trim()]=line.slice(i+1).trim().replace(/^['"]|['"]$/g,'');}
const ref=new URL(vars.VITE_SUPABASE_URL).hostname.split('.')[0];if(!vars.SUPABASE_PAT)throw Error('SUPABASE_PAT required for database migration/tests');
const migration=readFileSync(resolve(root,'supabase/migrations/202610090001_reiya_premium.sql'),'utf8');
const assertions=`
do $$ declare lid uuid; a jsonb; o uuid:=gen_random_uuid(); pid uuid; begin
 if has_table_privilege('anon','public.reiya_premium_backups','select') or has_function_privilege('authenticated','public.reiya_premium_activate(text,text,text,text)','execute') then raise exception 'Public access unexpectedly granted';end if;
 insert into reiya_premium_orders(id,claim_hash,plan,paypal_subscription_id) values(o,'synthetic','monthly','I-TEST-'||o);
 lid:=reiya_premium_fulfill(o,'I-TEST-'||o,'fixture-hash-'||o,'fixture-key-cipher','fixture-cloud-cipher',now()+interval '1 month');
 if reiya_premium_fulfill(o,'I-TEST-'||o,'different','different','different',now()+interval '1 month')<>lid then raise exception 'Fulfillment not idempotent';end if;
 a:=reiya_premium_activate('fixture-hash-'||o,'device-1','token-'||o,'Fixture');
 if reiya_premium_authorize('token-'||o) is null then raise exception 'Valid session rejected';end if;
 perform reiya_premium_activate('fixture-hash-'||o,'device-2','token2-'||o,'');perform reiya_premium_activate('fixture-hash-'||o,'device-3','token3-'||o,'');
 begin perform reiya_premium_activate('fixture-hash-'||o,'device-4','token4-'||o,'');raise exception 'Device limit bypassed';exception when others then if sqlerrm='Device limit bypassed' then raise;end if;end;
 update reiya_premium_licenses set revoked=true where id=lid;if reiya_premium_authorize('token-'||o) is not null then raise exception 'Revoked key allowed';end if;
 update reiya_premium_licenses set revoked=false,expires_at=now()-interval '1 second' where id=lid;if reiya_premium_authorize('token-'||o) is not null then raise exception 'Expired license allowed';end if;
 pid:=(a->>'profile_id')::uuid;for i in 1..7 loop perform reiya_premium_save_backup(pid,'encrypted-fixture-'||i,'{}');end loop;
 if (select count(*) from reiya_premium_backups where profile_id=pid)<>5 then raise exception 'Backup retention failed';end if;
 if not reiya_premium_rate('fixture-'||o,1,60) or reiya_premium_rate('fixture-'||o,1,60) then raise exception 'Rate limit failed';end if;
 end $$;
select 'PASS: RLS/grants, idempotent fulfillment, activation, expiry/revocation, device cap, retention, rate limits' as result;
`;
const apply=process.argv.includes('--apply');const sql=apply?migration:'begin;\n'+migration.replace(/^\s*begin;/,'').replace(/commit;\s*$/,'')+assertions+'\nrollback;';
const res=await fetch('https://api.supabase.com/v1/projects/'+ref+'/database/query',{method:'POST',headers:{Authorization:'Bearer '+vars.SUPABASE_PAT,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});if(!res.ok){console.error('DATABASE HTTP',res.status,(await res.text()).slice(0,400));process.exit(1);}const result=await res.json();console.log(apply?'APPLIED: isolated Reiya Premium schema':JSON.stringify(result));console.log(apply?'Existing non-Premium tables unchanged':'ROLLBACK: synthetic database fixtures and transaction rolled back');
