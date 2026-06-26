// app/services/profile.service.ts
import type { ApiResponse } from '~/types/api'
import type { Profile, UpdateProfileInput } from '~/types/profile'

export const useProfileService = () => {
  const { $api } = useNuxtApp()

  const getProfile = async (): Promise<Profile> => {
    const response = await $api.get<ApiResponse<Profile>>('profile')
    return response.data.data
  }

  const updateProfile = async (input: UpdateProfileInput): Promise<void> => {
    await $api.put<ApiResponse<void>>('profile', input)
  }

  return {
    getProfile,
    updateProfile
  }
}
