<!-- app/pages/university/growth-centers/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { GrowthCenter } from '~/types/growth-center'
import GrowthCenterFormModal from '~/components/admin/growth-center/GrowthCenterFormModal.vue'
import GrowthCenterPreviewModal from '~/components/admin/growth-center/GrowthCenterPreviewModal.vue'
import GrowthCenterUsersModal from '~/components/admin/growth-center/GrowthCenterUsersModal.vue'

definePageMeta({
  layout: 'university',
  middleware: 'auth',
  title: 'مدیریت مراکز رشد'
})

const universityService = useUniversityService()
const toast = useToast()

// ========== State ==========
const growthCenters = ref<GrowthCenter[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Filters
const filterTitle = ref('')
const filterIsActive = ref<string | null>(null)

// Modal states
const formModalOpen = ref(false)
const editingGrowthCenter = ref<GrowthCenter | null>(null)
const previewModalOpen = ref(false)
const previewHtml = ref('')
const usersModalOpen = ref(false)
const selectedGrowthCenterId = ref<number | null>(null)
const selectedGrowthCenterTitle = ref('')

// Universities list for dropdown (برای فرم ایجاد/ویرایش)
const universities = ref<{ id: number; title: string }[]>([])

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام مرکز رشد', sortable: true },
  { key: 'universityName', label: 'دانشگاه', sortable: true },
  { key: 'provinceName', label: 'استان', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// ========== Load Universities ==========
const loadUniversities = async () => {
  try {
    const { $api } = useNuxtApp()
    const response = await $api.post('panel/admin/universities/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    universities.value = response.data.data?.map((u: any) => ({ id: u.id, title: u.title })) || []
  } catch (error) {
    console.error('Error loading universities:', error)
  }
}

// ========== Load Data ==========
const loadData = async () => {
  loading.value = true
  try {
    const filters: any[] = []
    if (filterTitle.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: filterTitle.value.trim()
      })
    }
    if (filterIsActive.value !== null) {
      filters.push({
        propertyName: 'isActive',
        operation: GridFilterOperation.Equals,
        value: filterIsActive.value
      })
    }

    const request = {
      page: currentPage.value,
      pageSize: pageSize.value,
      inputParams: {
        filters,
        sort: sortKey.value && sortDirection.value
          ? {
              propertyName: sortKey.value,
              ascending: sortDirection.value === 'asc'
            }
          : null
      }
    }

    const result = await universityService.getGrowthCentersList(request)
    growthCenters.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
    totalPages.value = result.totalPages ?? 0
  } catch (error: any) {
    console.error('Error loading growth centers:', error)
    toast.add({ title: 'خطا در دریافت مراکز رشد', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ========== Pagination ==========
const setPage = (page: number) => {
  currentPage.value = page
  loadData()
}

const setPageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// ========== Sorting ==========
const setSort = (key: string) => {
  if (sortKey.value === key) {
    if (sortDirection.value === 'asc') sortDirection.value = 'desc'
    else if (sortDirection.value === 'desc') sortDirection.value = null
    else sortDirection.value = 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
  loadData()
}

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return 'i-lucide-arrow-up-down'
  if (sortDirection.value === 'asc') return 'i-lucide-arrow-up'
  if (sortDirection.value === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

// ========== Filters ==========
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filterTitle.value = ''
  filterIsActive.value = null
  currentPage.value = 1
  loadData()
}

// ========== Modal Handlers ==========
const openCreateModal = () => {
  editingGrowthCenter.value = null
  formModalOpen.value = true
}

const openEditModal = (item: GrowthCenter) => {
  editingGrowthCenter.value = item
  formModalOpen.value = true
}

const handleSave = async (data: any) => {
  try {
    if (data.id) {
      await universityService.updateGrowthCenter(data.id, data)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await universityService.createGrowthCenter(data)
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

const confirmDelete = (id: number, title: string) => {
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف مرکز رشد "${title}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteGrowthCenter(id, title) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const deleteGrowthCenter = async (id: number, title: string) => {
  try {
    await universityService.deleteGrowthCenter(id)
    toast.add({ title: `مرکز رشد "${title}" با موفقیت حذف شد`, color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const toggleActive = async (id: number) => {
  try {
    await universityService.toggleGrowthCenterActive(id)
    toast.add({ title: 'وضعیت با موفقیت تغییر کرد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

const openUsersModal = (item: GrowthCenter) => {
  selectedGrowthCenterId.value = item.id
  selectedGrowthCenterTitle.value = item.title
  usersModalOpen.value = true
}

const showPreview = (description: string) => {
  previewHtml.value = description
  previewModalOpen.value = true
}

// ========== Computed ==========
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totals.value))

// ========== Lifecycle ==========
onMounted(async () => {
  await loadUniversities()
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت مراکز رشد</h1>
        <UButton color="primary" size="sm" @click="openCreateModal">
          <UIcon name="i-lucide-plus" class="ml-1 size-4" />
          افزودن مرکز رشد
        </UButton>
      </div>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام مرکز رشد" class="flex-1 min-w-[150px]">
            <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="فعال" class="w-28">
            <USelect
              v-model="filterIsActive"
              :items="[
                { label: 'همه', value: null },
                { label: 'فعال', value: 'true' },
                { label: 'غیرفعال', value: 'false' }
              ]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <div class="flex gap-1">
            <UButton size="sm" @click="applyFilters">اعمال</UButton>
            <UButton size="sm" color="neutral" variant="ghost" @click="clearFilters">پاک کردن</UButton>
          </div>
        </div>
      </UCard>

      <!-- Loading -->
      <UCard v-if="loading" class="flex justify-center py-4">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
      </UCard>

      <!-- Table -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="col in columns"
                  :key="col.key"
                  class="px-3 py-1.5 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="col.sortable && setSort(col.key)"
                >
                  <div class="flex items-center justify-center gap-1">
                    {{ col.label }}
                    <UIcon v-if="col.sortable" :name="getSortIcon(col.key)" class="size-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in growthCenters"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.title }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.universityName }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.provinceName }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UDropdownMenu
                    :items="[
                      [
                        {
                          label: 'ویرایش',
                          icon: 'i-lucide-edit',
                          onSelect: () => openEditModal(item)
                        },
                        {
                          label: 'مدیریت کاربران',
                          icon: 'i-lucide-users',
                          onSelect: () => openUsersModal(item)
                        },
                        {
                          label: 'پیش‌نمایش',
                          icon: 'i-lucide-eye',
                          onSelect: () => showPreview(item.description)
                        },
                        {
                          label: 'تغییر وضعیت',
                          icon: item.isActive ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
                          onSelect: () => toggleActive(item.id)
                        },
                        {
                          label: 'حذف',
                          icon: 'i-lucide-trash',
                          color: 'error',
                          onSelect: () => confirmDelete(item.id, item.title)
                        }
                      ]
                    ]"
                    :content="{ align: 'end' }"
                  >
                    <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-more-vertical" />
                  </UDropdownMenu>
                </td>
              </tr>
              <tr v-if="growthCenters.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ مرکز رشدی یافت نشد</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 0" class="flex justify-between items-center mt-3 text-sm">
          <div class="text-gray-500">{{ startIndex }} - {{ endIndex }} از {{ totals }}</div>
          <div class="flex gap-1 items-center">
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="currentPage <= 1"
              @click="setPage(currentPage - 1)"
            />
            <span class="text-sm mx-1">صفحه {{ currentPage }} از {{ totalPages }}</span>
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="setPage(currentPage + 1)"
            />
            <USelect v-model="pageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setPageSize" />
          </div>
        </div>
      </div>

      <!-- Modals -->
      <GrowthCenterFormModal
        v-model:open="formModalOpen"
        :editing-id="editingGrowthCenter?.id || null"
        :initial-data="editingGrowthCenter || undefined"
        :universities="universities"
        @save="handleSave"
      />

      <GrowthCenterPreviewModal v-model:open="previewModalOpen" :html-content="previewHtml" />

      <GrowthCenterUsersModal
        v-model:open="usersModalOpen"
        :growth-center-id="selectedGrowthCenterId"
        :growth-center-title="selectedGrowthCenterTitle"
      />
    </div>
  </ClientOnly>
</template>

<style scoped>
.compact-grid :deep(.p-4) {
  padding: 0.75rem !important;
}
.compact-grid :deep(.gap-3) {
  gap: 0.5rem !important;
}
:deep(input),
:deep(textarea),
:deep(.reka-select-trigger) {
  text-align: left !important;
}
:deep(.reka-select-value) {
  text-align: right;
}
table {
  min-height: 100px !important;
}
tr,
tbody {
  vertical-align: top !important;
}
</style>
