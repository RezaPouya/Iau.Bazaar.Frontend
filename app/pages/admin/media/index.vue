<!-- app/pages/admin/media/index.vue -->
<script setup lang="ts">
import { GridFilterOperation } from '~/types/grid'
import MediaImageFormModal from '~/components/admin/media/MediaImageFormModal.vue'
import MediaVideoFormModal from '~/components/admin/media/MediaVideoFormModal.vue'
import MediaPreviewModal from '~/components/admin/media/MediaPreviewModal.vue'
import MediaTabs from '~/components/admin/media/MediaTabs.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'مدیریت رسانه'
})

// ---------- types ----------
interface ImageValueObject {
  url: string
  width: number | null
  height: number | null
  altText: string | null
}

interface MediaImage {
  id: number
  title: string | null
  image: ImageValueObject | null
  mobileImage: ImageValueObject | null
  createdAtPersian: string
}

interface VideoMedia {
  id: number
  title: string
  subTitle: string | null
  description: string | null
  durationTime: number
  video: { url: string } | null
  image: ImageValueObject | null
  createdAtPersian: string
}

// ---------- active tab ----------
const activeTab = ref<'images' | 'videos'>('images')

// ==================== IMAGES SECTION ====================

// Columns
const imageColumns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'عنوان', sortable: true },
  { key: 'image', label: 'تصویر', sortable: false },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Filters
const imageFilterTitle = ref('')

// Grid state
const imageData = ref<MediaImage[]>([])
const imageTotals = ref(0)
const imageCurrentPage = ref(1)
const imagePageSize = ref(10)
const imageLoading = ref(false)
const imageSortKey = ref<string | null>(null)
const imageSortDirection = ref<'asc' | 'desc' | null>(null)

// Modal state
const imageModalOpen = ref(false)
const editingImage = ref<MediaImage | null>(null)

// Preview modal
const previewModalOpen = ref(false)
const previewImageUrl = ref('')
const previewImageTitle = ref('')

// Load images
const loadImages = async () => {
  imageLoading.value = true
  try {
    const { $api } = useNuxtApp()
    const filters: any[] = []

    if (imageFilterTitle.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: imageFilterTitle.value.trim()
      })
    }

    const request = {
      page: imageCurrentPage.value,
      pageSize: imagePageSize.value,
      inputParams: {
        filters,
        sort:
          imageSortKey.value && imageSortDirection.value
            ? {
                propertyName: imageSortKey.value,
                ascending: imageSortDirection.value === 'asc'
              }
            : null
      }
    }

    const response = await $api.post('panel/admin/media/images/list', request)
    const result = response.data.data
    imageData.value = result.data ?? []
    imageTotals.value = result.totals ?? 0
    imageCurrentPage.value = result.page ?? 1
    imagePageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا در دریافت تصاویر', err)
    imageData.value = []
    imageTotals.value = 0
  } finally {
    imageLoading.value = false
  }
}

// Pagination
const imageTotalPages = computed(() => Math.ceil(imageTotals.value / imagePageSize.value))
const imageStartIndex = computed(() => (imageCurrentPage.value - 1) * imagePageSize.value + 1)
const imageEndIndex = computed(() => Math.min(imageCurrentPage.value * imagePageSize.value, imageTotals.value))

const setImagePage = (page: number) => {
  imageCurrentPage.value = page
  loadImages()
}

const setImagePageSize = (size: number) => {
  imagePageSize.value = size
  imageCurrentPage.value = 1
  loadImages()
}

// Sorting
const setImageSort = (key: string) => {
  if (imageSortKey.value === key) {
    if (imageSortDirection.value === 'asc') imageSortDirection.value = 'desc'
    else if (imageSortDirection.value === 'desc') imageSortDirection.value = null
    else imageSortDirection.value = 'asc'
  } else {
    imageSortKey.value = key
    imageSortDirection.value = 'asc'
  }
  imageCurrentPage.value = 1
  loadImages()
}

const getImageSortIcon = (key: string) => {
  if (imageSortKey.value !== key) return 'i-lucide-arrow-up-down'
  if (imageSortDirection.value === 'asc') return 'i-lucide-arrow-up'
  if (imageSortDirection.value === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

// Filters
const applyImageFilters = () => {
  imageCurrentPage.value = 1
  loadImages()
}

const clearImageFilters = () => {
  imageFilterTitle.value = ''
  imageCurrentPage.value = 1
  loadImages()
}

// CRUD handlers
const openCreateImageModal = () => {
  editingImage.value = null
  imageModalOpen.value = true
}

const openEditImageModal = (image: MediaImage) => {
  editingImage.value = image
  imageModalOpen.value = true
}

const handleSaveImage = async (formData: FormData) => {
  const { $api } = useNuxtApp()
  const toast = useToast()

  try {
    if (editingImage.value) {
      formData.append('Id', String(editingImage.value.id))
      await $api.put(`panel/admin/media/images/${editingImage.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await $api.post('panel/admin/media/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    imageModalOpen.value = false
    loadImages()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

const deleteImage = async (id: number, title: string) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    await $api.delete(`panel/admin/media/images/${id}`)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadImages()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const confirmDeleteImage = (id: number, title: string) => {
  const toast = useToast()
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف تصویر "${title || id}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteImage(id, title) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const showPreview = (url: string, title: string) => {
  previewImageUrl.value = url
  previewImageTitle.value = title
  previewModalOpen.value = true
}

// ==================== VIDEOS SECTION ====================

// Columns
const videoColumns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'عنوان', sortable: true },
  { key: 'durationTime', label: 'مدت (ثانیه)', sortable: true },
  { key: 'image', label: 'تصویر شاخص', sortable: false },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

// Filters
const videoFilterTitle = ref('')

// Grid state
const videoData = ref<VideoMedia[]>([])
const videoTotals = ref(0)
const videoCurrentPage = ref(1)
const videoPageSize = ref(10)
const videoLoading = ref(false)
const videoSortKey = ref<string | null>(null)
const videoSortDirection = ref<'asc' | 'desc' | null>(null)

// Modal state
const videoModalOpen = ref(false)
const editingVideo = ref<VideoMedia | null>(null)

// Load videos
const loadVideos = async () => {
  videoLoading.value = true
  try {
    const { $api } = useNuxtApp()
    const filters: any[] = []

    if (videoFilterTitle.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: videoFilterTitle.value.trim()
      })
    }

    const request = {
      page: videoCurrentPage.value,
      pageSize: videoPageSize.value,
      inputParams: {
        filters,
        sort:
          videoSortKey.value && videoSortDirection.value
            ? {
                propertyName: videoSortKey.value,
                ascending: videoSortDirection.value === 'asc'
              }
            : null
      }
    }

    const response = await $api.post('panel/admin/media/videos/list', request)
    const result = response.data.data
    videoData.value = result.data ?? []
    videoTotals.value = result.totals ?? 0
    videoCurrentPage.value = result.page ?? 1
    videoPageSize.value = result.pageSize ?? 10
  } catch (err: any) {
    console.error('خطا در دریافت ویدئوها', err)
    videoData.value = []
    videoTotals.value = 0
  } finally {
    videoLoading.value = false
  }
}

// Pagination
const videoTotalPages = computed(() => Math.ceil(videoTotals.value / videoPageSize.value))
const videoStartIndex = computed(() => (videoCurrentPage.value - 1) * videoPageSize.value + 1)
const videoEndIndex = computed(() => Math.min(videoCurrentPage.value * videoPageSize.value, videoTotals.value))

const setVideoPage = (page: number) => {
  videoCurrentPage.value = page
  loadVideos()
}

const setVideoPageSize = (size: number) => {
  videoPageSize.value = size
  videoCurrentPage.value = 1
  loadVideos()
}

// Sorting
const setVideoSort = (key: string) => {
  if (videoSortKey.value === key) {
    if (videoSortDirection.value === 'asc') videoSortDirection.value = 'desc'
    else if (videoSortDirection.value === 'desc') videoSortDirection.value = null
    else videoSortDirection.value = 'asc'
  } else {
    videoSortKey.value = key
    videoSortDirection.value = 'asc'
  }
  videoCurrentPage.value = 1
  loadVideos()
}

const getVideoSortIcon = (key: string) => {
  if (videoSortKey.value !== key) return 'i-lucide-arrow-up-down'
  if (videoSortDirection.value === 'asc') return 'i-lucide-arrow-up'
  if (videoSortDirection.value === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

// Filters
const applyVideoFilters = () => {
  videoCurrentPage.value = 1
  loadVideos()
}

const clearVideoFilters = () => {
  videoFilterTitle.value = ''
  videoCurrentPage.value = 1
  loadVideos()
}

// CRUD handlers
const openCreateVideoModal = () => {
  editingVideo.value = null
  videoModalOpen.value = true
}

const openEditVideoModal = (video: VideoMedia) => {
  editingVideo.value = video
  videoModalOpen.value = true
}

const handleSaveVideo = async (formData: FormData) => {
  const { $api } = useNuxtApp()
  const toast = useToast()

  try {
    if (editingVideo.value) {
      formData.append('Id', String(editingVideo.value.id))
      await $api.put(`panel/admin/media/videos/${editingVideo.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    } else {
      await $api.post('panel/admin/media/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.add({ title: 'ایجاد موفق', color: 'success' })
    }
    videoModalOpen.value = false
    loadVideos()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  }
}

const deleteVideo = async (id: number, title: string) => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    await $api.delete(`panel/admin/media/videos/${id}`)
    toast.add({ title: 'حذف موفق', color: 'success' })
    loadVideos()
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  }
}

const confirmDeleteVideo = (id: number, title: string) => {
  const toast = useToast()
  toast.add({
    title: 'تأیید حذف',
    description: `آیا از حذف ویدئو "${title}" اطمینان دارید؟`,
    color: 'error',
    actions: [
      { label: 'بله', onClick: () => deleteVideo(id, title) },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

// Format duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Initial load
watch(
  activeTab,
  (tab) => {
    if (tab === 'images') loadImages()
    else loadVideos()
  },
  { immediate: true }
)
</script>

<template>
  <ClientOnly>
    <div class="compact-grid">
      <div class="mb-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">مدیریت رسانه</h1>
      </div>

      <MediaTabs v-model="activeTab" />

      <!-- ==================== IMAGES TAB ==================== -->
      <div v-if="activeTab === 'images'">
        <div class="mb-3 flex justify-end">
          <UButton color="primary" size="sm" @click="openCreateImageModal">
            <UIcon name="i-lucide-plus" class="ml-1 size-4" />
            افزودن تصویر
          </UButton>
        </div>

        <!-- Filters -->
        <UCard class="mb-3 p-3">
          <div class="flex flex-wrap gap-2 items-end">
            <UFormField label="عنوان" class="flex-1 min-w-[200px]">
              <UInput v-model="imageFilterTitle" placeholder="جستجو..." class="w-full text-right" />
            </UFormField>
            <div class="flex gap-1">
              <UButton size="sm" @click="applyImageFilters">اعمال</UButton>
              <UButton size="sm" color="neutral" variant="ghost" @click="clearImageFilters">پاک کردن</UButton>
            </div>
          </div>
        </UCard>

        <!-- Loading -->
        <UCard v-if="imageLoading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
        </UCard>

        <!-- Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="col in imageColumns"
                    :key="col.key"
                    class="px-3 py-1.5 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="col.sortable && setImageSort(col.key)"
                  >
                    <div class="flex items-center justify-center gap-1">
                      {{ col.label }}
                      <UIcon v-if="col.sortable" :name="getImageSortIcon(col.key)" class="size-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in imageData" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                  <td class="px-3 py-1.5 text-right">{{ item.title || '—' }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <div v-if="item.image?.url" class="flex justify-center">
                      <img
                        :src="item.image.url"
                        :alt="item.image.altText || item.title || 'تصویر'"
                        class="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                        @click="showPreview(item.image.url, item.title || `تصویر ${item.id}`)"
                      />
                    </div>
                    <span v-else class="text-dimmed">—</span>
                  </td>
                  <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <div class="flex justify-center gap-1">
                      <UButton size="xs" color="neutral" variant="ghost" @click="openEditImageModal(item)">
                        <UIcon name="i-lucide-edit" />
                      </UButton>
                      <UButton size="xs" color="error" variant="ghost" @click="confirmDeleteImage(item.id, item.title || '')">
                        <UIcon name="i-lucide-trash" />
                      </UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="imageData.length === 0">
                  <td :colspan="imageColumns.length" class="px-3 py-4 text-center text-gray-500">هیچ تصویری یافت نشد</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="imageTotalPages > 0" class="flex justify-between items-center mt-3 text-sm">
            <div class="text-gray-500">{{ imageStartIndex }} - {{ imageEndIndex }} از {{ imageTotals }}</div>
            <div class="flex gap-1 items-center">
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="imageCurrentPage <= 1"
                @click="setImagePage(imageCurrentPage - 1)"
              />
              <span class="text-sm mx-1">صفحه {{ imageCurrentPage }} از {{ imageTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="imageCurrentPage >= imageTotalPages"
                @click="setImagePage(imageCurrentPage + 1)"
              />
              <USelect v-model="imagePageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setImagePageSize" />
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== VIDEOS TAB ==================== -->
      <div v-else-if="activeTab === 'videos'">
        <div class="mb-3 flex justify-end">
          <UButton color="primary" size="sm" @click="openCreateVideoModal">
            <UIcon name="i-lucide-plus" class="ml-1 size-4" />
            افزودن ویدئو
          </UButton>
        </div>

        <!-- Filters -->
        <UCard class="mb-3 p-3">
          <div class="flex flex-wrap gap-2 items-end">
            <UFormField label="عنوان" class="flex-1 min-w-[200px]">
              <UInput v-model="videoFilterTitle" placeholder="جستجو..." class="w-full text-right" />
            </UFormField>
            <div class="flex gap-1">
              <UButton size="sm" @click="applyVideoFilters">اعمال</UButton>
              <UButton size="sm" color="neutral" variant="ghost" @click="clearVideoFilters">پاک کردن</UButton>
            </div>
          </div>
        </UCard>

        <!-- Loading -->
        <UCard v-if="videoLoading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
        </UCard>

        <!-- Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="col in videoColumns"
                    :key="col.key"
                    class="px-3 py-1.5 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="col.sortable && setVideoSort(col.key)"
                  >
                    <div class="flex items-center justify-center gap-1">
                      {{ col.label }}
                      <UIcon v-if="col.sortable" :name="getVideoSortIcon(col.key)" class="size-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in videoData" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
                  <td class="px-3 py-1.5 text-right">{{ item.title }}</td>
                  <td class="px-3 py-1.5 text-center">{{ formatDuration(item.durationTime) }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <div v-if="item.image?.url" class="flex justify-center">
                      <img
                        :src="item.image.url"
                        :alt="item.image.altText || item.title"
                        class="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                        @click="showPreview(item.image.url, item.title)"
                      />
                    </div>
                    <span v-else class="text-dimmed">—</span>
                  </td>
                  <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
                  <td class="px-3 py-1.5 text-center">
                    <div class="flex justify-center gap-1">
                      <UButton size="xs" color="neutral" variant="ghost" @click="openEditVideoModal(item)">
                        <UIcon name="i-lucide-edit" />
                      </UButton>
                      <UButton size="xs" color="error" variant="ghost" @click="confirmDeleteVideo(item.id, item.title)">
                        <UIcon name="i-lucide-trash" />
                      </UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="videoData.length === 0">
                  <td :colspan="videoColumns.length" class="px-3 py-4 text-center text-gray-500">هیچ ویدئویی یافت نشد</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="videoTotalPages > 0" class="flex justify-between items-center mt-3 text-sm">
            <div class="text-gray-500">{{ videoStartIndex }} - {{ videoEndIndex }} از {{ videoTotals }}</div>
            <div class="flex gap-1 items-center">
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="videoCurrentPage <= 1"
                @click="setVideoPage(videoCurrentPage - 1)"
              />
              <span class="text-sm mx-1">صفحه {{ videoCurrentPage }} از {{ videoTotalPages }}</span>
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="videoCurrentPage >= videoTotalPages"
                @click="setVideoPage(videoCurrentPage + 1)"
              />
              <USelect v-model="videoPageSize" :items="[10, 20, 50, 100]" size="sm" class="w-20" @update:model-value="setVideoPageSize" />
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <MediaImageFormModal v-model:open="imageModalOpen" :editing-id="editingImage?.id || null" :initial-data="editingImage" @save="handleSaveImage" />

      <MediaVideoFormModal v-model:open="videoModalOpen" :editing-id="editingVideo?.id || null" :initial-data="editingVideo" @save="handleSaveVideo" />

      <MediaPreviewModal v-model:open="previewModalOpen" :image-url="previewImageUrl" :title="previewImageTitle" />
    </div>
  </ClientOnly>
</template>

<style scoped>
.compact-grid :deep(.p-4) {
  padding: 0.75rem !important;
}

.compact-grid :deep(.gap-3) {
  gap: 0.5rem !important;
}

:deep(input),
:deep(textarea),
:deep(.reka-select-trigger) {
  text-align: left !important;
}

:deep(.reka-select-value) {
  text-align: right;
}

table {
  min-height: 100px !important;
}

tr,
tbody {
  vertical-align: top !important;
}
</style>


