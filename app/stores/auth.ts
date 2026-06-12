import { defineStore } from 'pinia'
import type { AuthUser, LoginResponse } from '~/types/auth'
import { getTokenExpiration } from '~/utils/jwt'
import { useAccountService } from '~/services/account.service'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<AuthUser | null>(null)

  const refreshTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  const isRefreshing = ref(false)
  const isHydrated = ref(false)

  const isAuthenticated = computed(
    () => isHydrated.value && !!accessToken.value
  )

  /* ----------------------------------
   * Helpers
   * ---------------------------------- */

  const clearRefreshTimer = () => {
    if (refreshTimeout.value) {
      clearTimeout(refreshTimeout.value)
      refreshTimeout.value = null
    }
  }

  const persistSession = (data?: {
    accessToken: string
    refreshToken: string
    user: AuthUser
  }) => {
    if (!import.meta.client) return

    if (!data) return

    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const removeSession = () => {
    if (!import.meta.client) return

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  /* ----------------------------------
   * Core auth state
   * ---------------------------------- */

  const setAuth = (data: LoginResponse) => {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken

    user.value = {
      userId: data.userId,
      role: data.role,
      panelUrl: data.panelUrl,
      fullName: data.fullName,
      userName: data.userName,
      phoneNumber: data.phoneNumber
    }

    persistSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: user.value
    })

    scheduleRefresh()
  }

  const clearAuth = () => {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null

    clearRefreshTimer()
    removeSession()
  }

  /* ----------------------------------
   * Restore session
   * ---------------------------------- */

  const restoreSession = () => {
    if (!import.meta.client) {
      isHydrated.value = true
      return false
    }

    try {
      const storedAccessToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      const storedUser = localStorage.getItem('user')

      if (!storedAccessToken || !storedRefreshToken || !storedUser) {
        isHydrated.value = true
        return false
      }

      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)

      scheduleRefresh()

      isHydrated.value = true
      return true
    } catch (err) {
      console.error('restoreSession failed:', err)
      clearAuth()
      isHydrated.value = true
      return false
    }
  }

  /* ----------------------------------
   * Auth actions
   * ---------------------------------- */

  const login = async (userName: string, password: string) => {
    try {
      const service = useAccountService()

      const response = await service.signInByPassword({
        userName,
        password
      })

      if (!response.isSuccess) {
        throw new Error(response.message)
      }

      setAuth(response.data)
    } catch (err) {
      clearAuth()
      throw err
    }
  }

  const logout = async () => {
    const toast = useAppToast()

    try {
      const { $api } = useNuxtApp()
      await $api.post('/account/logout')

      toast.success('خروج موفق', 'با موفقیت از حساب کاربری خارج شدید')
    } catch {
      toast.error('هشدار', 'ارتباط با سرور برقرار نشد، اما نشست شما بسته شد')
    } finally {
      clearAuth()
      await navigateTo('/login')
    }
  }

  /* ----------------------------------
   * Token refresh logic
   * ---------------------------------- */

  const scheduleRefresh = () => {
    if (!accessToken.value) return

    const expiration = getTokenExpiration(accessToken.value)
    if (!expiration) {
      clearAuth()
      return
    }

    const safetyBuffer = 60_000
    const delay = expiration - Date.now() - safetyBuffer

    clearRefreshTimer()

    if (delay <= 0) {
      refreshAuthToken().catch(() => {})
      return
    }

    refreshTimeout.value = setTimeout(() => {
      refreshAuthToken().catch(() => {})
    }, delay)
  }

  const refreshAuthToken = async () => {
    if (isRefreshing.value || !refreshToken.value) return

    try {
      isRefreshing.value = true

      const service = useAccountService()
      const response = await service.refreshToken({
        refreshToken: refreshToken.value
      })

      if (!response.isSuccess) {
        throw new Error(response.message)
      }

      setAuth(response.data)
    } catch (err) {
      console.error('refreshAuthToken failed:', err)
      clearAuth()
    } finally {
      isRefreshing.value = false
    }
  }

  /* ----------------------------------
   * Expose
   * ---------------------------------- */

  return {
    accessToken,
    refreshToken,
    user,

    isAuthenticated,
    isRefreshing,

    login,
    logout,

    setAuth,
    clearAuth,

    restoreSession,

    refreshAuthToken,
    scheduleRefresh
  }
})
