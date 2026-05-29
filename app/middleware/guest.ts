import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return
  }

  return navigateTo(auth.user?.panelUrl || '/admin')
})
