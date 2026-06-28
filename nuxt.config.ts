// nuxt.config.ts
//
// نکته‌ی بسیار مهم: apiBase، آدرس پروکسی /medias، و CSP (در ادامه‌ی همین فایل) همگی
// قبلاً به‌صورت ثابت (hardcode) روی «https://localhost:7139» تنظیم شده بودند. یعنی به
// محض Deploy کردن سایت روی هر آدرس دیگری غیر از localhost (هر سرور واقعی)، تمام
// درخواست‌های API و بارگذاری تصاویر خراب می‌شدند. الان این آدرس از متغیر محیطی
// BACKEND_BASE_URL خوانده می‌شود (با همان localhost به‌عنوان مقدار پیش‌فرض، فقط برای
// راحتی توسعه محلی) — هنگام Deploy واقعی، حتماً این env var را به آدرس واقعی بک‌اند
// تنظیم کنید (مثلاً BACKEND_BASE_URL=https://api.iaubazaar.ir)
const backendBaseUrl = process.env.BACKEND_BASE_URL || 'https://localhost:7139'

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
      // مقدار نهایی را می‌توان هنگام اجرا هم با env var استاندارد Nuxt یعنی
      // NUXT_PUBLIC_API_BASE بازنویسی کرد (بدون نیاز به Build مجدد)
      apiBase: `${backendBaseUrl}/api`
    }
  },

  routeRules: {
    '/api/**': { cors: true }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    routeRules: {
      '/medias/**': { proxy: `${backendBaseUrl}/medias/**` },
      ...(import.meta.env.PROD ? {
        '/**': {
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            // نکته: cdn.jsdelivr.net برای فونت Vazirmatn اضافه شده (هم برای CSS با
            // @import و هم برای خودِ فایل‌های فونت). اگر فونت را بعداً self-host کردید،
            // می‌توانید این دو مورد را حذف کنید.
            'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' ${backendBaseUrl}`
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
  }
})


