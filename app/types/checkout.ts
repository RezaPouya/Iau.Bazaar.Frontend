// app/types/checkout.ts

export interface CheckoutAddressInput {
  recipientFullName: string
  recipientPhoneNumber: string
  provinceId: number
  cityId: number
  address: string
  postalCode?: string
}

export interface OrderItemPreview {
  productId: number
  productTitle: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ShipmentPreview {
  companyId: number
  companyTitle: string
  items: OrderItemPreview[]
  itemsTotal: number
  shippingCost: number
  isSameProvinceAsDestination: boolean
}

export interface CheckoutPreview {
  shipments: ShipmentPreview[]
  itemsSubtotal: number
  totalShippingCost: number
  taxAmount: number
  grandTotal: number
}

export interface CreateOrderInput {
  address: CheckoutAddressInput
  returnUrl: string
}

export interface OrderConfirmation {
  orderId: number
  invoiceNumber: string
  totalAmount: number
  paymentRedirectUrl: string
}

export interface PaymentCallbackResult {
  isSuccessful: boolean
  orderId: number
  invoiceNumber?: string
  failureReason?: string
}
