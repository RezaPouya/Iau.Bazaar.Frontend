<!-- app/pages/growth-center/product-files/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Product, Company } from '~/types/product'
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'
import ProductFilesFilters from '~/components/admin/product-files/ProductFilesFilters.vue'
import ProductFilesTable from '~/components/admin/product-files/ProductFilesTable.vue'
import ProductLegalDocumentsTable from '~/components/admin/product-files/ProductLegalDocumentsTable.vue'
import ProductFileApprovalModal from '~/components/admin/product-files/ProductFileApprovalModal.vue'
import ProductFileViewModal from '~/components/admin/product-files/ProductFileViewModal.vue'

definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'مدیریت مدارک محصولات'
})

const toast = useToast()
const growthCenterService = useGrowthCenterService()
const { $api } = useNuxtApp()

// ========== State ==========
const activeTab = ref<'files' | 'legal'>('files')
const selectedProductId = ref<number | null>(null)
const products = ref<Product[]>([])
const companies = ref<Company[]>([])

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
const approvalModalOpen = ref(false)
const approvingFile = ref<ProductFile | ProductLegalDocument | null>(null)

// ========== Load Products ==========
const loadProducts = async () => {
  try {
    const request = {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    }
    const result = await growthCenterService.getProductsList(request)
    products.value = result.data ?? []
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

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

    const result = await growthCenterService.getProductFiles(selectedProductId.value, request)
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

    // نکته: این endpoint قبلاً اصلاً در بک‌اند وجود نداشت و مسیر قبلی هم پیشوند
    // تکراری «/api» داشت. هر دو در همین دور اصلاح شدند.
    const result = await growthCenterService.getLegalDocuments(selectedProductId.value, request)
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

const openApprovalModal = (file: ProductFile | ProductLegalDocument) => {
  approvingFile.value = file
  approvalModalOpen.value = true
}

const submitApproval = async (approved: boolean, rejectionReason: string) => {
  if (!approvingFile.value) return

  try {
    // Check if it's a file or legal document
    if ('documentType' in approvingFile.value) {
      // Legal document
      await growthCenterService.toggleLegalDocumentApproval(
        approvingFile.value.id,
        approved,
        approved ? null : rejectionReason
      )
    } else {
      // Product file
      await growthCenterService.toggleProductFileApproval(
        approvingFile.value.id,
        approved,
        approved ? null : rejectionReason
      )
    }
    toast.add({
      title: approved ? 'مدرک تایید شد' : 'مدرک رد شد',
      color: 'success'
    })
    approvalModalOpen.value = false
    // Reload current tab data
    if (activeTab.value === 'files') {
      loadFiles()
    } else {
      loadLegalDocuments()
    }
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت',
      color: 'error'
    })
  }
}

// ========== Pagination Handlers ==========
const prevFilePage = () => {
  if (fileCurrentPage.value > 1) {
    fileCurrentPage.value--
    loadFiles()
  }
}

const nextFilePage = () => {
  if (fileCurrentPage.value < Math.ceil(fileTotals.value / filePageSize.value)) {
    fileCurrentPage.value++
    loadFiles()
  }
}

const prevLegalPage = () => {
  if (legalCurrentPage.value > 1) {
    legalCurrentPage.value--
    loadLegalDocuments()
  }
}

const nextLegalPage = () => {
  if (legalCurrentPage.value < Math.ceil(legalTotals.value / legalPageSize.value)) {
    legalCurrentPage.value++
    loadLegalDocuments()
  }
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
  await Promise.all([loadProducts(), loadCompanies()])
  if (products.value.length > 0) {
    selectedProductId.value = products.value[0].id
    loadFiles()
  }
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت مدارک محصولات</h1>
        <UBadge color="info" variant="subtle" size="sm">
          {{ products.length }} محصول
        </UBadge>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید مدارک (فایل‌ها و اسناد قانونی) محصولات شرکت‌های زیرمجموعه خود را مشاهده و تایید یا رد کنید.
            برای مشاهده مدارک هر محصول، ابتدا محصول مورد نظر را از لیست زیر انتخاب کنید.
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
                  label: `${p.title} (${p.companyName})`,
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
        <ProductFilesFilters v-model:filters="fileFilters" @apply="applyFileFilters" @clear="clearFileFilters" />

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
            @approve="openApprovalModal"
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
                @click="prevFilePage"
              />
              <span class="text-sm mx-1">صفحه {{ fileCurrentPage }} از {{ fileTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="fileCurrentPage >= fileTotalPages"
                @click="nextFilePage"
              />
              <USelect
                v-model="filePageSize"
                :items="[10, 20, 50, 100]"
                size="sm"
                class="w-20"
                @update:model-value="loadFiles"
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
            @approve="openApprovalModal"
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
                @click="prevLegalPage"
              />
              <span class="text-sm mx-1">صفحه {{ legalCurrentPage }} از {{ legalTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="legalCurrentPage >= legalTotalPages"
                @click="nextLegalPage"
              />
              <USelect
                v-model="legalPageSize"
                :items="[10, 20, 50, 100]"
                size="sm"
                class="w-20"
                @update:model-value="loadLegalDocuments"
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
      <ProductFileApprovalModal
        v-model:open="approvalModalOpen"
        :file="approvingFile as ProductFile"
        @submit="submitApproval"
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


