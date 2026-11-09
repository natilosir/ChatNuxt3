/** Build the API payload expected by the chat edit endpoint. */
export function buildEditMessagePayload(messageId, text, receiver) {
  assertMessageId(messageId);
  const normalizedReceiver = assertReceiver(receiver);
  const normalizedText = String(text ?? '').trim();

  if (!normalizedText) {
    throw new TypeError('Message text is required.');
  }

  return {
    id: messageId,
    text: normalizedText,
    receiver: normalizedReceiver,
  };
}

/** Build the API payload expected by the chat delete endpoint. */
export function buildDeleteMessagePayload(messageId, receiver) {
  assertMessageId(messageId);

  return {
    id: messageId,
    receiver: assertReceiver(receiver),
  };
}

export function isSameChatSelection(currentHash, nextHash) {
  if (currentHash == null || nextHash == null) return false;
  return String(currentHash) === String(nextHash);
}

/** Prevent duplicate concurrent requests for the same conversation key. */
export function createSingleFlightByKey() {
  const pendingRequests = new Map();

  return (key, request) => {
    if (key == null || typeof request !== 'function') {
      return Promise.reject(new TypeError('A request key and function are required.'));
    }

    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    const requestPromise = Promise.resolve()
      .then(request)
      .finally(() => {
        if (pendingRequests.get(key) === requestPromise) {
          pendingRequests.delete(key);
        }
      });

    pendingRequests.set(key, requestPromise);
    return requestPromise;
  };
}

function assertMessageId(messageId) {
  if (messageId === undefined || messageId === null || messageId === '') {
    throw new TypeError('Message id is required.');
  }
}

function assertReceiver(receiver) {
  if (typeof receiver !== 'string' || !receiver.trim()) {
    throw new TypeError('Receiver is required.');
  }

  return receiver.trim();
}
