// Retired credential-upload endpoint. New apps use server-authorized Premium metadata sync.
Deno.serve((_req)=>new Response(JSON.stringify({error:'Legacy credential sync retired. Update Reiya; local accounts and encrypted Premium backups remain available.'}),{status:410,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}));
