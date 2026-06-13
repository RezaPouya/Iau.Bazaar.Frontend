<!-- app/components/admin/product-files/ProductFileUploadModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  open: boolean
  productId: number
  productTitle: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'upload', formData: FormData): void
}>()

const form = reactive({
  files: [] as File[],
  title: '',
  description: ''
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

// Validation schema
const schema = z.object({
  files: z.array(z.any()).min(1, 'حداقل یک فایل انتخاب کنید'),
  title: z.string().optional(),
  description: z.string().optional()
})

type FormData = z.infer<typeof schema>

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    form.files = Array.from(input.files)
  }
}

const removeFile = (index: number) => {
  form.files.splice(index, 1)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  uploading.value = true
  const formData = new FormData()
  formData.append('ProductId', String(props.productId))
  for (const file of form.files) {
    formData.append('Files', file)
  }
  if (form.title) formData.append('Title', form.title)
  if (form.description) formData.append('Description', form.description)

  emit('upload', formData)
  resetForm()
  uploading.value = false
}

const resetForm = () => {
  form.files = []
  form.title = ''
  form.description = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const closeModal = () => {
  resetForm()
  emit('update:open', false)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) resetForm()
  }
)
</script>

<template>
  <UModal :open="open" title="آپلود فایل محصول" class="max-w-lg" @update:open="closeModal">
    <template #body>
      <div class="mb-3 text-sm text-dimmed">
        محصول: <span class="font-semibold">{{ productTitle }}</span>
      </div>

      <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="فایل‌ها" name="files" required>
          <div class="space-y-2">
            <UInput ref="fileInputRef" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar" @change="onFileSelect" />
            <div v-if="form.files.length" class="space-y-1 mt-2">
              <div v-for="(file, index) in form.files" :key="index" class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-file" class="size-4 text-dimmed" />
                  <span class="text-sm">{{ file.name }}</span>
                  <span class="text-xs text-dimmed">({{ formatFileSize(file.size) }})</span>
                </div>
                <UButton size="xs" color="error" variant="ghost" @click="removeFile(index)">
                  <UIcon name="i-lucide-x" class="size-4" />
                </UButton>
              </div>
            </div>
            <p class="text-xs text-dimmed">فرمت‌های مجاز: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP, RAR</p>
          </div>
        </UFormField>

        <UFormField label="عنوان" name="title">
          <UInput v-model="form.title" class="w-full text-right" placeholder="عنوان فایل (اختیاری)" />
        </UFormField>

        <UFormField label="توضیحات" name="description">
          <UTextarea v-model="form.description" rows="2" class="w-full text-right" placeholder="توضیحات (اختیاری)" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
          <UButton type="submit" color="primary" :loading="uploading">آپلود</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
