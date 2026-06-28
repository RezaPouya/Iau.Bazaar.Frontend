<script setup lang="ts">
import { useAdminContactUsMessageService } from '~/services/admin/contact-us-message.service'
import type { ContactUsMessageDto } from '~/types/contact-us-message'
import { ContactUsMessageState, ContactUsMessageStateConfig, contactUsMessageStateOptions } from '~/types/contact-us-message'
import ContactUsMessageViewModal from '~/components/admin/contact-us-message/ContactUsMessageViewModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت پیام‌ها'
})

const toast = useToast()
const messageService = useAdminContactUsMessageService()

// Stats
const stats = ref({
  total: 0,
  notSeen: 0,
  seen: 0,
  answered: 0,
  today: 0,
  thisWeek: 0
})

// Columns (بدون «دسته‌بندی»/«اولویت» چون این دو مفهوم در بک‌اند وجود ندارند)
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'name', label: 'نام فرستنده', sortable: true },
  { key: 'subjectTitle', label: 'موضوع', sortable: false },
  { key: 'state', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ارسال', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Filters
const filterSearchTerm = ref('')
const filterState = ref<number | null>(null)
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// Grid state
const data = ref<ContactUsMessageDto[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Selection
const selectedRows = ref<Set<number>>(new Set())
const selectAll = ref(false)

// Modal
const viewModalOpen = ref(false)
const selectedMessage = ref<ContactUsMessageDto | null>(null)

// Load stats — این اندپوینت قبلاً اصلاً در بک‌اند وجود نداشت (فقط با یک کامنت
// «فرضی» صدا زده می‌شد)؛ در همین دور ساخته شد.
const loadStats = async () => {
  try {
    stats.value = await messageService.getStats()
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load data
const loadData = async () => {
  loading.value = true
  try {
    // نکته مهم: این فیلدها باید سطح بالا (top-level) ارسال شوند، نه داخل
    // inputParams.filters — دقیقاً همان درسی که از باگ فیلتر صفحه محصولات گرفتیم.
    // ContactUsCoreService.GetMessagesAsync مستقیماً همین Property های strongly-typed
    // را می‌خواند (SearchTerm, State, FromDate, ToDate)، نه آرایه‌ی عمومی filters را.
    const result = await messageService.getMessagesList({
      page: currentPage.value,
      pageSize: pageSize.value,
      searchTerm: filterSearchTerm.value.trim() || null,
      state: filterState.value as any,
      fromDate: dateFrom.value || null,
      toDate: dateTo.value || null,
      inputParams: {
        filters: [],
        sort: sortKey.value && sortDirection.value
          ? { propertyName: sortKey.value, ascending: sortDirection.value === 'asc' }
          : null
      }
    })
    data.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
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
  filterSearchTerm.value = ''
  filterState.value = null
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  loadData()
  loadStats()
}

// Selection
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
    data.value.forEach(item => selectedRows.value.add(item.id))
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
            await Promise.all(Array.from(selectedRows.value).map(id => messageService.deleteMessage(id)))
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

// نکته: نسخه قبلی این تابع {status} می‌فرستاد (فیلدی که در DTO واقعی وجود ندارد).
// الان شکل درست {id, state} ارسال می‌شود.
const bulkUpdateState = async (state: number) => {
  if (selectedRows.value.size === 0) return
  try {
    await Promise.all(
      Array.from(selectedRows.value).map(id => messageService.updateMessage({ id, state: state as any }))
    )
    toast.add({ title: `وضعیت ${selectedRows.value.size} پیام با موفقیت تغییر کرد`, color: 'success' })
    selectedRows.value.clear()
    selectAll.value = false
    loadData()
    loadStats()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

// Single actions
const viewMessage = (message: ContactUsMessageDto) => {
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

// Export — این اندپوینت هم قبلاً اصلاً در بک‌اند وجود نداشت
const exporting = ref(false)
const exportMessages = async () => {
  exporting.value = true
  try {
    const blob = await messageService.exportMessages({
      page: 1,
      pageSize: 10000,
      searchTerm: filterSearchTerm.value.trim() || null,
      state: filterState.value as any,
      fromDate: dateFrom.value || null,
      toDate: dateTo.value || null
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messages_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.add({ title: 'خروجی با موفقیت ایجاد شد', color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ایجاد خروجی', color: 'error' })
  } finally {
    exporting.value = false
  }
}

// Badge helper
const getStateBadge = (state: number) => {
  return ContactUsMessageStateConfig[state] || { color: 'neutral', label: '—', icon: 'i-lucide-circle' }
}

const stateFilterOptions = [{ label: 'همه', value: null }, ...contactUsMessageStateOptions]

const bulkStateOptions = [
  { label: 'مشاهده شده', value: ContactUsMessageState.Seen, icon: 'i-lucide-eye' },
  { label: 'یادداشت‌گذاری شده', value: ContactUsMessageState.Answered, icon: 'i-lucide-check-check' }
]

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <!-- header -->
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت پیام‌ها</h1>
        <UButton color="neutral" variant="outline" size="sm" :loading="exporting" @click="exportMessages">
          <UIcon name="i-lucide-download" class="ml-1 size-4" />
          خروجی CSV
        </UButton>
      </div>

      <!-- stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.total }}</div>
          <div class="text-xs text-dimmed">کل پیام‌ها</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-warning-600">{{ stats.notSeen }}</div>
          <div class="text-xs text-dimmed">مشاهده نشده</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-info-600">{{ stats.seen }}</div>
          <div class="text-xs text-dimmed">مشاهده شده</div>
        </UCard>
        <UCard class="p-2 text-center">
          <div class="text-2xl font-bold text-success-600">{{ stats.answered }}</div>
          <div class="text-xs text-dimmed">یادداشت‌گذاری شده</div>
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

      <!-- bulk actions -->
      <div v-if="selectedRows.size > 0" class="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm"><span class="font-semibold">{{ selectedRows.size }}</span> پیام انتخاب شده</div>
        <div class="flex gap-2">
          <UDropdownMenu :items="[bulkStateOptions.map((opt) => ({ label: opt.label, icon: opt.icon, onSelect: () => bulkUpdateState(opt.value) }))]">
            <UButton size="sm" color="neutral" variant="outline"> تغییر وضعیت گروهی </UButton>
          </UDropdownMenu>
          <UButton size="sm" color="error" variant="outline" @click="bulkDelete"> حذف گروهی </UButton>
        </div>
      </div>

      <!-- filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="جستجو (نام/ایمیل/تلفن/متن)" class="flex-1 min-w-[200px]">
            <UInput v-model="filterSearchTerm" placeholder="جستجو..." class="w-full text-right" @keyup.enter="applyFilters" />
          </UFormField>
          <UFormField label="وضعیت" class="w-36">
            <USelect v-model="filterState" :items="stateFilterOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
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

      <!-- loading -->
      <UCard v-if="loading" class="flex justify-center py-4">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
      </UCard>

      <!-- table -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-2 py-1.5 text-center border-b w-8">
                  <UCheckbox :model-value="selectAll" @update:model-value="toggleSelectAll" />
                </th>
                <th v-for="col in columns" :key="col.key" class="px-3 py-1.5 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" @click="col.sortable && setSort(col.key)">
                  <div class="flex items-center justify-center gap-1">
                    {{ col.label }}
                    <UIcon v-if="col.sortable" :name="getSortIcon(col.key)" class="size-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in data" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" :class="{ 'bg-primary-50 dark:bg-primary-900/10': item.state === 1 }">
                <td class="px-2 py-1.5 text-center">
                  <UCheckbox :model-value="selectedRows.has(item.id)" @update:model-value="toggleSelectRow(item.id)" />
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-right">
                  <div class="flex items-center gap-2">
                    <span :class="{ 'font-semibold': item.state === 1 }">{{ item.name }}</span>
                    <UBadge v-if="item.state === 1" size="xs" color="primary" variant="subtle">جدید</UBadge>
                  </div>
                  <div class="text-xs text-dimmed">{{ item.email }}</div>
                </td>
                <td class="px-3 py-1.5 text-right max-w-[200px] truncate">{{ item.subjectTitle }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="getStateBadge(item.state).color" variant="subtle" size="sm" class="flex items-center gap-1 w-fit mx-auto">
                    <UIcon :name="getStateBadge(item.state).icon" class="size-3" />
                    {{ item.stateTitle }}
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

        <!-- pagination -->
        <div v-if="totalPages > 0" class="flex justify-between items-center mt-3 text-sm">
          <div class="text-gray-500">{{ startIndex }} - {{ endIndex }} از {{ totals }}</div>
          <div class="flex gap-1 items-center">
            <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
            <span class="text-sm mx-1">صفحه {{ currentPage }} از {{ totalPages }}</span>
            <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" size="sm" :disabled="currentPage >= totalPages" @click="setPage(currentPage + 1)" />
            <USelect v-model="pageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setPageSize" />
          </div>
        </div>
      </div>

      <!-- modal -->
      <ContactUsMessageViewModal v-model:open="viewModalOpen" :message="selectedMessage" @message-updated="loadData(); loadStats()" @message-deleted="loadData(); loadStats()" />
    </div>
  </ClientOnly>
</template>

<style scoped>
.compact-grid :deep(.p-4) { padding: 0.75rem !important; }
.compact-grid :deep(.gap-3) { gap: 0.5rem !important; }
:deep(input), :deep(textarea), :deep(.reka-select-trigger) { text-align: left !important; }
:deep(.reka-select-value) { text-align: right; }
table { min-height: 100px !important; }
tr, tbody { vertical-align: top !important; }
</style>
