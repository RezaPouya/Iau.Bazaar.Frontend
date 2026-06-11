<!-- app/components/admin/user/UserFormModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { UserRole } from '~/types/user'

const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: {
    userId?: number
    fullName: string
    userName: string
    phoneNumber: string
    email?: string
    nationalCode?: string
    role: string
    isActive: boolean
  }
  roles: UserRole[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}>()

const form = reactive({
  userId: null as number | null,
  fullName: '',
  userName: '',
  phoneNumber: '',
  email: '',
  nationalCode: '',
  password: '',
  role: '',
  isActive: true
})

const showPassword = ref(false)

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.userId = data.userId || null
      form.fullName = data.fullName
      form.userName = data.userName
      form.phoneNumber = data.phoneNumber
      form.email = data.email || ''
      form.nationalCode = data.nationalCode || ''
      form.role = data.role
      form.isActive = data.isActive
      form.password = ''
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)

const resetForm = () => {
  form.userId = null
  form.fullName = ''
  form.userName = ''
  form.phoneNumber = ''
  form.email = ''
  form.nationalCode = ''
  form.password = ''
  form.role = props.roles[0]?.id || ''
  form.isActive = true
}

const schema = z.object({
  fullName: z.string().min(3, 'نام کامل باید حداقل ۳ کاراکتر باشد'),
  userName: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  phoneNumber: z.string().min(11, 'شماره تماس نامعتبر است').max(11, 'شماره تماس نامعتبر است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  nationalCode: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد').optional().or(z.literal('')),
  role: z.string().min(1, 'لطفاً نقش کاربر را انتخاب کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').optional().or(z.literal('')),
  isActive: z.boolean()
})

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  const submitData = {
    ...event.data,
    userId: form.userId
  }

  // Only send password if it's provided (for create or password change)
  if (!submitData.password) {
    delete submitData.password
  }

  emit('save', submitData)
}

const closeModal = () => {
  emit('update:open', false)
}

const roleOptions = computed(() => {
  return props.roles.map((role) => ({
    label: role.nameFa || role.name,
    value: role.id
  }))
})
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش کاربر' : 'افزودن کاربر'" class="max-w-2xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="نام کامل" name="fullName" required>
            <UInput v-model="form.fullName" class="w-full text-right" />
          </UFormField>

          <UFormField label="نام کاربری" name="userName" required>
            <UInput v-model="form.userName" class="w-full text-right" />
          </UFormField>

          <UFormField label="شماره تماس" name="phoneNumber" required>
            <UInput v-model="form.phoneNumber" type="tel" class="w-full text-left" />
          </UFormField>

          <UFormField label="ایمیل" name="email">
            <UInput v-model="form.email" type="email" class="w-full text-left" />
          </UFormField>

          <UFormField label="کد ملی" name="nationalCode">
            <UInput v-model="form.nationalCode" class="w-full text-left" />
          </UFormField>

          <UFormField label="نقش کاربری" name="role" required>
            <USelect v-model="form.role" :items="roleOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
          </UFormField>

          <UFormField label="رمز عبور" name="password">
            <div class="flex gap-2">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="flex-1 text-left"
                :placeholder="editingId ? 'در صورت تمایل رمز جدید وارد کنید' : 'رمز عبور را وارد کنید'"
              />
              <UButton size="sm" color="neutral" variant="ghost" @click="showPassword = !showPassword">
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </UButton>
            </div>
            <p v-if="editingId" class="text-xs text-dimmed mt-1">برای تغییر رمز عبور، مقدار جدید وارد کنید</p>
          </UFormField>

          <UFormField label="فعال" name="isActive" class="flex-1">
            <USwitch v-model="form.isActive" />
          </UFormField>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
          <UButton type="submit" color="primary">ذخیره</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
