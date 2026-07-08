<!-- app/components/admin/user/UserFormModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// مقادیر دقیقاً برابر AppUserRoleEnum در بک‌اند - این اعداد را تغییر ندهید
// Admin=1, Operator=2, Customer=3, LegalCustomer=4, UniversityUser=10, GrowthCenterUser=20, CompanyUser=30
const ROLES_REQUIRING_UNIVERSITY = [10]
const ROLES_REQUIRING_GROWTH_CENTER = [20]
const ROLES_REQUIRING_COMPANY = [30]

const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: {
    id?: number
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
  roles: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}>()

const { $api } = useNuxtApp()

const form = reactive({
  id: null as number | null,
  firstName: '',
  lastName: '',
  userName: '',
  phoneNumber: '',
  email: '',
  nationalCode: '',
  password: '',
  role: null as number | null,
  isActive: true,
  universityId: null as number | null,
  growthCenterId: null as number | null,
  companyId: null as number | null
})

const showPassword = ref(false)

// ========== لیست‌های دانشگاه/مرکز رشد/شرکت برای انتخاب وابسته به نقش ==========
// از همان الگوی موجود در companies/index.vue و growth-centers/index.vue استفاده می‌کند
const universities = ref<{ id: number; title: string }[]>([])
const growthCenters = ref<{ id: number; title: string; universityName?: string }[]>([])
const companies = ref<{ id: number; title: string }[]>([])
const loadingRelatedLists = ref(false)

const fetchUniversities = async () => {
  try {
    const response = await $api.post('panel/admin/universities/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    universities.value = (response.data.data?.data || []).map((u: any) => ({ id: u.id, title: u.title }))
  } catch (error) {
    console.error('خطا در دریافت دانشگاه‌ها', error)
  }
}

const fetchGrowthCenters = async () => {
  try {
    const response = await $api.post('panel/admin/growth-centers/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    growthCenters.value = (response.data.data?.data || []).map((gc: any) => ({
      id: gc.id,
      title: gc.title,
      universityName: gc.universityName
    }))
  } catch (error) {
    console.error('خطا در دریافت مراکز رشد', error)
  }
}

const fetchCompanies = async () => {
  try {
    const response = await $api.post('panel/admin/companies/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    companies.value = (response.data.data?.data || []).map((c: any) => ({ id: c.id, title: c.title }))
  } catch (error) {
    console.error('خطا در دریافت شرکت‌ها', error)
  }
}

onMounted(async () => {
  loadingRelatedLists.value = true
  await Promise.all([fetchUniversities(), fetchGrowthCenters(), fetchCompanies()])
  loadingRelatedLists.value = false
})

const needsUniversity = computed(() => ROLES_REQUIRING_UNIVERSITY.includes(form.role as number))
const needsGrowthCenter = computed(() => ROLES_REQUIRING_GROWTH_CENTER.includes(form.role as number))
const needsCompany = computed(() => ROLES_REQUIRING_COMPANY.includes(form.role as number))

// با تغییر نقش، فیلدهای نهاد نامرتبط را خالی می‌کنیم وگرنه ValidateRoleAndEntity در بک‌اند رد می‌کند
watch(() => form.role, () => {
  if (!needsUniversity.value) form.universityId = null
  if (!needsGrowthCenter.value) form.growthCenterId = null
  if (!needsCompany.value) form.companyId = null
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.id = data.id || null
      form.firstName = data.firstName
      form.lastName = data.lastName
      form.userName = data.userName
      form.phoneNumber = data.phoneNumber
      form.email = data.email || ''
      form.nationalCode = data.nationalCode || ''
      form.role = data.role
      form.isActive = data.isActive
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
    if (!isOpen) {
      resetForm()
    }
  }
)

const resetForm = () => {
  form.id = null
  form.firstName = ''
  form.lastName = ''
  form.userName = ''
  form.phoneNumber = ''
  form.email = ''
  form.nationalCode = ''
  form.password = ''
  form.role = props.roles[0]?.id ?? null
  form.isActive = true
  form.universityId = null
  form.growthCenterId = null
  form.companyId = null
}

const schema = z
  .object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    userName: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
    phoneNumber: z.string().min(11, 'شماره تماس نامعتبر است').max(11, 'شماره تماس نامعتبر است'),
    email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
    nationalCode: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد').optional().or(z.literal('')),
    role: z.number().nullable().refine((val) => val !== null, 'لطفاً نقش کاربر را انتخاب کنید'),
    // رمز عبور فقط هنگام ایجاد کاربر جدید قابل تنظیم است (بک‌اند راهی برای تغییر آن در ویرایش ندارد)
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').optional().or(z.literal('')),
    isActive: z.boolean(),
    universityId: z.number().nullable().optional(),
    growthCenterId: z.number().nullable().optional(),
    companyId: z.number().nullable().optional()
  })
  .superRefine((data, ctx) => {
    if (ROLES_REQUIRING_UNIVERSITY.includes(data.role as number) && !data.universityId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'لطفاً دانشگاه را انتخاب کنید', path: ['universityId'] })
    }
    if (ROLES_REQUIRING_GROWTH_CENTER.includes(data.role as number) && !data.growthCenterId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'لطفاً مرکز رشد را انتخاب کنید', path: ['growthCenterId'] })
    }
    if (ROLES_REQUIRING_COMPANY.includes(data.role as number) && !data.companyId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'لطفاً شرکت را انتخاب کنید', path: ['companyId'] })
    }
    if (!props.editingId && !data.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'رمز عبور برای کاربر جدید الزامی است', path: ['password'] })
    }
  })

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  const submitData: any = {
    ...event.data,
    id: form.id,
    universityId: needsUniversity.value ? event.data.universityId : null,
    growthCenterId: needsGrowthCenter.value ? event.data.growthCenterId : null,
    companyId: needsCompany.value ? event.data.companyId : null
  }

  // در حالت ویرایش، بک‌اند فیلد رمز عبور ندارد - همیشه حذفش می‌کنیم تا چیزی بی‌فایده ارسال نشود
  if (form.id || !submitData.password) {
    delete submitData.password
  }

  emit('save', submitData)
}

const closeModal = () => {
  emit('update:open', false)
}

const roleOptions = computed(() => {
  return props.roles.map((role) => ({
    label: role.name,
    value: role.id
  }))
})

const universityOptions = computed(() => universities.value.map((u) => ({ label: u.title, value: u.id })))
const growthCenterOptions = computed(() =>
  growthCenters.value.map((gc) => ({
    label: gc.title + (gc.universityName ? ` (${gc.universityName})` : ''),
    value: gc.id
  }))
)
const companyOptions = computed(() => companies.value.map((c) => ({ label: c.title, value: c.id })))
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
            <UInput v-model="form.userName" class="w-full text-left" :disabled="!!editingId" />
            <p v-if="editingId" class="text-xs text-dimmed mt-1">نام کاربری پس از ایجاد قابل تغییر نیست</p>
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

          <UFormField v-if="!editingId" label="رمز عبور" name="password">
            <div class="flex gap-2">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="flex-1 text-left"
                placeholder="رمز عبور را وارد کنید"
              />
              <UButton size="sm" color="neutral" variant="ghost" @click="showPassword = !showPassword">
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </UButton>
            </div>
          </UFormField>

          <!-- فیلدهای وابسته به نقش -->
          <UFormField v-if="needsUniversity" label="دانشگاه" name="universityId" required class="md:col-span-2">
            <USelect
              v-model="form.universityId"
              :items="universityOptions"
              :loading="loadingRelatedLists"
              placeholder="انتخاب دانشگاه..."
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>

          <UFormField v-if="needsGrowthCenter" label="مرکز رشد" name="growthCenterId" required class="md:col-span-2">
            <USelect
              v-model="form.growthCenterId"
              :items="growthCenterOptions"
              :loading="loadingRelatedLists"
              placeholder="انتخاب مرکز رشد..."
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>

          <UFormField v-if="needsCompany" label="شرکت" name="companyId" required class="md:col-span-2">
            <USelect
              v-model="form.companyId"
              :items="companyOptions"
              :loading="loadingRelatedLists"
              placeholder="انتخاب شرکت..."
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
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


