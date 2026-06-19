<!-- app/pages/company/product-files/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Product } from '~/types/product'
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import { useCompanyService } from '~/services/company/company.service'
import ProductFilesTable from '~/components/admin/product-files/ProductFilesTable.vue'
import ProductLegalDocumentsTable from '~/components/admin/product-files/ProductLegalDocumentsTable.vue'
import ProductFileViewModal from '~/components/admin/product-files/ProductFileViewModal.vue'
import ProductFileUploadModal from '~/components/admin/product-files/ProductFileUploadModal.vue'

definePageMeta({
  layout: 'company',
  middleware: 'company',
  title: 'مدیریت مدارک محصولات'
})

const toast = useToast()
const companyService = useCompanyService()
const { $api } = useNuxtApp()

// ========== State ==========
const activeTab = ref<'files' | 'legal'>('files')
const selectedProductId = ref<number | null>(null)
const products = ref<Product[]>([])
const selectedProductTitle = ref('')

// ========== Files State ==========
const fileData = ref<ProductFile[]>([])
const fileTotals = ref(0)
const fileCurrentPage = ref(1)
const filePageSize = ref(10)
const fileLoading = ref(false)
const fileSortKey = ref<string | null>(null)
const fileSortDirection = ref<'asc' | 'desc' | null>(null)
const fileFilters = ref({
  title: '',
  fileName: '',
  approvalStatus: null as string | null
})

// ========== Legal Documents State ==========
const legalData = ref<ProductLegalDocument[]>([])
const legalTotals = ref(0)
const legalCurrentPage = ref(1)
const legalPageSize = ref(10)
const legalLoading = ref(false)
const legalSortKey = ref<string | null>(null)
const legalSortDirection = ref<'asc' | 'desc' | null>(null)

// ========== Modal State ==========
const viewModalOpen = ref(false)
const selectedFile = ref<ProductFile | ProductLegalDocument | null>(null)
const uploadModalOpen = ref(false)
const uploading = ref(false)

// ========== Load Products ==========
const loadProducts = async () => {
  try {
    const request = {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    }
    const result = await companyService.getProductsList(request)
    products.value = result.data ?? []
    if (products.value.length > 0) {
      selectedProductId.value = products.value[0].id
      selectedProductTitle.value = products.value[0].title
    }
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

// ========== Load Files ==========
const loadFiles = async () => {
  if (!selectedProductId.value) {
    fileData.value = []
    fileTotals.value = 0
    return
  }

  fileLoading.value = true
  try {
    const filters: any[] = []

    if (fileFilters.value.title.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: fileFilters.value.title.trim()
      })
    }
    if (fileFilters.value.fileName.trim()) {
      filters.push({
        propertyName: 'fileName',
        operation: GridFilterOperation.Contains,
        value: fileFilters.value.fileName.trim()
      })
    }
    if (fileFilters.value.approvalStatus) {
      filters.push({
        propertyName: 'approvalStatus',
        operation: GridFilterOperation.Equals,
        value: fileFilters.value.approvalStatus
      })
    }

    const request = {
      page: fileCurrentPage.value,
      pageSize: filePageSize.value,
      inputParams: {
        filters,
        sort: fileSortKey.value && fileSortDirection.value
          ? {
              propertyName: fileSortKey.value,
              ascending: fileSortDirection.value === 'asc'
            }
          : null
      }
    }

    const result = await companyService.getProductFiles(selectedProductId.value, request)
    fileData.value = result.data ?? []
    fileTotals.value = result.totals ?? 0
    fileCurrentPage.value = result.page ?? 1
    filePageSize.value = result.pageSize ?? 10
  } catch (error: any) {
    console.error('Error loading files:', error)
    toast.add({ title: 'خطا در دریافت فایل‌ها', color: 'error' })
  } finally {
    fileLoading.value = false
  }
}

// ========== Load Legal Documents ==========
const loadLegalDocuments = async () => {
  if (!selectedProductId.value) {
    legalData.value = []
    legalTotals.value = 0
    return
  }

  legalLoading.value = true
  try {
    const request = {
      page: legalCurrentPage.value,
      pageSize: legalPageSize.value,
      inputParams: {
        filters: [],
        sort: legalSortKey.value && legalSortDirection.value
          ? {
              propertyName: legalSortKey.value,
              ascending: legalSortDirection.value === 'asc'
            }
          : null
      }
    }

    const result = await companyService.getLegalDocuments(selectedProductId.value, request)
    legalData.value = result.data ?? []
    legalTotals.value = result.totals ?? 0
    legalCurrentPage.value = result.page ?? 1
    legalPageSize.value = result.pageSize ?? 10
  } catch (error: any) {
    console.error('Error loading legal documents:', error)
    toast.add({ title: 'خطا در دریافت مدارک قانونی', color: 'error' })
  } finally {
    legalLoading.value = false
  }
}

// ========== Tab Change Handler ==========
const onProductSelect = (productId: number) => {
  selectedProductId.value = productId
  const product = products.value.find(p => p.id === productId)
  selectedProductTitle.value = product?.title || ''
  if (activeTab.value === 'files') {
    loadFiles()
  } else {
    loadLegalDocuments()
  }
}

// ========== Sorting ==========
const setFileSort = (key: string) => {
  if (fileSortKey.value === key) {
    if (fileSortDirection.value === 'asc') fileSortDirection.value = 'desc'
    else if (fileSortDirection.value === 'desc') fileSortDirection.value = null
    else fileSortDirection.value = 'asc'
  } else {
    fileSortKey.value = key
    fileSortDirection.value = 'asc'
  }
  fileCurrentPage.value = 1
  loadFiles()
}

const setLegalSort = (key: string) => {
  if (legalSortKey.value === key) {
    if (legalSortDirection.value === 'asc') legalSortDirection.value = 'desc'
    else if (legalSortDirection.value === 'desc') legalSortDirection.value = null
    else legalSortDirection.value = 'asc'
  } else {
    legalSortKey.value = key
    legalSortDirection.value = 'asc'
  }
  legalCurrentPage.value = 1
  loadLegalDocuments()
}

// ========== Filter Handlers ==========
const applyFileFilters = () => {
  fileCurrentPage.value = 1
  loadFiles()
}

const clearFileFilters = () => {
  fileFilters.value = {
    title: '',
    fileName: '',
    approvalStatus: null
  }
  fileCurrentPage.value = 1
  loadFiles()
}

// ========== Modal Handlers ==========
const openViewModal = (file: ProductFile | ProductLegalDocument) => {
  selectedFile.value = file
  viewModalOpen.value = true
}

const openUploadModal = () => {
  uploadModalOpen.value = true
}

const handleUpload = async (formData: FormData) => {
  uploading.value = true
  try {
    await companyService.uploadProductFiles(formData)
    toast.add({ title: 'فایل‌ها با موفقیت آپلود شدند', color: 'success' })
    uploadModalOpen.value = false
    loadFiles()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در آپلود فایل‌ها',
      color: 'error'
    })
  } finally {
    uploading.value = false
  }
}

const handleUploadLegal = async (formData: FormData) => {
  uploading.value = true
  try {
    await companyService.uploadLegalDocument(formData)
    toast.add({ title: 'مدارک قانونی با موفقیت آپلود شدند', color: 'success' })
    uploadModalOpen.value = false
    loadLegalDocuments()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در آپلود مدارک قانونی',
      color: 'error'
    })
  } finally {
    uploading.value = false
  }
}

// ========== Download File ==========
const downloadFile = async (file: ProductFile | ProductLegalDocument) => {
  try {
    const blob = await companyService.downloadProductFile(file.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در دانلود فایل',
      color: 'error'
    })
  }
}

// ========== Delete File ==========
const deleteFile = async (file: ProductFile | ProductLegalDocument) => {
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف فایل "${file.title || file.fileName}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      {
        label: 'بله',
        onClick: async () => {
          try {
            if ('documentType' in file) {
              // Legal document
              await companyService.deleteLegalDocument(file.id)
            } else {
              // Product file
              await companyService.deleteProductFile(file.id)
            }
            toast.add({ title: 'فایل با موفقیت حذف شد', color: 'success' })
            if (activeTab.value === 'files') {
              loadFiles()
            } else {
              loadLegalDocuments()
            }
          } catch (error: any) {
            toast.add({
              title: error.response?.data?.message || 'خطا در حذف فایل',
              color: 'error'
            })
          }
        }
      },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// ========== Computed ==========
const fileTotalPages = computed(() => Math.ceil(fileTotals.value / filePageSize.value))
const fileStartIndex = computed(() => (fileCurrentPage.value - 1) * filePageSize.value + 1)
const fileEndIndex = computed(() => Math.min(fileCurrentPage.value * filePageSize.value, fileTotals.value))

const legalTotalPages = computed(() => Math.ceil(legalTotals.value / legalPageSize.value))
const legalStartIndex = computed(() => (legalCurrentPage.value - 1) * legalPageSize.value + 1)
const legalEndIndex = computed(() => Math.min(legalCurrentPage.value * legalPageSize.value, legalTotals.value))

// ========== Watch ==========
watch(activeTab, (tab) => {
  if (selectedProductId.value) {
    if (tab === 'files') {
      loadFiles()
    } else {
      loadLegalDocuments()
    }
  }
})

// ========== Lifecycle ==========
onMounted(async () => {
  await loadProducts()
  if (selectedProductId.value) {
    loadFiles()
  }
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت مدارک محصولات</h1>
        <UButton color="primary" size="sm" @click="openUploadModal">
          <UIcon name="i-lucide-upload" class="ml-1 size-4" />
          آپلود مدرک
        </UButton>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید مدارک (فایل‌ها و اسناد قانونی) محصولات خود را مدیریت کنید.
            مدارک آپلود شده پس از تایید مرکز رشد قابل مشاهده خواهند بود.
          </span>
        </div>
      </UCard>

      <!-- Product Selector -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-3 items-end">
          <UFormField label="انتخاب محصول" class="flex-1 min-w-[200px]">
            <USelect
              :model-value="selectedProductId"
              :items="[
                ...products.map((p) => ({
                  label: p.title,
                  value: p.id
                }))
              ]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
              placeholder="انتخاب محصول..."
              @update:model-value="onProductSelect"
            />
          </UFormField>
          <div v-if="selectedProductId" class="text-sm text-dimmed">
            شناسه محصول: {{ selectedProductId }}
          </div>
        </div>
      </UCard>

      <!-- Tabs -->
      <div v-if="selectedProductId" class="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="activeTab = 'files'"
          class="px-4 py-2 text-sm font-medium transition-all border-b-2"
          :class="activeTab === 'files' ? 'border-primary-600 text-primary-600' : 'border-transparent text-dimmed hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-files" class="size-4" />
            فایل‌های محصول
            <UBadge v-if="fileTotals > 0" color="neutral" variant="subtle" size="xs">
              {{ fileTotals }}
            </UBadge>
          </div>
        </button>
        <button
          @click="activeTab = 'legal'"
          class="px-4 py-2 text-sm font-medium transition-all border-b-2"
          :class="activeTab === 'legal' ? 'border-primary-600 text-primary-600' : 'border-transparent text-dimmed hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-4" />
            مدارک قانونی
            <UBadge v-if="legalTotals > 0" color="neutral" variant="subtle" size="xs">
              {{ legalTotals }}
            </UBadge>
          </div>
        </button>
      </div>

      <!-- No Product Selected -->
      <UCard v-if="!selectedProductId" class="flex justify-center py-8">
        <div class="text-center">
          <UIcon name="i-lucide-box" class="size-12 text-dimmed mx-auto" />
          <p class="text-dimmed mt-2">هیچ محصولی یافت نشد</p>
          <p class="text-sm text-dimmed">ابتدا یک محصول از لیست بالا انتخاب کنید</p>
        </div>
      </UCard>

      <!-- Files Tab -->
      <template v-else-if="activeTab === 'files'">
        <UCard class="mb-3 p-3">
          <div class="flex flex-wrap gap-2 items-end">
            <UFormField label="عنوان" class="flex-1 min-w-[120px]">
              <UInput v-model="fileFilters.title" placeholder="جستجو در عنوان..." class="w-full text-right" />
            </UFormField>
            <UFormField label="نام فایل" class="w-48">
              <UInput v-model="fileFilters.fileName" placeholder="جستجو در نام فایل..." class="w-full text-right" />
            </UFormField>
            <UFormField label="وضعیت تایید" class="w-32">
              <USelect
                v-model="fileFilters.approvalStatus"
                :items="[
                  { label: 'همه', value: null },
                  { label: 'در انتظار تایید', value: 'Pending' },
                  { label: 'تایید شده', value: 'Approved' },
                  { label: 'رد شده', value: 'Rejected' }
                ]"
                class="w-full"
                :popper="{ placement: 'bottom-end' }"
              />
            </UFormField>
            <div class="flex gap-1">
              <UButton size="sm" @click="applyFileFilters">اعمال</UButton>
              <UButton size="sm" color="neutral" variant="ghost" @click="clearFileFilters">پاک کردن</UButton>
            </div>
          </div>
        </UCard>

        <UCard v-if="fileLoading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
        </UCard>

        <template v-else>
          <ProductFilesTable
            :data="fileData"
            :loading="fileLoading"
            :sort-key="fileSortKey"
            :sort-direction="fileSortDirection"
            @sort="setFileSort"
            @view="openViewModal"
            @download="downloadFile"
            @delete="deleteFile"
          />

          <!-- Pagination -->
          <div v-if="fileTotalPages > 0" class="flex justify-between items-center mt-3 text-sm">
            <div class="text-gray-500">{{ fileStartIndex }} - {{ fileEndIndex }} از {{ fileTotals }}</div>
            <div class="flex gap-1 items-center">
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="fileCurrentPage <= 1"
                @click="fileCurrentPage--; loadFiles()"
              />
              <span class="text-sm mx-1">صفحه {{ fileCurrentPage }} از {{ fileTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="fileCurrentPage >= fileTotalPages"
                @click="fileCurrentPage++; loadFiles()"
              />
              <USelect
                v-model="filePageSize"
                :items="[10, 20, 50, 100]"
                size="sm"
                class="w-20"
                @update:model-value="fileCurrentPage = 1; loadFiles()"
              />
            </div>
          </div>

          <div v-if="fileData.length === 0" class="text-center text-dimmed py-4">
            هیچ فایلی برای این محصول یافت نشد
          </div>
        </template>
      </template>

      <!-- Legal Documents Tab -->
      <template v-else-if="activeTab === 'legal'">
        <UCard v-if="legalLoading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
        </UCard>

        <template v-else>
          <ProductLegalDocumentsTable
            :data="legalData"
            :loading="legalLoading"
            :sort-key="legalSortKey"
            :sort-direction="legalSortDirection"
            @sort="setLegalSort"
            @view="openViewModal"
            @download="downloadFile"
            @delete="deleteFile"
          />

          <!-- Pagination -->
          <div v-if="legalTotalPages > 0" class="flex justify-between items-center mt-3 text-sm">
            <div class="text-gray-500">{{ legalStartIndex }} - {{ legalEndIndex }} از {{ legalTotals }}</div>
            <div class="flex gap-1 items-center">
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="legalCurrentPage <= 1"
                @click="legalCurrentPage--; loadLegalDocuments()"
              />
              <span class="text-sm mx-1">صفحه {{ legalCurrentPage }} از {{ legalTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="legalCurrentPage >= legalTotalPages"
                @click="legalCurrentPage++; loadLegalDocuments()"
              />
              <USelect
                v-model="legalPageSize"
                :items="[10, 20, 50, 100]"
                size="sm"
                class="w-20"
                @update:model-value="legalCurrentPage = 1; loadLegalDocuments()"
              />
            </div>
          </div>

          <div v-if="legalData.length === 0" class="text-center text-dimmed py-4">
            هیچ مدرک قانونی برای این محصول یافت نشد
          </div>
        </template>
      </template>

      <!-- Modals -->
      <ProductFileViewModal v-model:open="viewModalOpen" :file="selectedFile as ProductFile" />

      <ProductFileUploadModal
        v-model:open="uploadModalOpen"
        :product-id="selectedProductId || 0"
        :product-title="selectedProductTitle"
        @upload="activeTab === 'files' ? handleUpload : handleUploadLegal"
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
