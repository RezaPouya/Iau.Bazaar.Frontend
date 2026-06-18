// app/services/university/university.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequest, GridDataSourceResult } from '~/types/grid'
import type { GrowthCenter, GrowthCenterUser, CreateGrowthCenterInput, UpdateGrowthCenterInput } from '~/types/growth-center'
import type { Company } from '~/types/company'
import type { Product } from '~/types/product'
import type { OrderSummary } from '~/types/order'

export const useUniversityService = () => {
  const { $api } = useNuxtApp()

  // ========== Growth Centers ==========
  const getGrowthCentersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<GrowthCenter>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<GrowthCenter>>>('/api/university/growth-centers/list', request)
    return response.data.data
  }

  const getGrowthCenterById = async (id: number): Promise<GrowthCenter> => {
    const response = await $api.get<ApiResponse<GrowthCenter>>(`/api/university/growth-centers/${id}`)
    return response.data.data
  }

  const createGrowthCenter = async (data: CreateGrowthCenterInput): Promise<GrowthCenter> => {
    const response = await $api.post<ApiResponse<GrowthCenter>>('/api/university/growth-centers', data)
    return response.data.data
  }

  const updateGrowthCenter = async (id: number, data: UpdateGrowthCenterInput): Promise<GrowthCenter> => {
    const response = await $api.put<ApiResponse<GrowthCenter>>(`/api/university/growth-centers/${id}`, data)
    return response.data.data
  }

  const deleteGrowthCenter = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`/api/university/growth-centers/${id}`)
  }

  const toggleGrowthCenterActive = async (id: number): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/university/growth-centers/${id}/toggle-active`)
  }

  // ========== Growth Center Users ==========
  const getGrowthCenterUsers = async (growthCenterId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<GrowthCenterUser>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<GrowthCenterUser>>>(
      `/api/university/growth-centers/${growthCenterId}/users/list`,
      request
    )
    return response.data.data
  }

  const addUserToGrowthCenter = async (growthCenterId: number, userId: number): Promise<void> => {
    await $api.post<ApiResponse<void>>(`/api/university/growth-centers/${growthCenterId}/users/add/${userId}`)
  }

  const removeUserFromGrowthCenter = async (growthCenterId: number, userId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`/api/university/growth-centers/${growthCenterId}/users/${userId}`)
  }

  const toggleGrowthCenterUserActive = async (growthCenterId: number, userId: number, isActive: boolean): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/university/growth-centers/${growthCenterId}/users/${userId}/toggle-active`, isActive)
  }

  // ========== Companies (Read-only) ==========
  const getCompaniesList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Company>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Company>>>('/api/university/companies/list', request)
    return response.data.data
  }

  const getCompanyById = async (id: number): Promise<Company> => {
    const response = await $api.get<ApiResponse<Company>>(`/api/university/companies/${id}`)
    return response.data.data
  }

  // ========== Products (Read-only) ==========
  const getProductsList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Product>>>('/api/university/products/list', request)
    return response.data.data
  }

  const getProductById = async (id: number): Promise<Product> => {
    const response = await $api.get<ApiResponse<Product>>(`/api/university/products/${id}`)
    return response.data.data
  }

  // ========== Orders (Read-only) ==========
  const getOrdersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<OrderSummary>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<OrderSummary>>>('/api/university/orders/list', request)
    return response.data.data
  }

  return {
    // Growth Centers
    getGrowthCentersList,
    getGrowthCenterById,
    createGrowthCenter,
    updateGrowthCenter,
    deleteGrowthCenter,
    toggleGrowthCenterActive,
    // Growth Center Users
    getGrowthCenterUsers,
    addUserToGrowthCenter,
    removeUserFromGrowthCenter,
    toggleGrowthCenterUserActive,
    // Companies
    getCompaniesList,
    getCompanyById,
    // Products
    getProductsList,
    getProductById,
    // Orders
    getOrdersList
  }
}
