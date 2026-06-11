<!-- app/components/admin/media/MediaTabs.vue -->
<script setup lang="ts">
const model = defineModel<'images' | 'videos'>({ required: true })

const tabs = [
  { value: 'images', label: 'تصاویر', icon: 'i-lucide-image' },
  { value: 'videos', label: 'ویدئوها', icon: 'i-lucide-video' }
]
</script>

<template>
  <div class="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="model = tab.value"
      class="px-4 py-2 text-sm font-medium transition-all border-b-2"
      :class="model === tab.value ? 'border-primary-600 text-primary-600' : 'border-transparent text-dimmed hover:text-gray-700 dark:hover:text-gray-300'"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="tab.icon" class="size-4" />
        {{ tab.label }}
      </div>
    </button>
  </div>
</template>
