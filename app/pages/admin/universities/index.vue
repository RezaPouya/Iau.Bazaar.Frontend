<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'

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
        sort: sortKey.value && sortDirection.value ? {
          propertyName: sortKey.value,
          ascending: sortDirection.value === 'asc'
        } : null
      }
    }
    const response = await $api.post('panel/admin/universities/list', request)
    const result = response.data
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

// ---------- مودال افزودن / ویرایش ----------
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  id: null as number | null, // add this line
  title: '',
  description: '',
  provinceId: 0,
  isActive: true,
  isVisible: true
})

const resetForm = () => {
  form.id = null
  form.title = ''
  form.description = ''
  form.provinceId = provinces.value[0]?.id || 0
  form.isActive = true
  form.isVisible = true
  editingId.value = null
}

const openCreateModal = () => {
  resetForm()
  modalOpen.value = true
}

const openEditModal = (university: any) => {
  editingId.value = university.id
  form.id = university.id
  form.title = university.title
  form.description = university.description || ''
  form.provinceId = university.provinceId
  form.isActive = university.isActive
  form.isVisible = university.isVisible
  modalOpen.value = true
}

const submitForm = async () => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    if (editingId.value) {
      await $api.put(`panel/admin/universities/${editingId.value}`, form)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await $api.post('panel/admin/universities', form)
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    modalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

// پیش‌نمایش
const previewHtml = ref('')
const previewOpen = ref(false)
const showPreview = (description: string) => {
  previewHtml.value = description
  previewOpen.value = true
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
    <div>
      <div class="mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">مدیریت دانشگاه‌ها</h1>
        <UButton color="primary" @click="openCreateModal"> افزودن دانشگاه </UButton>
      </div>

      <UCard class="mb-4">
        <div class="flex flex-wrap gap-3 items-end">
          <UFormField label="نام دانشگاه" class="flex-1 min-w-[200px]">
            <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full" />
          </UFormField>
          <UFormField label="استان" class="w-48">
            <USelect
              v-model="filterProvinceId"
              :items="[{ label: 'همه استان‌ها', value: null }, ...provinces.map((p) => ({ label: p.name, value: p.id }))]"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>
          <UFormField label="فعال" class="w-36">
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
          <UFormField label="قابل نمایش" class="w-36">
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
          <div class="flex gap-2">
            <UButton @click="applyFilters">اعمال فیلترها</UButton>
            <UButton color="neutral" variant="ghost" @click="clearFilters">حذف فیلترها</UButton>
          </div>
        </div>
      </UCard>

      <!-- لودینگ -->
      <UCard v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin mx-auto" />
      </UCard>

      <div v-else>
        <!-- جدول -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="col in columns"
                  :key="col.key"
                  class="px-4 py-2 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="col.sortable && setSort(col.key)"
                >
                  <div class="flex items-center justify-center gap-1">
                    {{ col.label }}
                    <UIcon v-if="col.sortable" :name="getSortIcon(col.key)" class="size-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in data" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-2 text-center">{{ item.id }}</td>
                <td class="px-4 py-2 text-center">{{ item.title }}</td>
                <td class="px-4 py-2 text-center">{{ item.provinceName }}</td>
                <td class="px-4 py-2 text-center">
                  <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle">
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-4 py-2 text-center">
                  <UBadge :color="item.isVisible ? 'success' : 'neutral'" variant="subtle">
                    {{ item.isVisible ? 'نمایش' : 'مخفی' }}
                  </UBadge>
                </td>
                <td class="px-4 py-2 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-4 py-2 text-center">
                  <div class="flex flex-col gap-2 w-32 mx-auto">
                    <UButton size="sm" color="neutral" variant="outline" @click="openEditModal(item)">
                      <UIcon name="i-lucide-edit" class="ml-1" /> ویرایش
                    </UButton>
                    <UButton size="sm" color="neutral" variant="outline" @click="showPreview(item.description)">
                      <UIcon name="i-lucide-eye" class="ml-1" /> پیش‌نمایش
                    </UButton>
                    <UButton size="sm" color="error" variant="outline" @click="confirmDelete(item.id)">
                      <UIcon name="i-lucide-trash" class="ml-1" /> حذف
                    </UButton>
                    <UButton size="sm" color="primary" variant="outline" @click="goToEditPage(item.id)">
                      <UIcon name="i-lucide-file-text" class="ml-1" /> ویرایش صفحه
                    </UButton>
                  </div>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
                  هیچ داده‌ای یافت نشد
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- صفحه‌بندی -->
        <div v-if="totalPages > 0" class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            {{ startIndex }} - {{ endIndex }} از {{ totals }}
          </div>
          <div class="flex gap-2 items-center">
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              :disabled="currentPage <= 1"
              @click="setPage(currentPage - 1)"
            />
            <span class="text-sm">صفحه {{ currentPage }} از {{ totalPages }}</span>
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              :disabled="currentPage >= totalPages"
              @click="setPage(currentPage + 1)"
            />
            <USelect
              v-model="pageSize"
              :items="[10, 20, 50, 100]"
              size="sm"
              class="w-24"
              @update:model-value="setPageSize"
            />
          </div>
        </div>
      </div>

      <!-- مودال‌ها -->
      <UModal v-model:open="modalOpen" :title="editingId ? 'ویرایش دانشگاه' : 'افزودن دانشگاه'" class="max-w-4xl">
        <template #body>
          <UForm :state="form" @submit="submitForm" class="space-y-4">
            <UFormField label="نام دانشگاه" required>
              <UInput v-model="form.title" class="w-full" />
            </UFormField>
            <UFormField label="استان" required>
              <USelect
                v-model="form.provinceId"
                :items="provinces.map((p) => ({ label: p.name, value: p.id }))"
                class="w-full"
                :popper="{ placement: 'bottom-end' }"
              />
            </UFormField>
            <UFormField label="توضیحات (HTML)">
              <RichTextEditor v-model="form.description" />
            </UFormField>
            <div class="flex gap-4">
              <UFormField label="فعال" class="flex-1">
                <USwitch v-model="form.isActive" />
              </UFormField>
              <UFormField label="قابل نمایش" class="flex-1">
                <USwitch v-model="form.isVisible" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <UButton color="neutral" variant="ghost" @click="modalOpen = false">انصراف</UButton>
              <UButton type="submit" color="primary">ذخیره</UButton>
            </div>
          </UForm>
        </template>
      </UModal>

      <UModal v-model:open="previewOpen" title="پیش‌نمایش توضیحات" class="max-w-4xl">
        <template #body>
          <div class="prose prose-sm dark:prose-invert max-w-none" v-html="previewHtml" />
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>
