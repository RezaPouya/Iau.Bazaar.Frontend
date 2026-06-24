<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth', layout: 'default' })

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)
const profile = ref<any>({})

// دریافت اطلاعات پروفایل
const { data, pending } = await useFetch('/api/profile', {
  key: 'profile',
  default: () => ({}),
  onResponseError: () => toast.add({ title: 'خطا در دریافت پروفایل', color: 'error' })
})
profile.value = data.value

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(11, 'شماره موبایل نامعتبر').optional(),
  email: z.string().email('ایمیل نامعتبر').optional().or(z.literal('')),
  nationalCode: z.string().length(10, 'کد ملی ۱۰ رقم است').optional()
})

type FormData = z.infer<typeof schema>
const form = reactive<Partial<FormData>>({})

// پر کردن فرم با داده‌های دریافتی
watch(profile, (val) => {
  if (val) {
    form.firstName = val.firstName
    form.lastName = val.lastName
    form.phoneNumber = val.phoneNumber
    form.email = val.email
    form.nationalCode = val.nationalCode
  }
}, { immediate: true })

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  loading.value = true
  try {
    await $api.put('/api/profile', event.data)
    toast.add({ title: 'پروفایل بروزرسانی شد', color: 'success' })
    await refreshNuxtData('profile')
  } catch (err: any) {
    toast.add({ title: 'خطا', description: err.response?.data?.message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">پروفایل من</h1>
    <UCard v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
    </UCard>
    <UCard v-else>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="نام" name="firstName">
          <UInput v-model="form.firstName" class="w-full" />
        </UFormField>
        <UFormField label="نام خانوادگی" name="lastName">
          <UInput v-model="form.lastName" class="w-full" />
        </UFormField>
        <UFormField label="شماره موبایل" name="phoneNumber">
          <UInput v-model="form.phoneNumber" type="tel" class="w-full text-left" />
        </UFormField>
        <UFormField label="ایمیل" name="email">
          <UInput v-model="form.email" type="email" class="w-full text-left" />
        </UFormField>
        <UFormField label="کد ملی" name="nationalCode">
          <UInput v-model="form.nationalCode" class="w-full text-left" />
        </UFormField>
        <UButton type="submit" color="primary" block :loading="loading">ذخیره تغییرات</UButton>
      </UForm>
    </UCard>
  </div>
</template>
