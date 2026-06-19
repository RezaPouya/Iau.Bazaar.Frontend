<!-- app/pages/growth-center/companies/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Company } from '~/types/company'
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'
import CompanyFormModal from '~/components/admin/company/CompanyFormModal.vue'
import CompanyPreviewModal from '~/components/admin/company/CompanyPreviewModal.vue'
import CompanyUsersModal from '~/components/admin/company/CompanyUsersModal.vue'

definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'مدیریت شرکت‌ها'
})

const toast = useToast()
const growthCenterService = useGrowthCenterService()

// ========== State ==========
const companies = ref<Company[]>([])
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
const editingCompany = ref<Company | null>(null)
const previewModalOpen = ref(false)
const previewHtml = ref('')
const usersModalOpen = ref(false)
const selectedCompanyId = ref<number | null>(null)
const selectedCompanyTitle = ref('')

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام شرکت', sortable: true },
  { key: 'growthCenterName', label: 'مرکز رشد', sortable: true },
  { key: 'growthCenterCommission', label: 'کمیسیون', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

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

    const result = await growthCenterService.getCompaniesList(request)
    companies.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
    totalPages.value = result.totalPages ?? 0
  } catch (error: any) {
    console.error('Error loading companies:', error)
    toast.add({ title: 'خطا در دریافت شرکت‌ها', color: 'error' })
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
  editingCompany.value = null
  formModalOpen.value = true
}

const openEditModal = (item: Company) => {
  editingCompany.value = item
  formModalOpen.value = true
}

const handleSave = async (data: any) => {
  try {
    if (data.id) {
      await growthCenterService.updateCompany(data.id, data)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      const { id, ...createData } = data
      await growthCenterService.createCompany(createData)
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
    description: `آیا از حذف شرکت "${title}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteCompany(id, title) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const deleteCompany = async (id: number, title: string) => {
  try {
    await growthCenterService.deleteCompany(id)
    toast.add({ title: `شرکت "${title}" با موفقیت حذف شد`, color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const toggleActive = async (id: number) => {
  try {
    await growthCenterService.toggleCompanyActive(id)
    toast.add({ title: 'وضعیت با موفقیت تغییر کرد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

const openUsersModal = (item: Company) => {
  selectedCompanyId.value = item.id
  selectedCompanyTitle.value = item.title
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
onMounted(() => {
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت شرکت‌ها</h1>
        <UButton color="primary" size="sm" @click="openCreateModal">
          <UIcon name="i-lucide-plus" class="ml-1 size-4" />
          افزودن شرکت
        </UButton>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید شرکت‌های زیرمجموعه مرکز رشد خود را مدیریت کنید.
            شرکت‌ها پس از ثبت نیاز به تایید دارند و می‌توانید کاربران را به آنها اضافه کنید.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام شرکت" class="flex-1 min-w-[150px]">
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
                v-for="item in companies"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.title }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.growthCenterName }}</td>
                <td class="px-3 py-1.5 text-center">
                  <span class="text-sm">{{ item.growthCenterCommission }}%</span>
                </td>
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
              <tr v-if="companies.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ شرکتی یافت نشد</td>
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
      <CompanyFormModal
        v-model:open="formModalOpen"
        :editing-id="editingCompany?.id || null"
        :initial-data="editingCompany || undefined"
        :growth-centers="[]"
        @save="handleSave"
      />

      <CompanyPreviewModal v-model:open="previewModalOpen" :html-content="previewHtml" />

      <CompanyUsersModal
        v-model:open="usersModalOpen"
        :company-id="selectedCompanyId"
        :company-title="selectedCompanyTitle"
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

