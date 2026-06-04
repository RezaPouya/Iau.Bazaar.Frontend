<!-- app/components/admin/growth-center/GrowthCenterFormModal.vue -->
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
    universityId: number
    isActive: boolean
  }
  universities: { id: number; title: string }[]
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
  universityId: 0,
  isActive: true
})

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.id = data.id || null
      form.title = data.title
      form.description = data.description || ''
      form.universityId = data.universityId
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
  form.description = ''
  form.universityId = props.universities[0]?.id || 0
  form.isActive = true
}

// Validation schema
const schema = z.object({
  title: z.string().min(2, 'نام مرکز رشد باید حداقل ۲ کاراکتر باشد'),
  universityId: z.number().min(1, 'لطفاً دانشگاه را انتخاب کنید'),
  description: z.string().optional(),
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
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش مرکز رشد' : 'افزودن مرکز رشد'" class="max-w-3xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-3">
        <UFormField label="نام مرکز رشد" name="title" required>
          <UInput v-model="form.title" class="w-full text-right" />
        </UFormField>

        <UFormField label="دانشگاه" name="universityId" required>
          <USelect
            v-model="form.universityId"
            :items="universities.map((u) => ({ label: u.title, value: u.id }))"
            class="w-full"
            :popper="{ placement: 'bottom-end' }"
          />
        </UFormField>

        <UFormField label="توضیحات" name="description">
          <RichTextEditor v-model="form.description" />
        </UFormField>

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
