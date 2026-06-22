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

// شکل استاندارد پاسخ بک‌اند - دقیقاً منطبق با ApiResponse<T> در WebApi
// (همان الگویی که AccountController با ApiResponse<T>.Ok(...).ToHttpResponse() برمی‌گرداند)
export interface ApiResponseBody<T> {
  isSuccess: boolean
  message: string
  statusCode: number
  errors: string[]
  validationErrors: Record<string, string[]>
  data: T
}

export const useAdminUserService = () => {
  const { $api } = useNuxtApp()

  // همه‌ی endpoint های این کنترلر اکنون ApiResponse<T> برمی‌گردانند،
  // پس همیشه response.data.data خود داده‌ی واقعی است.

  const getUsersList = async (request: UserListRequest): Promise<GridDataSourceResult<User>> => {
    const response = await $api.post<ApiResponseBody<GridDataSourceResult<User>>>('panel/admin/users/list', request)
    return response.data.data
  }

  const getUserById = async (userId: number): Promise<User> => {
    const response = await $api.get<ApiResponseBody<User>>(`panel/admin/users/${userId}`)
    return response.data.data
  }

  const createUser = async (data: CreateUserInput): Promise<User> => {
    const response = await $api.post<ApiResponseBody<User>>('panel/admin/users', data)
    return response.data.data
  }

  const updateUser = async (userId: number, data: UpdateUserInput): Promise<User> => {
    const response = await $api.put<ApiResponseBody<User>>(`panel/admin/users/${userId}`, data)
    return response.data.data
  }

  const deleteUser = async (userId: number): Promise<void> => {
    await $api.delete(`panel/admin/users/${userId}`)
  }

  const toggleUserActive = async (userId: number): Promise<void> => {
    await $api.patch(`panel/admin/users/${userId}/toggle-active`)
  }

  const getRoles = async (): Promise<UserRole[]> => {
    const response = await $api.get<ApiResponseBody<UserRole[]>>('panel/admin/users/roles')
    return response.data.data
  }

  // عمداً حذف شد: resetUserPassword
  // دلیل: بک‌اند فعلی هیچ endpoint/متدی برای تغییر رمز عبور کاربر موجود ندارد.
  // UpdateUserInputDto هم فیلد رمز عبور ندارد. این قابلیت جدا نیاز به یک متد در
  // UserCoreService + یک route جدید در این کنترلر دارد.

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
