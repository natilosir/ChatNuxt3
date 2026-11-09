import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const themeCss = readFileSync(new URL('../assets/css/theme/chat-theme.css', import.meta.url), 'utf8');
const layoutCss = readFileSync(new URL('../assets/css/chat/chat-layout.css', import.meta.url), 'utf8');
const conversationCss = readFileSync(new URL('../assets/css/chat/conversation.css', import.meta.url), 'utf8');
const sidebarCss = readFileSync(new URL('../assets/css/chat/chat-sidebar.css', import.meta.url), 'utf8');
const headerCss = readFileSync(new URL('../assets/css/chat/chat-header.css', import.meta.url), 'utf8');
const inputCss = readFileSync(new URL('../assets/css/chat/message-input.css', import.meta.url), 'utf8');

const extractRule = (css, selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 's'));
  return match?.[1] ?? '';
};

test('chat glass surfaces use a consistent 2px blur token', () => {
  assert.match(themeCss, /--chat-glass-blur:\s*2px\s*;/);
  for (const [name, css, selector] of [
    ['chat view', layoutCss, '.chat-view'],
    ['sidebar', sidebarCss, '.app-sidebar'],
    ['chat header', headerCss, '.app-header'],
    ['profile dropdown', headerCss, '.profile-dropdown'],
    ['conversation header', conversationCss, '.conversation-header'],
    ['message bubble', conversationCss, '.message'],
    ['message composer', inputCss, '.message-input'],
  ]) {
    const rule = extractRule(css, selector);
    assert.match(rule, /backdrop-filter:\s*blur\(var\(--chat-glass-blur\)\)/, `${name} must use the 2px blur token`);
  }
});

test('wallpaper background is rendered as a blurred layer without covering chat controls', () => {
  assert.match(layoutCss, /\.main-content::before\s*\{/);
  const wallpaperLayer = extractRule(layoutCss, '.main-content::before');
  assert.match(wallpaperLayer, /filter:\s*blur\(var\(--chat-glass-blur\)\)/);
  assert.match(wallpaperLayer, /pointer-events:\s*none/);
});

test('message bubbles have 50% translucent surfaces while message text stays sharp', () => {
  assert.match(themeCss, /--chat-glass-opacity:\s*0\.5\s*;/);
  const sentRule = extractRule(conversationCss, '.message.sent');
  const receivedRule = extractRule(conversationCss, '.message.received');
  for (const [name, rule] of [['sent message', sentRule], ['received message', receivedRule]]) {
    assert.match(rule, /backdrop-filter:\s*blur\(var\(--chat-glass-blur\)\)/, `${name} must apply the glass blur directly`);
    assert.match(rule, /-webkit-backdrop-filter:\s*blur\(var\(--chat-glass-blur\)\)/, `${name} must support WebKit glass blur`);
    assert.match(rule, /rgba\([^)]*,\s*var\(--chat-glass-opacity\)\)/, `${name} must use 50% opacity`);
  }
  const textRule = extractRule(conversationCss, '.message-text');
  assert.doesNotMatch(textRule, /filter:\s*blur/);
  const profileMenuRule = extractRule(headerCss, '.profile-dropdown');
  assert.match(profileMenuRule, /background:\s*rgba\([^)]*,\s*var\(--chat-glass-opacity\)\)/);
});
