import { defineStore } from 'pinia'
import { useAccountService } from '~/services/account.service'
import type { AuthUser, LoginResponse } from '~/types/auth'
import { getTokenExpiration } from '~/utils/jwt'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const refreshToken = ref('')
  const user = ref<AuthUser | null>(null)
  const refreshTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  const isRefreshing = ref(false)
  const isAuthenticated = computed(() => !!accessToken.value)

  const restoreSession = () => {
    if (!import.meta.client) {
      return false
    }

    const storedAccessToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUser = localStorage.getItem('user')

    if (!storedAccessToken || !storedRefreshToken || !storedUser) {
      return false
    }

    try {
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)

      scheduleRefresh()

      return true
    } catch {
      clearAuth()
      return false
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Set Auth
    |--------------------------------------------------------------------------
    */

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

    if (import.meta.client) {
      // sessionStorage.setItem('access_token', data.accessToken)
      // sessionStorage.setItem('refresh_token', data.refreshToken)
      // sessionStorage.setItem('user', JSON.stringify(user.value))

      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    scheduleRefresh()
  }

  /*
    |--------------------------------------------------------------------------
    | Clear Auth
    |--------------------------------------------------------------------------
    */

  const clearAuth = () => {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }

    if (refreshTimeout.value) {
      clearTimeout(refreshTimeout.value)
      refreshTimeout.value = null
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

  const login = async (userName: string, password: string) => {
    const service = useAccountService()

    const response = await service.signInByPassword({
      userName,
      password
    })

    if (!response.isSuccess) {
      throw new Error(response.message)
    }

    setAuth(response.data)
  }

  /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

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

  /*
    |--------------------------------------------------------------------------
    | Schedule Refresh
    |--------------------------------------------------------------------------
    */

  const scheduleRefresh = () => {
    if (!accessToken.value) {
      return
    }

    const expiration = getTokenExpiration(accessToken.value)

    if (!expiration) {
      clearAuth()

      return
    }

    const timeout = expiration - Date.now() - 60000

    if (timeout <= 0) {
      refreshAuthToken()

      return
    }

    if (refreshTimeout.value) {
      clearTimeout(refreshTimeout.value)
    }

    refreshTimeout.value = setTimeout(async () => {
      await refreshAuthToken()
    }, timeout)
  }

  /*
    |--------------------------------------------------------------------------
    | Refresh Token
    |--------------------------------------------------------------------------
    */

  const refreshAuthToken = async () => {
    if (isRefreshing.value || !refreshToken.value) {
      return
    }

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
    } catch (error) {
      clearAuth()

      console.error('Error refreshing token:', error)

      await navigateTo('/account/login')

      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  return {
    accessToken,
    refreshToken,
    user,

    isAuthenticated,

    login,
    logout,

    setAuth,
    clearAuth,

    restoreSession,

    refreshAuthToken,
    scheduleRefresh
  }
})
