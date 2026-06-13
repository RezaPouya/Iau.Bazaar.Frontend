// app/plugins/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '~/stores/auth'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: number
}

// Queue item for requests waiting during token refresh
interface QueueItem {
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
  config: RetryableRequestConfig
}

export default defineNuxtPlugin((nuxtApp) => {
  const { $pinia } = nuxtApp
  const config = useRuntimeConfig()
  const MAX_RETRY_COUNT = 3

  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // State for handling concurrent token refresh
  let isRefreshing = false
  let failedQueue: QueueItem[] = []

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error)
      } else {
        config.headers.Authorization = `Bearer ${token}`
        resolve(api(config))
      }
    })
    failedQueue = []
  }

  // ==================== Request Interceptor ====================
  api.interceptors.request.use(
    (requestConfig: RetryableRequestConfig) => {
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
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const auth = useAuthStore($pinia)
      const originalRequest = error.config as RetryableRequestConfig

      if (!originalRequest) {
        return Promise.reject(error)
      }

      // Not a 401 -> reject immediately
      if (error.response?.status !== 401) {
        return Promise.reject(error)
      }

      // 401 on logout or refresh token endpoints -> clear session and redirect
      if (
        originalRequest.url?.includes('/account/logout') ||
        originalRequest.url?.includes('/account/refresh-token')
      ) {
        auth.clearAuth()
        await navigateTo('/account/login', { replace: true })
        return Promise.reject(error)
      }

      // Initialize retry counter
      originalRequest._retry = originalRequest._retry || 0

      // Too many retries -> clear and redirect
      if (originalRequest._retry >= MAX_RETRY_COUNT) {
        auth.clearAuth()
        await navigateTo('/account/login', { replace: true })
        return Promise.reject(error)
      }

      // If no refresh token available, cannot recover
      if (!auth.refreshToken) {
        auth.clearAuth()
        await navigateTo('/account/login', { replace: true })
        return Promise.reject(error)
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      // Start token refresh
      isRefreshing = true
      originalRequest._retry++

      try {
        await auth.refreshAuthToken()
        const newToken = auth.accessToken

        // Process any queued requests with the new token
        processQueue(null, newToken)

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed -> clear everything and redirect
        processQueue(refreshError as Error, null)
        auth.clearAuth()
        await navigateTo('/account/login', { replace: true })
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
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
