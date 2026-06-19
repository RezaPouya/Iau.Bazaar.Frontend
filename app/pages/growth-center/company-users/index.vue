<!-- app/pages/growth-center/company-users/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import type { Company, CompanyUser } from '~/types/company'
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'

definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'مدیریت کاربران شرکت‌ها'
})

const toast = useToast()
const growthCenterService = useGrowthCenterService()

// ========== State ==========
const users = ref<CompanyUser[]>([])
const companies = ref<Company[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Filters
const filterFullName = ref('')
const filterUserName = ref('')
const filterPhoneNumber = ref('')
const filterIsActive = ref<string | null>(null)
const selectedCompanyId = ref<number | null>(null)

// Modal states
const addUserModalOpen = ref(false)
const userIdToAdd = ref<number | null>(null)
const addingUser = ref(false)

// ========== Columns ==========
const columns = [
  { key: 'userId', label: 'شناسه کاربر', sortable: true },
  { key: 'fullName', label: 'نام کامل', sortable: true },
  { key: 'userName', label: 'نام کاربری', sortable: true },
  { key: 'phoneNumber', label: 'شماره تماس', sortable: true },
  { key: 'companyTitle', label: 'شرکت', sortable: true },
  { key: 'isActive', label: 'فعال', sortable: true },
  { key: 'joinedAtPersian', label: 'تاریخ عضویت', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

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

// ========== Load Data ==========
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
    if (filterIsActive.value !== null) {
      filters.push({
        propertyName: 'isActive',
        operation: GridFilterOperation.Equals,
        value: filterIsActive.value
      })
    }

    // Get users from all companies under this growth center
    if (companies.value.length === 0) {
      users.value = []
      totals.value = 0
      totalPages.value = 0
      loading.value = false
      return
    }

    const allUsers: CompanyUser[] = []
    let totalCount = 0

    for (const company of companies.value) {
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

      try {
        const result = await growthCenterService.getCompanyUsers(company.id, request)
        const usersWithCompany = result.data.map((u: any) => ({
          ...u,
          companyTitle: company.title
        }))
        allUsers.push(...usersWithCompany)
        totalCount += result.totals || 0
      } catch (error) {
        console.error(`Error loading users for company ${company.id}:`, error)
      }
    }

    users.value = allUsers
    totals.value = totalCount
    totalPages.value = Math.ceil(totalCount / pageSize.value)
  } catch (error: any) {
    console.error('Error loading users:', error)
    toast.add({ title: 'خطا در دریافت کاربران', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ========== Pagination ==========
const setPage = (page: number) => {
  currentPage.value = page
  loadData()
}

const setPageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// ========== Sorting ==========
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

// ========== Filters ==========
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filterFullName.value = ''
  filterUserName.value = ''
  filterPhoneNumber.value = ''
  filterIsActive.value = null
  selectedCompanyId.value = null
  currentPage.value = 1
  loadData()
}

// ========== Add User ==========
const addUser = async () => {
  if (!selectedCompanyId.value || !userIdToAdd.value) {
    toast.add({ title: 'لطفاً شرکت و شناسه کاربر را وارد کنید', color: 'warning' })
    return
  }

  addingUser.value = true
  try {
    await growthCenterService.addUserToCompany(selectedCompanyId.value, userIdToAdd.value)
    toast.add({ title: 'کاربر با موفقیت به شرکت اضافه شد', color: 'success' })
    addUserModalOpen.value = false
    userIdToAdd.value = null
    await loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در افزودن کاربر به شرکت',
      color: 'error'
    })
  } finally {
    addingUser.value = false
  }
}

// ========== Remove User ==========
const removeUser = async (companyId: number, userId: number, userName: string) => {
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف کاربر "${userName}" از این شرکت اطمینان دارید؟`,
    color: 'error',
    actions: [
      {
        label: 'بله',
        onClick: async () => {
          try {
            await growthCenterService.removeUserFromCompany(companyId, userId)
            toast.add({ title: 'کاربر با موفقیت از شرکت حذف شد', color: 'success' })
            await loadData()
          } catch (error: any) {
            toast.add({
              title: error.response?.data?.message || 'خطا در حذف کاربر از شرکت',
              color: 'error'
            })
          }
        }
      },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// ========== Toggle User Active ==========
const toggleUserActive = async (companyId: number, userId: number, isActive: boolean) => {
  try {
    await growthCenterService.toggleCompanyUserActive(companyId, userId, !isActive)
    toast.add({ title: 'وضعیت کاربر با موفقیت تغییر کرد', color: 'success' })
    await loadData()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در تغییر وضعیت کاربر',
      color: 'error'
    })
  }
}

// ========== Computed ==========
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totals.value))

// ========== Lifecycle ==========
onMounted(async () => {
  await loadCompanies()
  await loadData()
})

// Reload when companies change
watch(companies, () => {
  loadData()
})
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت کاربران شرکت‌ها</h1>
        <UButton color="primary" size="sm" @click="addUserModalOpen = true">
          <UIcon name="i-lucide-plus" class="ml-1 size-4" />
          افزودن کاربر به شرکت
        </UButton>
      </div>

      <!-- Info Card -->
      <UCard class="mb-3 bg-primary-50 dark:bg-primary-900/10 p-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-info" class="size-5 text-primary-600" />
          <span class="text-dimmed">
            در این بخش می‌توانید کاربران شرکت‌های زیرمجموعه مرکز رشد خود را مدیریت کنید.
            کاربران با نقش
            <span class="font-semibold">CompanyUser</span>
            می‌توانند به شرکت‌ها اضافه شوند.
          </span>
        </div>
      </UCard>

      <!-- Filters -->
      <UCard class="mb-3 p-3">
        <div class="flex flex-wrap gap-2 items-end">
          <UFormField label="نام کامل" class="flex-1 min-w-[120px]">
            <UInput v-model="filterFullName" placeholder="جستجو..." class="w-full text-right" />
          </UFormField>
          <UFormField label="نام کاربری" class="w-36">
            <UInput v-model="filterUserName" placeholder="نام کاربری..." class="w-full text-right" />
          </UFormField>
          <UFormField label="شماره تماس" class="w-32">
            <UInput v-model="filterPhoneNumber" placeholder="شماره تماس..." class="w-full text-left" />
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
              <tr
                v-for="item in users"
                :key="item.userId"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-1.5 text-center">{{ item.userId }}</td>
                <td class="px-3 py-1.5 text-right">{{ item.fullName }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.userName }}</td>
                <td class="px-3 py-1.5 text-left">{{ item.phoneNumber }}</td>
                <td class="px-3 py-1.5 text-center">{{ item.companyTitle }}</td>
                <td class="px-3 py-1.5 text-center">
                  <UBadge :color="item.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-3 py-1.5 text-center">{{ item.joinedAtPersian }}</td>
                <td class="px-3 py-1.5 text-center">
                  <div class="flex justify-center gap-1">
                    <UButton
                      size="xs"
                      :color="item.isActive ? 'error' : 'success'"
                      variant="ghost"
                      @click="toggleUserActive(item.companyId, item.userId, item.isActive)"
                    >
                      <UIcon :name="item.isActive ? 'i-lucide-user-x' : 'i-lucide-user-check'" />
                    </UButton>
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      @click="removeUser(item.companyId, item.userId, item.fullName)"
                    >
                      <UIcon name="i-lucide-trash" />
                    </UButton>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ کاربری یافت نشد</td>
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
            <USelect v-model="pageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setPageSize" />
          </div>
        </div>
      </div>

      <!-- Add User Modal -->
      <UModal v-model:open="addUserModalOpen" title="افزودن کاربر به شرکت" class="max-w-md">
        <template #body>
          <UForm class="space-y-4" @submit.prevent="addUser">
            <UFormField label="شرکت" required>
              <USelect
                v-model="selectedCompanyId"
                :items="
                  companies.map((c) => ({
                    label: c.title,
                    value: c.id
                  }))
                "
                class="w-full"
                :popper="{ placement: 'bottom-end' }"
                placeholder="انتخاب شرکت..."
              />
            </UFormField>

            <UFormField label="شناسه کاربر" required>
              <UInput
                v-model.number="userIdToAdd"
                type="number"
                placeholder="شناسه کاربر را وارد کنید"
                class="w-full text-left"
              />
              <template #description>
                <span class="text-xs text-dimmed">
                  کاربر باید نقش
                  <span class="font-semibold">CompanyUser</span>
                  داشته باشد
                </span>
              </template>
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="addUserModalOpen = false"> انصراف </UButton>
              <UButton type="submit" color="primary" :loading="addingUser"> افزودن </UButton>
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
