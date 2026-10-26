import test from 'node:test';
import assert from 'node:assert/strict';
import { connectBusinessRedirect } from '../business/submission-redirect.mjs';
import { connectHubSpotConversions } from '../business/tracking/hubspot-conversions.mjs';

const formId = '915079cb-bc34-4b07-9079-26e9c3e19248';
const bookingUrl = 'https://calendly.com/d/cv5w-hbr-rdr/nibly-meeting';

function fixture(pathname = '/business/') {
  const windowRef = new EventTarget(), frames = [], timers = [], visits = [];
  Object.assign(windowRef, {
    location: { pathname, assign: url => visits.push(url) },
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
    console: { warn() {} },
    HubSpotFormsV4: { getFormFromEvent: () => ({
      getFormId: () => formId, getConversionId: () => 'conversion-test-001',
    }) },
  });
  connectBusinessRedirect({ windowRef, formId });
  return {
    windowRef, frames, timers, visits,
    emit: (name = 'hs-form-event:on-submission:success', id = formId) =>
      windowRef.dispatchEvent(new CustomEvent(name, { detail: { formId: id } })),
    paint: () => frames.splice(0).forEach(callback => callback()),
  };
}

test('success waits for the confirmation to paint, then schedules exactly one second', () => {
  const f = fixture();
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
});

test('loading, failed submissions and unrelated forms never schedule a redirect', () => {
  const f = fixture();
  for (const name of ['click', 'submit', 'hs-form-event:on-ready', 'hs-form-event:on-submission:failed']) f.emit(name);
  f.emit(undefined, 'another-form');
  assert.equal(f.frames.length, 0);
  assert.equal(f.timers.length, 0);
});

test('only the business route redirects, with or without its trailing slash', () => {
  for (const path of ['/side-hustle/', '/franchise/', '/', '/business/other']) {
    const f = fixture(path); f.emit();
    assert.equal(f.frames.length, 0, path);
  }
  const f = fixture('/business'); f.emit();
  assert.equal(f.frames.length, 1);
});

test('conversion queues before navigation, and measurement failure does not block booking', () => {
  for (const blocked of [false, true]) {
    const f = fixture(), conversions = [];
    connectHubSpotConversions({ windowRef: f.windowRef, formId, tracking: {
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
