// app/types/order.ts
import type { GridDataSourceRequest, GridDataSourceResult } from './grid'

export interface OrderItem {
  productId: number
  productTitle: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderSummary {
  id: number
  orderNumber: string
  orderDate: string
  totalAmount: number
  status: number // OrderStatus enum
  statusTitle: string
  items: OrderItem[]
}

export interface InvoiceDetail {
  orderId: number
  orderNumber: string
  orderDate: string
  totalAmount: number
  status: number
  statusTitle: string
  customerFullName: string
  customerNationalCode: string
  customerPhoneNumber: string
  customerAddress: string
  customerPostalCode: string
  items: OrderItem[]
}

export interface OrderListFilter extends GridDataSourceRequest {
  status?: number | null
  companyId?: number | null
}
