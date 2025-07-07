// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    css: [
        'bootstrap/dist/css/bootstrap.min.css',
        'bootstrap-icons/font/bootstrap-icons.css'
    ],

    // تنظیمات ماژول PWA
    modules: [
        ['@vite-pwa/nuxt', {  // <-- تنظیمات PWA اینجا قرار می‌گیرد
            registerType: 'autoUpdate',
            manifest: {
                name: 'Chat',
                short_name: 'chat',
                description: 'Chater',
                theme_color: '#4e0c65',
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,svg,ico}']
            },
            devOptions: {
                enabled: true
            }
        }]
    ]
})