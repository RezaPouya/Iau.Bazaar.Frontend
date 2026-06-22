// app/services/admin/user.service.ts
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '~/types/user'
import type { GridDataSourceResult } from '~/types/grid'

// شکل دقیق درخواست لیست کاربران - UserListFilterDto در بک‌اند
// توجه: این کنترلر برخلاف بقیه‌ی گرید‌ها، فیلترها را از inputParams.filters نمی‌خواند،
// بلکه searchTerm / isActive / isLockedOut / role را به صورت فیلدهای مستقیم می‌خواند.
export interface UserListRequest {
  page: number
  pageSize: number
  inputParams?: {
    filters: never[]
    sort: { propertyName: string; ascending: boolean } | null
  }
  searchTerm?: string | null
  isActive?: boolean | null
  isLockedOut?: boolean | null
  role?: number | null
}

export const useAdminUserService = () => {
  const { $api } = useNuxtApp()

  // توجه مهم: AdminUserManagementController از ApiResponse<T> استفاده نمی‌کند،
  // بلکه مستقیماً Ok(dto) برمی‌گرداند. بنابراین response.data خودِ DTO است، نه { data: DTO }.

  const getUsersList = async (request: UserListRequest): Promise<GridDataSourceResult<User>> => {
    const response = await $api.post<GridDataSourceResult<User>>('panel/admin/users/list', request)
    return response.data
  }

  const getUserById = async (userId: number): Promise<User> => {
    const response = await $api.get<User>(`panel/admin/users/${userId}`)
    return response.data
  }

  const createUser = async (data: CreateUserInput): Promise<User> => {
    const response = await $api.post<User>('panel/admin/users', data)
    return response.data
  }

  const updateUser = async (userId: number, data: UpdateUserInput): Promise<User> => {
    const response = await $api.put<User>(`panel/admin/users/${userId}`, data)
    return response.data
  }

  const deleteUser = async (userId: number): Promise<void> => {
    await $api.delete(`panel/admin/users/${userId}`)
  }

  const toggleUserActive = async (userId: number): Promise<void> => {
    await $api.patch(`panel/admin/users/${userId}/toggle-active`)
  }

  // نکته: بدنه باید { newPassword } باشد (نه { password })، چون بک‌اند ResetPasswordRequestBody.NewPassword را می‌خواند
  const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
    await $api.post(`panel/admin/users/${userId}/reset-password`, { newPassword })
  }

  const getRoles = async (): Promise<UserRole[]> => {
    const response = await $api.get<UserRole[]>('panel/admin/users/roles')
    return response.data
  }

  return {
    getUsersList,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    resetUserPassword,
    getRoles
  }
}
