import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequestAllowedParameters, GridDataSourceResult } from '~/types/grid'
import type { ContactUsMessageDto, UpdateContactUsMessageDto, AnswerMessageDto, ContactUsMessageListFilterDto } from '~/types/contact-us-message'

export const useAdminContactUsMessageService = () => {
  const { $api } = useNuxtApp()

  const getGridSpecs = async (): Promise<GridDataSourceRequestAllowedParameters> => {
    const response = await $api.get<ApiResponse<GridDataSourceRequestAllowedParameters>>('api/admin/contact-us/grid-specs')
    return response.data.data
  }

  const getMessagesList = async (filter: ContactUsMessageListFilterDto): Promise<GridDataSourceResult<ContactUsMessageDto>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ContactUsMessageDto>>>('api/admin/contact-us/list', filter)
    return response.data.data
  }

  const getMessageById = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.get<ApiResponse<ContactUsMessageDto>>(`api/admin/contact-us/${id}`)
    return response.data.data
  }

  const updateMessage = async (id: number, data: UpdateContactUsMessageDto): Promise<ContactUsMessageDto> => {
    const response = await $api.put<ApiResponse<ContactUsMessageDto>>(`api/admin/contact-us/${id}`, data)
    return response.data.data
  }

  const deleteMessage = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`api/admin/contact-us/${id}`)
  }

  const markAsSeen = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.patch<ApiResponse<ContactUsMessageDto>>(`api/admin/contact-us/${id}/mark-seen`)
    return response.data.data
  }

  const answerMessage = async (id: number, adminNote: string): Promise<ContactUsMessageDto> => {
    const response = await $api.post<ApiResponse<ContactUsMessageDto>>(`api/admin/contact-us/${id}/answer`, { adminNote } as AnswerMessageDto)
    return response.data.data
  }

  const toggleSeen = async (id: number, isSeen: boolean): Promise<ContactUsMessageDto> => {
    return await updateMessage(id, { isSeen })
  }

  const toggleAnswered = async (id: number, isAnswered: boolean, adminNote?: string): Promise<ContactUsMessageDto> => {
    return await updateMessage(id, { isAnswered, adminNote })
  }

  return {
    getGridSpecs,
    getMessagesList,
    getMessageById,
    updateMessage,
    deleteMessage,
    markAsSeen,
    answerMessage,
    toggleSeen,
    toggleAnswered
  }
}
