<!-- app/pages/university/companies/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Company } from '~/types/company'
import { useUniversityService } from '~/services/university/university.service'

definePageMeta({
  layout: 'university',
  middleware: 'auth',
  title: 'مشاهده شرکت‌ها'
})

const toast = useToast()
const universityService = useUniversityService()

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
const filterGrowthCenterName = ref('')
const filterIsActive = ref<string | null>(null)

// Modal states
const previewModalOpen = ref(false)
const previewHtml = ref('')
const selectedCompany = ref<Company | null>(null)

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
    if (filterGrowthCenterName.value.trim()) {
      filters.push({
        propertyName: 'growthCenterName',
        operation: GridFilterOperation.Contains,
        value: filterGrowthCenterName.value.trim()
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

    const result = await universityService.getCompaniesList(request)
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
  filterGrowthCenterName.value = ''
  filterIsActive.value = null
  currentPage.value = 1
  loadData()
}

// ========== View Details ==========
const viewDetails = async (companyId: number) => {
  try {
    const company = await universityService.getCompanyById(companyId)
    selectedCompany.value = company
    previewHtml.value = company.description || 'توضیحاتی برای این شرکت ثبت نشده است.'
    previewModalOpen.value = true
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در دریافت جزئیات شرکت',
      color: 'error'
    })
  }
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
        <h1 class="text-xl font-bold">مشاهده شرکت‌ها</h1>
        <UBadge color="info" variant="subtle" size="sm">
          تعداد کل: {{ totals }}
        </UBadge>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید شرکت‌های زیرمجموعه دانشگاه خود را مشاهده کنید. برای مشاهده جزئیات هر شرکت، روی دکمه
            <span class="font-semibold">مشاهده</span> کلیک کنید.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام شرکت" class="flex-1 min-w-[150px]">
            <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="مرکز رشد" class="w-48">
            <UInput v-model="filterGrowthCenterName" placeholder="نام مرکز رشد..." class="w-full text-right" />
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
                <td class="px-3 py-1.5 text-right">
                  <div class="font-medium">{{ item.title }}</div>
                </td>
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
                  <UButton size="xs" color="primary" variant="ghost" @click="viewDetails(item.id)">
                    <UIcon name="i-lucide-eye" class="size-4" />
                    مشاهده
                  </UButton>
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

      <!-- Preview Modal -->
      <UModal v-model:open="previewModalOpen" title="جزئیات شرکت" class="max-w-3xl">
        <template #body>
          <div v-if="selectedCompany" class="space-y-4">
            <!-- Company Info -->
            <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div class="text-xs text-dimmed">نام شرکت</div>
                <div class="font-semibold">{{ selectedCompany.title }}</div>
              </div>
              <div>
                <div class="text-xs text-dimmed">مرکز رشد</div>
                <div class="font-semibold">{{ selectedCompany.growthCenterName }}</div>
              </div>
              <div>
                <div class="text-xs text-dimmed">کمیسیون مرکز رشد</div>
                <div class="font-semibold">{{ selectedCompany.growthCenterCommission }}%</div>
              </div>
              <div>
                <div class="text-xs text-dimmed">وضعیت</div>
                <UBadge :color="selectedCompany.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                  {{ selectedCompany.isActive ? 'فعال' : 'غیرفعال' }}
                </UBadge>
              </div>
              <div class="col-span-2">
                <div class="text-xs text-dimmed">تاریخ ایجاد</div>
                <div class="font-semibold">{{ selectedCompany.createdAtPersian }}</div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedCompany.shortDescription">
              <div class="text-sm text-dimmed mb-1">توضیح کوتاه</div>
              <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                {{ selectedCompany.shortDescription }}
              </div>
            </div>

            <div v-if="selectedCompany.description">
              <div class="text-sm text-dimmed mb-1">توضیحات کامل</div>
              <div class="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-3 rounded-lg" v-html="selectedCompany.description" />
            </div>

            <div v-if="!selectedCompany.description && !selectedCompany.shortDescription" class="text-center text-dimmed py-4">
              توضیحاتی برای این شرکت ثبت نشده است.
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="previewModalOpen = false">بستن</UButton>
          </div>
        </template>
      </UModal>
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
.prose {
  max-width: none;
}
.prose img {
  max-width: 100%;
  height: auto;
}
</style>
