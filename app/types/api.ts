export interface ApiResponse<T> {
  isSuccess: boolean
  message: string
  statusCode: number
  validationErrors?: Record<string, string[]>
  data: T
}
