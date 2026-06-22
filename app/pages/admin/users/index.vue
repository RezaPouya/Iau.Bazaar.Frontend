<!-- app/pages/admin/users/index.vue -->
<script setup lang="ts">
import { useAdminUserService, type UserListRequest } from '~/services/admin/user.service'
import UserFormModal from '~/components/admin/user/UserFormModal.vue'
import UserPasswordModal from '~/components/admin/user/UserPasswordModal.vue'
import type { UserRole } from '~/types/user'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت کاربران',
  ssr: false
})

const toast = useToast()
const userService = useAdminUserService()

// ---------- ستون‌ها ----------
const columns = [
  { key: 'id', label: 'شناسه' },
  { key: 'fullName', label: 'نام کامل' },
  { key: 'userName', label: 'نام کاربری' },
  { key: 'phoneNumber', label: 'شماره تماس' },
  { key: 'role', label: 'نقش' },
  { key: 'isActive', label: 'فعال' },
  { key: 'createdAt', label: 'تاریخ ثبت‌نام' },
  { key: 'lockoutEnd', label: 'وضعیت قفل' },
  { key: 'actions', label: 'عملیات' }
]

// فرمت تاریخ
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

// ---------- نقش‌ها ----------
// خروجی panel/admin/users/roles دقیقاً { id: number (مقدار enum), name: string } است
const roles = ref<UserRole[]>([])
const fetchRoles = async () => {
  try {
    roles.value = await userService.getRoles()
  } catch (error) {
    console.error('خطا در دریافت نقش‌ها', error)
    toast.add({ title: 'خطا در دریافت نقش‌ها', color: 'error' })
  }
}

// نام نقش از روی مقدار رشته‌ای که UserOutputDto.Role برمی‌گرداند (مثل "Admin"، "CompanyUser")
const roleLabelMap: Record<string, string> = {
  Admin: 'مدیر سامانه',
  Operator: 'اپراتور سامانه',
  Customer: 'مشتری حقیقی',
  LegalCustomer: 'مشتری حقوقی',
  UniversityUser: 'مسئول دانشگاه',
  GrowthCenterUser: 'مسئول مرکز رشد',
  CompanyUser: 'مسئول شرکت'
}

const roleColorMap: Record<string, string> = {
  Admin: 'error',
  Operator: 'warning',
  Customer: 'info',
  LegalCustomer: 'info',
  UniversityUser: 'primary',
  GrowthCenterUser: 'primary',
  CompanyUser: 'primary'
}

const getRoleName = (role: string) => roleLabelMap[role] || role
const getRoleColor = (role: string) => roleColorMap[role] || 'neutral'

// ---------- فیلترها ----------
const filterSearchTerm = ref('')
const filterRole = ref<number | null>(null)
const filterIsActive = ref<string | null>(null)

// ---------- وضعیت گرید ----------
const data = ref<any[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// ---------- بارگذاری داده‌ها ----------
// نکته مهم: AdminUserManagementController فیلترها را از inputParams.filters نمی‌خواند،
// بلکه searchTerm / isActive / isLockedOut / role را به صورت فیلدهای مستقیم در بدنه‌ی درخواست می‌خواند.
const loadData = async () => {
  loading.value = true
  try {
    const request: UserListRequest = {
      page: currentPage.value,
      pageSize: pageSize.value,
      inputParams: { filters: [], sort: null },
      searchTerm: filterSearchTerm.value.trim() || null,
      isActive: filterIsActive.value !== null ? filterIsActive.value === 'true' : null,
      role: filterRole.value
    }

    const result = await userService.getUsersList(request)

    data.value = result.data || []
    totals.value = result.totals || 0
    currentPage.value = result.page || 1
    pageSize.value = result.pageSize || pageSize.value
  } catch (err: any) {
    console.error('Error loading users:', err)
    toast.add({
      title: 'خطا در بارگذاری داده‌ها',
      description: err.response?.data?.message || err.message || 'لطفاً دوباره تلاش کنید',
      color: 'error'
    })
    data.value = []
    totals.value = 0
  } finally {
    loading.value = false
  }
}

// ---------- صفحه‌بندی ----------
const totalPages = computed(() => Math.max(1, Math.ceil(totals.value / pageSize.value)))
const startIndex = computed(() => (totals.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
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

// ---------- فیلترها ----------
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filterSearchTerm.value = ''
  filterRole.value = null
  filterIsActive.value = null
  currentPage.value = 1
  loadData()
}

// ---------- مودال‌ها ----------
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

// ---------- ذخیره کاربر ----------
const handleSave = async (formData: any) => {
  try {
    if (formData.id) {
      const { id, password, ...updateData } = formData
      await userService.updateUser(id, updateData)
      // اگر رمز جدید هم وارد شده بود، جدا ارسال می‌شود
      if (password) {
        await userService.resetUserPassword(id, password)
      }
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

// ---------- تغییر رمز عبور ----------
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

// ---------- حذف کاربر ----------
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

// ---------- فعال/غیرفعال ----------
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

onMounted(async () => {
  await fetchRoles()
  await loadData()
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

      <!-- فیلترها -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="جستجو" class="flex-1 min-w-[200px]">
            <UInput
              v-model="filterSearchTerm"
              placeholder="نام، نام کاربری، شماره تماس، ایمیل یا کد ملی..."
              class="w-full text-right"
              @keyup.enter="applyFilters"
            />
          </UFormField>
          <UFormField label="نقش کاربری" class="w-40">
            <USelect
              v-model="filterRole"
              :items="[{ label: 'همه نقش‌ها', value: null }, ...roles.map((r) => ({ label: r.name, value: r.id }))]"
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

      <!-- بارگذاری -->
      <UCard v-if="loading" class="flex justify-center py-8">
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
          <span class="text-sm text-gray-500">در حال بارگذاری...</span>
        </div>
      </UCard>

      <!-- جدول -->
      <div v-else>
        <UCard class="overflow-hidden p-0">
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-900 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="col in columns"
                    :key="col.key"
                    class="px-3 py-2 text-center border-b border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center justify-center gap-1 whitespace-nowrap">
                      {{ col.label }}
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
                  <td class="px-3 py-2 text-center">
                    <UBadge v-if="item.isLockedOut" color="error" variant="subtle" size="sm">قفل شده</UBadge>
                    <span v-else class="text-gray-400">—</span>
                  </td>
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

          <!-- صفحه‌بندی -->
          <div v-if="totals > 0" class="flex flex-wrap justify-between items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
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

      <!-- مودال‌ها -->
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
