// plugins/pinia-auth-init.ts
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.restoreSession()
  if (auth.accessToken) {
    auth.scheduleRefresh()
  }
})
