import test from 'node:test';
import assert from 'node:assert/strict';
import { getMessageStatusPresentation } from '../utils/chat/messageStatus.js';

test('status 2 identifies an edited message and provides an edit icon', () => {
  assert.deepEqual(getMessageStatusPresentation({ status: 2 }), {
    kind: 'edited',
    label: 'ویرایش شد',
    icon: 'bi-pencil-square',
  });
});

test('string status 2 is also treated as edited', () => {
  assert.equal(getMessageStatusPresentation({ status: '2' }).kind, 'edited');
});

test('a failed local delivery is separate from server status 2', () => {
  assert.deepEqual(getMessageStatusPresentation({ status: null, deliveryState: 'failed' }), {
    kind: 'failed',
    label: 'ارسال ناموفق',
    icon: 'bi-exclamation-circle',
  });
});

test('normal sent and seen states retain their own icons', () => {
  assert.equal(getMessageStatusPresentation({ status: 0 }).icon, 'bi-check');
  assert.equal(getMessageStatusPresentation({ status: 1 }).icon, 'bi-check-all');
});
