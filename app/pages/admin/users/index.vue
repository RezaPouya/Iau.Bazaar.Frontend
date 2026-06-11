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
  { key: 'userId', label: 'شناسه', sortable: true },
  { key: 'fullName', label: 'نام کامل', sortable: true },
  { key: 'userName', label: 'نام کاربری', sortable: true },
  { key: 'phoneNumber', label: 'شماره تماس', sortable: true },
  { key: 'role', label: 'نقش', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ثبت‌نام', sortable: true },
  { key: 'lastLoginAtPersian', label: 'آخرین ورود', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Roles
const roles = ref<{ id: string; name: string; nameFa: string }[]>([])
const fetchRoles = async () => {
  try {
    const response = await $api.get('panel/admin/users/roles')
    console.log(response)
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
        value: filterIsActive.value
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

    const result = await userService.getUsersList(request)
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
    userId: user.userId,
    fullName: user.fullName
  }
  passwordModalOpen.value = true
}

// Save user
const handleSave = async (formData: any) => {
  try {
    if (formData.userId) {
      const { userId, ...updateData } = formData
      await userService.updateUser(userId, updateData)
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await userService.createUser(formData)
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    formModalOpen.value = false
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
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
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر رمز عبور', color: 'error' })
  }
}

// Delete user
const deleteUser = async (userId: number) => {
  try {
    await userService.deleteUser(userId)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

// Toggle active
const toggleActive = async (userId: number) => {
  try {
    await userService.toggleUserActive(userId)
    toast.add({ title: 'وضعیت با موفقیت تغییر کرد', color: 'success' })
    loadData()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
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
    User: 'info',
    CompanyAdmin: 'primary'
  }
  return roleColors[role] || 'neutral'
}

const getRoleName = (role: string) => {
  const roleNames: Record<string, string> = {
    Admin: 'مدیر',
    Operator: 'اپراتور',
    User: 'کاربر عادی',
    CompanyAdmin: 'مدیر شرکت'
  }
  return roleNames[role] || role
}

onMounted(async () => {
  await fetchRoles()
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت کاربران</h1>
        <UButton color="primary" size="sm" @click="openCreateModal"> افزودن کاربر </UButton>
      </div>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام کامل" class="flex-1 min-w-[150px]">
            <UInput v-model="filterFullName" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="نام کاربری" class="w-40">
            <UInput v-model="filterUserName" placeholder="نام کاربری..." class="w-full text-right" />
          </UFormField>
          <UFormField label="شماره تماس" class="w-36">
            <UInput v-model="filterPhoneNumber" placeholder="شماره تماس..." class="w-full text-left" />
          </UFormField>
          <UFormField label="نقش کاربری" class="w-32">
            <USelect
              v-model="filterRole"
              :items="[{ label: 'همه نقش‌ها', value: null }, ...roles.map((r) => ({ label: r.nameFa || r.name, value: r.id }))]"
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
              <tr v-for="item in data" :key="item.userId" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-3 py-1.5 text-center">{{ item.userId }}</td>
                <td class="px-3 py-1.5 text-right">{{ item.fullName }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.userName }}</td>
                <td class="px-3 py-1.5 text-left">{{ item.phoneNumber }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="getRoleColor(item.role)" variant="subtle" size="sm">
                    {{ getRoleName(item.role) }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.lastLoginAtPersian || '—' }}</td>
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
                          label: 'تغییر رمز عبور',
                          icon: 'i-lucide-key',
                          onSelect: () => openPasswordModal(item)
                        },
                        {
                          label: 'تغییر وضعیت',
                          icon: item.isActive ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
                          onSelect: () => toggleActive(item.userId)
                        },
                        {
                          label: 'حذف',
                          icon: 'i-lucide-trash',
                          color: 'error',
                          onSelect: () => confirmDelete(item.userId, item.fullName)
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
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ کاربری یافت نشد</td>
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

      <!-- Modals -->
      <UserFormModal
        v-model:open="formModalOpen"
        :editing-id="editingUser?.userId || null"
        :initial-data="editingUser || undefined"
        :roles="roles"
        @save="handleSave"
      />

      <UserPasswordModal v-model:open="passwordModalOpen" :user-name="selectedUserForPassword?.fullName || ''" @save="handleResetPassword" />
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
