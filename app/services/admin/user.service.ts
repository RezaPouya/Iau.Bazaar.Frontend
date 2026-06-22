// app/services/admin/user.service.ts
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '~/types/user'
import type { GridDataSourceResult } from '~/types/grid'

// شکل دقیق بدنه‌ی درخواست لیست کاربران - باید با UserListFilterDto در بک‌اند یکی باشد.
// توجه: AdminUserManagementController برخلاف بقیه‌ی گریدهای پروژه، فیلتر را از
// inputParams.filters نمی‌خواند؛ بلکه searchTerm/isActive/isLockedOut/role را به صورت
// فیلد مستقیم در بدنه‌ی JSON می‌خواند.
export interface UserListRequest {
  page: number
  pageSize: number
  inputParams?: {
    filters: never[]
    sort: null
  }
  searchTerm?: string | null
  isActive?: boolean | null
  isLockedOut?: boolean | null
  role?: number | null
}

export const useAdminUserService = () => {
  const { $api } = useNuxtApp()

  // نکته‌ی مهم: AdminUserManagementController از ApiResponse<T> استفاده نمی‌کند و
  // مستقیماً Ok(dto) برمی‌گرداند. یعنی response.data همان DTO است، نه { data: DTO }.
  // (برای GetList این به‌طور تصادفی کار می‌کرد چون GridDataSourceResult خودش هم یک
  // فیلد data دارد، اما برای create/update/getById کاملاً اشتباه بود.)

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

  const getRoles = async (): Promise<UserRole[]> => {
    const response = await $api.get<UserRole[]>('panel/admin/users/roles')
    return response.data
  }

  // عمداً حذف شد: resetUserPassword
  // دلیل: بک‌اند فعلی هیچ endpoint ای برای تغییر رمز عبور کاربر موجود ندارد
  // (نه در UserCoreService و نه در AdminUserManagementController).
  // UpdateUserInputDto هم فیلد رمز عبور ندارد. اضافه کردن این قابلیت نیازمند
  // تغییر بک‌اند است که طبق تصمیم فعلی، فعلاً انجام نمی‌شود.

  return {
    getUsersList,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    getRoles
  }
}
