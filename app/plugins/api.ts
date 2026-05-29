import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 30000
  })

  /*
  |--------------------------------------------------------------------------
  | Request Interceptor
  |--------------------------------------------------------------------------
  */

  api.interceptors.request.use(
    (config) => {
      const pinia = useNuxtApp().$pinia
      const auth = useAuthStore(pinia)

      if (auth.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`

        config.headers['X-Requested-With'] = 'XMLHttpRequest'
      }

      return config
    },

    (error) => Promise.reject(error)
  )

  /*
  |--------------------------------------------------------------------------
  | Response Interceptor
  |--------------------------------------------------------------------------
  */

  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const auth = useAuthStore()

      const originalRequest = error.config

      /*
      |--------------------------------------------------------------------------
      | Prevent refresh loop
      |--------------------------------------------------------------------------
      */

      if (originalRequest?._retry) {
        return Promise.reject(error)
      }

      /*
      |--------------------------------------------------------------------------
      | Ignore logout failure
      |--------------------------------------------------------------------------
      */

      if (originalRequest?.url?.includes('/account/logout')) {
        return Promise.reject(error)
      }

      /*
      |--------------------------------------------------------------------------
      | Unauthorized
      |--------------------------------------------------------------------------
      */

      if (error.response?.status === 401) {
        originalRequest._retry = true

        if (auth.refreshToken) {
          try {
            await auth.refreshAuthToken()

            originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`

            return api(originalRequest)
          } catch {
            auth.clearAuth()

            await navigateTo('/login')
          }
        }

        auth.clearAuth()

        await navigateTo('/login')
      }

      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
})
