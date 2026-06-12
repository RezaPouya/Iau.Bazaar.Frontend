<!-- app/components/admin/product-files/ProductFileApprovalModal.vue -->
<script setup lang="ts">
import type { ProductFile } from '~/types/product-file'

const props = defineProps<{
  open: boolean
  file: ProductFile | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', approved: boolean, rejectionReason: string): void
}>()

const approved = ref(true)
const rejectionReason = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      approved.value = true
      rejectionReason.value = ''
    }
  }
)

const closeModal = () => {
  emit('update:open', false)
}

const onSubmit = () => {
  emit('submit', approved.value, rejectionReason.value)
  closeModal()
}
</script>

<template>
  <UModal :open="open" :title="approved ? 'تایید فایل' : 'رد فایل'" class="max-w-md" @update:open="closeModal">
    <template #body>
      <div v-if="file" class="space-y-4">
        <p class="text-sm">
          فایل: <span class="font-semibold">{{ file.title || file.fileName }}</span>
        </p>
        <p class="text-xs text-dimmed">
          محصول: {{ file.productId }}
        </p>

        <UFormField label="نتیجه تایید" required>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <URadio v-model="approved" :value="true" />
              <span>تایید</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <URadio v-model="approved" :value="false" />
              <span>رد</span>
            </label>
          </div>
        </UFormField>

        <UFormField v-if="!approved" label="دلیل رد" required>
          <UTextarea v-model="rejectionReason" rows="3" placeholder="لطفاً دلیل رد فایل را وارد کنید..." class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
        <UButton :color="approved ? 'primary' : 'error'" @click="onSubmit">
          {{ approved ? 'تایید' : 'رد' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
