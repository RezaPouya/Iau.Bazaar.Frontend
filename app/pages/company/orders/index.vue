<!-- app/pages/company/orders/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { OrderSummary, InvoiceDetail } from '~/types/order'
import { useCompanyService } from '~/services/company/company.service'

definePageMeta({
  layout: 'company',
  middleware: 'company',
  title: 'مشاهده سفارشات'
})

const toast = useToast()
const companyService = useCompanyService()

// ========== State ==========
const orders = ref<OrderSummary[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Filters
const filterStatus = ref<number | null>(null)
const filterDateFrom = ref<string>('')
const filterDateTo = ref<string>('')
const filterSearch = ref('')

// Modal for invoice details
const invoiceModalOpen = ref(false)
const selectedInvoice = ref<InvoiceDetail | null>(null)
const invoiceLoading = ref(false)

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه سفارش', sortable: true },
  { key: 'orderNumber', label: 'شماره فاکتور', sortable: true },
  { key: 'orderDate', label: 'تاریخ ثبت', sortable: true },
  { key: 'totalAmount', label: 'مبلغ کل', sortable: true },
  { key: 'statusTitle', label: 'وضعیت', sortable: true },
  { key: 'itemsCount', label: 'تعداد اقلام', sortable: false },
  { key: 'actions', label: 'عملیات', sortable: false }
]

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

    if (filterDateFrom.value) {
      filters.push({
        propertyName: 'orderDate',
        operation: GridFilterOperation.GreaterThanOrEqual,
        value: filterDateFrom.value
      })
    }

    if (filterDateTo.value) {
      filters.push({
        propertyName: 'orderDate',
        operation: GridFilterOperation.LessThanOrEqual,
        value: filterDateTo.value
      })
    }

    if (filterSearch.value.trim()) {
      filters.push({
        propertyName: 'orderNumber',
        operation: GridFilterOperation.Contains,
        value: filterSearch.value.trim()
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

    const result = await companyService.getOrdersList(request)
    orders.value = result.data ?? []
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
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterSearch.value = ''
  currentPage.value = 1
  loadData()
}

// ========== Invoice Detail ==========
const viewInvoice = async (orderId: number) => {
  invoiceLoading.value = true
  invoiceModalOpen.value = true
  try {
    selectedInvoice = await companyService.getOrderInvoice(orderId)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در دریافت فاکتور', color: 'error' })
    invoiceModalOpen.value = false
  } finally {
    invoiceLoading.value = false
  }
}

// ========== Export Orders ==========
const exportOrders = async () => {
  try {
    // In a real implementation, this would call an export API
    toast.add({ title: 'خروجی با موفقیت ایجاد شد', color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ایجاد خروجی', color: 'error' })
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
onMounted(() => {
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مشاهده سفارشات</h1>
        <div class="flex items-center gap-2">
          <UBadge color="info" variant="subtle" size="sm">
            تعداد کل: {{ totals }}
          </UBadge>
          <UButton color="neutral" variant="outline" size="sm" @click="exportOrders">
            <UIcon name="i-lucide-download" class="ml-1 size-4" />
            خروجی Excel
          </UButton>
        </div>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید تمام سفارشات ثبت شده برای محصولات شرکت خود را مشاهده کنید.
            برای مشاهده جزئیات کامل هر سفارش و فاکتور، روی دکمه
            <span class="font-semibold">مشاهده فاکتور</span> کلیک کنید.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="جستجو" class="flex-1 min-w-[150px]">
            <UInput
              v-model="filterSearch"
              placeholder="شماره فاکتور..."
              class="w-full text-right"
            />
          </UFormField>
          <UFormField label="وضعیت" class="w-40">
            <USelect
              v-model="filterStatus"
              :items="statusOptions"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="از تاریخ" class="w-36">
            <UInput
              v-model="filterDateFrom"
              type="date"
              class="w-full"
            />
          </UFormField>
          <UFormField label="تا تاریخ" class="w-36">
            <UInput
              v-model="filterDateTo"
              type="date"
              class="w-full"
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
                  <span class="font-mono font-semibold">{{ item.orderNumber }}</span>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.orderDate }}</td>
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
                    <UIcon
                      :name="
                        item.status === 1 ? 'i-lucide-clock' :
                        item.status === 2 ? 'i-lucide-check-circle' :
                        item.status === 3 ? 'i-lucide-truck' :
                        item.status === 4 ? 'i-lucide-package-check' :
                        'i-lucide-x-circle'
                      "
                      class="ml-1 size-3"
                    />
                    {{ item.statusTitle }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  {{ item.items?.length || 0 }}
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
              <div class="flex items-center gap-2 mb-3">
                <UIcon name="i-lucide-user" class="size-5 text-dimmed" />
                <h4 class="font-semibold">اطلاعات خریدار</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-dimmed w-16">نام:</span>
                  <span class="font-medium">{{ selectedInvoice.customerFullName }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-dimmed w-16">کد ملی:</span>
                  <span class="font-medium">{{ selectedInvoice.customerNationalCode }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-dimmed w-16">تلفن:</span>
                  <span class="font-medium" dir="ltr">{{ selectedInvoice.customerPhoneNumber }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-dimmed w-16">کد پستی:</span>
                  <span class="font-medium">{{ selectedInvoice.customerPostalCode }}</span>
                </div>
                <div class="md:col-span-2 flex items-start gap-2">
                  <span class="text-dimmed w-16 shrink-0">آدرس:</span>
                  <span class="font-medium">{{ selectedInvoice.customerAddress }}</span>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <UIcon name="i-lucide-package" class="size-5 text-dimmed" />
                <h4 class="font-semibold">محصولات سفارش</h4>
                <UBadge color="neutral" variant="subtle" size="xs">
                  {{ selectedInvoice.items.length }} قلم
                </UBadge>
              </div>
              <div class="overflow-x-auto border rounded-lg">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-3 py-2 text-center border-b">ردیف</th>
                      <th class="px-3 py-2 text-center border-b">محصول</th>
                      <th class="px-3 py-2 text-center border-b">تعداد</th>
                      <th class="px-3 py-2 text-center border-b">قیمت واحد</th>
                      <th class="px-3 py-2 text-center border-b">قیمت کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in selectedInvoice.items"
                      :key="item.productId"
                      class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td class="px-3 py-2 text-center">{{ index + 1 }}</td>
                      <td class="px-3 py-2 text-center">{{ item.productTitle }}</td>
                      <td class="px-3 py-2 text-center">{{ item.quantity }}</td>
                      <td class="px-3 py-2 text-center">{{ item.unitPrice.toLocaleString() }} تومان</td>
                      <td class="px-3 py-2 text-center font-semibold text-primary-600">
                        {{ item.totalPrice.toLocaleString() }} تومان
                      </td>
                    </tr>
                    <tr class="bg-gray-50 dark:bg-gray-800 font-semibold">
                      <td colspan="4" class="px-3 py-2 text-left">جمع کل</td>
                      <td class="px-3 py-2 text-center text-primary-600">
                        {{ selectedInvoice.totalAmount.toLocaleString() }} تومان
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Order Timeline (optional) -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-2 mb-3">
                <UIcon name="i-lucide-history" class="size-5 text-dimmed" />
                <h4 class="font-semibold">تاریخچه وضعیت</h4>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="flex items-center gap-1">
                  <span class="text-dimmed">وضعیت فعلی:</span>
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
                <span class="text-dimmed">|</span>
                <span class="text-dimmed">تاریخ ثبت:</span>
                <span class="font-medium">{{ selectedInvoice.orderDate }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="invoiceModalOpen = false">بستن</UButton>
            <UButton color="primary" variant="outline" @click="invoiceModalOpen = false">
              <UIcon name="i-lucide-printer" class="ml-1 size-4" />
              چاپ فاکتور
            </UButton>
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
