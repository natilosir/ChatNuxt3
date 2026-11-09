import { defineNuxtConfig } from 'nuxt/config';
import path from 'path'; // برای ساخت مسیر مطلق پوشه خروجی

export default defineNuxtConfig ( {
	compatibilityDate: '2025-05-15' ,
	devtools: { enabled: true } ,
	// All application components are explicitly imported from their current folders.
	// Disabling auto-scan prevents stale generated imports after component moves.
	components: false ,
	runtimeConfig: {
		public: {
			// Set these only after confirming the matching backend route and payload.
			profileUpdateEndpoint: '' ,
			accountSettingsUpdateEndpoint: '' ,
		} ,
	} ,
	// Expose the dev server on all network interfaces so it can be reached
	// from other devices (e.g. a phone) on the same Wi-Fi network.
	devServer: {
		host: '0.0.0.0' ,
		port: 3000 ,
	} ,
	app: {
		head: {
			meta: [
				{
					name: 'viewport' ,
					content: 'width=device-width, initial-scale=1, viewport-fit=cover' ,
				} ,
			] ,
		} ,
	} ,
	css: [
		'bootstrap/dist/css/bootstrap.min.css' ,
		'bootstrap-icons/font/bootstrap-icons.css' ,
		'@/assets/css/theme/chat-theme.css' ,
	] ,
	modules: [
		[
			'@vite-pwa/nuxt' ,
			{
				registerType: 'autoUpdate' ,
				manifest: {
					name: 'Chat' ,
					short_name: 'chat' ,
					description: 'Chater' ,
					theme_color: '#1B0D2E' ,
				} ,
				workbox: {
					globPatterns: [ '**/*.{js,css,html,png,svg,ico}' ] ,
				} ,
				// Vite PWA's development worker can reference a non-generated
				// .nuxt/dev-sw-dist/sw.js file on Windows. Keep the worker disabled
				// during development; production Workbox output remains enabled.
				devOptions: {
					enabled: false ,
				} ,
			} ,
		] ,
	] ,
	// 👇 این بخش خروجی استاتیک را به پوشه "build" هدایت می‌کند
	nitro: {
		output: {
			publicDir: path.join ( __dirname , 'build' ) ,
		} ,
	} ,
} );