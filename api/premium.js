
import * as service from '../server/premium.mjs';
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 try{const action=req.query?.action;const allowed={config:['GET'],checkout:['POST'],receipt:['POST'],activate:['POST'],status:['GET'],backup:['GET','POST','DELETE'],deactivate:['POST'],webhook:['POST']};if(!allowed[action]?.includes(req.method))throw new service.HttpError(405,'Method not allowed');
 const local=req.premiumLocalTest===true&&process.env.NODE_ENV!=='production';const origin=req.headers.origin;const localOrigin=local&&origin&&['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname)&&new URL(origin).host===req.headers.host;if(origin&&!localOrigin&&origin!==new URL(process.env.SITE_URL).origin)throw new service.HttpError(403,'Origin not allowed');
 let chunks=[],size=0;if(!req.body)for await(const chunk of req){const b=Buffer.from(chunk);chunks.push(b);size+=b.length;if(size>3200000)throw new service.HttpError(413,'Request too large');}const raw=Buffer.concat(chunks).toString('utf8');let body=typeof req.body==='object'&&!Buffer.isBuffer(req.body)?(req.body||{}):{};if(req.body&&typeof req.body!=='object'){try{body=JSON.parse(Buffer.isBuffer(req.body)?req.body.toString('utf8'):req.body);}catch{throw new service.HttpError(400,'Invalid JSON');}}if(raw){try{body=JSON.parse(raw);}catch{throw new service.HttpError(400,'Invalid JSON');}}
 if(Buffer.byteLength(JSON.stringify(body))>3200000)throw new service.HttpError(413,'Request too large');const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();let result;
 if(action==='config')result={...await service.configuration(),local_test:local,checkout_enabled:local?process.env.PAYPAL_SANDBOX==='true':process.env.PREMIUM_CHECKOUT_ENABLED!=='false'};
 else if(action==='checkout'){if(!local&&process.env.PREMIUM_CHECKOUT_ENABLED==='false')throw new service.HttpError(503,'Premium purchases are temporarily unavailable while Live billing is configured');if(local&&process.env.PAYPAL_SANDBOX!=='true')throw new service.HttpError(409,'Local checkout requires PayPal Sandbox credentials; live charges are disabled for local tests');result=await service.checkout(body.plan,ip,local?'http://'+req.headers.host:undefined,body.consent);}
 else if(action==='receipt')result=await service.receipt(body.purchase_id,body.claim_secret,ip);
 else if(action==='activate')result=await service.activate(body.key,body.device_id,body.display_name,ip);
 else if(action==='webhook')result=await service.webhook(req.headers,body);
 else {const token=req.headers.authorization?.replace(/^Bearer /,'');const a=await service.authorize(token);if(action==='status')result={premium:true,profile_id:a.profile_id,expires_at:a.expires_at};if(action==='backup')result=await service.backup(req.method,a,body,req.query.id);if(action==='deactivate')result=await service.deactivate(a);}
 res.status(200).json(result);
 }catch(e){res.status(e.status||503).json({error:e.status?e.message:'Premium service temporarily unavailable'});}
}
