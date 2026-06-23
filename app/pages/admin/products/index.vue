<!-- app/pages/admin/products/index.vue -->
<script setup lang="ts">
import type { Product, Company, ProductCategory, EnumerationUnit } from '~/types/product'
import ProductFilters from '~/components/admin/product/ProductFilters.vue'
import ProductTable from '~/components/admin/product/ProductTable.vue'
import ProductViewModal from '~/components/admin/product/ProductViewModal.vue'
import ProductApprovalModal from '~/components/admin/product/ProductApprovalModal.vue'
import ProductDeleteModal from '~/components/admin/product/ProductDeleteModal.vue'
import ProductPagination from '~/components/admin/product/ProductPagination.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت محصولات'
})

// ---------- types ----------
interface ProductFilters {
  title: string
  sku: string
  companyId: number | null
  approvalStatus: string | null
  state: string | null
}

// ---------- data ----------
const companies = ref<Company[]>([])
const categories = ref<ProductCategory[]>([])
const enumerationUnits = ref<EnumerationUnit[]>([])

// ---------- grid state ----------
const data = ref<Product[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// ---------- filters state ----------
const filters = ref<ProductFilters>({
  title: '',
  sku: '',
  companyId: null,
  approvalStatus: null,
  state: null
})

// ---------- modal state ----------
const viewModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const approvalModalOpen = ref(false)
const approvingProduct = ref<Product | null>(null)
const deleteModalOpen = ref(false)
const deletingProduct = ref<Product | null>(null)

// ---------- load dropdown data ----------
const loadCompanies = async () => {
  const { $api } = useNuxtApp()
  try {
    const response = await $api.post('panel/admin/companies/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    companies.value = response.data.data?.data?.map((c: any) => ({ id: c.id, title: c.title })) || []
  } catch (error) {
    console.error('خطا در دریافت شرکت‌ها', error)
  }
}

const loadCategories = async () => {
  const { $api } = useNuxtApp()
  try {
    const response = await $api.post('panel/admin/product-categories/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    categories.value = response.data.data?.data?.map((c: any) => ({ id: c.id, name: c.name, priority: c.priority })) || []
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌ها', error)
  }
}

const loadEnumerationUnits = async () => {
  enumerationUnits.value = [
    { id: 1, name: 'عدد', symbol: 'عدد' },
    { id: 2, name: 'کیلوگرم', symbol: 'kg' },
    { id: 3, name: 'گرم', symbol: 'g' },
    { id: 4, name: 'متر', symbol: 'm' },
    { id: 5, name: 'سانتی‌متر', symbol: 'cm' },
    { id: 6, name: 'لیتر', symbol: 'L' },
    { id: 7, name: 'میلی‌لیتر', symbol: 'mL' }
  ]
}

// ---------- load data ----------
const loadData = async () => {
  loading.value = true
  try {
    const { $api } = useNuxtApp()
    const filterList: any[] = []

    if (filters.value.title.trim()) {
      filterList.push({
        propertyName: 'title',
        operation: 'contains',
        value: filters.value.title.trim()
      })
    }
    if (filters.value.sku.trim()) {
      filterList.push({
        propertyName: 'sku',
        operation: 'contains',
        value: filters.value.sku.trim()
      })
    }
    if (filters.value.companyId !== null) {
      filterList.push({
        propertyName: 'companyId',
        operation: 'equals',
        value: String(filters.value.companyId)
      })
    }
    if (filters.value.approvalStatus !== null) {
      filterList.push({
        propertyName: 'approvalStatus',
        operation: 'equals',
        value: filters.value.approvalStatus
      })
    }
    if (filters.value.state !== null) {
      filterList.push({
        propertyName: 'state',
        operation: 'equals',
        value: filters.value.state
      })
    }

    const request = {
      page: currentPage.value,
      pageSize: pageSize.value,
      inputParams: {
        filters: filterList,
        sort:
          sortKey.value && sortDirection.value
            ? {
                propertyName: sortKey.value,
                ascending: sortDirection.value === 'asc'
              }
            : null
      }
    }

    const response = await $api.post('panel/admin/products/list', request)
    const result = response.data.data
    data.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا:', err)
    data.value = []
    totals.value = 0
  } finally {
    loading.value = false
  }
}

// ---------- pagination ----------
const totalPages = computed(() => Math.ceil(totals.value / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totals.value))

const setPage = (page: number) => {
  currentPage.value = page
  loadData()
}

const setPageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// ---------- sorting ----------
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

// ---------- filter handlers ----------
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filters.value = {
    title: '',
    sku: '',
    companyId: null,
    approvalStatus: null,
    state: null
  }
  currentPage.value = 1
  loadData()
}

// ---------- modal handlers ----------
const viewProduct = (product: Product) => {
  selectedProduct.value = product
  viewModalOpen.value = true
}

const editProduct = (product: Product) => {
  navigateTo(`/admin/products/edit/${product.id}`)
}

const openApprovalModal = (product: Product) => {
  approvingProduct.value = product
  approvalModalOpen.value = true
}

const submitApproval = async (approved: boolean, rejectionReason: string) => {
  if (!approvingProduct.value) return

  const { $api } = useNuxtApp()
  const toast = useToast()

  try {
    await $api.patch(`panel/admin/products/${approvingProduct.value.id}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
    toast.add({
      title: approved ? 'محصول تایید شد' : 'محصول رد شد',
      color: 'success'
    })
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت',
      color: 'error'
    })
  }
}

const openDeleteModal = (product: Product) => {
  deletingProduct.value = product
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!deletingProduct.value) return

  const { $api } = useNuxtApp()
  const toast = useToast()

  try {
    await $api.delete(`panel/admin/products/${deletingProduct.value.id}`)
    toast.add({ title: 'محصول با موفقیت حذف شد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در حذف محصول',
      color: 'error'
    })
  }
}

// ---------- initial load ----------
onMounted(async () => {
  await Promise.all([loadCompanies(), loadCategories(), loadEnumerationUnits(), loadData()])
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت محصولات</h1>
      </div>

      <ProductFilters v-model:filters="filters" :companies="companies" @apply="applyFilters" @clear="clearFilters" />

      <UCard v-if="loading" class="flex justify-center py-4">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
      </UCard>

      <template v-else>
        <ProductTable
          :data="data"
          :loading="loading"
          :sort-key="sortKey"
          :sort-direction="sortDirection"
          @sort="setSort"
          @view="viewProduct"
          @edit="editProduct"
          @approve="openApprovalModal"
          @delete="openDeleteModal"
        />

        <ProductPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :totals="totals"
          :page-size="pageSize"
          :start-index="startIndex"
          :end-index="endIndex"
          @page="setPage"
          @page-size="setPageSize"
        />
      </template>

      <!-- Modals -->
      <ProductViewModal v-model:open="viewModalOpen" :product="selectedProduct" />
      <ProductApprovalModal v-model:open="approvalModalOpen" :product="approvingProduct" @submit="submitApproval" />
      <ProductDeleteModal v-model:open="deleteModalOpen" :product="deletingProduct" @confirm="confirmDelete" />
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


