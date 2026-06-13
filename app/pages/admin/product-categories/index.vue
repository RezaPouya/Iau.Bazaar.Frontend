<!-- app/pages/admin/product-categories/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت دسته‌بندی محصولات'
})

// ---------- types ----------
interface ProductCategory {
  id: number
  name: string
  priority: number
  createdAtPersian: string
}

// ---------- columns ----------
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'name', label: 'نام دسته‌بندی', sortable: true },
  { key: 'priority', label: 'اولویت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// ---------- filters ----------
const filterName = ref('')
const filterMinPriority = ref<number | null>(null)
const filterMaxPriority = ref<number | null>(null)

// ---------- grid state ----------
const data = ref<ProductCategory[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// ---------- modal state ----------
const formModalOpen = ref(false)
const editingCategory = ref<ProductCategory | null>(null)

// ---------- form validation schema ----------
const schema = z.object({
  name: z.string().min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد'),
  priority: z.number().int().min(0, 'اولویت باید عددی مثبت باشد')
})

type FormData = z.infer<typeof schema>

const form = reactive({
  name: '',
  priority: 0
})

// reset form
const resetForm = () => {
  form.name = ''
  form.priority = 0
}

// watch for editing
watch(editingCategory, (cat) => {
  if (cat) {
    form.name = cat.name
    form.priority = cat.priority
  } else {
    resetForm()
  }
})

// ---------- load data ----------
const loadData = async () => {
  loading.value = true
  try {
    const { $api } = useNuxtApp()
    const filters: any[] = []

    if (filterName.value.trim()) {
      filters.push({
        propertyName: 'name',
        operation: GridFilterOperation.Contains,
        value: filterName.value.trim()
      })
    }
    if (filterMinPriority.value !== null && filterMinPriority.value !== undefined) {
      filters.push({
        propertyName: 'priority',
        operation: GridFilterOperation.GreaterThanOrEqual,
        value: String(filterMinPriority.value)
      })
    }
    if (filterMaxPriority.value !== null && filterMaxPriority.value !== undefined) {
      filters.push({
        propertyName: 'priority',
        operation: GridFilterOperation.LessThanOrEqual,
        value: String(filterMaxPriority.value)
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

    const response = await $api.post('panel/admin/product-categories/list', request)
    const result = response.data
    data.value = result.data ?? []
    totals.value = result.totals ?? 0
    currentPage.value = result.page ?? 1
    pageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا در دریافت دسته‌بندی‌ها', err)
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

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return 'i-lucide-arrow-up-down'
  if (sortDirection.value === 'asc') return 'i-lucide-arrow-up'
  if (sortDirection.value === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

// ---------- filters ----------
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filterName.value = ''
  filterMinPriority.value = null
  filterMaxPriority.value = null
  currentPage.value = 1
  loadData()
}

// ---------- modal handlers ----------
const openCreateModal = () => {
  editingCategory.value = null
  formModalOpen.value = true
}

const openEditModal = (category: ProductCategory) => {
  editingCategory.value = category
  formModalOpen.value = true
}

const handleSave = async (event: FormSubmitEvent<FormData>) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    if (editingCategory.value) {
      // update
      await $api.put(`panel/admin/product-categories/${editingCategory.value.id}`, {
        id: editingCategory.value.id,
        name: event.data.name,
        priority: event.data.priority
      })
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      // create
      await $api.post('panel/admin/product-categories', {
        name: event.data.name,
        priority: event.data.priority
      })
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

const deleteCategory = async (id: number, name: string) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    await $api.delete(`panel/admin/product-categories/${id}`)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const confirmDelete = (id: number, name: string) => {
  const toast = useToast()
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف دسته‌بندی "${name}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteCategory(id, name) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// initial load
onMounted(() => {
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت دسته‌بندی محصولات</h1>
        <UButton color="primary" size="sm" @click="openCreateModal">
          افزودن دسته‌بندی
        </UButton>
      </div>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام دسته‌بندی" class="flex-1 min-w-[150px]">
            <UInput v-model="filterName" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="اولویت حداقل" class="w-32">
            <UInput v-model.number="filterMinPriority" type="number" min="0" placeholder="از" class="w-full text-left" />
          </UFormField>
          <UFormField label="اولویت حداکثر" class="w-32">
            <UInput v-model.number="filterMaxPriority" type="number" min="0" placeholder="تا" class="w-full text-left" />
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
                v-for="item in data"
                :key="item.id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                <td class="px-3 py-1.5 text-right">{{ item.name }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.priority }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <div class="flex justify-center gap-1">
                    <UButton size="xs" color="neutral" variant="ghost" @click="openEditModal(item)">
                      <UIcon name="i-lucide-edit" />
                    </UButton>
                    <UButton size="xs" color="error" variant="ghost" @click="confirmDelete(item.id, item.name)">
                      <UIcon name="i-lucide-trash" />
                    </UButton>
                  </div>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">
                  هیچ داده‌ای یافت نشد
                </td>
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
            <USelect
              v-model="pageSize"
              :items="[10, 20, 50, 100]"
              size="sm"
              class="w-20"
              @update:model-value="setPageSize"
            />
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <UModal
        v-model:open="formModalOpen"
        :title="editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'"
        class="max-w-md"
      >
        <template #body>
          <UForm :schema="schema" :state="form" @submit="handleSave" class="space-y-4">
            <UFormField label="نام دسته‌بندی" name="name" required>
              <UInput v-model="form.name" class="w-full text-right" />
            </UFormField>

            <UFormField label="اولویت" name="priority" required>
              <UInput v-model.number="form.priority" type="number" min="0" class="w-full text-left" />
              <template #description>
                <span class="text-xs text-dimmed">اعداد کوچکتر در اولویت نمایش بالاتری هستند</span>
              </template>
            </UFormField>

            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="ghost" @click="formModalOpen = false">انصراف</UButton>
              <UButton type="submit" color="primary">ذخیره</UButton>
            </div>
          </UForm>
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
