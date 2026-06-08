<!-- app/components/admin/company/CompanyUsersModal.vue -->
<script setup lang="ts">
import type { GridDataSourceRequest } from '~/types/grid'

const props = defineProps<{
  open: boolean
  companyId: number | null
  companyTitle: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { $api } = useNuxtApp()
const toast = useToast()

// State
const users = ref<any[]>([])
const loading = ref(false)
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const searchTerm = ref('')

// User to add
const addUserModalOpen = ref(false)
const userIdToAdd = ref<number | null>(null)
const addingUser = ref(false)

// Load users
const loadUsers = async () => {
  if (!props.companyId) return

  loading.value = true
  try {
    const request: GridDataSourceRequest = {
      page: currentPage.value,
      pageSize: pageSize.value,
      inputParams: {
        filters: [],
        sort: null
      }
    }

    const response = await $api.post(
      `/api/admin/companies/${props.companyId}/users/list`,
      request
    )
    const result = response.data
    users.value = result.data ?? []
    totals.value = result.totals ?? 0
    totalPages.value = result.totalPages ?? 0
    currentPage.value = result.page ?? 1
  } catch (error: any) {
    console.error('Error loading users:', error)
    toast.add({ title: 'خطا در دریافت کاربران', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Add user to company
const addUser = async () => {
  if (!props.companyId || !userIdToAdd.value) return

  addingUser.value = true
  try {
    await $api.post(
      `/api/admin/companies/${props.companyId}/users/add/${userIdToAdd.value}`
    )
    toast.add({ title: 'کاربر با موفقیت اضافه شد', color: 'success' })
    addUserModalOpen.value = false
    userIdToAdd.value = null
    await loadUsers()
  } catch (error: any) {
    toast.add({
      title: error.response?.data?.message || 'خطا در افزودن کاربر',
      color: 'error'
    })
  } finally {
    addingUser.value = false
  }
}

// Remove user from company
const removeUser = async (userId: number) => {
  if (!props.companyId) return

  try {
    await $api.delete(`/api/admin/companies/${props.companyId}/users/${userId}`)
    toast.add({ title: 'کاربر با موفقیت حذف شد', color: 'success' })
    await loadUsers()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف کاربر', color: 'error' })
  }
}

// Toggle user active status
const toggleUserActive = async (userId: number, isActive: boolean) => {
  if (!props.companyId) return

  try {
    await $api.patch(
      `/api/admin/companies/${props.companyId}/users/${userId}/toggle-active`,
      !isActive
    )
    toast.add({ title: 'وضعیت کاربر با موفقیت تغییر کرد', color: 'success' })
    await loadUsers()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

// Confirm remove user
const confirmRemoveUser = (userId: number, userName: string) => {
  const toast = useToast()
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف کاربر "${userName}" از این شرکت اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => removeUser(userId) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// Watch for modal open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.companyId) {
      currentPage.value = 1
      loadUsers()
    }
  }
)

const closeModal = () => {
  emit('update:open', false)
}

const setPage = (page: number) => {
  currentPage.value = page
  loadUsers()
}
</script>

<template>
  <UModal :open="open" :title="`مدیریت کاربران - ${companyTitle}`" class="max-w-4xl" @update:open="closeModal">
    <template #body>
      <div class="space-y-4">
        <!-- Header with add button -->
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">لیست کاربران</h3>
          <UButton size="sm" @click="addUserModalOpen = true">
            افزودن کاربر
          </UButton>
        </div>

        <!-- Users Table -->
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-3 py-1.5 text-center border-b">نام کامل</th>
                  <th class="px-3 py-1.5 text-center border-b">نام کاربری</th>
                  <th class="px-3 py-1.5 text-center border-b">شماره تماس</th>
                  <th class="px-3 py-1.5 text-center border-b">وضعیت</th>
                  <th class="px-3 py-1.5 text-center border-b">تاریخ عضویت</th>
                  <th class="px-3 py-1.5 text-center border-b">عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.userId" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-3 py-1.5 text-center">{{ user.fullName }}</td>
                  <td class="px-3 py-1.5 text-center">{{ user.userName }}</td>
                  <td class="px-3 py-1.5 text-center">{{ user.phoneNumber }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle" size="sm">
                      {{ user.isActive ? 'فعال' : 'غیرفعال' }}
                    </UBadge>
                  </td>
                  <td class="px-3 py-1.5 text-center">{{ user.joinedAtPersian }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <div class="flex justify-center gap-1">
                      <UButton
                        size="xs"
                        :color="user.isActive ? 'error' : 'success'"
                        variant="ghost"
                        @click="toggleUserActive(user.userId, user.isActive)"
                      >
                        <UIcon :name="user.isActive ? 'i-lucide-user-x' : 'i-lucide-user-check'" />
                      </UButton>
                      <UButton
                        size="xs"
                        color="error"
                        variant="ghost"
                        @click="confirmRemoveUser(user.userId, user.fullName)"
                      >
                        <UIcon name="i-lucide-trash" />
                      </UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td :colspan="6" class="px-3 py-4 text-center text-gray-500">
                    هیچ کاربری یافت نشد
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 0" class="flex justify-between items-center mt-3 text-sm">
            <div class="text-gray-500">
              {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totals) }} از {{ totals }}
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
              <span class="text-sm mx-1">صفحه {{ currentPage }} از {{ totalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="currentPage >= totalPages"
                @click="setPage(currentPage + 1)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Add User Modal -->
  <UModal v-model:open="addUserModalOpen" title="افزودن کاربر به شرکت" class="max-w-md">
    <template #body>
      <UForm class="space-y-4" @submit.prevent="addUser">
        <UFormField label="شناسه کاربر" required>
          <UInput
            v-model.number="userIdToAdd"
            type="number"
            placeholder="شناسه کاربر را وارد کنید"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="addUserModalOpen = false">
            انصراف
          </UButton>
          <UButton type="submit" color="primary" :loading="addingUser">
            افزودن
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
