// Local UI fixture: no server calls, real purchases, SMTP delivery or billing operations.
const ORDER='10000000-0000-4000-8000-000000000017';
let refunds=[];
export const previewEnabled=(loc=globalThis.location)=>['localhost','127.0.0.1','[::1]'].includes(loc?.hostname)&&new URLSearchParams(loc?.search||'').get('preview')==='1';
export async function previewRequest(action,body){
 if(!previewEnabled())throw Error('Local preview is not enabled');
 if(action==='dashboard')return {preview:true,email:'preview@reiya.local',purchases:[{order_id:ORDER,id:'20000000-0000-4000-8000-000000000017',plan:'monthly',status:'active',revoked:false,created_at:new Date(Date.now()-86400000*2).toISOString(),expires_at:new Date(Date.now()+86400000*28).toISOString(),max_devices:3,devices:1,backups:[{id:'sample-snapshot',created_at:new Date().toISOString(),files:12,bytes:42000}],refunds}]};
 if(action==='key'){if(body.order_id!==ORDER)throw Error('Preview purchase not found');return {key:'REIYA-PREVIEW-ONLY-NOT-A-VALID-PREMIUM-KEY'};}
 if(action==='refund'){if(body.erase_local_data!==true)throw Error('Confirm the data deletion notice first');if(refunds.length)throw Error('A sample request already exists');if(String(body.reason||'').trim().length<10)throw Error('Enter at least 10 characters');refunds=[{id:'sample-refund',status:'pending',reason:body.reason,created_at:new Date().toISOString()}];return {requested:true};}
 if(action==='email-key')throw Error('Preview does not send email. Use verified account sign-in to test SMTP delivery.');
 if(action==='logout'){refunds=[];location.assign('/my-premium');return {signed_out:true};}
 throw Error('This action is not available in the local preview');
}
