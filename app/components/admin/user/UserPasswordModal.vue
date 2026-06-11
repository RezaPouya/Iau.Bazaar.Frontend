<!-- app/components/admin/user/UserPasswordModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  open: boolean
  userName: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', password: string): void
}>()

const form = reactive({
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)

const schema = z
  .object({
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword']
  })

type FormData = z.infer<typeof schema>

const onSubmit = (event: FormSubmitEvent<FormData>) => {
  emit('save', event.data.password)
  resetForm()
}

const resetForm = () => {
  form.password = ''
  form.confirmPassword = ''
}

const closeModal = () => {
  resetForm()
  emit('update:open', false)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)
</script>

<template>
  <UModal :open="open" title="تغییر رمز عبور" class="max-w-md" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <div class="text-sm text-dimmed mb-2">
          تغییر رمز عبور برای کاربر: <span class="font-semibold">{{ userName }}</span>
        </div>

        <UFormField label="رمز عبور جدید" name="password" required>
          <div class="flex gap-2">
            <UInput v-model="form.password" :type="showPassword ? 'text' : 'password'" class="flex-1 text-left" />
            <UButton size="sm" color="neutral" variant="ghost" @click="showPassword = !showPassword">
              <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
            </UButton>
          </div>
        </UFormField>

        <UFormField label="تکرار رمز عبور" name="confirmPassword" required>
          <UInput v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" class="w-full text-left" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
          <UButton type="submit" color="primary">تغییر رمز</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
