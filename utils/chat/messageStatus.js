/**
 * Translate the backend message status into a UI presentation.
 * Backend contract: 2 means the message was edited (not delivery failure).
 * Local delivery failures use deliveryState so they cannot collide with API statuses.
 */
export function getMessageStatusPresentation(message = {}) {
  if (message.deliveryState === 'failed') {
    return {
      kind: 'failed',
      label: 'ارسال ناموفق',
      icon: 'bi-exclamation-circle',
    };
  }

  const status = message.status === null || message.status === undefined
    ? null
    : Number(message.status);

  if (status === 2) {
    return {
      kind: 'edited',
      label: 'ویرایش شد',
      icon: 'bi-pencil-square',
    };
  }

  if (status === null) {
    return {
      kind: 'sending',
      label: 'در حال ارسال',
      icon: 'bi-clock',
    };
  }

  if (status === 0) {
    return {
      kind: 'sent',
      label: 'ارسال شد',
      icon: 'bi-check',
    };
  }

  if (status === 1) {
    return {
      kind: 'seen',
      label: 'دیده شد',
      icon: 'bi-check-all',
    };
  }

  return {
    kind: 'unknown',
    label: 'وضعیت پیام',
    icon: null,
  };
}
