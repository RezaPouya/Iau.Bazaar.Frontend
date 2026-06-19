// app/services/growth-center/growth-center.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequest, GridDataSourceResult } from '~/types/grid'
import type { Company, CompanyUser, CreateCompanyInput, UpdateCompanyInput } from '~/types/company'
import type { Product, ProductApprovalRequest } from '~/types/product'
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import type { OrderSummary } from '~/types/order'
import type { User } from '~/types/user'

export const useGrowthCenterService = () => {
  const { $api } = useNuxtApp()

  // ========== Companies ==========
  const getCompaniesList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Company>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Company>>>('/api/growth-center/companies/list', request)
    return response.data.data
  }

  const getCompanyById = async (id: number): Promise<Company> => {
    const response = await $api.get<ApiResponse<Company>>(`/api/growth-center/companies/${id}`)
    return response.data.data
  }

  const createCompany = async (data: CreateCompanyInput): Promise<Company> => {
    const response = await $api.post<ApiResponse<Company>>('/api/growth-center/companies', data)
    return response.data.data
  }

  const updateCompany = async (id: number, data: UpdateCompanyInput): Promise<Company> => {
    const response = await $api.put<ApiResponse<Company>>(`/api/growth-center/companies/${id}`, data)
    return response.data.data
  }

  const deleteCompany = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`/api/growth-center/companies/${id}`)
  }

  const toggleCompanyActive = async (id: number): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/companies/${id}/toggle-active`)
  }

  // ========== Company Users ==========
  const getCompanyUsers = async (companyId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<CompanyUser>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<CompanyUser>>>(
      `/api/growth-center/companies/${companyId}/users/list`,
      request
    )
    return response.data.data
  }

  const addUserToCompany = async (companyId: number, userId: number): Promise<void> => {
    await $api.post<ApiResponse<void>>(`/api/growth-center/companies/${companyId}/users/add/${userId}`)
  }

  const removeUserFromCompany = async (companyId: number, userId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`/api/growth-center/companies/${companyId}/users/${userId}`)
  }

  const toggleCompanyUserActive = async (companyId: number, userId: number, isActive: boolean): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/companies/${companyId}/users/${userId}/toggle-active`, isActive)
  }

  // ========== Users ==========
  const getUsersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<User>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<User>>>('/api/growth-center/users/list', request)
    return response.data.data
  }

  // ========== Products ==========
  const getProductsList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Product>>>('/api/growth-center/products/list', request)
    return response.data.data
  }

  const getProductById = async (id: number): Promise<Product> => {
    const response = await $api.get<ApiResponse<Product>>(`/api/growth-center/products/${id}`)
    return response.data.data
  }

  const toggleProductApproval = async (productId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/products/${productId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  const toggleProductImageApproval = async (imageId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/products/images/${imageId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  // ========== Product Files ==========
  const getProductFiles = async (productId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<ProductFile>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ProductFile>>>(
      `/api/growth-center/product-files/${productId}/list`,
      request
    )
    return response.data.data
  }

  const toggleProductFileApproval = async (fileId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/product-files/files/${fileId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  const toggleLegalDocumentApproval = async (documentId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`/api/growth-center/product-files/legal/${documentId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  // ========== Orders ==========
  const getOrdersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<OrderSummary>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<OrderSummary>>>('/api/growth-center/orders/list', request)
    return response.data.data
  }

  return {
    // Companies
    getCompaniesList,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyActive,
    // Company Users
    getCompanyUsers,
    addUserToCompany,
    removeUserFromCompany,
    toggleCompanyUserActive,
    // Users
    getUsersList,
    // Products
    getProductsList,
    getProductById,
    toggleProductApproval,
    toggleProductImageApproval,
    // Product Files
    getProductFiles,
    toggleProductFileApproval,
    toggleLegalDocumentApproval,
    // Orders
    getOrdersList
  }
}
