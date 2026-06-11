// app/services/admin/message.service.ts
import type { ApiResponse } from '~/types/api'
import type {
  ContactUsMessageDto,
  UpdateContactUsMessageDto,
  AnswerMessageDto,
  ContactUsMessageListFilterDto,
  GridDataSourceRequestAllowedParameters
} from '~/types/message'
import type { GridDataSourceResult } from '~/types/grid'

export const useAdminMessageService = () => {
  const { $api } = useNuxtApp()

  // دریافت مشخصات گرید (فیلدهای قابل مرتب‌سازی و فیلتر)
  const getGridSpecs = async (): Promise<GridDataSourceRequestAllowedParameters> => {
    const response = await $api.get<ApiResponse<GridDataSourceRequestAllowedParameters>>('api/admin/messages/grid-specs')
    return response.data.data
  }

  // دریافت لیست پیام‌ها
  const getMessagesList = async (filter: ContactUsMessageListFilterDto): Promise<GridDataSourceResult<ContactUsMessageDto>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ContactUsMessageDto>>>('api/admin/messages/list', filter)
    return response.data.data
  }

  // دریافت پیام با شناسه
  const getMessageById = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.get<ApiResponse<ContactUsMessageDto>>(`api/admin/messages/${id}`)
    return response.data.data
  }

  // بروزرسانی پیام
  const updateMessage = async (id: number, data: UpdateContactUsMessageDto): Promise<ContactUsMessageDto> => {
    const response = await $api.put<ApiResponse<ContactUsMessageDto>>(`api/admin/messages/${id}`, data)
    return response.data.data
  }

  // حذف پیام
  const deleteMessage = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`api/admin/messages/${id}`)
  }

  // علامت‌گذاری به عنوان دیده شده
  const markAsSeen = async (id: number): Promise<ContactUsMessageDto> => {
    const response = await $api.patch<ApiResponse<ContactUsMessageDto>>(`api/admin/messages/${id}/mark-seen`)
    return response.data.data
  }

  // پاسخ به پیام
  const answerMessage = async (id: number, adminNote: string): Promise<ContactUsMessageDto> => {
    const response = await $api.post<ApiResponse<ContactUsMessageDto>>(`api/admin/messages/${id}/answer`, { adminNote } as AnswerMessageDto)
    return response.data.data
  }

  // تغییر وضعیت دیده شده/نشده
  const toggleSeen = async (id: number, isSeen: boolean): Promise<ContactUsMessageDto> => {
    return await updateMessage(id, { isSeen })
  }

  // تغییر وضعیت پاسخ داده شده/نشده
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
