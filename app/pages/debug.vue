<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Auth Debug</h1>

    <div class="space-y-4">
      <div>
        <h2 class="font-semibold">localStorage:</h2>
        <pre class="bg-gray-100 p-2 rounded">{{ localStorageData }}</pre>
      </div>

      <div>
        <h2 class="font-semibold">Auth Store:</h2>
        <pre class="bg-gray-100 p-2 rounded">{{ authStoreData }}</pre>
      </div>

      <div class="flex gap-2">
        <UButton @click="refresh">Refresh Store</UButton>
        <UButton @click="clearAndRedirect" color="error">Clear & Redirect</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const auth = useAuthStore()

const localStorageData = ref({})
const authStoreData = ref({})

const refresh = () => {
  localStorageData.value = {
    access_token: localStorage.getItem('access_token')?.substring(0, 30) + '...',
    refresh_token: localStorage.getItem('refresh_token')?.substring(0, 30) + '...',
    user: localStorage.getItem('user')
  }

  authStoreData.value = {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    accessTokenExists: !!auth.accessToken
  }
}

const clearAndRedirect = () => {
  auth.clearAuth()
  navigateTo('/account/login')
}

onMounted(() => {
  refresh()
})
</script>
