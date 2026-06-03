<template>
  <ClientOnly>
    <UCard>
      <!-- Filters slot -->
      <div v-if="$slots.filters" class="mb-4">
        <slot name="filters" :add-filter="addFilter" :clear-filters="clearFilters" />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
      </div>

      <!-- Table -->
      <UTable
        v-else
        :rows="data"
        :columns="columns"
        :loading="loading"
        :ui="{
          th: 'cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800'
        }"
        @update:sort="onSort"
      >
        <template v-for="col in columns" :key="col.id" #[`cell-${col.id}`]="{ row, value }">
          <slot :name="`cell-${col.id}`" :row="row" :value="value">
            {{ value }}
          </slot>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="totalPages > 0" class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">{{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totals) }} از {{ totals }}</div>
        <div class="flex gap-2 items-center">
          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
          <span class="text-sm">صفحه {{ currentPage }} از {{ totalPages }}</span>
          <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" :disabled="currentPage >= totalPages" @click="setPage(currentPage + 1)" />
          <USelect v-model="pageSizeValue" :items="[10, 20, 50, 100]" size="sm" class="w-24" />
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { GridPropertyFilter, GridSort } from '~/types/grid'

export interface DataGridColumn {
  id: string
  header: string
  sortable?: boolean
}

const props = defineProps<{
  columns: DataGridColumn[]
  data: any[]
  totals: number
  totalPages: number
  currentPage: number
  pageSize: number
  loading: boolean
  sort: GridSort | null
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'update:sort', sort: GridSort | null): void
  (e: 'addFilter', filter: GridPropertyFilter): void
  (e: 'clearFilters'): void
}>()

const pageSizeValue = computed({
  get: () => props.pageSize,
  set: (val: number) => emit('update:pageSize', val)
})

const setPage = (page: number) => emit('update:page', page)

const addFilter = (filter: GridPropertyFilter) => emit('addFilter', filter)
const clearFilters = () => emit('clearFilters')

const onSort = (options: { column: string; direction: 'asc' | 'desc' | false }) => {
  if (!options.direction) {
    emit('update:sort', null)
  } else {
    emit('update:sort', {
      propertyName: options.column,
      ascending: options.direction === 'asc'
    })
  }
}
</script>
