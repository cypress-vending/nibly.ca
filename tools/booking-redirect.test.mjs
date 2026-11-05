import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { connectBookingRedirect, bookingFormIds, bookingUrl } from '../booking-redirect.mjs';
import { connectHubSpotConversions } from '../business/tracking/hubspot-conversions.mjs';

const enquiryFormId = '584606a2-c862-4806-9216-923f18c529fd';
const campaignFormId = '915079cb-bc34-4b07-9079-26e9c3e19248';
const serviceFormId = '2ff4c7dd-449f-469a-a5b1-68c8db99fb0a';
const root = new URL('../', import.meta.url);

function fixture(formId = campaignFormId) {
  const windowRef = new EventTarget(), frames = [], timers = [], visits = [];
  Object.assign(windowRef, {
    location: { assign: url => visits.push(url) },
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
    console: { warn() {} },
    HubSpotFormsV4: { getFormFromEvent: () => ({
      getFormId: () => formId, getConversionId: () => 'conversion-test-001',
    }) },
  });
  connectBookingRedirect({ windowRef });
  return {
    windowRef, frames, timers, visits,
    emit: (name = 'hs-form-event:on-submission:success', id = formId) =>
      windowRef.dispatchEvent(new CustomEvent(name, { detail: { formId: id } })),
    paint: () => frames.splice(0).forEach(callback => callback()),
  };
}

test('the Calendly round robin is the booking destination for both sales forms', () => {
  assert.equal(bookingUrl, 'https://calendly.com/d/cv5w-hbr-rdr/nibly-meeting');
  assert.deepEqual([...bookingFormIds].sort(), [enquiryFormId, campaignFormId].sort());
});

test('success waits for the confirmation to paint, then schedules exactly one second', () => {
  for (const formId of [enquiryFormId, campaignFormId]) {
    const f = fixture(formId);
    f.emit(); f.emit();
    assert.equal(f.frames.length, 1);
    assert.equal(f.timers.length, 0);
    f.paint();
    assert.equal(f.timers.length, 0);
    f.paint();
    assert.equal(f.timers.length, 1);
    assert.equal(f.timers[0].delay, 1000);
    assert.deepEqual(f.visits, []);
    f.timers[0].callback();
    assert.deepEqual(f.visits, [bookingUrl]);
  }
});

test('loading, failed submissions, the service form and unrelated forms never redirect', () => {
  const f = fixture();
  for (const name of ['click', 'submit', 'hs-form-event:on-ready', 'hs-form-event:on-submission:failed']) f.emit(name);
  f.emit(undefined, 'another-form');
  f.emit(undefined, serviceFormId);
  assert.equal(f.frames.length, 0);
  assert.equal(f.timers.length, 0);
});

test('every sales form page loads the redirect, and the service request page does not', () => {
  for (const page of ['index.html', 'the-machine.html', 'locations.html', 'contact-us.html']) {
    const html = readFileSync(new URL(page, root), 'utf8');
    assert.ok(html.includes(`data-form-id="${enquiryFormId}"`), page);
    assert.equal(html.split('<script type="module" src="booking-redirect.mjs"></script>').length, 2, page);
  }
  for (const page of ['business/index.html', 'side-hustle/index.html', 'franchise/index.html']) {
    const html = readFileSync(new URL(page, root), 'utf8');
    assert.ok(html.includes(`data-form-id="${campaignFormId}"`), page);
    assert.match(html, /<script type="module" src="(\.|\.\.\/business)\/baseline\.js"/, page);
  }
  assert.match(readFileSync(new URL('business/baseline.js', root), 'utf8'), /^import '\.\.\/booking-redirect\.mjs';$/m);
  assert.ok(!readFileSync(new URL('request.html', root), 'utf8').includes('booking-redirect'));
});

test('conversion queues before navigation, and measurement failure does not block booking', () => {
  for (const blocked of [false, true]) {
    const f = fixture(), conversions = [];
    connectHubSpotConversions({ windowRef: f.windowRef, formId: campaignFormId, tracking: {
      leadConfirmed: value => {
        if (blocked) throw Error('blocked pixel');
        conversions.push(value);
      },
    } });
    f.emit();
    assert.equal(conversions.length, blocked ? 0 : 1);
    assert.deepEqual(f.visits, []);
    f.paint(); f.paint(); f.timers[0].callback();
    assert.deepEqual(f.visits, [bookingUrl]);
  }
});
