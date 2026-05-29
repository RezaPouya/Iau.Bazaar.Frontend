import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.user) {
    return navigateTo('account/login')
  }

  const role = auth.user.role

  const isAdmin = role === 'Admin' || role === 'Operator'

  if (!isAdmin) {
    return navigateTo('/')
  }
})
