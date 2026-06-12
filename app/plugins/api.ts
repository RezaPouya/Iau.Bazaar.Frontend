// app/plugins/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '~/stores/auth'

// تعریف نوع برای درخواست‌های با retry
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: number
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const MAX_RETRY_COUNT = 3
  const BASE_RETRY_DELAY = 1000

  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  // ==================== Request Interceptor ====================
  api.interceptors.request.use(
    async (requestConfig: RetryableRequestConfig) => {
      const { $pinia } = useNuxtApp()
      const auth = useAuthStore($pinia)

      if (auth.accessToken) {
        requestConfig.headers.Authorization = `Bearer ${auth.accessToken}`
        requestConfig.headers['X-Requested-With'] = 'XMLHttpRequest'
      }

      return requestConfig
    },
    (error: AxiosError) => Promise.reject(error)
  )

  // ==================== Response Interceptor ====================
  // app/plugins/api.ts - قسمت response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const { $pinia } = useNuxtApp()
      const auth = useAuthStore($pinia)
      const originalRequest = error.config as RetryableRequestConfig

      if (!originalRequest) {
        return Promise.reject(error)
      }

      // ==================== 401 Unauthorized ====================
      if (error.response?.status === 401) {
        originalRequest._retry = originalRequest._retry || 0

        if (originalRequest._retry >= MAX_RETRY_COUNT) {
          auth.clearAuth()
          await navigateTo('/account/login', { replace: true })
          return Promise.reject(error)
        }

        if (originalRequest.url?.includes('/account/logout')) {
          auth.clearAuth()
          return Promise.reject(error)
        }

        if (originalRequest.url?.includes('/account/refresh-token')) {
          auth.clearAuth()
          await navigateTo('/account/login', { replace: true })
          return Promise.reject(error)
        }

        if (auth.refreshToken) {
          originalRequest._retry++

          try {
            await auth.refreshAuthToken()
            originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            // ✅ مهم: clear auth و هدایت به لاگین
            auth.clearAuth()
            await navigateTo('/account/login', { replace: true })
            return Promise.reject(error)
          }
        } else {
          // ✅ مهم: clear auth و هدایت به لاگین
          auth.clearAuth()
          await navigateTo('/account/login', { replace: true })
          return Promise.reject(error)
        }
      }

      return Promise.reject(error)
    }
  )

  // ==================== Helper Methods ====================
  const get = async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get<T>(url, { params })
    return response.data
  }

  const post = async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.post<T>(url, data)
    return response.data
  }

  const put = async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put<T>(url, data)
    return response.data
  }

  const del = async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url)
    return response.data
  }

  const patch = async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch<T>(url, data)
    return response.data
  }

  return {
    provide: {
      api,
      $api: api,
      apiGet: get,
      apiPost: post,
      apiPut: put,
      apiDelete: del,
      apiPatch: patch
    }
  }
})
