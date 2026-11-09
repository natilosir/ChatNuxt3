import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeleteMessagePayload,
  buildEditMessagePayload,
  createSingleFlightByKey,
  isSameChatSelection,
} from '../utils/chat/chatActions.js';

test('edit payload includes message id, edited text, and receiver', () => {
  assert.deepEqual(buildEditMessagePayload(42, '  updated text  ', 'peer-1'), {
    id: 42,
    text: 'updated text',
    receiver: 'peer-1',
  });
});

test('delete payload includes message id and receiver', () => {
  assert.deepEqual(buildDeleteMessagePayload(42, 'peer-1'), {
    id: 42,
    receiver: 'peer-1',
  });
});

test('chat selection does not navigate when the selected chat is already open', () => {
  assert.equal(isSameChatSelection('peer-1', 'peer-1'), true);
  assert.equal(isSameChatSelection('peer-1', 'peer-2'), false);
  assert.equal(isSameChatSelection(null, 'peer-1'), false);
});

test('single-flight shares one in-flight request for the same chat', async () => {
  const runSingleFlight = createSingleFlightByKey();
  let requestCount = 0;
  let resolveRequest;
  const request = () => {
    requestCount += 1;
    return new Promise((resolve) => {
      resolveRequest = resolve;
    });
  };

  const first = runSingleFlight('peer-1', request);
  const second = runSingleFlight('peer-1', request);

  await Promise.resolve();
  assert.equal(requestCount, 1);
  resolveRequest({ chats: [] });
  assert.deepEqual(await first, { chats: [] });
  assert.deepEqual(await second, { chats: [] });
});

test('edit and delete payload builders reject a missing receiver', () => {
  assert.throws(() => buildEditMessagePayload(42, 'hello', ''), /Receiver is required/);
  assert.throws(() => buildDeleteMessagePayload(42, null), /Receiver is required/);
});
