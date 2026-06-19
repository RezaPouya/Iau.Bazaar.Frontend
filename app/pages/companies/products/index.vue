<!-- app/pages/company/products/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Product, ProductCategory, EnumerationUnit } from '~/types/product'
import { useCompanyService } from '~/services/company/company.service'
import ProductStatusBadge from '~/components/admin/product/ProductStatusBadge.vue'
import ProductViewModal from '~/components/admin/product/ProductViewModal.vue'

definePageMeta({
  layout: 'company',
  middleware: 'company',
  title: 'مدیریت محصولات'
})

const toast = useToast()
const companyService = useCompanyService()
const { $api } = useNuxtApp()

// ========== State ==========
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const enumerationUnits = ref<EnumerationUnit[]>([])

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
const filterState = ref<string | null>(null)
const filterApprovalStatus = ref<string | null>(null)

// Modal states
const viewModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const formModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)

// Form state for create/edit
const form = reactive({
  title: '',
  sku: '',
  shortDescription: '',
  description: '',
  price: 0,
  vat: 0,
  discountPercent: null as number | null,
  discountStartDate: null as string | null,
  discountEndDate: null as string | null,
  inventoryCount: 0,
  enumerationUnitId: 1,
  weightInGrams: null as number | null,
  state: 0,
  categoryIds: [] as number[],
  images: [] as File[]
})

const isEditing = ref(false)
const saving = ref(false)

// ========== Columns ==========
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام محصول', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'finalPrice', label: 'قیمت نهایی', sortable: true },
  { key: 'inventoryCount', label: 'موجودی', sortable: true },
  { key: 'approvalStatus', label: 'وضعیت تایید', sortable: true },
  { key: 'state', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// ========== Load Dropdown Data ==========
const loadCategories = async () => {
  try {
    const response = await $api.post('panel/admin/product-categories/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    categories.value = response.data.data?.map((c: any) => ({ id: c.id, name: c.name, priority: c.priority })) || []
  } catch (error) {
    console.error('Error loading categories:', error)
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
    if (filterState.value !== null) {
      filters.push({
        propertyName: 'state',
        operation: GridFilterOperation.Equals,
        value: filterState.value
      })
    }
    if (filterApprovalStatus.value !== null) {
      filters.push({
        propertyName: 'approvalStatus',
        operation: GridFilterOperation.Equals,
        value: filterApprovalStatus.value
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

    const result = await companyService.getProductsList(request)
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
  filterState.value = null
  filterApprovalStatus.value = null
  currentPage.value = 1
  loadData()
}

// ========== View Product ==========
const viewProduct = (product: Product) => {
  selectedProduct.value = product
  viewModalOpen.value = true
}

// ========== Create/Edit Product ==========
const openCreateModal = () => {
  isEditing.value = false
  editingProduct.value = null
  resetForm()
  formModalOpen.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  editingProduct.value = product
  form.title = product.title
  form.sku = product.sku
  form.shortDescription = product.shortDescription || ''
  form.description = product.description || ''
  form.price = product.price
  form.vat = product.vat
  form.discountPercent = product.discountPercent
  form.discountStartDate = product.discountStartDate
  form.discountEndDate = product.discountEndDate
  form.inventoryCount = product.inventoryCount
  form.enumerationUnitId = product.enumerationUnitId
  form.weightInGrams = product.weightInGrams
  form.state = product.state
  form.categoryIds = product.categoryIds || []
  form.images = []
  formModalOpen.value = true
}

const resetForm = () => {
  form.title = ''
  form.sku = ''
  form.shortDescription = ''
  form.description = ''
  form.price = 0
  form.vat = 0
  form.discountPercent = null
  form.discountStartDate = null
  form.discountEndDate = null
  form.inventoryCount = 0
  form.enumerationUnitId = 1
  form.weightInGrams = null
  form.state = 0
  form.categoryIds = []
  form.images = []
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    form.images = Array.from(input.files)
  }
}

const saveProduct = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('Title', form.title)
    formData.append('SKU', form.sku)
    if (form.shortDescription) formData.append('ShortDescription', form.shortDescription)
    if (form.description) formData.append('Description', form.description)
    formData.append('Price', String(form.price))
    formData.append('Vat', String(form.vat))
    if (form.discountPercent !== null) formData.append('DiscountPercent', String(form.discountPercent))
    if (form.discountStartDate) formData.append('DiscountStartDate', form.discountStartDate)
    if (form.discountEndDate) formData.append('DiscountEndDate', form.discountEndDate)
    formData.append('InventoryCount', String(form.inventoryCount))
    formData.append('EnumerationUnitId', String(form.enumerationUnitId))
    if (form.weightInGrams !== null) formData.append('WeightInGrams', String(form.weightInGrams))
    formData.append('State', String(form.state))
    form.categoryIds.forEach(id => formData.append('CategoryIds', String(id)))
    form.images.forEach(file => formData.append('Images', file))

    if (isEditing.value && editingProduct.value) {
      formData.append('Id', String(editingProduct.value.id))
      await companyService.updateProduct(editingProduct.value.id, formData)
      toast.add({ title: 'محصول با موفقیت ویرایش شد', color: 'success' })
    } else {
      await companyService.createProduct(formData)
      toast.add({ title: 'محصول با موفقیت ایجاد شد', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در ذخیره محصول',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// ========== Delete Product ==========
const confirmDelete = (id: number, title: string) => {
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف محصول "${title}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteProduct(id) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const deleteProduct = async (id: number) => {
  try {
    await companyService.deleteProduct(id)
    toast.add({ title: 'محصول با موفقیت حذف شد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در حذف محصول',
      color: 'error'
    })
  }
}

// ========== Change Status ==========
const changeStatus = async (id: number, status: number) => {
  try {
    await companyService.changeProductStatus(id, status)
    toast.add({ title: 'وضعیت محصول با موفقیت تغییر کرد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت',
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
  await Promise.all([loadCategories(), loadEnumerationUnits()])
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت محصولات</h1>
        <UButton color="primary" size="sm" @click="openCreateModal">
          <UIcon name="i-lucide-plus" class="ml-1 size-4" />
          افزودن محصول
        </UButton>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید محصولات شرکت خود را مدیریت کنید. محصولات جدید در وضعیت
            <span class="font-semibold text-warning-600">در انتظار تایید</span>
            قرار می‌گیرند و پس از تایید توسط مرکز رشد، قابل مشاهده خواهند بود.
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
                          label: 'ویرایش',
                          icon: 'i-lucide-edit',
                          onSelect: () => openEditModal(item)
                        },
                        {
                          label: item.state === 1 ? 'غیرفعال کردن' : 'منتشر کردن',
                          icon: item.state === 1 ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
                          onSelect: () => changeStatus(item.id, item.state === 1 ? 2 : 1)
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

      <!-- Create/Edit Product Modal -->
      <UModal v-model:open="formModalOpen" :title="isEditing ? 'ویرایش محصول' : 'افزودن محصول'" class="max-w-3xl">
        <template #body>
          <div class="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="نام محصول" required>
                <UInput v-model="form.title" class="w-full text-right" />
              </UFormField>
              <UFormField label="SKU" required>
                <UInput v-model="form.sku" class="w-full text-left" />
              </UFormField>
            </div>

            <UFormField label="توضیح کوتاه">
              <UTextarea v-model="form.shortDescription" rows="2" class="w-full text-right" />
            </UFormField>

            <UFormField label="توضیحات کامل">
              <FeatureRichTextEditor v-model="form.description" placeholder="توضیحات محصول را وارد کنید..." />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField label="قیمت پایه" required>
                <UInput v-model.number="form.price" type="number" min="0" step="1000" class="w-full text-left" />
              </UFormField>
              <UFormField label="مالیات (%)">
                <UInput v-model.number="form.vat" type="number" min="0" max="100" class="w-full text-left" />
              </UFormField>
              <UFormField label="تخفیف (%)">
                <UInput v-model.number="form.discountPercent" type="number" min="0" max="100" class="w-full text-left" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="تاریخ شروع تخفیف">
                <UInput v-model="form.discountStartDate" type="date" class="w-full" />
              </UFormField>
              <UFormField label="تاریخ پایان تخفیف">
                <UInput v-model="form.discountEndDate" type="date" class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField label="موجودی" required>
                <UInput v-model.number="form.inventoryCount" type="number" min="0" class="w-full text-left" />
              </UFormField>
              <UFormField label="واحد شمارش" required>
                <USelect
                  v-model="form.enumerationUnitId"
                  :items="enumerationUnits.map(u => ({ label: u.name, value: u.id }))"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="وزن (گرم)">
                <UInput v-model.number="form.weightInGrams" type="number" min="0" class="w-full text-left" />
              </UFormField>
            </div>

            <UFormField label="دسته‌بندی‌ها">
              <USelect
                v-model="form.categoryIds"
                :items="categories.map(c => ({ label: c.name, value: c.id }))"
                class="w-full"
                multiple
                :popper="{ placement: 'bottom-end' }"
              />
            </UFormField>

            <UFormField label="وضعیت">
              <USelect
                v-model="form.state"
                :items="[
                  { label: 'پیش نویس', value: 0 },
                  { label: 'منتشر شده', value: 1 }
                ]"
                class="w-full"
              />
            </UFormField>

            <UFormField label="تصاویر محصول">
              <UInput type="file" multiple accept="image/*" @change="handleFileUpload" />
              <div v-if="form.images.length" class="mt-2 flex flex-wrap gap-2">
                <div v-for="(file, index) in form.images" :key="index" class="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img :src="URL.createObjectURL(file)" class="w-full h-full object-cover" />
                  <UButton size="xs" color="error" variant="solid" class="absolute -top-2 -right-2 rounded-full" @click="form.images.splice(index, 1)">
                    <UIcon name="i-lucide-x" class="size-3" />
                  </UButton>
                </div>
              </div>
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="formModalOpen = false">انصراف</UButton>
            <UButton color="primary" :loading="saving" @click="saveProduct">ذخیره</UButton>
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
