// app/services/admin/order.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceResult } from '~/types/grid'
import type { OrderSummary, InvoiceDetail, OrderListFilter } from '~/types/order'

export const useAdminOrderService = () => {
  const { $api } = useNuxtApp()

  const getOrdersList = async (filter: OrderListFilter): Promise<GridDataSourceResult<OrderSummary>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<OrderSummary>>>('admin/orders/list', filter)
    return response.data.data
  }

  const getOrderInvoice = async (orderId: number): Promise<InvoiceDetail> => {
    const response = await $api.get<ApiResponse<InvoiceDetail>>(`admin/orders/${orderId}/invoice`)
    return response.data.data
  }

  return {
    getOrdersList,
    getOrderInvoice
  }
}


