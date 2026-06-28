// app/services/admin/contact-us-message.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequestAllowedParameters, GridDataSourceResult } from '~/types/grid'
import type {
  ContactUsMessageDto,
  UpdateContactUsMessageInput,
  AnswerMessageInput,
  ContactUsMessageListFilter,
  ContactUsStats
} from '~/types/contact-us-message'

export const useAdminContactUsMessageService = () => {
  const { $api } = useNuxtApp()

  const getGridSpecs = async (): Promise<GridDataSourceRequestAllowedParameters> => {
    const response = await $api.get<ApiResponse<GridDataSourceRequestAllowedParameters>>('admin/contact-us/grid-specs')
    return response.data.data
  }

  const getMessagesList = async (filter: ContactUsMessageListFilter): Promise<GridDataSourceResult<ContactUsMessageDto>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ContactUsMessageDto>>>('admin/contact-us/list', filter)
    return response.data.data
  }

  const getMessageById = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.get<ApiResponse<ContactUsMessageDto>>(`admin/contact-us/${id}`)
    return response.data.data
  }

  // نکته: نسخه قبلی این متد {isSeen, isAnswered} می‌فرستاد که در DTO واقعی بک‌اند
  // (UpdateContactUsMessageDto: { Id, State, AdminNote }) چنین فیلدهایی وجود ندارد؛
  // یعنی State همیشه با مقدار نامعتبر (enum=0) بازنویسی می‌شد. الان شکل درست ارسال می‌شود.
  const updateMessage = async (input: UpdateContactUsMessageInput): Promise<ContactUsMessageDto> => {
    const response = await $api.put<ApiResponse<ContactUsMessageDto>>(`admin/contact-us/${input.id}`, input)
    return response.data.data
  }

  const deleteMessage = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`admin/contact-us/${id}`)
  }

  const markAsSeen = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.patch<ApiResponse<ContactUsMessageDto>>(`admin/contact-us/${id}/mark-seen`)
    return response.data.data
  }

  const answerMessage = async (id: number, adminNote: string): Promise<ContactUsMessageDto> => {
    const response = await $api.post<ApiResponse<ContactUsMessageDto>>(`admin/contact-us/${id}/answer`, { adminNote } as AnswerMessageInput)
    return response.data.data
  }

  // این اندپوینت قبلاً اصلاً در بک‌اند وجود نداشت (فقط با کامنت «فرضی» صدا زده می‌شد)
  const getStats = async (): Promise<ContactUsStats> => {
    const response = await $api.get<ApiResponse<ContactUsStats>>('admin/contact-us/stats')
    return response.data.data
  }

  // این اندپوینت هم قبلاً اصلاً در بک‌اند وجود نداشت
  const exportMessages = async (filter: ContactUsMessageListFilter): Promise<Blob> => {
    const response = await $api.post('admin/contact-us/export', filter, { responseType: 'blob' })
    return response.data
  }

  return {
    getGridSpecs,
    getMessagesList,
    getMessageById,
    updateMessage,
    deleteMessage,
    markAsSeen,
    answerMessage,
    getStats,
    exportMessages
  }
}
