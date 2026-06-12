<!-- app/pages/admin/products/files/[id].vue -->
<script setup lang="ts">
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import { GridFilterOperation } from '~/types/grid'
import ProductFilesFilters from '~/components/admin/product-files/ProductFilesFilters.vue'
import ProductFilesTable from '~/components/admin/product-files/ProductFilesTable.vue'
import ProductLegalDocumentsTable from '~/components/admin/product-files/ProductLegalDocumentsTable.vue'
import ProductFileUploadModal from '~/components/admin/product-files/ProductFileUploadModal.vue'
import ProductFileViewModal from '~/components/admin/product-files/ProductFileViewModal.vue'
import ProductFileApprovalModal from '~/components/admin/product-files/ProductFileApprovalModal.vue'
import ProductFileDeleteModal from '~/components/admin/product-files/ProductFileDeleteModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت فایل‌های محصول'
})

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const toast = useToast()

const productId = computed(() => parseInt(route.params.id as string))
const productTitle = ref('')
const activeTab = ref<'files' | 'legal'>('files')

// ---------- product info ----------
const fetchProductInfo = async () => {
  try {
    const response = await $api.get(`panel/admin/products/${productId.value}`)
    productTitle.value = response.data.data?.title || `محصول ${productId.value}`
  } catch (error) {
    console.error('خطا در دریافت اطلاعات محصول', error)
  }
}

// ---------- files state ----------
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

// ---------- legal documents state ----------
const legalData = ref<ProductLegalDocument[]>([])
const legalTotals = ref(0)
const legalCurrentPage = ref(1)
const legalPageSize = ref(10)
const legalLoading = ref(false)
const legalSortKey = ref<string | null>(null)
const legalSortDirection = ref<'asc' | 'desc' | null>(null)

// ---------- modal state ----------
const uploadModalOpen = ref(false)
const viewModalOpen = ref(false)
const selectedFile = ref<ProductFile | ProductLegalDocument | null>(null)
const approvalModalOpen = ref(false)
const approvingFile = ref<ProductFile | ProductLegalDocument | null>(null)
const deleteModalOpen = ref(false)
const deletingFile = ref<ProductFile | ProductLegalDocument | null>(null)

// ---------- load files ----------
const loadFiles = async () => {
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

    const response = await $api.post(`panel/admin/product-files/${productId.value}/list`, request)
    const result = response.data
    fileData.value = result.data ?? []
    fileTotals.value = result.totals ?? 0
    fileCurrentPage.value = result.page ?? 1
    filePageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا:', err)
    fileData.value = []
    fileTotals.value = 0
  } finally {
    fileLoading.value = false
  }
}

// ---------- load legal documents ----------
const loadLegalDocuments = async () => {
  legalLoading.value = true
  try {
    const filters: any[] = []

    const request = {
      page: legalCurrentPage.value,
      pageSize: legalPageSize.value,
      inputParams: {
        filters,
        sort: legalSortKey.value && legalSortDirection.value
          ? {
              propertyName: legalSortKey.value,
              ascending: legalSortDirection.value === 'asc'
            }
          : null
      }
    }

    const response = await $api.post(`panel/admin/product-files/${productId.value}/legal/list`, request)
    const result = response.data
    legalData.value = result.data ?? []
    legalTotals.value = result.totals ?? 0
    legalCurrentPage.value = result.page ?? 1
    legalPageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا:', err)
    legalData.value = []
    legalTotals.value = 0
  } finally {
    legalLoading.value = false
  }
}

// ---------- pagination ----------
const fileTotalPages = computed(() => Math.ceil(fileTotals.value / filePageSize.value))
const fileStartIndex = computed(() => (fileCurrentPage.value - 1) * filePageSize.value + 1)
const fileEndIndex = computed(() => Math.min(fileCurrentPage.value * filePageSize.value, fileTotals.value))

const legalTotalPages = computed(() => Math.ceil(legalTotals.value / legalPageSize.value))
const legalStartIndex = computed(() => (legalCurrentPage.value - 1) * legalPageSize.value + 1)
const legalEndIndex = computed(() => Math.min(legalCurrentPage.value * legalPageSize.value, legalTotals.value))

// ---------- sorting ----------
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

// ---------- filter handlers ----------
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

// ---------- upload handler ----------
const handleUpload = async (formData: FormData) => {
  try {
    await $api.post('panel/admin/product-files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.add({ title: 'فایل‌ها با موفقیت آپلود شدند', color: 'success' })
    uploadModalOpen.value = false
    loadFiles()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در آپلود فایل',
      color: 'error'
    })
  }
}

// ---------- download file ----------
const downloadFile = async (file: ProductFile | ProductLegalDocument) => {
  try {
    const response = await $api.get(`panel/admin/product-files/download/${file.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.fileName)
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

// ---------- approval handler ----------
const handleApproval = async (approved: boolean, rejectionReason: string) => {
  if (!approvingFile.value) return

  try {
    await $api.patch(`panel/admin/product-files/approve`, {
      id: approvingFile.value.id,
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
    toast.add({
      title: approved ? 'فایل تایید شد' : 'فایل رد شد',
      color: 'success'
    })
    approvalModalOpen.value = false
    loadFiles()
    loadLegalDocuments()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت',
      color: 'error'
    })
  }
}

// ---------- delete handler ----------
const handleDelete = async () => {
  if (!deletingFile.value) return

  try {
    await $api.delete(`panel/admin/product-files/${deletingFile.value.id}`)
    toast.add({ title: 'فایل با موفقیت حذف شد', color: 'success' })
    deleteModalOpen.value = false
    loadFiles()
    loadLegalDocuments()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در حذف فایل',
      color: 'error'
    })
  }
}

// ---------- go back ----------
const goBack = () => {
  router.push('/admin/products')
}

// ---------- initial load ----------
onMounted(async () => {
  await fetchProductInfo()
  loadFiles()
  loadLegalDocuments()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <!-- Header -->
      <div class="mb-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-right" @click="goBack" />
          <h1 class="text-xl font-bold">مدیریت فایل‌های محصول</h1>
        </div>
        <UButton color="primary" size="sm" @click="uploadModalOpen = true">
          <UIcon name="i-lucide-upload" class="ml-1 size-4" />
          آپلود فایل
        </UButton>
      </div>

      <!-- Product Info Card -->
      <UCard class="mb-3 p-3 bg-primary-50 dark:bg-primary-900/10">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-package" class="size-5 text-primary-600" />
          <span class="text-sm text-dimmed">محصول:</span>
          <span class="font-semibold">{{ productTitle }}</span>
          <span class="text-xs text-dimmed">(شناسه: {{ productId }})</span>
        </div>
      </UCard>

      <!-- Tabs -->
      <div class="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="activeTab = 'files'"
          class="px-4 py-2 text-sm font-medium transition-all border-b-2"
          :class="activeTab === 'files'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-dimmed hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-files" class="size-4" />
            فایل‌های محصول
          </div>
        </button>
        <button
          @click="activeTab = 'legal'"
          class="px-4 py-2 text-sm font-medium transition-all border-b-2"
          :class="activeTab === 'legal'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-dimmed hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-4" />
            مدارک قانونی
          </div>
        </button>
      </div>

      <!-- Files Tab -->
      <div v-if="activeTab === 'files'">
        <ProductFilesFilters
          v-model:filters="fileFilters"
          @apply="applyFileFilters"
          @clear="clearFileFilters"
        />

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
            @view="(file) => { selectedFile = file; viewModalOpen = true }"
            @download="downloadFile"
            @approve="(file) => { approvingFile = file; approvalModalOpen = true }"
            @delete="(file) => { deletingFile = file; deleteModalOpen = true }"
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
        </template>
      </div>

      <!-- Legal Documents Tab -->
      <div v-else-if="activeTab === 'legal'">
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
            @view="(doc) => { selectedFile = doc; viewModalOpen = true }"
            @download="downloadFile"
            @approve="(doc) => { approvingFile = doc; approvalModalOpen = true }"
            @delete="(doc) => { deletingFile = doc; deleteModalOpen = true }"
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
        </template>
      </div>

      <!-- Modals -->
      <ProductFileUploadModal
        v-model:open="uploadModalOpen"
        :product-id="productId"
        :product-title="productTitle"
        @upload="handleUpload"
      />

      <ProductFileViewModal
        v-model:open="viewModalOpen"
        :file="selectedFile as ProductFile"
      />

      <ProductFileApprovalModal
        v-model:open="approvalModalOpen"
        :file="approvingFile as ProductFile"
        @submit="handleApproval"
      />

      <ProductFileDeleteModal
        v-model:open="deleteModalOpen"
        :file="deletingFile as ProductFile"
        @confirm="handleDelete"
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
