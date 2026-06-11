<!-- app/components/admin/media/MediaPreviewModal.vue -->
<script setup lang="ts">
const props = defineProps<{
  open: boolean
  imageUrl: string
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const closeModal = () => {
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" :title="title" class="max-w-4xl" @update:open="closeModal">
    <template #body>
      <div class="flex justify-center">
        <img :src="imageUrl" :alt="title" class="max-w-full max-h-[70vh] rounded-lg" />
      </div>
    </template>
  </UModal>
</template>
