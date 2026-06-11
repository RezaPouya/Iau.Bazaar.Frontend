<!-- app/components/admin/media/MediaVideoFormModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface VideoMedia {
  id: number
  title: string
  subTitle: string | null
  description: string | null
  durationTime: number
  image?: { url: string } | null
}

const props = defineProps<{
  open: boolean
  editingId: number | null
  initialData?: VideoMedia | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', formData: FormData): void
}>()

// Form state
const form = reactive({
  title: '',
  subTitle: '',
  description: '',
  durationTime: 0,
  video: null as File | null,
  image: null as File | null,
  videoPreview: '',
  imagePreview: ''
})

const videoInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.title = data.title
      form.subTitle = data.subTitle || ''
      form.description = data.description || ''
      form.durationTime = data.durationTime
      form.imagePreview = data.image?.url || ''
      form.video = null
      form.image = null
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
  form.subTitle = ''
  form.description = ''
  form.durationTime = 0
  form.video = null
  form.image = null
  form.videoPreview = ''
  form.imagePreview = ''
  if (videoInputRef.value) videoInputRef.value.value = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
}

// Handle file selection
const onFileSelect = (event: Event, type: 'video' | 'image') => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const previewUrl = URL.createObjectURL(file)
    if (type === 'video') {
      if (form.videoPreview) URL.revokeObjectURL(form.videoPreview)
      form.video = file
      form.videoPreview = previewUrl
    } else {
      if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
      form.image = file
      form.imagePreview = previewUrl
    }
  }
}

// Remove selected file
const removeFile = (type: 'video' | 'image') => {
  if (type === 'video') {
    if (form.videoPreview) URL.revokeObjectURL(form.videoPreview)
    form.video = null
    form.videoPreview = ''
    if (videoInputRef.value) videoInputRef.value.value = ''
  } else {
    if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
    form.image = null
    form.imagePreview = ''
    if (imageInputRef.value) imageInputRef.value.value = ''
  }
}

// Validation schema
const schema = z.object({
  title: z.string().min(2, 'عنوان ویدئو باید حداقل ۲ کاراکتر باشد'),
  subTitle: z.string().optional(),
  description: z.string().optional(),
  durationTime: z.number().int().min(1, 'مدت زمان باید حداقل ۱ ثانیه باشد')
})

type FormData = z.infer<typeof schema>

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  const formData = new FormData()
  formData.append('Title', form.title)
  if (form.subTitle) formData.append('SubTitle', form.subTitle)
  if (form.description) formData.append('Description', form.description)
  formData.append('DurationTime', String(form.durationTime))
  if (form.video) formData.append('Video', form.video)
  if (form.image) formData.append('Image', form.image)

  emit('save', formData)
}

const closeModal = () => {
  emit('update:open', false)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (form.videoPreview) URL.revokeObjectURL(form.videoPreview)
  if (form.imagePreview && !props.initialData) URL.revokeObjectURL(form.imagePreview)
})
</script>

<template>
  <UModal :open="open" :title="editingId ? 'ویرایش ویدئو' : 'افزودن ویدئو'" class="max-w-2xl" @update:open="closeModal">
    <template #body>
      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="عنوان" name="title" required>
          <UInput v-model="form.title" class="w-full text-right" />
        </UFormField>

        <UFormField label="زیر عنوان" name="subTitle">
          <UInput v-model="form.subTitle" class="w-full text-right" />
        </UFormField>

        <UFormField label="توضیحات" name="description">
          <UTextarea v-model="form.description" rows="3" class="w-full text-right" />
        </UFormField>

        <UFormField label="مدت زمان (ثانیه)" name="durationTime" required>
          <UInput v-model.number="form.durationTime" type="number" min="1" class="w-full text-left" />
        </UFormField>

        <UFormField label="فایل ویدئو" name="video">
          <div class="space-y-2">
            <div v-if="form.videoPreview" class="flex items-center gap-2">
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                <UIcon name="i-lucide-video" class="size-5 text-primary-600" />
                <span class="text-sm">{{ form.video?.name || 'ویدئو انتخاب شده' }}</span>
              </div>
              <UButton size="xs" color="error" variant="ghost" @click="removeFile('video')">
                <UIcon name="i-lucide-x" class="size-4" />
              </UButton>
            </div>
            <UInput ref="videoInputRef" type="file" accept="video/mp4,video/quicktime,video/x-msvideo" @change="(e) => onFileSelect(e, 'video')" />
            <p class="text-xs text-dimmed">فرمت‌های مجاز: MP4, MOV, AVI</p>
          </div>
        </UFormField>

        <UFormField label="تصویر شاخص" name="image">
          <div class="space-y-2">
            <div v-if="form.imagePreview" class="relative inline-block">
              <img :src="form.imagePreview" class="w-32 h-32 object-cover rounded-lg border" />
              <UButton size="xs" color="error" variant="solid" class="absolute -top-2 -right-2 rounded-full" @click="removeFile('image')">
                <UIcon name="i-lucide-x" class="size-3" />
              </UButton>
            </div>
            <UInput ref="imageInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg" @change="(e) => onFileSelect(e, 'image')" />
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
