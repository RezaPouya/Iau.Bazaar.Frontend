<!-- app/components/admin/product-files/ProductFileDeleteModal.vue -->
<script setup lang="ts">
import type { ProductFile } from '~/types/product-file'

const props = defineProps<{
  open: boolean
  file: ProductFile | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const closeModal = () => {
  emit('update:open', false)
}

const onConfirm = () => {
  emit('confirm')
  closeModal()
}
</script>

<template>
  <UModal :open="open" title="حذف فایل" class="max-w-md" @update:open="closeModal">
    <template #body>
      <p v-if="file" class="text-center">
        آیا از حذف فایل <span class="font-semibold">{{ file.title || file.fileName }}</span> اطمینان دارید؟
      </p>
      <p class="text-sm text-dimmed text-center mt-2">این عمل غیرقابل بازگشت است.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
        <UButton color="error" @click="onConfirm">حذف</UButton>
      </div>
    </template>
  </UModal>
</template>
