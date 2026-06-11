// app/types/media.ts
import type { GridDataSourceRequest, GridDataSourceResult } from './grid'

/**
 * Image Value Object (from backend)
 */
export interface ImageValueObject {
  url: string
  width: number | null
  height: number | null
  altText: string | null
}

/**
 * Video Value Object (from backend)
 */
export interface VideoValueObject {
  url: string
  width: number | null
  height: number | null
}

/**
 * Media Image DTO (from backend AdminMediaController)
 */
export interface MediaImage {
  id: number
  title: string | null
  image: ImageValueObject | null
  mobileImage: ImageValueObject | null
  createdAt: string
  createdAtPersian: string
}

/**
 * Video Media DTO (from backend AdminMediaController)
 */
export interface VideoMedia {
  id: number
  title: string
  subTitle: string | null
  description: string | null
  durationTime: number
  video: VideoValueObject | null
  image: ImageValueObject | null
  createdAt: string
  createdAtPersian: string
}

/**
 * Create Media Image Input
 */
export interface CreateMediaImageInput {
  title?: string
  image?: File
  mobileImage?: File
}

/**
 * Update Media Image Input
 */
export interface UpdateMediaImageInput extends CreateMediaImageInput {
  id: number
}

/**
 * Create Video Media Input
 */
export interface CreateVideoMediaInput {
  title: string
  subTitle?: string
  description?: string
  durationTime: number
  video?: File
  image?: File
}

/**
 * Update Video Media Input
 */
export interface UpdateVideoMediaInput extends CreateVideoMediaInput {
  id: number
}

/**
 * Media Images List Response
 * @description Alias for GridDataSourceResult<MediaImage>
 */
export type MediaImagesListResponse = GridDataSourceResult<MediaImage>

/**
 * Video Medias List Response
 * @description Alias for GridDataSourceResult<VideoMedia>
 */
export type VideoMediasListResponse = GridDataSourceResult<VideoMedia>

/**
 * Media Filters
 */
export interface MediaImageListFilter extends GridDataSourceRequest {
  searchTerm?: string
}

export interface VideoMediaListFilter extends GridDataSourceRequest {
  searchTerm?: string
}

// Export media types
export * from './media'
