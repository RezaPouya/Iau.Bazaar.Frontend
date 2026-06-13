<!-- app/components/admin/product/ProductPagination.vue -->
<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  totals: number
  pageSize: number
  startIndex: number
  endIndex: number
}>()

const emit = defineEmits<{
  (e: 'page', page: number): void
  (e: 'pageSize', size: number): void
}>()

const setPage = (page: number) => emit('page', page)
const setPageSize = (size: number) => emit('pageSize', size)
</script>

<template>
  <div v-if="totalPages > 0" class="flex justify-between items-center mt-3 text-sm">
    <div class="text-gray-500">{{ startIndex }} - {{ endIndex }} از {{ totals }}</div>
    <div class="flex gap-1 items-center">
      <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
      <span class="text-sm mx-1">صفحه {{ currentPage }} از {{ totalPages }}</span>
      <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" size="sm" :disabled="currentPage >= totalPages" @click="setPage(currentPage + 1)" />
      <USelect :model-value="pageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setPageSize" />
    </div>
  </div>
</template>
