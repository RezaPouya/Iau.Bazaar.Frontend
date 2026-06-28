<!-- app/components/admin/company/CompanyFormModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useLocationService, type IdName } from '~/services/location.service'

// Props
const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: {
    id?: number
    title: string
    shortDescription: string
    description: string
    growthCenterId: number
    growthCenterCommission: number
    provinceId?: number | null
    sameProvinceShippingCost?: number
    otherProvinceShippingCost?: number
    isActive: boolean
  }
  growthCenters: { id: number; title: string; universityName?: string }[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}>()

// لیست استان‌ها برای انتخاب مبدأ ارسال شرکت
const { getProvinces } = useLocationService()
const provinces = ref<IdName[]>([])
onMounted(async () => {
  provinces.value = await getProvinces()
})

// Form state
const form = reactive({
  id: null as number | null,
  title: '',
  shortDescription: '',
  description: '',
  growthCenterId: 0,
  growthCenterCommission: 0,
  provinceId: null as number | null,
  sameProvinceShippingCost: 0,
  otherProvinceShippingCost: 0,
  isActive: true
})

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.id = data.id || null
      form.title = data.title
      form.shortDescription = data.shortDescription || ''
      form.description = data.description || ''
      form.growthCenterId = data.growthCenterId
      form.growthCenterCommission = data.growthCenterCommission || 0
      form.provinceId = data.provinceId ?? null
      form.sameProvinceShippingCost = data.sameProvinceShippingCost || 0
      form.otherProvinceShippingCost = data.otherProvinceShippingCost || 0
      form.isActive = data.isActive
    }
  },
  { immediate: true }
)

// Reset form when modal closes
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
  form.title = ''
  form.shortDescription = ''
  form.description = ''
  form.growthCenterId = props.growthCenters[0]?.id || 0
  form.growthCenterCommission = 0
  form.provinceId = null
  form.sameProvinceShippingCost = 0
  form.otherProvinceShippingCost = 0
  form.isActive = true
}

// Validation schema
const schema = z.object({
  title: z.string().min(2, 'نام شرکت باید حداقل ۲ کاراکتر باشد'),
  growthCenterId: z.number().min(1, 'لطفاً مرکز رشد را انتخاب کنید'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  growthCenterCommission: z.number().min(0, 'کمیسیون باید عددی مثبت باشد').max(100, 'کمیسیون نمی‌تواند بیشتر از ۱۰۰ باشد'),
  provinceId: z.number().nullable().optional(),
  sameProvinceShippingCost: z.number().min(0, 'هزینه ارسال نمی‌تواند منفی باشد'),
  otherProvinceShippingCost: z.number().min(0, 'هزینه ارسال نمی‌تواند منفی باشد'),
  isActive: z.boolean()
})

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  emit('save', {
    ...event.data,
    id: form.id
  })
}

const closeModal = () => {
  emit('update:open', false)
}

// Helper to format commission display
const formatCommission = (value: number) => `${value}%`
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش شرکت' : 'افزودن شرکت'" class="max-w-3xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" class="space-y-3" @submit="onSubmit">
        <UFormField label="نام شرکت" name="title" required>
          <UInput v-model="form.title" class="w-full text-right" />
        </UFormField>

        <UFormField label="مرکز رشد" name="growthCenterId" required>
          <USelect
            v-model="form.growthCenterId"
            :items="
              growthCenters.map((gc) => ({
                label: gc.title + (gc.universityName ? ` (${gc.universityName})` : ''),
                value: gc.id
              }))
            "
            class="w-full"
            :popper="{ placement: 'bottom-end' }"
          />
        </UFormField>

        <UFormField label="توضیح کوتاه" name="shortDescription">
          <UTextarea v-model="form.shortDescription" rows="2" class="w-full text-right" />
        </UFormField>

        <UFormField label="توضیحات کامل (HTML)" name="description">
          <RichTextEditor v-model="form.description" />
        </UFormField>

        <UFormField label="کمیسیون مرکز رشد (%)" name="growthCenterCommission">
          <div class="flex items-center gap-2">
            <UInput v-model.number="form.growthCenterCommission" type="number" step="0.5" min="0" max="100" class="flex-1 text-left" />
            <span class="text-sm text-gray-500">درصد</span>
          </div>
        </UFormField>

        <!-- اضافه شد: مبدأ ارسال و هزینه پستی (برای سفارش‌هایی که چند شرکت دارند و
             هرکدام بسته‌ی خودشان را جدا ارسال می‌کنند) -->
        <UFormField label="استان مبدأ ارسال" name="provinceId" help="این شرکت محصولات خود را از کدام استان ارسال می‌کند">
          <USelect
            v-model="form.provinceId"
            :items="[{ label: 'تعیین نشده', value: null }, ...provinces.map(p => ({ label: p.name, value: p.id }))]"
            class="w-full"
            :popper="{ placement: 'bottom-end' }"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="هزینه ارسال داخل استان (تومان)" name="sameProvinceShippingCost">
            <UInput v-model.number="form.sameProvinceShippingCost" type="number" min="0" class="w-full text-left" />
          </UFormField>
          <UFormField label="هزینه ارسال بین‌استانی (تومان)" name="otherProvinceShippingCost">
            <UInput v-model.number="form.otherProvinceShippingCost" type="number" min="0" class="w-full text-left" />
          </UFormField>
        </div>

        <UFormField label="فعال" name="isActive" class="flex-1">
          <USwitch v-model="form.isActive" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
          <UButton type="submit" color="primary">ذخیره</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>


