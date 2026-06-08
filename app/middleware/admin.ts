import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.user) {
    console.log('admin middleware , user is null')
    return navigateTo('/account/login')
  }

  console.log('🔍 Admin Middleware Debug:', {
    hasUser: !!auth.user,
    userRole: auth.user?.role,
    roleType: typeof auth.user?.role,
    fullUser: auth.user,
    isAuthenticated: auth.isAuthenticated
  })

  if (!auth.isAuthenticated) {
    console.log('admin middleware , user is not authenticated')
    return navigateTo('/account/login')
  }

  const role = auth.user.role

  const isAdmin = role === 'Admin' || role === 'Operator'

  if (!isAdmin) {
    return navigateTo('/')
  }
})
