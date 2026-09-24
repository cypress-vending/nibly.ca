import test from 'node:test';
import assert from 'node:assert/strict';
import { createNiblyTracking } from '../business/tracking/nibly-tracking.mjs';
function fixture(href = 'https://landing.example/business/?oppref=abc&utm_source=chatgpt&email=private@example.com') {
 const store = new Map(), scripts = [], calls = [];
 const w = { location: new URL(href), sessionStorage: { getItem: k => store.get(k), setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) }, document: { createElement: () => ({}), head: { appendChild: s => scripts.push(s) } } };
 const options = {enabled:true,pixelId:'test-public-id',allowedOrigins:['https://landing.example'],windowRef:w};
 return {w,store,scripts,calls,options};
}
test('default preview never loads SDK or emits a lead, even with consent',()=>{
 const f=fixture();const tracker=createNiblyTracking({...f.options,enabled:false});
 assert.equal(tracker.setConsent(true),false);assert.equal(tracker.leadConfirmed({eventId:'test-event-001'}).queued,false);assert.equal(f.scripts.length,0);
});
test('origin and HTTPS guards prevent accidental preview reporting',()=>{
 for(const url of ['http://landing.example/','https://preview.example/','http://localhost:5184/']) {
  const f=fixture(url);const t=createNiblyTracking(f.options);assert.equal(t.setConsent(true),false);assert.equal(f.scripts.length,0);
 }
});
test('eligible production initializes without a consent action and emits no lead on load',()=>{
 const f=fixture();const t=createNiblyTracking(f.options);
 assert.equal(f.scripts.length,1);
 assert.deepEqual(f.w.oaiq.q.map(args=>Array.from(args)),[['init',{pixelId:'test-public-id'}]]);
 assert.deepEqual(t.getAttribution(),{oppref:'abc',utm_source:'chatgpt'});
});
test('confirmed lead uses standard payload and deduplicates callback/reload',()=>{
 const f=fixture();const t=createNiblyTracking(f.options);assert.equal(f.scripts.length,1);
 assert.deepEqual(Array.from(f.w.oaiq.q[0]),['init',{pixelId:'test-public-id'}]);
 assert.equal(t.leadConfirmed({eventId:'submission-001'}).queued,true);
 assert.deepEqual(Array.from(f.w.oaiq.q.at(-1)),['measure','lead_created',{type:'customer_action'},{event_id:'submission-001'}]);
 assert.equal(t.leadConfirmed({eventId:'submission-001'}).reason,'duplicate');
 const again=createNiblyTracking(f.options);assert.equal(again.leadConfirmed({eventId:'submission-001'}).reason,'duplicate');
});
test('attribution is allowlisted and consent revocation blocks future events',()=>{
 const f=fixture();const t=createNiblyTracking(f.options);t.setConsent(true);
 assert.deepEqual(t.getAttribution(),{oppref:'abc',utm_source:'chatgpt'});
 t.setConsent(false);assert.deepEqual(t.getAttribution(),{});assert.equal(f.store.size,0);assert.equal(t.leadConfirmed({eventId:'submission-002'}).queued,false);
});
test('bad IDs are rejected and blocked storage does not break lead flow',()=>{
 const f=fixture();f.w.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
 const t=createNiblyTracking(f.options);t.setConsent(true);assert.equal(t.leadConfirmed({eventId:'user@example.com'}).reason,'invalid-event-id');assert.equal(t.leadConfirmed({eventId:'submission-003'}).queued,true);
});
