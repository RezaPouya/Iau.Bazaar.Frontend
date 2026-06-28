<script setup lang="ts">
const props = defineProps<{
  open: boolean
  htmlContent: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const closeModal = () => {
  emit('update:open', false)
}

const { sanitize } = useSanitizedHtml()
const sanitizedHtml = computed(() => sanitize(props.htmlContent))
</script>

<template>
  <UModal :open="open" title="پیش‌نمایش توضیحات" class="max-w-3xl" @update:open="closeModal">
    <template #body>
      <div class="prose prose-sm dark:prose-invert max-w-none" v-html="sanitizedHtml" />
    </template>
  </UModal>
</template>


