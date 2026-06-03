<script setup lang="ts">
import type { GridDataSourceRequest, GridDataSourceResult, GridPropertyFilter } from '~/types/grid'
import { GridFilterOperation } from '~/types/grid'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت دانشگاه‌ها'
})

// Column definitions
const columns = [
  { accessorKey: 'id', header: 'شناسه', sortable: true },
  { accessorKey: 'title', header: 'نام دانشگاه', sortable: true },
  { accessorKey: 'provinceName', header: 'استان', sortable: true },
  { accessorKey: 'isActive', header: 'فعال', sortable: true },
  { accessorKey: 'isVisible', header: 'قابل نمایش', sortable: true },
  { accessorKey: 'createdAtPersian', header: 'تاریخ ایجاد', sortable: true },
  { accessorKey: 'actions', header: 'عملیات', sortable: false },
]

// ---- Fetch provinces from backend ----
const provinces = ref<{ id: number; name: string }[]>([])
const fetchProvinces = async () => {
  const { $api } = useNuxtApp()
  try {
    // Adjust the endpoint according to your backend (e.g., /api/geo/provinces)
    const response = await $api.get('/api/geo/provinces')
    provinces.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch provinces', error)
  }
}
onMounted(fetchProvinces)

// ---- Filter values (for UI binding) ----
const filterTitle = ref('')
const filterProvinceId = ref<number | null>(null)
const filterIsActive = ref<string | null>(null)   // 'true' / 'false' / null
const filterIsVisible = ref<string | null>(null) // 'true' / 'false' / null

// API call
const fetchUniversities = async (request: GridDataSourceRequest) => {
  const { $api } = useNuxtApp()
  const response = await $api.post<ApiResponse<GridDataSourceResult<any>>>(
    '/api/admin/universities/list',
    request
  )
  return response.data.data
}

// Use the grid composable
const grid = useGrid(fetchUniversities)

// Helper to apply all current filters (called whenever any filter changes)
const applyFilters = () => {
  // Remove existing filters for these properties
  const properties = ['title', 'provinceId', 'isActive', 'isVisible']
  properties.forEach(prop => {
    grid.addFilter({
      propertyName: prop,
      operation: GridFilterOperation.Equals,
      value: ''
    })
  })

  // Title filter (contains)
  if (filterTitle.value.trim()) {
    grid.addFilter({
      propertyName: 'title',
      operation: GridFilterOperation.Contains,
      value: filterTitle.value.trim()
    })
  }

  // Province filter (equals to province ID)
  if (filterProvinceId.value !== null && filterProvinceId.value !== undefined) {
    grid.addFilter({
      propertyName: 'provinceId',
      operation: GridFilterOperation.Equals,
      value: String(filterProvinceId.value)
    })
  }

  // IsActive filter (boolean)
  if (filterIsActive.value !== null) {
    grid.addFilter({
      propertyName: 'isActive',
      operation: GridFilterOperation.Equals,
      value: filterIsActive.value
    })
  }

  // IsVisible filter (boolean)
  if (filterIsVisible.value !== null) {
    grid.addFilter({
      propertyName: 'isVisible',
      operation: GridFilterOperation.Equals,
      value: filterIsVisible.value
    })
  }

  // Force reload (addFilter already calls loadData)
}

// Clear all filters
const clearAllFilters = () => {
  filterTitle.value = ''
  filterProvinceId.value = null
  filterIsActive.value = null
  filterIsVisible.value = null
  grid.clearFilters() // this clears all filters and reloads data
}

// Watch for changes to any filter value and re-apply
watch([filterTitle, filterProvinceId, filterIsActive, filterIsVisible], () => {
  applyFilters()
}, { deep: true })
</script>

<template>
  <div>
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">مدیریت دانشگاه‌ها</h1>
      <UButton color="primary" @click="() => {}">
        افزودن دانشگاه
      </UButton>
    </div>

    <DataGrid
      :columns="columns"
      :data="grid.data.value"
      :totals="grid.totals.value"
      :total-pages="grid.totalPages.value"
      :current-page="grid.currentPage.value"
      :page-size="grid.pageSize.value"
      :loading="grid.loading.value"
      :sort="grid.sort.value"
      @update:page="grid.setPage"
      @update:page-size="grid.setPageSize"
      @update:sort="grid.setSort"
      @add-filter="grid.addFilter"
      @clear-filters="grid.clearFilters"
    >
      <!-- Custom cell for isActive -->
      <template #cell-isActive="{ value }">
        <UBadge :color="value ? 'success' : 'error'" variant="subtle">
          {{ value ? 'فعال' : 'غیرفعال' }}
        </UBadge>
      </template>

      <!-- Custom cell for isVisible -->
      <template #cell-isVisible="{ value }">
        <UBadge :color="value ? 'success' : 'neutral'" variant="subtle">
          {{ value ? 'نمایش' : 'مخفی' }}
        </UBadge>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <UButton icon="i-lucide-edit" size="xs" color="neutral" variant="ghost" />
          <UButton icon="i-lucide-trash" size="xs" color="error" variant="ghost" />
        </div>
      </template>

      <!-- Filters toolbar -->
      <template #filters>
        <div class="flex flex-wrap gap-3 items-end">
          <!-- Title search -->
          <UFormField label="نام دانشگاه" class="w-64">
            <UInput
              v-model="filterTitle"
              placeholder="جستجو..."
              class="w-full"
            />
          </UFormField>

          <!-- Province select -->
          <UFormField label="استان" class="w-48">
            <USelect
              v-model="filterProvinceId"
              :items="[
                { label: 'همه استان‌ها', value: null },
                ...provinces.map(p => ({ label: p.name, value: p.id }))
              ]"
              placeholder="انتخاب استان"
            />
          </UFormField>

          <!-- IsActive filter -->
          <UFormField label="وضعیت فعال" class="w-36">
            <USelect
              v-model="filterIsActive"
              :items="[
                { label: 'همه', value: null },
                { label: 'فعال', value: 'true' },
                { label: 'غیرفعال', value: 'false' }
              ]"
            />
          </UFormField>

          <!-- IsVisible filter -->
          <UFormField label="قابل نمایش" class="w-36">
            <USelect
              v-model="filterIsVisible"
              :items="[
                { label: 'همه', value: null },
                { label: 'نمایش', value: 'true' },
                { label: 'مخفی', value: 'false' }
              ]"
            />
          </UFormField>

          <!-- Clear filters button -->
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-eraser"
            @click="clearAllFilters"
          >
            حذف فیلترها
          </UButton>
        </div>
      </template>
    </DataGrid>
  </div>
</template>
