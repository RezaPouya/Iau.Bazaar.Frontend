<!-- app/pages/growth-center/products/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Product, Company, ProductCategory } from '~/types/product'
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'
import ProductStatusBadge from '~/components/admin/product/ProductStatusBadge.vue'
import ProductApprovalModal from '~/components/admin/product/ProductApprovalModal.vue'
import ProductViewModal from '~/components/admin/product/ProductViewModal.vue'

definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'مدیریت محصولات'
})

const toast = useToast()
const growthCenterService = useGrowthCenterService()
const { $api } = useNuxtApp()

// ========== State ==========
const products = ref<Product[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Filters
const filterTitle = ref('')
const filterSku = ref('')
const filterCompanyId = ref<number | null>(null)
const filterApprovalStatus = ref<string | null>(null)
const filterState = ref<string | null>(null)

// Dropdown data
const companies = ref<Company[]>([])

// Modal states
const viewModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

const approvalModalOpen = ref(false)
const approvingProduct = ref<Product | null>(null)

// Image approval modal
const imageApprovalModalOpen = ref(false)
const approvingImage = ref<{ productId: number; imageId: number; imageUrl: string } | null>(null)

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام محصول', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'companyName', label: 'شرکت', sortable: true },
  { key: 'finalPrice', label: 'قیمت نهایی', sortable: true },
  { key: 'inventoryCount', label: 'موجودی', sortable: true },
  { key: 'approvalStatus', label: 'وضعیت تایید', sortable: true },
  { key: 'state', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
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

    if (filterTitle.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: filterTitle.value.trim()
      })
    }
    if (filterSku.value.trim()) {
      filters.push({
        propertyName: 'sku',
        operation: GridFilterOperation.Contains,
        value: filterSku.value.trim()
      })
    }
    if (filterCompanyId.value !== null) {
      filters.push({
        propertyName: 'companyId',
        operation: GridFilterOperation.Equals,
        value: String(filterCompanyId.value)
      })
    }
    if (filterApprovalStatus.value !== null) {
      filters.push({
        propertyName: 'approvalStatus',
        operation: GridFilterOperation.Equals,
        value: filterApprovalStatus.value
      })
    }
    if (filterState.value !== null) {
      filters.push({
        propertyName: 'state',
        operation: GridFilterOperation.Equals,
        value: filterState.value
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

    const result = await growthCenterService.getProductsList(request)
    products.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
    totalPages.value = result.totalPages ?? 0
  } catch (error: any) {
    console.error('Error loading products:', error)
    toast.add({ title: 'خطا در دریافت محصولات', color: 'error' })
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
  filterSku.value = ''
  filterCompanyId.value = null
  filterApprovalStatus.value = null
  filterState.value = null
  currentPage.value = 1
  loadData()
}

// ========== View Product ==========
const viewProduct = (product: Product) => {
  selectedProduct.value = product
  viewModalOpen.value = true
}

// ========== Approval Modals ==========
const openApprovalModal = (product: Product) => {
  approvingProduct.value = product
  approvalModalOpen.value = true
}

const submitApproval = async (approved: boolean, rejectionReason: string) => {
  if (!approvingProduct.value) return

  try {
    await growthCenterService.toggleProductApproval(
      approvingProduct.value.id,
      approved,
      approved ? null : rejectionReason
    )
    toast.add({
      title: approved ? 'محصول تایید شد' : 'محصول رد شد',
      color: 'success'
    })
    approvalModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت تایید',
      color: 'error'
    })
  }
}

// ========== Image Approval ==========
const openImageApprovalModal = (productId: number, imageId: number, imageUrl: string) => {
  approvingImage.value = { productId, imageId, imageUrl }
  imageApprovalModalOpen.value = true
}

const submitImageApproval = async (approved: boolean, rejectionReason: string) => {
  if (!approvingImage.value) return

  try {
    await growthCenterService.toggleProductImageApproval(
      approvingImage.value.imageId,
      approved,
      approved ? null : rejectionReason
    )
    toast.add({
      title: approved ? 'تصویر تایید شد' : 'تصویر رد شد',
      color: 'success'
    })
    imageApprovalModalOpen.value = false
    // Refresh product details if modal is open
    if (selectedProduct.value && selectedProduct.value.id === approvingImage.value.productId) {
      const updated = await growthCenterService.getProductById(selectedProduct.value.id)
      selectedProduct.value = updated
    }
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت تصویر',
      color: 'error'
    })
  }
}

// ========== Format Price ==========
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

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
        <h1 class="text-xl font-bold">مدیریت محصولات</h1>
        <div class="flex items-center gap-2">
          <UBadge v-if="filterApprovalStatus === '0'" color="warning" variant="subtle" size="sm">
            نمایش محصولات در انتظار تایید
          </UBadge>
          <UBadge color="info" variant="subtle" size="sm">
            تعداد کل: {{ totals }}
          </UBadge>
        </div>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید محصولات شرکت‌های زیرمجموعه خود را مشاهده و مدیریت کنید.
            محصولات جدید در وضعیت
            <span class="font-semibold text-warning-600">در انتظار تایید</span>
            قرار دارند و شما می‌توانید آنها را تایید یا رد کنید. همچنین می‌توانید تصاویر محصولات را نیز تایید یا رد کنید.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام محصول" class="flex-1 min-w-[120px]">
            <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="SKU" class="w-28">
            <UInput v-model="filterSku" placeholder="کد محصول..." class="w-full text-left" />
          </UFormField>
          <UFormField label="شرکت" class="w-40">
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
          <UFormField label="وضعیت تایید" class="w-32">
            <USelect
              v-model="filterApprovalStatus"
              :items="[
                { label: 'همه', value: null },
                { label: 'در انتظار تایید', value: '0' },
                { label: 'تایید شده', value: '1' },
                { label: 'رد شده', value: '2' }
              ]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="وضعیت انتشار" class="w-28">
            <USelect
              v-model="filterState"
              :items="[
                { label: 'همه', value: null },
                { label: 'پیش نویس', value: '0' },
                { label: 'منتشر شده', value: '1' },
                { label: 'غیر فعال', value: '2' }
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
                v-for="item in products"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="{ 'bg-warning-50 dark:bg-warning-900/10': item.approvalStatus === 0 }"
              >
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-right">
                  <div class="font-medium">{{ item.title }}</div>
                  <div class="text-xs text-dimmed">{{ item.slug }}</div>
                </td>
                <td class="px-3 py-1.5 text-left text-sm">{{ item.sku }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.companyName }}</td>
                <td class="px-3 py-1.5 text-left">
                  <div class="font-medium text-primary-600">{{ formatPrice(item.finalPrice) }}</div>
                  <div v-if="item.discountPercent" class="text-xs text-dimmed line-through">
                    {{ formatPrice(item.price) }}
                  </div>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <ProductStatusBadge type="stock" :inventory-count="item.inventoryCount">
                    <template #suffix>
                      <span class="mr-1">({{ item.inventoryCount }})</span>
                    </template>
                  </ProductStatusBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <ProductStatusBadge type="approval" :value="item.approvalStatus" />
                </td>
                <td class="px-3 py-1.5 text-center">
                  <ProductStatusBadge type="state" :value="item.state" />
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UDropdownMenu
                    :items="[
                      [
                        {
                          label: 'مشاهده جزئیات',
                          icon: 'i-lucide-eye',
                          onSelect: () => viewProduct(item)
                        },
                        {
                          label: item.approvalStatus === 1 ? 'رد محصول' : 'تایید محصول',
                          icon: item.approvalStatus === 1 ? 'i-lucide-x-circle' : 'i-lucide-check-circle',
                          onSelect: () => openApprovalModal(item),
                          color: item.approvalStatus === 1 ? 'error' : 'success'
                        }
                      ]
                    ]"
                    :content="{ align: 'end' }"
                  >
                    <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-more-vertical" />
                  </UDropdownMenu>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ محصولی یافت نشد</td>
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

      <!-- Product View Modal -->
      <ProductViewModal v-model:open="viewModalOpen" :product="selectedProduct" />

      <!-- Product Approval Modal -->
      <ProductApprovalModal
        v-model:open="approvalModalOpen"
        :product="approvingProduct"
        @submit="submitApproval"
      />

      <!-- Image Approval Modal -->
      <UModal v-model:open="imageApprovalModalOpen" title="تایید/رد تصویر" class="max-w-md">
        <template #body>
          <div v-if="approvingImage" class="space-y-4">
            <!-- Image Preview -->
            <div class="flex justify-center">
              <img :src="approvingImage.imageUrl" alt="تصویر محصول" class="max-w-full max-h-64 rounded-lg border" />
            </div>

            <p class="text-sm text-center text-dimmed">
              آیا از تایید این تصویر اطمینان دارید؟
            </p>

            <div class="flex justify-center gap-4">
              <UButton
                color="success"
                @click="submitImageApproval(true, '')"
              >
                <UIcon name="i-lucide-check" class="ml-1" />
                تایید
              </UButton>
              <UButton
                color="error"
                @click="submitImageApproval(false, 'تصویر نامناسب')"
              >
                <UIcon name="i-lucide-x" class="ml-1" />
                رد
              </UButton>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="neutral" variant="ghost" @click="imageApprovalModalOpen = false">انصراف</UButton>
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

