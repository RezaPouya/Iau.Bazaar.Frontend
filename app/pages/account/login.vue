<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center">
          <p class="text-slate-500 dark:text-slate-600 mt-1">لطفاً وارد حساب کاربری خود شوید</p>
        </div>
      </template>

      <!-- RTL-aware tab buttons -->
      <div class="flex rounded-lg bg-slate-100 dark:bg-slate-700 p-1 mb-6">
        <button
          type="button"
          @click="activeTab = 'password'"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-all rounded-ee-lg rounded-ss-lg',
            activeTab === 'password'
              ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm rounded-e-none'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          ورود با رمز عبور
        </button>
        <button
          type="button"
          @click="activeTab = 'otp'"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-all rounded-ee-lg rounded-ss-lg',
            activeTab === 'otp'
              ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm rounded-s-none'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          ورود با رمز یکبار مصرف
        </button>
      </div>

      <UForm :state="form" @submit="handleSubmit">
        <UFormField label="نام کاربری یا شماره همراه" name="username" required>
          <UInput
            v-model="form.username"
            placeholder="نام کاربری یا 09123456789"
            size="lg"
            class="w-full"
            input-class="!text-left"
            :disabled="loading"
          />
        </UFormField>

        <div class="mt-5">
          <UFormField v-if="activeTab === 'password'" label="رمز عبور" name="password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              size="lg"
              class="w-full"
              input-class="!text-left"
              :disabled="loading"
            />
          </UFormField>

          <UFormField v-if="activeTab === 'otp'" label="رمز یکبار مصرف" name="otp" required>
            <div class="flex gap-2 w-full">
              <UInput
                v-model="form.otp"
                type="text"
                placeholder="کد ۶ رقمی"
                size="lg"
                class="flex-1 w-full"
                input-class="!text-left"
                :disabled="loading || !otpSent"
              />
              <UButton
                color="primary"
                variant="outline"
                :loading="sendingOtp"
                :disabled="!form.username || sendingOtp || otpCooldown > 0"
                @click="sendOtp"
              >
                {{ otpCooldown > 0 ? `${otpCooldown} ثانیه` : 'ارسال کد' }}
              </UButton>
            </div>
            <p v-if="otpSent && !otpCooldown" class="text-sm text-green-600 mt-1">
              کد یکبار مصرف به شماره همراه شما ارسال شد.
            </p>
          </UFormField>
        </div>

        <div v-if="error" class="mt-5">
          <UAlert color="red" :title="error" />
        </div>

        <div class="mt-5">
          <UButton
            type="submit"
            color="primary"
            block
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? 'در حال ورود...' : 'ورود' }}
          </UButton>
        </div>

        <div class="text-center text-sm mt-4">
          <NuxtLink to="/forgot-password" class="text-primary-600 hover:underline">
            رمز عبور خود را فراموش کرده‌اید؟
          </NuxtLink>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Reactive state
const activeTab = ref(route.query.tab === 'otp' ? 'otp' : 'password')
const loading = ref(false)
const sendingOtp = ref(false)
const otpSent = ref(false)
const otpCooldown = ref(0)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
  otp: ''
})

// Example handlers – replace with your actual logic
const sendOtp = async () => {
  sendingOtp.value = true
  try {
    // await $api.post('/auth/send-otp', { mobile: form.username })
    otpSent.value = true
    // start cooldown timer
    otpCooldown.value = 120
    const interval = setInterval(() => {
      if (otpCooldown.value > 0) otpCooldown.value--
      else clearInterval(interval)
    }, 1000)
  } catch (err: any) {
    error.value = err.message || 'خطا در ارسال کد'
  } finally {
    sendingOtp.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'password') {
      // await authStore.login({ username: form.username, password: form.password })
      console.log('Login with password', form)
    } else {
      // await authStore.loginWithOtp({ mobile: form.username, code: form.otp })
      console.log('Login with OTP', form)
    }
    // router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'ورود ناموفق بود'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Force text-left on all inputs inside this component */
:deep(input) {
  text-align: left !important;
}
</style>
