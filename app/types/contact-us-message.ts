import type { GridPropertyFilter, GridSort } from './grid'

// ============ Enums ============
export type ContactUsMessageStatus = 'pending' | 'read' | 'replied' | 'archived' | 'spam'
export type ContactUsMessagePriority = 'low' | 'normal' | 'high' | 'urgent'
export type ContactUsMessageCategory = 'general' | 'support' | 'sales' | 'technical' | 'complaint' | 'suggestion'

// ============ Configs ============
export const ContactUsMessageStatusConfig: Record<ContactUsMessageStatus, { color: string; label: string; icon: string }> = {
  pending: { color: 'warning', label: 'در انتظار', icon: 'i-lucide-clock' },
  read: { color: 'info', label: 'خوانده شده', icon: 'i-lucide-eye' },
  replied: { color: 'success', label: 'پاسخ داده شده', icon: 'i-lucide-reply' },
  archived: { color: 'neutral', label: 'بایگانی', icon: 'i-lucide-archive' },
  spam: { color: 'error', label: 'اسپم', icon: 'i-lucide-alert-circle' }
}

export const ContactUsMessagePriorityConfig: Record<ContactUsMessagePriority, { color: string; label: string; icon: string }> = {
  low: { color: 'neutral', label: 'کم', icon: 'i-lucide-arrow-down' },
  normal: { color: 'info', label: 'عادی', icon: 'i-lucide-minus' },
  high: { color: 'warning', label: 'بالا', icon: 'i-lucide-arrow-up' },
  urgent: { color: 'error', label: 'فوری', icon: 'i-lucide-alert-triangle' }
}

export const ContactUsMessageCategoryConfig: Record<ContactUsMessageCategory, { label: string; icon: string }> = {
  general: { label: 'عمومی', icon: 'i-lucide-message-circle' },
  support: { label: 'پشتیبانی', icon: 'i-lucide-life-buoy' },
  sales: { label: 'فروش', icon: 'i-lucide-shopping-bag' },
  technical: { label: 'فنی', icon: 'i-lucide-code' },
  complaint: { label: 'شکایت', icon: 'i-lucide-thumbs-down' },
  suggestion: { label: 'پیشنهاد', icon: 'i-lucide-lightbulb' }
}

// ============ DTOs ============
export interface ContactUsMessageDto {
  id: number
  fullName: string
  email: string
  phoneNumber?: string
  subject: string
  text: string
  isSeen: boolean
  isAnswered: boolean
  adminNote?: string
  createdAt: string
  createdAtPersian?: string
  answeredAt?: string
  answeredAtPersian?: string
  // فیلدهای اضافی که ممکن است از بک‌اند بیایند
  status?: ContactUsMessageStatus
  priority?: ContactUsMessagePriority
  category?: ContactUsMessageCategory
}

export interface UpdateContactUsMessageDto {
  id: number
  isSeen?: boolean
  isAnswered?: boolean
  adminNote?: string
  status?: ContactUsMessageStatus
}

export interface AnswerMessageDto {
  adminNote: string
}

export interface ContactUsMessageListFilterDto {
  page: number
  pageSize: number
  inputParams: {
    filters: GridPropertyFilter[]
    sort: GridSort | null
  }
}
