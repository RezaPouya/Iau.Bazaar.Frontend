<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import UniversityFormModal from '~/components/admin/university/UniversityFormModal.vue'
import UniversityPreviewModal from '~/components/admin/university/UniversityPreviewModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت دانشگاه‌ها'
})

// ---------- ستون‌ها ----------
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام دانشگاه', sortable: true },
  { key: 'provinceName', label: 'استان', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'isVisible', label: 'قابل نمایش', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// ---------- دریافت استان‌ها ----------
const provinces = ref<{ id: number; name: string }[]>([])
const fetchProvinces = async () => {
  const { $api } = useNuxtApp()
  try {
    const response = await $api.get('panel/admin/drop-downs/provinces')
    provinces.value = response.data.data || response.data
  } catch (error) {
    console.error('خطا در دریافت استان‌ها', error)
  }
}
onMounted(fetchProvinces)

// ---------- فیلترها ----------
const filterTitle = ref('')
const filterProvinceId = ref<number | null>(null)
const filterIsActive = ref<string | null>(null)
const filterIsVisible = ref<string | null>(null)

// ---------- State grid ----------
const data = ref<any[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// ---------- بارگذاری داده‌ها ----------
const loadData = async () => {
  loading.value = true
  try {
    const { $api } = useNuxtApp()
    const filters: any[] = []
    if (filterTitle.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: filterTitle.value.trim()
      })
    }
    if (filterProvinceId.value != null) {
      filters.push({
        propertyName: 'provinceId',
        operation: GridFilterOperation.Equals,
        value: String(filterProvinceId.value)
      })
    }
    if (filterIsActive.value != null) {
      filters.push({
        propertyName: 'isActive',
        operation: GridFilterOperation.Equals,
        value: filterIsActive.value
      })
    }
    if (filterIsVisible.value != null) {
      filters.push({
        propertyName: 'isVisible',
        operation: GridFilterOperation.Equals,
        value: filterIsVisible.value
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
    const response = await $api.post('panel/admin/universities/list', request)
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

// ---------- صفحه‌بندی ----------
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

// ---------- مرتب‌سازی ----------
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

// ---------- فیلترها ----------
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filterTitle.value = ''
  filterProvinceId.value = null
  filterIsActive.value = null
  filterIsVisible.value = null
  currentPage.value = 1
  loadData()
}

// ---------- Modal state ----------
const formModalOpen = ref(false)
const editingUniversity = ref<any>(null)
const previewModalOpen = ref(false)
const previewHtml = ref('')

const openCreateModal = () => {
  editingUniversity.value = null
  formModalOpen.value = true
}

const openEditModal = (university: any) => {
  editingUniversity.value = university
  formModalOpen.value = true
}

const showPreview = (description: string) => {
  previewHtml.value = description
  previewModalOpen.value = true
}

const handleSave = async (formData: any) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    if (formData.id) {
      await $api.put(`panel/admin/universities/${formData.id}`, formData)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      const { id, ...createData } = formData
      await $api.post('panel/admin/universities', createData)
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

// حذف
const deleteUniversity = async (id: number) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    await $api.delete(`panel/admin/universities/${id}`)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const confirmDelete = (id: number) => {
  const toast = useToast()
  toast.add({
    title: 'تأیید حذف',
    description: 'آیا از حذف این دانشگاه اطمینان دارید؟',
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteUniversity(id) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const goToEditPage = (id: number) => {
  navigateTo(`/admin/universities/edit/${id}`)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت دانشگاه‌ها</h1>
        <UButton color="primary" size="sm" @click="openCreateModal"> افزودن دانشگاه </UButton>
      </div>

      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام دانشگاه" class="flex-1 min-w-[150px]">
            <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="استان" class="w-40">
            <USelect
              v-model="filterProvinceId"
              :items="[{ label: 'همه استان‌ها', value: null }, ...provinces.map((p) => ({ label: p.name, value: p.id }))]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="فعال" class="w-28">
            <USelect
              v-model="filterIsActive"
              :items="[
                { label: 'همه', value: null },
                { label: 'فعال', value: 'true' },
                { label: 'غیرفعال', value: 'false' }
              ]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="قابل نمایش" class="w-28">
            <USelect
              v-model="filterIsVisible"
              :items="[
                { label: 'همه', value: null },
                { label: 'نمایش', value: 'true' },
                { label: 'مخفی', value: 'false' }
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

      <!-- لودینگ -->
      <UCard v-if="loading" class="flex justify-center py-4">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
      </UCard>

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
              <tr v-for="item in data" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.title }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.provinceName }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="item.isVisible ? 'success' : 'neutral'" variant="subtle" size="sm">
                    {{ item.isVisible ? 'نمایش' : 'مخفی' }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UDropdownMenu
                    :items="[
                      [
                        {
                          label: 'ویرایش',
                          icon: 'i-lucide-edit',
                          onSelect: () => openEditModal(item)
                        },
                        {
                          label: 'پیش‌نمایش',
                          icon: 'i-lucide-eye',
                          onSelect: () => showPreview(item.description)
                        },
                        {
                          label: 'حذف',
                          icon: 'i-lucide-trash',
                          color: 'error',
                          onSelect: () => confirmDelete(item.id)
                        },
                        {
                          label: 'ویرایش صفحه',
                          icon: 'i-lucide-file-text',
                          onSelect: () => goToEditPage(item.id)
                        }
                      ]
                    ]"
                    :content="{ align: 'end' }"
                  >
                    <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-more-vertical" />
                  </UDropdownMenu>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ داده‌ای یافت نشد</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- صفحه‌بندی -->
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

      <!-- Modals -->
      <UniversityFormModal
        v-model:open="formModalOpen"
        :editing-id="editingUniversity?.id || null"
        :initial-data="editingUniversity || undefined"
        :provinces="provinces"
        @save="handleSave"
      />

      <UniversityPreviewModal v-model:open="previewModalOpen" :html-content="previewHtml" />
    </div>
  </ClientOnly>
</template>

<style scoped>
/* فشرده‌سازی */
.compact-grid :deep(.p-4) {
  padding: 0.75rem !important;
}
.compact-grid :deep(.gap-3) {
  gap: 0.5rem !important;
}
/* راست‌چین کردن ورودی‌ها */
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


