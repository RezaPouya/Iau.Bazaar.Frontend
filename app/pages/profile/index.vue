<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useProfileService } from '~/services/profile.service'

definePageMeta({ middleware: 'auth', layout: 'default' })

// نکته: نسخه قبلی این صفحه با useFetch('/api/profile') و $api.put('/api/profile', ...)
// کار می‌کرد. مورد اول هیچ‌وقت به بک‌اند واقعی نمی‌رسید و مورد دوم به‌خاطر پیشوند
// تکراری «/api» به آدرس غلط .../api/api/profile منتهی می‌شد.
const { getProfile, updateProfile } = useProfileService()
const toast = useAppToast()
const loading = ref(false)

const { data: profile, pending, refresh } = await useAsyncData(
  'profile',
  () => getProfile(),
  { default: () => null }
)

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
    form.firstName = val.firstName ?? ''
    form.lastName = val.lastName ?? ''
    form.phoneNumber = val.phoneNumber ?? ''
    form.email = val.email ?? ''
    form.nationalCode = val.nationalCode ?? ''
  }
}, { immediate: true })

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  loading.value = true
  try {
    await updateProfile(event.data)
    toast.success('پروفایل بروزرسانی شد')
    await refresh()
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message)
  } finally {
    loading.value = false
  }
}

useHead({ title: 'پروفایل من' })
</script>

<template>
  <div class="max-w-lg mx-auto py-8">
    <div class="flex items-center gap-3 mb-6">
      <UAvatar :alt="`${form.firstName} ${form.lastName}`" size="lg" />
      <div>
        <h1 class="text-2xl font-bold">پروفایل من</h1>
        <p v-if="profile?.userName" class="text-sm text-dimmed">{{ profile.userName }}</p>
      </div>
    </div>

    <UCard v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary-500" />
    </UCard>
    <UCard v-else>
      <UForm :schema="schema" :state="form" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="نام" name="firstName">
            <UInput v-model="form.firstName" class="w-full" />
          </UFormField>
          <UFormField label="نام خانوادگی" name="lastName">
            <UInput v-model="form.lastName" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="شماره موبایل" name="phoneNumber">
          <UInput v-model="form.phoneNumber" type="tel" class="w-full text-left" dir="ltr" />
        </UFormField>
        <UFormField label="ایمیل" name="email">
          <UInput v-model="form.email" type="email" class="w-full text-left" dir="ltr" />
        </UFormField>
        <UFormField label="کد ملی" name="nationalCode">
          <UInput v-model="form.nationalCode" class="w-full text-left" dir="ltr" />
        </UFormField>
        <UButton type="submit" color="primary" block :loading="loading">ذخیره تغییرات</UButton>
      </UForm>
    </UCard>
  </div>
</template>
