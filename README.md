# ChatLand

Nuxt 3 / Vue 3 chat application using Bootstrap 5.3 and a purple glassmorphism interface.

## Project structure

```text
assets/
├── css/
│   ├── account/       # Profile and account settings styles
│   ├── auth/          # Login, register and recovery styles
│   ├── chat/          # Chat layout, sidebar, messages and composer styles
│   └── theme/         # Global theme tokens and scrollbar styles
└── fonts/             # Local font assets

components/
├── account/           # Account page shell and account UI
└── chat/              # Chat header, sidebar, message and composer UI

composables/
├── api/               # HTTP transport
├── chat/              # Conversation lifecycle and polling
└── state/             # Shared reactive chat state

middleware/
├── auth.js            # Authenticated routes
└── guest.js           # Guest-only routes

pages/                 # Nuxt file-based routes
layouts/               # Login and chat application layouts
utils/
├── auth/              # Auth checks, route state and snapshots
└── chat/              # Message payloads, reconciliation and chat helpers

tests/                 # Node test runner unit and regression tests
```

## Setup

```bash
npm install
npm run dev
```

The `predev` hook automatically removes stale `.nuxt` and `node_modules/.vite` caches before starting Nuxt. Start the app with `npm run dev` (rather than calling `nuxt dev` directly) so the cleanup hook runs.

## Tests

```bash
npm test
```

## Production build

```bash
npm run build
```

## SSR and hydration stability

- Page layouts are declared with `definePageMeta`; pages no longer switch layouts at runtime with `setPageLayout`.
- Authenticated and guest route decisions are handled by Nuxt route middleware.
- Auth state is resolved once and serialized with Nuxt `useState`, so the server and browser use the same initial route decision during hydration.
- The login page no longer awaits a remote auth request inside its setup function, avoiding a server/client redirect race while rendering the page.

## PWA development

The Vite PWA development worker remains disabled to prevent a missing `.nuxt/dev-sw-dist/sw.js` request on Windows. Production Workbox/PWA output remains enabled.

The development startup script handles this cleanup automatically.
## Chat behavior

- Conversation history requests are single-flight per conversation.
- Polling continues every four seconds while the tab is visible to receive new messages.
- Incoming messages are merged by normalized server IDs and stable fields when IDs are absent.
- Selecting the already-open chat does not navigate or reload the conversation.
- The legacy loading animation, edit/delete payload fields, bottom-up edit sheet, and original sound paths are retained.

## Backend configuration

The uploaded source contains the Nuxt frontend, not the Laravel/API source. Profile update and password update endpoints therefore remain configurable and must be set only after confirming the real backend routes and payload contract:

```env
NUXT_PUBLIC_PROFILE_UPDATE_ENDPOINT=
NUXT_PUBLIC_ACCOUNT_SETTINGS_UPDATE_ENDPOINT=
```

The profile payload is `{ name, username, email }`; the password payload is `{ current_password, password, password_confirmation }`. Verify these fields with the backend before enabling the endpoints.

The original audio files referenced by the app (`/assets/sound_in.wav`, `/assets/sound_out.wav`, `/assets/error.mp3`) were not included in the source archive. Add those files under `public/assets/` to enable playback.

## تنظیمات Glassmorphism

مقادیر افکت شیشه‌ای چت از `assets/css/theme/chat-theme.css` کنترل می‌شوند:

- `--chat-glass-blur: 2px` برای بلور تصویر پس‌زمینه و سطوح شیشه‌ای
- `--chat-glass-opacity: 0.5` برای شفافیت سطوح شیشه‌ای و حباب پیام‌ها

شفافیت روی لایه پس‌زمینه حباب‌ها اعمال می‌شود؛ متن پیام عمداً بدون `filter: blur` باقی می‌ماند تا خوانایی آن حفظ شود.
