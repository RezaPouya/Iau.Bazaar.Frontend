// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ],

  plugins: [
    { src: '~/plugins/theme.client.ts', mode: 'all' },
    { src: '~/plugins/auth-init.client.ts', mode: 'client' },
    { src: '~/plugins/api.ts', mode: 'client' }
  ],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: {
        dir: 'rtl',
        lang: 'fa-IR'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'https://localhost:7139/api'
    }
  },

  routeRules: {
    '/api/**': { cors: true }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    routeRules: {
      '/medias/**': { proxy: 'https://localhost:7139/medias/**' },
      ...(import.meta.env.PROD ? {
        '/**': {
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://localhost:7139"
          }
        }
      } : {})
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
})
