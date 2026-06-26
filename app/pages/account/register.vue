<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'guest', layout: 'account' })

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
  userName: z.string().min(3, 'نام کاربری حداقل ۳ کاراکتر'),
  phoneNumber: z.string().min(11, 'شماره موبایل نامعتبر').max(11, 'شماره موبایل نامعتبر'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalCode: z.string().length(10, 'کد ملی ۱۰ رقم است').optional(),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن مطابقت ندارند',
  path: ['confirmPassword']
})

type FormData = z.infer<typeof schema>
const form = reactive<Partial<FormData>>({})

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  loading.value = true
  try {
    // نکته: مسیر قبلی «/api/public/auth/register» به‌خاطر پیشوند تکراری «/api» باعث
    // می‌شد آدرس نهایی غلط (.../api/api/public/auth/register) شود و ثبت‌نام شکست بخورد.
    await $api.post('public/auth/register', event.data)
    toast.add({ title: 'ثبت‌نام موفق', description: 'لطفاً وارد شوید.', color: 'success' })
    await navigateTo('/account/login')
  } catch (err: any) {
    toast.add({ title: 'خطا', description: err.response?.data?.message || 'ثبت‌نام ناموفق', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto py-8">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-center">ثبت‌نام</h1>
      </template>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="نام کاربری" name="userName" required>
          <UInput v-model="form.userName" class="w-full" />
        </UFormField>
        <UFormField label="شماره موبایل" name="phoneNumber" required>
          <UInput v-model="form.phoneNumber" type="tel" class="w-full text-left" />
        </UFormField>
        <UFormField label="نام" name="firstName">
          <UInput v-model="form.firstName" class="w-full" />
        </UFormField>
        <UFormField label="نام خانوادگی" name="lastName">
          <UInput v-model="form.lastName" class="w-full" />
        </UFormField>
        <UFormField label="کد ملی" name="nationalCode">
          <UInput v-model="form.nationalCode" class="w-full text-left" />
        </UFormField>
        <UFormField label="رمز عبور" name="password" required>
          <UInput v-model="form.password" type="password" class="w-full" />
        </UFormField>
        <UFormField label="تکرار رمز عبور" name="confirmPassword" required>
          <UInput v-model="form.confirmPassword" type="password" class="w-full" />
        </UFormField>
        <UButton type="submit" color="primary" block :loading="loading">ثبت‌نام</UButton>
      </UForm>
      <div class="text-center mt-4 text-sm">
        قبلاً ثبت‌نام کرده‌اید؟ <NuxtLink to="/account/login" class="text-primary-600">ورود</NuxtLink>
      </div>
    </UCard>
  </div>
</template>


