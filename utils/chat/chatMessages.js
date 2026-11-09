/**
 * Build a stable identity for a message.
 * Server ids are normalized because some API responses return them as numbers
 * while the polling endpoint returns the same ids as strings.
 */
export function getMessageIdentities(message) {
  if (!message || typeof message !== 'object') return [];

  const identities = [];
  if (message.id !== undefined && message.id !== null && message.id !== '') {
    identities.push(`id:${String(message.id)}`);
  }

  const identityParts = [
    message.sender,
    message.text,
    message.created_at,
    message.receiver,
    message.file_name,
    message.file_url,
  ].map((value) => String(value ?? '').trim());

  if (identityParts.some(Boolean)) {
    identities.push(`fallback:${JSON.stringify(identityParts)}`);
  }

  return identities;
}

export function getMessageIdentity(message) {
  return getMessageIdentities(message)[0] ?? null;
}

/** Return only messages that are not already represented in the current list. */
export function getNewMessages(existingMessages = [], incomingMessages = []) {
  const knownIdentities = new Set(
    existingMessages.flatMap(getMessageIdentities),
  );
  const newMessages = [];

  for (const message of incomingMessages) {
    if (!message) continue;

    const identities = getMessageIdentities(message);
    if (identities.some((identity) => knownIdentities.has(identity))) continue;

    identities.forEach((identity) => knownIdentities.add(identity));
    newMessages.push(message);
  }

  return newMessages;
}

/** Return a new message list with only previously unseen messages appended. */
export function mergeUniqueMessages(existingMessages = [], incomingMessages = []) {
  return [...existingMessages, ...getNewMessages(existingMessages, incomingMessages)];
}

/**
 * Replace the optimistic message after the server confirms delivery.
 * Falls back to updating an existing server id before appending a new item.
 */
export function reconcileSentMessage(messages = [], confirmedMessage) {
  if (!confirmedMessage) return [...messages];

  const optimisticIndex = messages.findIndex(
    (message) =>
      typeof message?.id === 'string' &&
      message.id.startsWith('temp-') &&
      message.text === confirmedMessage.text,
  );

  if (optimisticIndex !== -1) {
    return messages.map((message, index) =>
      index === optimisticIndex ? confirmedMessage : message,
    );
  }

  const confirmedIdentity = getMessageIdentity(confirmedMessage);
  const existingIndex = messages.findIndex(
    (message) => getMessageIdentity(message) === confirmedIdentity,
  );

  if (existingIndex !== -1) {
    return messages.map((message, index) =>
      index === existingIndex ? confirmedMessage : message,
    );
  }

  return [...messages, confirmedMessage];
}

/**
 * Keep the sender convention already used by the chat API:
 * the selected peer's hash identifies received messages; "me" is always own.
 */
export function isOwnMessage(message, peerHash) {
  return message?.sender === 'me' || message?.sender !== peerHash;
}

export function hasMessageId(message, messageId) {
  if (message?.id === undefined || message?.id === null || messageId === undefined || messageId === null) {
    return false;
  }

  return String(message.id) === String(messageId);
}

/** Mark a locally edited message with the backend's edited status (2). */
export function markMessageAsEdited(messages = [], messageId, text) {
  return messages.map((message) =>
    hasMessageId(message, messageId)
      ? { ...message, text: String(text ?? '').trim(), status: 2 }
      : message,
  );
}

