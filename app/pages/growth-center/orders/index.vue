<!-- app/pages/growth-center/orders/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { OrderSummary, InvoiceDetail } from '~/types/order'
import type { Company } from '~/types/company'
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'

definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'مشاهده سفارشات'
})

const toast = useToast()
const growthCenterService = useGrowthCenterService()

// ========== State ==========
const orders = ref<OrderSummary[]>([])
const companies = ref<Company[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Filters
const filterStatus = ref<number | null>(null)
const filterCompanyId = ref<number | null>(null)

// Modal for invoice details
const invoiceModalOpen = ref(false)
const selectedInvoice = ref<InvoiceDetail | null>(null)
const invoiceLoading = ref(false)

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه سفارش', sortable: true },
  { key: 'orderNumber', label: 'شماره فاکتور', sortable: true },
  { key: 'orderDate', label: 'تاریخ ثبت', sortable: true },
  { key: 'companyName', label: 'شرکت', sortable: true },
  { key: 'totalAmount', label: 'مبلغ کل', sortable: true },
  { key: 'statusTitle', label: 'وضعیت', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// ========== Load Companies ==========
const loadCompanies = async () => {
  try {
    const request = {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    }
    const result = await growthCenterService.getCompaniesList(request)
    companies.value = result.data ?? []
  } catch (error) {
    console.error('Error loading companies:', error)
  }
}

// ========== Load Data ==========
const loadData = async () => {
  loading.value = true
  try {
    const filters: any[] = []
    if (filterStatus.value !== null && filterStatus.value !== undefined) {
      filters.push({
        propertyName: 'status',
        operation: GridFilterOperation.Equals,
        value: String(filterStatus.value)
      })
    }
    if (filterCompanyId.value !== null) {
      filters.push({
        propertyName: 'companyId',
        operation: GridFilterOperation.Equals,
        value: String(filterCompanyId.value)
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

    const result = await growthCenterService.getOrdersList(request)

    // Enhance orders with company names
    const ordersWithCompany = result.data.map((order: OrderSummary) => {
      const company = companies.value.find(c => c.id === (order as any).companyId)
      return {
        ...order,
        companyName: company?.title || '—'
      }
    })

    orders.value = ordersWithCompany
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
    totalPages.value = result.totalPages ?? 0
  } catch (error: any) {
    console.error('Error loading orders:', error)
    toast.add({ title: 'خطا در دریافت سفارشات', color: 'error' })
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
  filterStatus.value = null
  filterCompanyId.value = null
  currentPage.value = 1
  loadData()
}

// ========== Invoice Detail ==========
const viewInvoice = async (orderId: number) => {
  invoiceLoading.value = true
  invoiceModalOpen.value = true
  try {
    const { $api } = useNuxtApp()
    const response = await $api.get(`/api/growth-center/orders/${orderId}/invoice`)
    selectedInvoice.value = response.data.data
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در دریافت فاکتور', color: 'error' })
    invoiceModalOpen.value = false
  } finally {
    invoiceLoading.value = false
  }
}

// ========== Status Options ==========
const statusOptions = [
  { label: 'همه', value: null },
  { label: 'در انتظار پرداخت', value: 1 },
  { label: 'پرداخت شده', value: 2 },
  { label: 'ارسال شده', value: 3 },
  { label: 'تحویل داده شده', value: 4 },
  { label: 'لغو شده', value: 5 }
]

// ========== Computed ==========
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totals.value))

// ========== Lifecycle ==========
onMounted(async () => {
  await loadCompanies()
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مشاهده سفارشات</h1>
        <UBadge color="info" variant="subtle" size="sm">
          تعداد کل: {{ totals }}
        </UBadge>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید تمام سفارشات ثبت شده برای شرکت‌های زیرمجموعه مرکز رشد خود را مشاهده کنید.
            برای مشاهده جزئیات کامل هر سفارش، روی دکمه
            <span class="font-semibold">مشاهده فاکتور</span> کلیک کنید.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="وضعیت" class="w-48">
            <USelect
              v-model="filterStatus"
              :items="statusOptions"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="شرکت" class="w-48">
            <USelect
              v-model="filterCompanyId"
              :items="[
                { label: 'همه شرکت‌ها', value: null },
                ...companies.map((c) => ({ label: c.title, value: c.id }))
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
                v-for="item in orders"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-center">
                  <span class="font-mono">{{ item.orderNumber }}</span>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.orderDate }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.companyName }}</td>
                <td class="px-3 py-1.5 text-center font-semibold text-primary-600">
                  {{ item.totalAmount.toLocaleString() }} تومان
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge
                    :color="
                      item.status === 1 ? 'warning' :
                      item.status === 2 ? 'success' :
                      item.status === 3 ? 'info' :
                      item.status === 4 ? 'primary' :
                      'error'
                    "
                    variant="subtle"
                    size="sm"
                  >
                    {{ item.statusTitle }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UButton size="xs" color="primary" variant="ghost" @click="viewInvoice(item.id)">
                    <UIcon name="i-lucide-file-text" class="size-4" />
                    مشاهده فاکتور
                  </UButton>
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ سفارشی یافت نشد</td>
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

      <!-- Invoice Detail Modal -->
      <UModal v-model:open="invoiceModalOpen" title="جزئیات فاکتور" class="max-w-4xl">
        <template #body>
          <div v-if="invoiceLoading" class="flex justify-center py-8">
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
          </div>
          <div v-else-if="selectedInvoice" class="space-y-4">
            <!-- Header Info -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div class="text-xs text-dimmed">شماره فاکتور</div>
                <div class="font-semibold font-mono">{{ selectedInvoice.orderNumber }}</div>
              </div>
              <div>
                <div class="text-xs text-dimmed">تاریخ</div>
                <div class="font-semibold">{{ selectedInvoice.orderDate }}</div>
              </div>
              <div>
                <div class="text-xs text-dimmed">وضعیت</div>
                <UBadge
                  :color="
                    selectedInvoice.status === 1 ? 'warning' :
                    selectedInvoice.status === 2 ? 'success' :
                    selectedInvoice.status === 3 ? 'info' :
                    selectedInvoice.status === 4 ? 'primary' :
                    'error'
                  "
                  variant="subtle"
                  size="sm"
                >
                  {{ selectedInvoice.statusTitle }}
                </UBadge>
              </div>
              <div>
                <div class="text-xs text-dimmed">مبلغ کل</div>
                <div class="font-semibold text-primary-600">{{ selectedInvoice.totalAmount.toLocaleString() }} تومان</div>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 class="font-semibold mb-2">اطلاعات خریدار</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div><span class="text-dimmed">نام:</span> {{ selectedInvoice.customerFullName }}</div>
                <div><span class="text-dimmed">کد ملی:</span> {{ selectedInvoice.customerNationalCode }}</div>
                <div><span class="text-dimmed">تلفن:</span> {{ selectedInvoice.customerPhoneNumber }}</div>
                <div class="col-span-2"><span class="text-dimmed">آدرس:</span> {{ selectedInvoice.customerAddress }}</div>
                <div><span class="text-dimmed">کد پستی:</span> {{ selectedInvoice.customerPostalCode }}</div>
              </div>
            </div>

            <!-- Items -->
            <div>
              <h4 class="font-semibold mb-2">محصولات</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-3 py-1.5 text-center border-b">محصول</th>
                      <th class="px-3 py-1.5 text-center border-b">تعداد</th>
                      <th class="px-3 py-1.5 text-center border-b">قیمت واحد</th>
                      <th class="px-3 py-1.5 text-center border-b">قیمت کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedInvoice.items" :key="item.productId" class="border-b border-gray-200 dark:border-gray-700">
                      <td class="px-3 py-1.5 text-center">{{ item.productTitle }}</td>
                      <td class="px-3 py-1.5 text-center">{{ item.quantity }}</td>
                      <td class="px-3 py-1.5 text-center">{{ item.unitPrice.toLocaleString() }} تومان</td>
                      <td class="px-3 py-1.5 text-center font-semibold">{{ item.totalPrice.toLocaleString() }} تومان</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="invoiceModalOpen = false">بستن</UButton>
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
</style>
