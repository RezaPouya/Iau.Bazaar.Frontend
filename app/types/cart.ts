export interface CartItemDto {
  id: number
  productId: number
  productTitle: string
  productImageUrl: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CartDto {
  items: CartItemDto[]
  subtotal: number
  taxAmount: number
  totalAmount: number
}
