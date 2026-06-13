<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)
const otpSent = ref(false)
const step = ref<'request' | 'verify'>('request')
const mobileNumber = ref('')
const otpCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const requestSchema = z.object({
  mobileNumber: z.string().min(11, 'شماره موبایل معتبر نیست').max(11, 'شماره موبایل معتبر نیست')
})

const verifySchema = z
  .object({
    otpCode: z.string().length(6, 'کد باید ۶ رقمی باشد'),
    newPassword: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword']
  })

// ---------- event handlers ----------
const sendOtp = async (event: FormSubmitEvent<any>) => {
  loading.value = true
  try {
    await $api.post('/account/send-forget-password-otp', {
      cellphone: mobileNumber.value
    })
    otpSent.value = true
    step.value = 'verify'
    toast.add({
      title: 'کد ارسال شد',
      description: 'کد تایید به شماره موبایل شما ارسال شد',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'خطا',
      description: error.response?.data?.message || 'خطا در ارسال کد',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const resetPassword = async (event: FormSubmitEvent<any>) => {
  loading.value = true
  try {
    await $api.post('/account/forget-password', {
      cellphone: mobileNumber.value,
      otp: otpCode.value,
      password: newPassword.value,
      confirmPassword: confirmPassword.value
    })
    toast.add({
      title: 'رمز عبور تغییر کرد',
      description: 'رمز عبور شما با موفقیت تغییر کرد. لطفاً وارد شوید.',
      color: 'success'
    })
    await navigateTo('/account/login')
  } catch (error: any) {
    toast.add({
      title: 'خطا',
      description: error.response?.data?.message || 'خطا در تغییر رمز عبور',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const goBackToRequest = () => {
  step.value = 'request'
  otpCode.value = ''
}

const goToLogin = () => {
  navigateTo('/account/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-bold">فراموشی رمز عبور</h1>
          <p class="text-slate-500 dark:text-slate-600 mt-1">
            {{ step === 'request' ? 'شماره موبایل خود را وارد کنید' : 'کد تایید را وارد کنید' }}
          </p>
        </div>
      </template>

      <!-- Step 1: Request OTP -->
      <UForm v-if="step === 'request'" :schema="requestSchema" :state="{ mobileNumber }" @submit="sendOtp">
        <UFormField label="شماره موبایل" name="mobileNumber" required>
          <UInput v-model="mobileNumber" type="tel" placeholder="09123456789" size="lg" class="w-full text-left" />
        </UFormField>

        <div class="mt-5">
          <UButton type="submit" color="primary" block size="lg" :loading="loading">
            ارسال کد تایید
          </UButton>
        </div>

        <div class="text-center text-sm mt-4">
          <UButton color="neutral" variant="ghost" @click="goToLogin">
            بازگشت به صفحه ورود
          </UButton>
        </div>
      </UForm>

      <!-- Step 2: Verify OTP & Reset Password -->
      <UForm v-else :schema="verifySchema" :state="{ otpCode, newPassword, confirmPassword }" @submit="resetPassword">
        <UFormField label="کد تایید" name="otpCode" required>
          <UInput v-model="otpCode" type="text" placeholder="کد ۶ رقمی" size="lg" class="w-full text-left" />
        </UFormField>

        <UFormField label="رمز عبور جدید" name="newPassword" required class="mt-4">
          <UInput v-model="newPassword" type="password" placeholder="رمز عبور جدید" size="lg" class="w-full text-left" />
        </UFormField>

        <UFormField label="تکرار رمز عبور" name="confirmPassword" required class="mt-4">
          <UInput v-model="confirmPassword" type="password" placeholder="تکرار رمز عبور" size="lg" class="w-full text-left" />
        </UFormField>

        <div class="mt-5">
          <UButton type="submit" color="primary" block size="lg" :loading="loading">
            تغییر رمز عبور
          </UButton>
        </div>

        <div class="text-center text-sm mt-4">
          <UButton color="neutral" variant="ghost" @click="goBackToRequest">
            ارسال مجدد کد
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
