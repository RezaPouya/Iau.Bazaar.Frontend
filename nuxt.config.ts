// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt'],

  plugins: ['~/plugins/api', '~/plugins/theme.client', '~/plugins/auth-init.client'],

  runtimeConfig: {
    public: {
      apiBase: 'https://localhost:7139/api'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  app: {
    head: {
      meta: [{ charset: 'utf-8' }, { dir: 'rtl' }, { lang: 'fa' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  },

  // Security headers for production only
  nitro:
    process.env.NODE_ENV === 'production'
      ? {
          routeRules: {
            '/**': {
              headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Content-Security-Policy':
                  "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-production-api.com;"
              }
            }
          }
        }
      : {} // No CSP headers in development
})
