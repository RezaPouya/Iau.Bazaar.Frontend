// app/services/admin/user.service.ts
import type { ApiResponse } from '~/types/api'
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '~/types/user'
import type { GridDataSourceRequest, GridDataSourceResult } from '~/types/grid'

export const useAdminUserService = () => {
  const { $api } = useNuxtApp()

  const getUsersList = async (
    request: GridDataSourceRequest
  ): Promise<GridDataSourceResult<User>> => {
    try {
      // ارسال درخواست
      const response = await $api.post<ApiResponse<GridDataSourceResult<User>>>(
        'panel/admin/users/list',
        request
      )

      // بررسی وجود داده
      if (!response?.data) {
        throw new Error('پاسخی از سرور دریافت نشد')
      }

      // استخراج داده اصلی (response.data.data همان شیء اصلی است)
      const mainData = response.data.data

      // اگر mainData وجود نداشته باشد، از response.data استفاده می‌کنیم (برخی APIها مستقیماً داده را برمی‌گردانند)
      const result = mainData || response.data

      // حالا result شامل page, pageSize, totals, data است
      return {
        data: result.data || [],
        totals: result.totals || 0,
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        totalPages: result.totalPages || 1
      }
    } catch (error) {
      console.error('Error in getUsersList:', error)
      // در صورت خطا، یک ساختار خالی برمی‌گردانیم
      return {
        data: [],
        totals: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }
  }

  // بقیه متدها بدون تغییر
  const getUserById = async (userId: number): Promise<User> => {
    const response = await $api.get<ApiResponse<User>>(`panel/admin/users/${userId}`)
    return response.data.data
  }

  const createUser = async (data: CreateUserInput): Promise<User> => {
    const response = await $api.post<ApiResponse<User>>('panel/admin/users', data)
    return response.data.data
  }

  const updateUser = async (userId: number, data: UpdateUserInput): Promise<User> => {
    const response = await $api.put<ApiResponse<User>>(`panel/admin/users/${userId}`, data)
    return response.data.data
  }

  const deleteUser = async (userId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`panel/admin/users/${userId}`)
  }

  const toggleUserActive = async (userId: number): Promise<User> => {
    const response = await $api.patch<ApiResponse<User>>(`panel/admin/users/${userId}/toggle-active`)
    return response.data.data
  }

  const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
    await $api.post<ApiResponse<void>>(`panel/admin/users/${userId}/reset-password`, { newPassword })
  }

  const getRoles = async (): Promise<UserRole[]> => {
    const response = await $api.get<ApiResponse<UserRole[]>>('panel/admin/users/roles')
    return response.data.data
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
