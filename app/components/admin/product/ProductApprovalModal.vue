<!-- app/components/admin/product/ProductApprovalModal.vue -->
<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  open: boolean
  product: Product | null
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
    } else if (props.product) {
      approved.value = props.product.approvalStatus === 1
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
  <UModal :open="open" :title="approved ? 'تایید محصول' : 'رد محصول'" class="max-w-md" @update:open="closeModal">
    <template #body>
      <div v-if="product" class="space-y-4">
        <p class="text-sm">
          محصول: <span class="font-semibold">{{ product.title }}</span>
        </p>

        <UFormField label="نتیجه تایید" required>
          <URadioGroup
            v-model="approved"
            orientation="horizontal"
            :items="[
              { label: 'تایید', value: true },
              { label: 'رد', value: false }
            ]"
          />
        </UFormField>

        <UFormField v-if="!approved" label="دلیل رد" required>
          <UTextarea v-model="rejectionReason" rows="3" placeholder="لطفاً دلیل رد محصول را وارد کنید..." class="w-full" />
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


