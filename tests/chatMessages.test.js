import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeUniqueMessages,
  reconcileSentMessage,
  isOwnMessage,
  markMessageAsEdited,
} from '../utils/chat/chatMessages.js';

test('mergeUniqueMessages appends only messages with unseen ids', () => {
  const existing = [{ id: 1, text: 'old' }];
  const incoming = [
    { id: 1, text: 'duplicate' },
    { id: 2, text: 'new' },
  ];

  assert.deepEqual(mergeUniqueMessages(existing, incoming), [
    { id: 1, text: 'old' },
    { id: 2, text: 'new' },
  ]);
});

test('reconcileSentMessage replaces its optimistic message', () => {
  const optimistic = { id: 'temp-123', text: 'hello', sender: 'me', status: null };
  const confirmed = { id: 42, text: 'hello', sender: 'me', status: 0 };

  assert.deepEqual(reconcileSentMessage([optimistic], confirmed), [confirmed]);
});

test('reconcileSentMessage does not append a duplicate confirmed id', () => {
  const existing = [{ id: 42, text: 'hello', status: 0 }];
  const updated = { id: 42, text: 'hello', status: 1 };

  assert.deepEqual(reconcileSentMessage(existing, updated), [updated]);
});

test('isOwnMessage recognises own messages and the selected peer correctly', () => {
  assert.equal(isOwnMessage({ sender: 'me' }, 'peer-1'), true);
  assert.equal(isOwnMessage({ sender: 'peer-1' }, 'peer-1'), false);
  assert.equal(isOwnMessage({ sender: 'peer-2' }, 'peer-1'), true);
});

test('mergeUniqueMessages treats numeric and string ids as the same message', () => {
  const existing = [{ id: 42, sender: 'peer-1', text: 'hello', created_at: '10:00' }];
  const incoming = [{ id: '42', sender: 'peer-1', text: 'hello', created_at: '10:00' }];

  assert.deepEqual(mergeUniqueMessages(existing, incoming), existing);
});

test('mergeUniqueMessages deduplicates messages without server ids by stable fields', () => {
  const existing = [{ sender: 'peer-1', text: 'hello', created_at: '10:00' }];
  const incoming = [
    { sender: 'peer-1', text: 'hello', created_at: '10:00' },
    { sender: 'peer-1', text: 'new message', created_at: '10:01' },
  ];

  assert.deepEqual(mergeUniqueMessages(existing, incoming), [
    ...existing,
    incoming[1],
  ]);
});

test('mergeUniqueMessages matches a polled message when one response omits its id', () => {
  const existing = [{ id: 42, sender: 'peer-1', text: 'hello', created_at: '10:00' }];
  const incoming = [{ sender: 'peer-1', text: 'hello', created_at: '10:00' }];

  assert.deepEqual(mergeUniqueMessages(existing, incoming), existing);
});

test('reconcileSentMessage matches numeric and string forms of the server id', () => {
  const existing = [{ id: 42, text: 'hello', status: 0 }];
  const updated = { id: '42', text: 'hello', status: 1 };

  assert.deepEqual(reconcileSentMessage(existing, updated), [updated]);
});

test('markMessageAsEdited updates the text and assigns backend status 2', () => {
  const existing = [
    { id: 10, text: 'before', status: 1 },
    { id: 11, text: 'untouched', status: 1 },
  ];

  assert.deepEqual(markMessageAsEdited(existing, '10', '  after  '), [
    { id: 10, text: 'after', status: 2 },
    { id: 11, text: 'untouched', status: 1 },
  ]);
});
