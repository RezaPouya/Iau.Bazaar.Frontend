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

      // If there's no request config, just reject
      if (!originalRequest) return Promise.reject(error)

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        auth.clearAuth()
        await navigateTo('/login')
        return Promise.reject(error)
      }

      // Ignore logout endpoint failures – they are already handled in the store
      if (originalRequest.url?.includes('/account/logout')) {
        return Promise.reject(error)
      }

      // Only handle 401 Unauthorized responses
      if (error.response?.status === 401) {
        // Mark this request as retried to avoid loops
        originalRequest._retry = true

        // Do NOT try to refresh if the failing request itself is the refresh token endpoint
        if (originalRequest.url?.includes('/account/refresh-token')) {
          auth.clearAuth()
          await navigateTo('/login')
          return Promise.reject(error)
        }

        if (auth.refreshToken) {
          try {
            // refreshAuthToken() now throws on failure
            await auth.refreshAuthToken()
            // Update the failed request with the new access token
            originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`
            // Retry the original request
            return api(originalRequest)
          } catch {
            // Refresh failed – clear everything and redirect
            auth.clearAuth()
            await navigateTo('/login')
            return Promise.reject(error)
          }
        } else {
          // No refresh token available – immediate logout
          auth.clearAuth()
          await navigateTo('/login')
        }
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
