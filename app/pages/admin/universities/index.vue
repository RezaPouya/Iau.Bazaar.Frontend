<script setup lang="ts">
import type { GridDataSourceRequest, GridDataSourceResult, GridPropertyFilter } from '~/types/grid'
import { GridFilterOperation } from '~/types/grid'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت دانشگاه‌ها'
})

// ---------- ستون‌های جدول ----------
const columns = [
  { accessorKey: 'id', header: 'شناسه', sortable: true },
  { accessorKey: 'title', header: 'نام دانشگاه', sortable: true },
  { accessorKey: 'provinceName', header: 'استان', sortable: true },
  { accessorKey: 'isActive', header: 'فعال', sortable: true },
  { accessorKey: 'isVisible', header: 'قابل نمایش', sortable: true },
  { accessorKey: 'createdAtPersian', header: 'تاریخ ایجاد', sortable: true },
  { accessorKey: 'actions', header: 'عملیات', sortable: false },
]

// ---------- دریافت استان‌ها ----------
const provinces = ref<{ id: number; name: string }[]>([])
const fetchProvinces = async () => {
  const { $api } = useNuxtApp()
  try {
    const response = await $api.get('panel/admin/drop-downs/provinces')
    provinces.value = response.data.data
  } catch (error) {
    console.error('خطا در دریافت استان‌ها', error)
  }
}
onMounted(fetchProvinces)

// ---------- مقادیر فیلترها (غیر خودکار) ----------
const filterTitle = ref('')
const filterProvinceId = ref<number | null>(null)
const filterIsActive = ref<string | null>(null)
const filterIsVisible = ref<string | null>(null)

// ---------- منطق Grid ----------
const fetchUniversities = async (request: GridDataSourceRequest) => {
  const { $api } = useNuxtApp()
  const response = await $api.post<ApiResponse<GridDataSourceResult<any>>>(
    '/api/admin/universities/list',
    request
  )
  return response.data.data
}
const grid = useGrid(fetchUniversities)

// اعمال فیلترها (با دکمه)
const applyFilters = () => {
  // پاک کردن فیلترهای قبلی
  const properties = ['title', 'provinceId', 'isActive', 'isVisible']
  properties.forEach(prop => {
    grid.addFilter({ propertyName: prop, operation: GridFilterOperation.Equals, value: '' })
  })

  if (filterTitle.value.trim()) {
    grid.addFilter({
      propertyName: 'title',
      operation: GridFilterOperation.Contains,
      value: filterTitle.value.trim()
    })
  }
  if (filterProvinceId.value !== null) {
    grid.addFilter({
      propertyName: 'provinceId',
      operation: GridFilterOperation.Equals,
      value: String(filterProvinceId.value)
    })
  }
  if (filterIsActive.value !== null) {
    grid.addFilter({
      propertyName: 'isActive',
      operation: GridFilterOperation.Equals,
      value: filterIsActive.value
    })
  }
  if (filterIsVisible.value !== null) {
    grid.addFilter({
      propertyName: 'isVisible',
      operation: GridFilterOperation.Equals,
      value: filterIsVisible.value
    })
  }
}

const clearFilters = () => {
  filterTitle.value = ''
  filterProvinceId.value = null
  filterIsActive.value = null
  filterIsVisible.value = null
  grid.clearFilters()
}

// ---------- مودال افزودن / ویرایش دانشگاه ----------
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  title: '',
  description: '',
  provinceId: 0,
  isActive: true,
  isVisible: true
})

const resetForm = () => {
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

const openEditModal = async (university: any) => {
  editingId.value = university.id
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
    grid.loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

// پیش‌نمایش (با دیالوگ ساده)
const previewHtml = ref('')
const previewOpen = ref(false)
const showPreview = (description: string) => {
  previewHtml.value = description
  previewOpen.value = true
}

// حذف با تأیید
const deleteUniversity = async (id: number) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    await $api.delete(`panel/admin/universities/${id}`)
    toast.add({ title: 'حذف موفق', color: 'success' })
    grid.loadData()
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

// ویرایش صفحه (رفتن به صفحه اختصاصی)
const goToEditPage = (id: number) => {
  navigateTo(`panel/admin/universities/edit/${id}`)
}
</script>

<template>
  <div>
    <!-- هدر و دکمه افزودن -->
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">مدیریت دانشگاه‌ها</h1>
      <UButton color="primary" @click="openCreateModal">
        افزودن دانشگاه
      </UButton>
    </div>

    <!-- نوار فیلترها (با دکمه مجزا) -->
    <UCard class="mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <UFormField label="نام دانشگاه" class="flex-1 min-w-[200px]">
          <UInput v-model="filterTitle" placeholder="جستجو..." class="w-full" />
        </UFormField>
        <UFormField label="استان" class="w-48">
          <USelect
            v-model="filterProvinceId"
            :items="[{ label: 'همه استان‌ها', value: null }, ...provinces.map(p => ({ label: p.name, value: p.id }))]"
            class="w-full"
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
          />
        </UFormField>
        <div class="flex gap-2">
          <UButton @click="applyFilters">اعمال فیلترها</UButton>
          <UButton color="neutral" variant="ghost" @click="clearFilters">حذف فیلترها</UButton>
        </div>
      </div>
    </UCard>

    <!-- جدول داده‌ها -->
    <DataGrid
      :columns="columns"
      :data="grid.data.value"
      :totals="grid.totals.value"
      :total-pages="grid.totalPages.value"
      :current-page="grid.currentPage.value"
      :page-size="grid.pageSize.value"
      :loading="grid.loading.value"
      :sort="grid.sort.value"
      @update:page="grid.setPage"
      @update:page-size="grid.setPageSize"
      @update:sort="grid.setSort"
    >
      <!-- وضعیت فعال -->
      <template #cell-isActive="{ value }">
        <UBadge :color="value ? 'success' : 'error'" variant="subtle">
          {{ value ? 'فعال' : 'غیرفعال' }}
        </UBadge>
      </template>

      <!-- وضعیت قابل نمایش -->
      <template #cell-isVisible="{ value }">
        <UBadge :color="value ? 'success' : 'neutral'" variant="subtle">
          {{ value ? 'نمایش' : 'مخفی' }}
        </UBadge>
      </template>

      <!-- دکمه‌های عمودی با عرض یکسان -->
      <template #cell-actions="{ row }">
        <div class="flex flex-col gap-2 w-32">
          <UButton size="sm" color="neutral" variant="outline" @click="openEditModal(row)">
            <UIcon name="i-lucide-edit" class="ml-1" /> ویرایش
          </UButton>
          <UButton size="sm" color="neutral" variant="outline" @click="showPreview(row.description)">
            <UIcon name="i-lucide-eye" class="ml-1" /> پیش‌نمایش
          </UButton>
          <UButton size="sm" color="error" variant="outline" @click="confirmDelete(row.id)">
            <UIcon name="i-lucide-trash" class="ml-1" /> حذف
          </UButton>
          <UButton size="sm" color="primary" variant="outline" @click="goToEditPage(row.id)">
            <UIcon name="i-lucide-file-text" class="ml-1" /> ویرایش صفحه
          </UButton>
        </div>
      </template>
    </DataGrid>

    <!-- مودال افزودن/ویرایش دانشگاه -->
    <UModal v-model:open="modalOpen" :title="editingId ? 'ویرایش دانشگاه' : 'افزودن دانشگاه'" class="max-w-4xl">
      <template #body>
        <UForm :state="form" @submit="submitForm" class="space-y-4">
          <UFormField label="نام دانشگاه" required>
            <UInput v-model="form.title" class="w-full" />
          </UFormField>

          <UFormField label="استان" required>
            <USelect
              v-model="form.provinceId"
              :items="provinces.map(p => ({ label: p.name, value: p.id }))"
              class="w-full"
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

    <!-- مودال پیش‌نمایش HTML -->
    <UModal v-model:open="previewOpen" title="پیش‌نمایش توضیحات" class="max-w-4xl">
      <template #body>
        <div class="prose prose-sm dark:prose-invert max-w-none" v-html="previewHtml" />
      </template>
    </UModal>
  </div>
</template>
