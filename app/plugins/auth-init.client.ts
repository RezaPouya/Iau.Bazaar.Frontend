export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  // CRITICAL: Log what's happening
  console.log('🔧 Auth Init Plugin - Before restore:', {
    hasAccessToken: !!auth.accessToken,
    hasUser: !!auth.user
  })

  const restored = auth.restoreSession()

  console.log('🔧 Auth Init Plugin - After restore:', {
    restored,
    hasAccessToken: !!auth.accessToken,
    hasUser: !!auth.user,
    userRole: auth.user?.role,
    accessToken: auth.accessToken?.substring(0, 20) + '...'
  })

  if (auth.accessToken) {
    console.log('✅ Token found, scheduling refresh')
    auth.scheduleRefresh()
  } else {
    console.log('❌ No token found')
  }
})
