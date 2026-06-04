<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Props
const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: {
    id?: number
    title: string
    description: string
    provinceId: number
    isActive: boolean
    isVisible: boolean
  }
  provinces: { id: number; name: string }[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any): void
}>()

// Form state
const form = reactive({
  id: null as number | null,
  title: '',
  description: '',
  provinceId: 0,
  isActive: true,
  isVisible: true
})

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.id = data.id || null
      form.title = data.title
      form.description = data.description
      form.provinceId = data.provinceId
      form.isActive = data.isActive
      form.isVisible = data.isVisible
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
  form.description = ''
  form.provinceId = props.provinces[0]?.id || 0
  form.isActive = true
  form.isVisible = true
}

// Validation schema
const schema = z.object({
  title: z.string().min(2, 'نام دانشگاه باید حداقل ۲ کاراکتر باشد'),
  provinceId: z.number().min(1, 'لطفاً استان را انتخاب کنید'),
  description: z.string().optional(),
  isActive: z.boolean(),
  isVisible: z.boolean()
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
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش دانشگاه' : 'افزودن دانشگاه'" class="max-w-3xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-3">
        <UFormField label="نام دانشگاه" name="title" required>
          <UInput v-model="form.title" class="w-full text-right" />
        </UFormField>

        <UFormField label="استان" name="provinceId" required>
          <USelect
            v-model="form.provinceId"
            :items="provinces.map((p) => ({ label: p.name, value: p.id }))"
            class="w-full"
            :popper="{ placement: 'bottom-end' }"
          />
        </UFormField>

        <UFormField label="توضیحات (HTML)" name="description">
          <FeatureRichTextEditor v-model="form.description" />
        </UFormField>

        <div class="flex gap-4">
          <UFormField label="فعال" name="isActive" class="flex-1">
            <USwitch v-model="form.isActive" />
          </UFormField>
          <UFormField label="قابل نمایش" name="isVisible" class="flex-1">
            <USwitch v-model="form.isVisible" />
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
