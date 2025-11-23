// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: { enabled: false },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@prisma/nuxt'],
  css: ['~/assets/css/base.css'],
  runtimeConfig: {
    sessionSecret: 'change-this-secret-in-production'
  },
  hooks: {
    'app:resolve'(app) {
      app.plugins = app.plugins.filter(
        (plugin) => !plugin.src?.includes('@prisma/nuxt/dist/runtime/plugin')
      )
    }
  },
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
})