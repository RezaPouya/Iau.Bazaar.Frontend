<!-- app/pages/admin/users/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import { useAdminUserService } from '~/services/admin/user.service'
import UserFormModal from '~/components/admin/user/UserFormModal.vue'
import UserPasswordModal from '~/components/admin/user/UserPasswordModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت کاربران'
})

const { $api } = useNuxtApp()
const toast = useToast()
const userService = useAdminUserService()

// Columns
const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'fullName', label: 'نام کامل', sortable: true },
  { key: 'userName', label: 'نام کاربری', sortable: true },
  { key: 'phoneNumber', label: 'شماره تماس', sortable: true },
  { key: 'role', label: 'نقش', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'createdAt', label: 'تاریخ ثبت‌نام', sortable: true },
  { key: 'lockoutEnd', label: 'آخرین ورود', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Format Persian date
const formatPersianDate = (dateString: string | null) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return '—'
  }
}

// Roles
const roles = ref<{ id: string; name: string; nameFa: string }[]>([])
const fetchRoles = async () => {
  try {
    const response = await $api.get('panel/admin/users/roles')
    console.log('Roles response:', response)
    roles.value = response.data.data || response.data || []
  } catch (error) {
    console.error('خطا در دریافت نقش‌ها', error)
  }
}

// Filters
const filterFullName = ref('')
const filterUserName = ref('')
const filterPhoneNumber = ref('')
const filterRole = ref<string | null>(null)
const filterIsActive = ref<string | null>(null)

// Grid state
const data = ref<any[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

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
    if (filterUserName.value.trim()) {
      filters.push({
        propertyName: 'userName',
        operation: GridFilterOperation.Contains,
        value: filterUserName.value.trim()
      })
    }
    if (filterPhoneNumber.value.trim()) {
      filters.push({
        propertyName: 'phoneNumber',
        operation: GridFilterOperation.Contains,
        value: filterPhoneNumber.value.trim()
      })
    }
    if (filterRole.value) {
      filters.push({
        propertyName: 'role',
        operation: GridFilterOperation.Equals,
        value: filterRole.value
      })
    }
    if (filterIsActive.value !== null) {
      filters.push({
        propertyName: 'isActive',
        operation: GridFilterOperation.Equals,
        value: filterIsActive.value === 'true'
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

    console.log('Request payload:', request)

    // Try direct API call first to see if it works
    try {
      const directResponse = await $api.post('panel/admin/users/list', request)
      console.log('Direct API response:', directResponse)
      console.log('Direct API data:', directResponse.data)

      // If direct call works, use that data
      if (directResponse.data && directResponse.data.data) {
        const responseData = directResponse.data.data
        data.value = responseData.data || responseData || []
        totals.value = responseData.totals || responseData.total || 0
        currentPage.value = responseData.page || 1
        pageSize.value = responseData.pageSize || 10
        console.log('Data loaded successfully:', data.value)
        return
      }
    } catch (directError) {
      console.error('Direct API call failed, trying service:', directError)
    }

    // Fallback to service call
    const result = await userService.getUsersList(request)
    console.log('Service response:', result)

    // Handle different response structures
    if (result && result.data) {
      data.value = result.data
      totals.value = result.totals || result.total || 0
      currentPage.value = result.page || 1
      pageSize.value = result.pageSize || 10
    } else if (Array.isArray(result)) {
      data.value = result
      totals.value = result.length
    } else {
      data.value = result || []
      totals.value = 0
    }

    console.log('Final data:', data.value)
    console.log('Total records:', totals.value)

  } catch (err: any) {
    console.error('Error loading data:', err)
    toast.add({
      title: 'خطا در بارگذاری داده‌ها',
      description: err.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
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
}

const clearFilters = () => {
  filterFullName.value = ''
  filterUserName.value = ''
  filterPhoneNumber.value = ''
  filterRole.value = null
  filterIsActive.value = null
  currentPage.value = 1
  loadData()
}

// Modal states
const formModalOpen = ref(false)
const editingUser = ref<any>(null)
const passwordModalOpen = ref(false)
const selectedUserForPassword = ref<{ userId: number; fullName: string } | null>(null)

const openCreateModal = () => {
  editingUser.value = null
  formModalOpen.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = user
  formModalOpen.value = true
}

const openPasswordModal = (user: any) => {
  selectedUserForPassword.value = {
    userId: user.id,
    fullName: user.fullName
  }
  passwordModalOpen.value = true
}

// Save user
const handleSave = async (formData: any) => {
  try {
    if (formData.id) {
      const { id, ...updateData } = formData
      await userService.updateUser(id, updateData)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await userService.createUser(formData)
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({
      title: 'خطا در ذخیره',
      description: error.response?.data?.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
  }
}

// Reset password
const handleResetPassword = async (password: string) => {
  if (!selectedUserForPassword.value) return

  try {
    await userService.resetUserPassword(selectedUserForPassword.value.userId, password)
    toast.add({ title: 'رمز عبور با موفقیت تغییر کرد', color: 'success' })
    passwordModalOpen.value = false
    selectedUserForPassword.value = null
  } catch (error: any) {
    toast.add({
      title: 'خطا در تغییر رمز عبور',
      description: error.response?.data?.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
  }
}

// Delete user
const deleteUser = async (userId: number) => {
  try {
    await userService.deleteUser(userId)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({
      title: 'خطا در حذف',
      description: error.response?.data?.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
  }
}

// Toggle active
const toggleActive = async (userId: number) => {
  try {
    await userService.toggleUserActive(userId)
    toast.add({ title: 'وضعیت با موفقیت تغییر کرد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({
      title: 'خطا در تغییر وضعیت',
      description: error.response?.data?.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
  }
}

// Confirm delete
const confirmDelete = (userId: number, fullName: string) => {
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف کاربر "${fullName}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteUser(userId) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// Role badge color
const getRoleColor = (role: string) => {
  const roleColors: Record<string, string> = {
    Admin: 'error',
    Operator: 'warning',
    Customer: 'info',
    CompanyAdmin: 'primary'
  }
  return roleColors[role] || 'neutral'
}

const getRoleName = (role: string) => {
  const roleNames: Record<string, string> = {
    Admin: 'مدیر',
    Operator: 'اپراتور',
    Customer: 'کاربر عادی',
    CompanyAdmin: 'مدیر شرکت'
  }
  return roleNames[role] || role
}

// Debug: Check if data is loading
watch(data, (newVal) => {
  console.log('Data changed:', newVal)
})

watch(totals, (newVal) => {
  console.log('Total changed:', newVal)
})

onMounted(async () => {
  await fetchRoles()
  // Small delay to ensure everything is ready
  setTimeout(() => {
    loadData()
  }, 100)
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex flex-wrap justify-between items-center gap-2">
        <h1 class="text-xl font-bold">مدیریت کاربران</h1>
        <UButton color="primary" size="sm" @click="openCreateModal">
          <UIcon name="i-lucide-plus" class="size-4" />
          افزودن کاربر
        </UButton>
      </div>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام کامل" class="flex-1 min-w-[150px]">
            <UInput
              v-model="filterFullName"
              placeholder="جستجو..."
              class="w-full text-right"
              @keyup.enter="applyFilters"
            />
          </UFormField>
          <UFormField label="نام کاربری" class="w-40">
            <UInput
              v-model="filterUserName"
              placeholder="نام کاربری..."
              class="w-full text-right"
              @keyup.enter="applyFilters"
            />
          </UFormField>
          <UFormField label="شماره تماس" class="w-36">
            <UInput
              v-model="filterPhoneNumber"
              placeholder="شماره تماس..."
              class="w-full text-left"
              @keyup.enter="applyFilters"
            />
          </UFormField>
          <UFormField label="نقش کاربری" class="w-32">
            <USelect
              v-model="filterRole"
              :items="[
                { label: 'همه نقش‌ها', value: null },
                ...roles.map((r) => ({ label: r.nameFa || r.name, value: r.id }))
              ]"
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
          <div class="flex gap-1">
            <UButton size="sm" @click="applyFilters">اعمال</UButton>
            <UButton size="sm" color="neutral" variant="ghost" @click="clearFilters">پاک کردن</UButton>
          </div>
        </div>
      </UCard>

      <!-- Debug Info -->
      <div v-if="!loading" class="mb-2 text-xs text-gray-500">
        تعداد کل: {{ totals }} - تعداد رکوردها: {{ data.length }}
      </div>

      <!-- Loading -->
      <UCard v-if="loading" class="flex justify-center py-8">
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
          <span class="text-sm text-gray-500">در حال بارگذاری...</span>
        </div>
      </UCard>

      <!-- Table -->
      <div v-else>
        <UCard class="overflow-hidden p-0">
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-900 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="col in columns"
                    :key="col.key"
                    class="px-3 py-2 text-center border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="col.sortable && setSort(col.key)"
                  >
                    <div class="flex items-center justify-center gap-1 whitespace-nowrap">
                      {{ col.label }}
                      <UIcon
                        v-if="col.sortable"
                        :name="getSortIcon(col.key)"
                        class="size-3.5 flex-shrink-0"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in data"
                  :key="item.id"
                  class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td class="px-3 py-2 text-center">{{ item.id }}</td>
                  <td class="px-3 py-2 text-right">{{ item.fullName }}</td>
                  <td class="px-3 py-2 text-center">{{ item.userName }}</td>
                  <td class="px-3 py-2 text-left dir-ltr">{{ item.phoneNumber }}</td>
                  <td class="px-3 py-2 text-center">
                    <UBadge :color="getRoleColor(item.role)" variant="subtle" size="sm">
                      {{ getRoleName(item.role) }}
                    </UBadge>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                      {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                    </UBadge>
                  </td>
                  <td class="px-3 py-2 text-center">{{ formatPersianDate(item.createdAt) }}</td>
                  <td class="px-3 py-2 text-center">{{ item.lockoutEnd ? formatPersianDate(item.lockoutEnd) : '—' }}</td>
                  <td class="px-3 py-2 text-center">
                    <UDropdownMenu
                      :items="[
                        [
                          {
                            label: 'ویرایش',
                            icon: 'i-lucide-edit',
                            onSelect: () => openEditModal(item)
                          },
                          {
                            label: 'تغییر رمز عبور',
                            icon: 'i-lucide-key',
                            onSelect: () => openPasswordModal(item)
                          },
                          {
                            label: item.isActive ? 'غیرفعال کردن' : 'فعال کردن',
                            icon: item.isActive ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
                            onSelect: () => toggleActive(item.id)
                          },
                          {
                            label: 'حذف',
                            icon: 'i-lucide-trash',
                            color: 'error',
                            onSelect: () => confirmDelete(item.id, item.fullName)
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
                  <td :colspan="columns.length" class="px-3 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center gap-2">
                      <UIcon name="i-lucide-users" class="size-8 text-gray-300" />
                      <span>هیچ کاربری یافت نشد</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 0" class="flex flex-wrap justify-between items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500">
              نمایش {{ startIndex }} - {{ endIndex }} از {{ totals }} کاربر
            </div>
            <div class="flex gap-1 items-center">
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="currentPage <= 1"
                @click="setPage(currentPage - 1)"
              />
              <span class="text-sm mx-1 whitespace-nowrap">
                صفحه {{ currentPage }} از {{ totalPages }}
              </span>
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
        </UCard>
      </div>

      <!-- Modals -->
      <UserFormModal
        v-model:open="formModalOpen"
        :editing-id="editingUser?.id || null"
        :initial-data="editingUser || undefined"
        :roles="roles"
        @save="handleSave"
      />

      <UserPasswordModal
        v-model:open="passwordModalOpen"
        :user-name="selectedUserForPassword?.fullName || ''"
        @save="handleResetPassword"
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

.dir-ltr {
  direction: ltr !important;
}

table {
  min-height: 100px !important;
}

tr,
tbody {
  vertical-align: top !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .compact-grid :deep(.p-4) {
    padding: 0.5rem !important;
  }

  .compact-grid :deep(.gap-3) {
    gap: 0.25rem !important;
  }

  .compact-grid :deep(.flex-wrap) {
    gap: 0.5rem !important;
  }
}
</style>
