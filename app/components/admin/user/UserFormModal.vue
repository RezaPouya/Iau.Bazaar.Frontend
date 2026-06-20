<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { UserRole } from '~/types/user'

const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: {
    userId?: number
    firstName: string
    lastName: string
    userName: string
    phoneNumber: string
    email?: string
    nationalCode?: string
    role: number | null
    isActive: boolean
    universityId?: number | null
    growthCenterId?: number | null
    companyId?: number | null
  }
  roles: UserRole[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}>()

const form = reactive({
  userId: null as number | null,
  firstName: '',
  lastName: '',
  userName: '',
  phoneNumber: '',
  email: '',
  nationalCode: '',
  password: '',
  role: null as number | null,
  universityId: null as number | null,
  growthCenterId: null as number | null,
  companyId: null as number | null,
  isActive: true
})

const showPassword = ref(false)

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.userId = data.userId || null
      form.firstName = data.firstName || ''
      form.lastName = data.lastName || ''
      form.userName = data.userName || ''
      form.phoneNumber = data.phoneNumber || ''
      form.email = data.email || ''
      form.nationalCode = data.nationalCode || ''
      form.role = data.role
      form.isActive = data.isActive ?? true
      form.universityId = data.universityId ?? null
      form.growthCenterId = data.growthCenterId ?? null
      form.companyId = data.companyId ?? null
      form.password = ''
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) resetForm()
  }
)

const resetForm = () => {
  form.userId = null
  form.firstName = ''
  form.lastName = ''
  form.userName = ''
  form.phoneNumber = ''
  form.email = ''
  form.nationalCode = ''
  form.password = ''
  form.role = props.roles[0]?.id || null
  form.isActive = true
  form.universityId = null
  form.growthCenterId = null
  form.companyId = null
}

const schema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  userName: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  phoneNumber: z.string().min(11, 'شماره تماس نامعتبر است').max(11, 'شماره تماس نامعتبر است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  nationalCode: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد').optional().or(z.literal('')),
  role: z.number().nullable().refine(val => val !== null, 'لطفاً نقش کاربر را انتخاب کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').optional().or(z.literal('')),
  isActive: z.boolean(),
  universityId: z.number().nullable().optional(),
  growthCenterId: z.number().nullable().optional(),
  companyId: z.number().nullable().optional()
})

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  const submitData = { ...event.data, userId: form.userId }

  // در حالت ویرایش، رمز عبور را فقط در صورت پر شدن ارسال کن
  if (props.editingId && !submitData.password) {
    delete submitData.password
  }

  // در حالت ایجاد، isActive را ارسال نکن (بک‌اند مقدار پیش‌فرض دارد)
  if (!props.editingId) {
    delete submitData.isActive
  }

  // حذف مقادیر null برای فیلدهای اختیاری
  if (submitData.universityId === null) delete submitData.universityId
  if (submitData.growthCenterId === null) delete submitData.growthCenterId
  if (submitData.companyId === null) delete submitData.companyId

  emit('save', submitData)
}

const closeModal = () => emit('update:open', false)

const roleOptions = computed(() =>
  props.roles.map((role) => ({
    label: role.nameFa || role.name,
    value: role.id
  }))
)
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش کاربر' : 'افزودن کاربر'" class="max-w-2xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="نام" name="firstName" required>
            <UInput v-model="form.firstName" class="w-full text-right" />
          </UFormField>

          <UFormField label="نام خانوادگی" name="lastName" required>
            <UInput v-model="form.lastName" class="w-full text-right" />
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
            <USwitch v-model="form.isActive" :disabled="!editingId" />
            <p v-if="!editingId" class="text-xs text-dimmed">کاربر جدید به‌طور پیش‌فرض فعال است</p>
          </UFormField>
        </div>

        <!-- فیلدهای روابط (اختیاری) -->
        <div v-if="form.role === 2" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField label="دانشگاه" name="universityId">
            <UInput v-model.number="form.universityId" type="number" placeholder="شناسه دانشگاه" class="w-full text-left" />
          </UFormField>
          <UFormField label="مرکز رشد" name="growthCenterId">
            <UInput v-model.number="form.growthCenterId" type="number" placeholder="شناسه مرکز رشد" class="w-full text-left" />
          </UFormField>
          <UFormField label="شرکت" name="companyId">
            <UInput v-model.number="form.companyId" type="number" placeholder="شناسه شرکت" class="w-full text-left" />
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
