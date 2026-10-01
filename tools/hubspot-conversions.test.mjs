import test from 'node:test';
import assert from 'node:assert/strict';
import { createNiblyTracking } from '../business/tracking/nibly-tracking.mjs';
import { connectHubSpotConversions } from '../business/tracking/hubspot-conversions.mjs';
const formId = 'cfb46a58-42db-4eb5-9d46-53fc060f8252';
function fixture({enabled=true}={}) {
 const w = new EventTarget(), storage = new Map(), scripts=[];
 let conversionId = 'hubspot-conversion-001';
 Object.assign(w,{location:new URL('https://nibly.ca/business/?oppref=click-reference&utm_source=chatgpt'),crypto,console,
 sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
 document:{createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},
 HubSpotFormsV4:{getFormFromEvent:()=>({getFormId:()=>formId,getConversionId:()=>conversionId,getInstanceId:()=> 'instance-001'})}});
 const tracking=createNiblyTracking({enabled,pixelId:'public-test-pixel',allowedOrigins:['https://nibly.ca'],windowRef:w});
 const disconnect=connectHubSpotConversions({windowRef:w,tracking,formId});
 const emit=(name='hs-form-event:on-submission:success',id=formId)=>w.dispatchEvent(new CustomEvent(name,{detail:{formId:id,instanceId:'instance-001'}}));
 const leads=()=> (w.oaiq?.q||[]).map(x=>Array.from(x)).filter(x=>x[0]==='measure');
 return {w,emit,leads,scripts,disconnect,setId:id=>conversionId=id};
}
test('only a confirmed success for the configured HubSpot form emits a lead',()=>{
 const f=fixture();
 for(const event of ['click','submit','hs-form-event:on-ready','hs-form-event:on-submission:failed']) f.emit(event);
 f.emit(undefined,'another-form'); assert.equal(f.leads().length,0);
 f.emit();assert.deepEqual(f.leads(),[['measure','lead_created',{type:'customer_action'},{event_id:'hubspot-conversion-001'}]]);
 f.emit();assert.equal(f.leads().length,1);
 f.setId('hubspot-conversion-002');f.emit();assert.equal(f.leads().length,2);
});
test('missing conversion IDs deduplicate per instance without collecting contact data',()=>{
 const f=fixture();f.setId(undefined);f.emit();f.emit();assert.equal(f.leads().length,1);
 assert.match(f.leads()[0][3].event_id,/^[a-f0-9-]{36}$/);
});
test('missing API, invalid form identity and SDK errors do not break lead delivery',()=>{
 const f=fixture();delete f.w.HubSpotFormsV4;assert.doesNotThrow(()=>f.emit());assert.equal(f.leads().length,0);
 f.w.HubSpotFormsV4={getFormFromEvent:()=>({getFormId:()=> 'wrong'})};f.emit();assert.equal(f.leads().length,0);
 f.w.console={warn:()=>{}};f.w.HubSpotFormsV4={getFormFromEvent:()=>{throw Error('unavailable')}};assert.doesNotThrow(()=>f.emit());
});
test('disabled preview cannot send conversions, and listener can be removed',()=>{
 const f=fixture({enabled:false});f.emit();assert.equal(f.scripts.length,0);assert.equal(f.leads().length,0);
 const active=fixture();active.disconnect();active.emit();assert.equal(active.leads().length,0);
});
