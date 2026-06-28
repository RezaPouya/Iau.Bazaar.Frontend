// app/services/location.service.ts
import type { ApiResponse } from '~/types/api'

export interface IdName {
  id: number
  name: string
}

export const useLocationService = () => {
  const { $api } = useNuxtApp()

  const getProvinces = async (): Promise<IdName[]> => {
    const response = await $api.get<ApiResponse<IdName[]>>('public/provinces')
    return response.data.data
  }

  const getCities = async (provinceId: number): Promise<IdName[]> => {
    const response = await $api.get<ApiResponse<IdName[]>>('public/cities', { params: { provinceId } })
    return response.data.data
  }

  return { getProvinces, getCities }
}
