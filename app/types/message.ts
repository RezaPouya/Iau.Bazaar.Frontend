import type { GridPropertyFilter, GridSort } from './grid'

// app/types/message.ts
export interface ContactUsMessageDto {
  id: number
  fullName: string
  email: string
  phoneNumber?: string
  subject: string
  text: string // در بک‌اند text است نه message
  isSeen: boolean
  isAnswered: boolean
  adminNote?: string
  createdAt: string
  createdAtPersian?: string
  answeredAt?: string
  answeredAtPersian?: string
}

export interface UpdateContactUsMessageDto {
  id: number
  isSeen?: boolean
  isAnswered?: boolean
  adminNote?: string
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
