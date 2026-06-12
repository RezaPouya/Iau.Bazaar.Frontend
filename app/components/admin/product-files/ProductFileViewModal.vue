<!-- app/components/admin/product-files/ProductFileViewModal.vue -->
<script setup lang="ts">
import type { ProductFile } from '~/types/product-file'

const props = defineProps<{
  open: boolean
  file: ProductFile | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const closeModal = () => {
  emit('update:open', false)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved': return { color: 'success', label: 'تایید شده' }
    case 'Rejected': return { color: 'error', label: 'رد شده' }
    default: return { color: 'warning', label: 'در انتظار تایید' }
  }
}

const isImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
}
</script>

<template>
  <UModal :open="open" title="جزئیات فایل" class="max-w-2xl" @update:open="closeModal">
    <template #body>
      <div v-if="file" class="space-y-4">
        <!-- Image Preview -->
        <div v-if="isImage(file.fileName)" class="flex justify-center">
          <img :src="file.fileUrl" :alt="file.title || file.fileName" class="max-w-full max-h-64 rounded-lg" />
        </div>

        <!-- File Info -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-dimmed">شناسه</div>
            <div class="text-sm font-medium">{{ file.id }}</div>
          </div>
          <div>
            <div class="text-xs text-dimmed">وضعیت تایید</div>
            <UBadge :color="getStatusBadge(file.approvalStatus).color" variant="subtle" size="sm">
              {{ getStatusBadge(file.approvalStatus).label }}
            </UBadge>
          </div>
          <div>
            <div class="text-xs text-dimmed">عنوان</div>
            <div class="text-sm">{{ file.title || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-dimmed">نام فایل</div>
            <div class="text-sm break-all">{{ file.fileName }}</div>
          </div>
          <div>
            <div class="text-xs text-dimmed">حجم فایل</div>
            <div class="text-sm">{{ formatFileSize(file.fileSize) }}</div>
          </div>
          <div>
            <div class="text-xs text-dimmed">تاریخ آپلود</div>
            <div class="text-sm">{{ file.createdAtPersian }}</div>
          </div>
          <div v-if="file.description">
            <div class="text-xs text-dimmed">توضیحات</div>
            <div class="text-sm">{{ file.description }}</div>
          </div>
          <div v-if="file.rejectionReason">
            <div class="text-xs text-dimmed">دلیل رد</div>
            <div class="text-sm text-error">{{ file.rejectionReason }}</div>
          </div>
          <div v-if="file.approvedByUserName">
            <div class="text-xs text-dimmed">تایید کننده</div>
            <div class="text-sm">{{ file.approvedByUserName }}</div>
          </div>
          <div v-if="file.approvedAtPersian">
            <div class="text-xs text-dimmed">تاریخ تایید</div>
            <div class="text-sm">{{ file.approvedAtPersian }}</div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="closeModal">بستن</UButton>
        <UButton v-if="file" color="primary" variant="outline" @click="closeModal">
          <UIcon name="i-lucide-download" class="ml-1 size-4" />
          دانلود
        </UButton>
      </div>
    </template>
  </UModal>
</template>
