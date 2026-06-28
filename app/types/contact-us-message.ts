// app/types/contact-us-message.ts
//
// نکته مهم: نسخه‌ی قبلی این فایل بر اساس یک مدل کاملاً متفاوت از آنچه در بک‌اند واقعی
// وجود دارد نوشته شده بود — یک «status» با ۵ مقدار (pending/read/replied/archived/spam)
// به‌علاوه‌ی «priority» و «category» که هیچ‌کدام در بک‌اند (ContactUsMessageDto واقعی)
// وجود ندارند. بک‌اند واقعی فقط ۳ وضعیت دارد (مشاهده‌نشده/مشاهده‌شده/یادداشت‌گذاری‌شده)
// و priority/category اصلاً معنا ندارند. این یعنی قبلاً نام فرستنده، موضوع، و
// رنگ/برچسب وضعیت در جدول همیشه نمایش نادرست/خالی داشتند، و حتی بدتر: تابع
// toggleSeen/toggleAnswered قبلی فیلدهایی می‌فرستاد که بک‌اند نمی‌شناسد، و چون مقدار
// «state» را در بدنه‌ی درخواست ارسال نمی‌کردند، باعث می‌شد وضعیت پیام با مقدار نامعتبر
// (enum=0) در دیتابیس بازنویسی شود. این فایل اکنون دقیقاً مطابق ContactUsMessageDto
// واقعی بازنویسی شده است.

export const ContactUsMessageState = {
  NotSeen: 1,
  Seen: 2,
  Answered: 3
} as const

export type ContactUsMessageStateValue = (typeof ContactUsMessageState)[keyof typeof ContactUsMessageState]

export const ContactUsMessageStateConfig: Record<number, { color: string, label: string, icon: string }> = {
  [ContactUsMessageState.NotSeen]: { color: 'warning', label: 'مشاهده نشده', icon: 'i-lucide-clock' },
  [ContactUsMessageState.Seen]: { color: 'info', label: 'مشاهده شده', icon: 'i-lucide-eye' },
  [ContactUsMessageState.Answered]: { color: 'success', label: 'یادداشت‌گذاری شده', icon: 'i-lucide-check-check' }
}

export const contactUsMessageStateOptions = [
  { label: 'مشاهده نشده', value: ContactUsMessageState.NotSeen },
  { label: 'مشاهده شده', value: ContactUsMessageState.Seen },
  { label: 'یادداشت‌گذاری شده', value: ContactUsMessageState.Answered }
]

export interface ContactUsMessageDto {
  id: number
  subjectTitle: string
  name: string
  email: string
  phone: string
  content: string
  state: ContactUsMessageStateValue
  stateTitle: string
  createdAt: string
  createdAtPersian: string
  seenAt?: string | null
  seenAtPersian?: string | null
  noteAddedAt?: string | null
  adminNote?: string | null
  adminUserId?: number | null
}

// باید دقیقاً با UpdateContactUsMessageDto بک‌اند یکی باشد
export interface UpdateContactUsMessageInput {
  id: number
  state: ContactUsMessageStateValue
  adminNote?: string | null
}

export interface AnswerMessageInput {
  adminNote: string
}

// باید دقیقاً با ContactUsMessageListFilterDto بک‌اند یکی باشد — توجه: فیلدها سطح‌بالا
// هستند، نه داخل inputParams.filters (همان درسی که از باگ فیلتر محصولات گرفتیم)
export interface ContactUsMessageListFilter {
  page: number
  pageSize: number
  searchTerm?: string | null
  subjectId?: number | null
  state?: ContactUsMessageStateValue | null
  fromDate?: string | null
  toDate?: string | null
  inputParams?: {
    filters: never[]
    sort: { propertyName: string, ascending: boolean } | null
  }
}

export interface ContactUsStats {
  total: number
  notSeen: number
  seen: number
  answered: number
  today: number
  thisWeek: number
}
