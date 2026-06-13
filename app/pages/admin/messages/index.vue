<!-- app/pages/admin/messages/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import { useAdminMessageService } from '~/services/admin/message.service'
import type { Message, MessageStatus, MessagePriority, MessageCategory } from '~/types/message'
import { MessageStatusConfig, MessagePriorityConfig, MessageCategoryConfig } from '~/types/message'
import MessageViewModal from '~/components/admin/message/MessageViewModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت پیام‌ها'
})

const toast = useToast()
const messageService = useAdminMessageService()

// Stats
const stats = ref({
  total: 0,
  pending: 0,
  read: 0,
  replied: 0,
  archived: 0,
  spam: 0,
  today: 0,
  thisWeek: 0,
  thisMonth: 0
})

// Columns
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'fullName', label: 'نام فرستنده', sortable: true },
  { key: 'subject', label: 'موضوع', sortable: true },
  { key: 'category', label: 'دسته‌بندی', sortable: true },
  { key: 'priority', label: 'اولویت', sortable: true },
  { key: 'status', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ارسال', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Filters
const filterFullName = ref('')
const filterEmail = ref('')
const filterSubject = ref('')
const filterStatus = ref<string | null>(null)
const filterPriority = ref<string | null>(null)
const filterCategory = ref<string | null>(null)
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// Grid state
const data = ref<Message[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Selection for bulk actions
const selectedRows = ref<Set<number>>(new Set())
const selectAll = ref(false)

// Modal state
const viewModalOpen = ref(false)
const selectedMessage = ref<Message | null>(null)

// Load stats
const loadStats = async () => {
  try {
    stats.value = await messageService.getMessageStats()
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const filters: any[] = []

    if (filterFullName.value.trim()) {
      filters.push({
        propertyName: 'fullName',
        operation: GridFilterOperation.Contains,
        value: filterFullName.value.trim()
      })
    }
    if (filterEmail.value.trim()) {
      filters.push({
        propertyName: 'email',
        operation: GridFilterOperation.Contains,
        value: filterEmail.value.trim()
      })
    }
    if (filterSubject.value.trim()) {
      filters.push({
        propertyName: 'subject',
        operation: GridFilterOperation.Contains,
        value: filterSubject.value.trim()
      })
    }
    if (filterStatus.value) {
      filters.push({
        propertyName: 'status',
        operation: GridFilterOperation.Equals,
        value: filterStatus.value
      })
    }
    if (filterPriority.value) {
      filters.push({
        propertyName: 'priority',
        operation: GridFilterOperation.Equals,
        value: filterPriority.value
      })
    }
    if (filterCategory.value) {
      filters.push({
        propertyName: 'category',
        operation: GridFilterOperation.Equals,
        value: filterCategory.value
      })
    }
    if (dateFrom.value) {
      filters.push({
        propertyName: 'createdAt',
        operation: GridFilterOperation.GreaterThanOrEqual,
        value: dateFrom.value
      })
    }
    if (dateTo.value) {
      filters.push({
        propertyName: 'createdAt',
        operation: GridFilterOperation.LessThanOrEqual,
        value: dateTo.value
      })
    }

    const request = {
      page: currentPage.value,
      pageSize: pageSize.value,
      inputParams: {
        filters,
        sort:
          sortKey.value && sortDirection.value
            ? {
                propertyName: sortKey.value,
                ascending: sortDirection.value === 'asc'
              }
            : null
      }
    }

    const result = await messageService.getMessagesList(request)
    data.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10

    // Clear selection on new data load
    selectedRows.value.clear()
    selectAll.value = false
  } catch (err: any) {
    console.error('Error:', err)
    data.value = []
    totals.value = 0
  } finally {
    loading.value = false
  }
}

// Pagination
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

// Sorting
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

// Filters
const applyFilters = () => {
  currentPage.value = 1
  loadData()
  loadStats()
}

const clearFilters = () => {
  filterFullName.value = ''
  filterEmail.value = ''
  filterSubject.value = ''
  filterStatus.value = null
  filterPriority.value = null
  filterCategory.value = null
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  loadData()
  loadStats()
}

// Selection handlers
const toggleSelectRow = (id: number) => {
  if (selectedRows.value.has(id)) {
    selectedRows.value.delete(id)
  } else {
    selectedRows.value.add(id)
  }
  selectAll.value = selectedRows.value.size === data.value.length && data.value.length > 0
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value.clear()
    selectAll.value = false
  } else {
    data.value.forEach((item) => selectedRows.value.add(item.id))
    selectAll.value = true
  }
}

// Bulk actions
const bulkDelete = async () => {
  if (selectedRows.value.size === 0) return

  toast.add({
    title: 'تأیید حذف گروهی',
    description: `آیا از حذف ${selectedRows.value.size} پیام اطمینان دارید؟`,
    color: 'error',
    actions: [
      {
        label: 'بله',
        onClick: async () => {
          try {
            await messageService.bulkDeleteMessages(Array.from(selectedRows.value))
            toast.add({ title: 'پیام‌ها با موفقیت حذف شدند', color: 'success' })
            selectedRows.value.clear()
            selectAll.value = false
            loadData()
            loadStats()
          } catch (error: any) {
            toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
          }
        }
      },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const bulkUpdateStatus = async (status: MessageStatus) => {
  if (selectedRows.value.size === 0) return

  try {
    await messageService.bulkUpdateStatus(Array.from(selectedRows.value), status)
    toast.add({ title: `وضعیت ${selectedRows.value.size} پیام با موفقیت تغییر کرد`, color: 'success' })
    selectedRows.value.clear()
    selectAll.value = false
    loadData()
    loadStats()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

// Single message actions
const viewMessage = async (message: Message) => {
  selectedMessage.value = message
  viewModalOpen.value = true
}

const deleteMessage = async (id: number) => {
  toast.add({
    title: 'تأیید حذف',
    description: 'آیا از حذف این پیام اطمینان دارید؟',
    color: 'error',
    actions: [
      {
        label: 'بله',
        onClick: async () => {
          try {
            await messageService.deleteMessage(id)
            toast.add({ title: 'پیام با موفقیت حذف شد', color: 'success' })
            loadData()
            loadStats()
          } catch (error: any) {
            toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
          }
        }
      },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const updateStatus = async (id: number, status: MessageStatus) => {
  try {
    await messageService.updateMessageStatus({ messageId: id, status })
    toast.add({ title: 'وضعیت با موفقیت تغییر کرد', color: 'success' })
    loadData()
    loadStats()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

// Export
const exportMessages = async () => {
  try {
    const filters: any[] = []
    if (filterFullName.value.trim()) {
      filters.push({ propertyName: 'fullName', operation: GridFilterOperation.Contains, value: filterFullName.value.trim() })
    }
    if (filterStatus.value) {
      filters.push({ propertyName: 'status', operation: GridFilterOperation.Equals, value: filterStatus.value })
    }

    const blob = await messageService.exportMessages({ filters })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messages_export_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({ title: 'خروجی با موفقیت ایجاد شد', color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ایجاد خروجی', color: 'error' })
  }
}

// Status badge
const getStatusBadge = (status: MessageStatus) => {
  const config = MessageStatusConfig[status]
  return { color: config.color, label: config.label, icon: config.icon }
}

const getPriorityBadge = (priority: MessagePriority) => {
  const config = MessagePriorityConfig[priority]
  return { color: config.color, label: config.label, icon: config.icon }
}

const getCategoryBadge = (category: MessageCategory) => {
  const config = MessageCategoryConfig[category]
  return { label: config.label, icon: config.icon }
}

// Status options for select
const statusOptions = [
  { label: 'همه', value: null },
  { label: 'در انتظار', value: 'pending' },
  { label: 'خوانده شده', value: 'read' },
  { label: 'پاسخ داده شده', value: 'replied' },
  { label: 'بایگانی', value: 'archived' },
  { label: 'اسپم', value: 'spam' }
]

const priorityOptions = [
  { label: 'همه', value: null },
  { label: 'کم', value: 'low' },
  { label: 'عادی', value: 'normal' },
  { label: 'بالا', value: 'high' },
  { label: 'فوری', value: 'urgent' }
]

const categoryOptions = [
  { label: 'همه', value: null },
  { label: 'عمومی', value: 'general' },
  { label: 'پشتیبانی', value: 'support' },
  { label: 'فروش', value: 'sales' },
  { label: 'فنی', value: 'technical' },
  { label: 'شکایت', value: 'complaint' },
  { label: 'پیشنهاد', value: 'suggestion' }
]

const bulkStatusOptions = [
  { label: 'خوانده شده', value: 'read', icon: 'i-lucide-eye' },
  { label: 'بایگانی', value: 'archived', icon: 'i-lucide-archive' },
  { label: 'اسپم', value: 'spam', icon: 'i-lucide-alert-circle' }
]

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت پیام‌ها</h1>
        <UButton color="neutral" variant="outline" size="sm" @click="exportMessages">
          <UIcon name="i-lucide-download" class="ml-1 size-4" />
          خروجی Excel
        </UButton>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.total }}</div>
          <div class="text-xs text-dimmed">کل پیام‌ها</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-warning-600">{{ stats.pending }}</div>
          <div class="text-xs text-dimmed">در انتظار</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-info-600">{{ stats.read }}</div>
          <div class="text-xs text-dimmed">خوانده شده</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-success-600">{{ stats.replied }}</div>
          <div class="text-xs text-dimmed">پاسخ داده شده</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-neutral-600">{{ stats.archived }}</div>
          <div class="text-xs text-dimmed">بایگانی</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-error-600">{{ stats.spam }}</div>
          <div class="text-xs text-dimmed">اسپم</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.today }}</div>
          <div class="text-xs text-dimmed">امروز</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.thisWeek }}</div>
          <div class="text-xs text-dimmed">این هفته</div>
        </UCard>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedRows.size > 0" class="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm">
          <span class="font-semibold">{{ selectedRows.size }}</span> پیام انتخاب شده
        </div>
        <div class="flex gap-2">
          <UDropdownMenu
            :items="[
              bulkStatusOptions.map((opt) => ({
                label: opt.label,
                icon: opt.icon,
                onSelect: () => bulkUpdateStatus(opt.value as MessageStatus)
              }))
            ]"
          >
            <UButton size="sm" color="neutral" variant="outline"> تغییر وضعیت گروهی </UButton>
          </UDropdownMenu>
          <UButton size="sm" color="error" variant="outline" @click="bulkDelete"> حذف گروهی </UButton>
        </div>
      </div>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام فرستنده" class="flex-1 min-w-[120px]">
            <UInput v-model="filterFullName" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="ایمیل" class="w-40">
            <UInput v-model="filterEmail" placeholder="ایمیل..." class="w-full text-left" />
          </UFormField>
          <UFormField label="موضوع" class="w-40">
            <UInput v-model="filterSubject" placeholder="موضوع..." class="w-full text-right" />
          </UFormField>
          <UFormField label="وضعیت" class="w-28">
            <USelect v-model="filterStatus" :items="statusOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
          </UFormField>
          <UFormField label="اولویت" class="w-24">
            <USelect v-model="filterPriority" :items="priorityOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
          </UFormField>
          <UFormField label="دسته‌بندی" class="w-28">
            <USelect v-model="filterCategory" :items="categoryOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
          </UFormField>
          <UFormField label="از تاریخ" class="w-32">
            <UInput v-model="dateFrom" type="date" class="w-full" />
          </UFormField>
          <UFormField label="تا تاریخ" class="w-32">
            <UInput v-model="dateTo" type="date" class="w-full" />
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
                <th class="px-2 py-1.5 text-center border-b w-8">
                  <UCheckbox :model-value="selectAll" @update:model-value="toggleSelectAll" />
                </th>
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
                v-for="item in data"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="{ 'bg-primary-50 dark:bg-primary-900/10': !item.isRead }"
              >
                <td class="px-2 py-1.5 text-center">
                  <UCheckbox :model-value="selectedRows.has(item.id)" @update:model-value="toggleSelectRow(item.id)" />
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-right">
                  <div class="flex items-center gap-2">
                    <span :class="{ 'font-semibold': !item.isRead }">{{ item.fullName }}</span>
                    <UBadge v-if="!item.isRead" size="xs" color="primary" variant="subtle">جدید</UBadge>
                  </div>
                </td>
                <td class="px-3 py-1.5 text-right max-w-[200px] truncate" :class="{ 'font-semibold': !item.isRead }">
                  {{ item.subject }}
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge variant="subtle" size="sm" class="flex items-center gap-1 w-fit mx-auto">
                    <UIcon :name="getCategoryBadge(item.category).icon" class="size-3" />
                    {{ getCategoryBadge(item.category).label }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="getPriorityBadge(item.priority).color" variant="subtle" size="sm" class="flex items-center gap-1 w-fit mx-auto">
                    <UIcon :name="getPriorityBadge(item.priority).icon" class="size-3" />
                    {{ getPriorityBadge(item.priority).label }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="getStatusBadge(item.status).color" variant="subtle" size="sm" class="flex items-center gap-1 w-fit mx-auto">
                    <UIcon :name="getStatusBadge(item.status).icon" class="size-3" />
                    {{ getStatusBadge(item.status).label }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <div class="flex justify-center gap-1">
                    <UButton size="xs" color="neutral" variant="ghost" @click="viewMessage(item)">
                      <UIcon name="i-lucide-eye" />
                    </UButton>
                    <UButton size="xs" color="error" variant="ghost" @click="deleteMessage(item.id)">
                      <UIcon name="i-lucide-trash" />
                    </UButton>
                  </div>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="columns.length + 1" class="px-3 py-4 text-center text-gray-500">هیچ پیامی یافت نشد</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 0" class="flex justify-between items-center mt-3 text-sm">
          <div class="text-gray-500">{{ startIndex }} - {{ endIndex }} از {{ totals }}</div>
          <div class="flex gap-1 items-center">
            <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
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

      <!-- Message View Modal -->
      <MessageViewModal v-model:open="viewModalOpen" :message="selectedMessage" @reply="loadData" @status-change="loadData" />
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
