<!-- app/components/admin/media/MediaImageFormModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface MediaImage {
  id: number
  title: string | null
  image?: { url: string } | null
  mobileImage?: { url: string } | null
}

const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: MediaImage | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', formData: FormData): void
}>()

// Form state
const form = reactive({
  title: '',
  image: null as File | null,
  mobileImage: null as File | null,
  imagePreview: '',
  mobileImagePreview: ''
})

const imageInputRef = ref<HTMLInputElement | null>(null)
const mobileImageInputRef = ref<HTMLInputElement | null>(null)

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.title = data.title || ''
      form.imagePreview = data.image?.url || ''
      form.mobileImagePreview = data.mobileImage?.url || ''
      form.image = null
      form.mobileImage = null
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
  form.title = ''
  form.image = null
  form.mobileImage = null
  form.imagePreview = ''
  form.mobileImagePreview = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
  if (mobileImageInputRef.value) mobileImageInputRef.value.value = ''
}

// Handle image file selection
const onImageFileSelect = (event: Event, type: 'image' | 'mobileImage') => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const previewUrl = URL.createObjectURL(file)
    if (type === 'image') {
      if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
      form.image = file
      form.imagePreview = previewUrl
    } else {
      if (form.mobileImagePreview && !props.initialData) URL.revokeObjectURL(form.mobileImagePreview)
      form.mobileImage = file
      form.mobileImagePreview = previewUrl
    }
  }
}

// Remove selected image
const removeImageFile = (type: 'image' | 'mobileImage') => {
  if (type === 'image') {
    if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
    form.image = null
    form.imagePreview = ''
    if (imageInputRef.value) imageInputRef.value.value = ''
  } else {
    if (form.mobileImagePreview && !props.initialData) URL.revokeObjectURL(form.mobileImagePreview)
    form.mobileImage = null
    form.mobileImagePreview = ''
    if (mobileImageInputRef.value) mobileImageInputRef.value.value = ''
  }
}

// Validation schema
const schema = z.object({
  title: z.string().optional()
})

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  const formData = new FormData()
  if (form.title) formData.append('Title', form.title)
  if (form.image) formData.append('Image', form.image)
  if (form.mobileImage) formData.append('MobileImage', form.mobileImage)

  emit('save', formData)
}

const closeModal = () => {
  emit('update:open', false)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
  if (form.mobileImagePreview && !props.initialData) URL.revokeObjectURL(form.mobileImagePreview)
})
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش تصویر' : 'افزودن تصویر'" class="max-w-2xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="عنوان" name="title">
          <UInput v-model="form.title" class="w-full text-right" />
        </UFormField>

        <UFormField label="تصویر اصلی" name="image">
          <div class="space-y-2">
            <div v-if="form.imagePreview" class="relative inline-block">
              <img :src="form.imagePreview" class="w-32 h-32 object-cover rounded-lg border" />
              <UButton size="xs" color="error" variant="solid" class="absolute -top-2 -right-2 rounded-full" @click="removeImageFile('image')">
                <UIcon name="i-lucide-x" class="size-3" />
              </UButton>
            </div>
            <UInput ref="imageInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg" @change="(e) => onImageFileSelect(e, 'image')" />
            <p class="text-xs text-dimmed">فرمت‌های مجاز: JPEG, PNG, WEBP</p>
          </div>
        </UFormField>

        <UFormField label="تصویر موبایل (تامبنیل)" name="mobileImage">
          <div class="space-y-2">
            <div v-if="form.mobileImagePreview" class="relative inline-block">
              <img :src="form.mobileImagePreview" class="w-32 h-32 object-cover rounded-lg border" />
              <UButton size="xs" color="error" variant="solid" class="absolute -top-2 -right-2 rounded-full" @click="removeImageFile('mobileImage')">
                <UIcon name="i-lucide-x" class="size-3" />
              </UButton>
            </div>
            <UInput
              ref="mobileImageInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              @change="(e) => onImageFileSelect(e, 'mobileImage')"
            />
            <p class="text-xs text-dimmed">فرمت‌های مجاز: JPEG, PNG, WEBP</p>
          </div>
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
          <UButton type="submit" color="primary">ذخیره</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
