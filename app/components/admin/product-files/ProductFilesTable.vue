<!-- app/components/admin/product-files/ProductFilesTable.vue -->
<script setup lang="ts">
import type { ProductFile } from '~/types/product-file'

const props = defineProps<{
  data: ProductFile[]
  loading: boolean
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
}>()

const emit = defineEmits<{
  (e: 'sort', key: string): void
  (e: 'view', file: ProductFile): void
  (e: 'download', file: ProductFile): void
  (e: 'approve', file: ProductFile): void
  (e: 'delete', file: ProductFile): void
}>()

const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'عنوان', sortable: true },
  { key: 'fileName', label: 'نام فایل', sortable: true },
  { key: 'fileSize', label: 'حجم', sortable: true },
  { key: 'approvalStatus', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ آپلود', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

const setSort = (key: string) => emit('sort', key)

const getSortIcon = (key: string) => {
  if (props.sortKey !== key) return 'i-lucide-arrow-up-down'
  if (props.sortDirection === 'asc') return 'i-lucide-arrow-up'
  if (props.sortDirection === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved': return { color: 'success', label: 'تایید شده' }
    case 'Rejected': return { color: 'error', label: 'رد شده' }
    default: return { color: 'warning', label: 'در انتظار تایید' }
  }
}
</script>

<template>
  <div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-1.5 text-center border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="col.sortable && setSort(col.key)"
            >
              <div class="flex items-center justify-center gap-1">
                {{ col.label }}
                <UIcon v-if="col.sortable" :name="getSortIcon(col.key)" class="size-3.5" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in data"
            :key="item.id"
            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
            <td class="px-3 py-1.5 text-right">{{ item.title || '—' }}</td>
            <td class="px-3 py-1.5 text-right">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file" class="size-4 text-dimmed" />
                <span class="truncate max-w-[200px]">{{ item.fileName }}</span>
              </div>
            </td>
            <td class="px-3 py-1.5 text-left">{{ formatFileSize(item.fileSize) }}</td>
            <td class="px-3 py-1.5 text-center">
              <UBadge :color="getStatusBadge(item.approvalStatus).color" variant="subtle" size="sm">
                {{ getStatusBadge(item.approvalStatus).label }}
              </UBadge>
            </td>
            <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
            <td class="px-3 py-1.5 text-center">
              <div class="flex justify-center gap-1">
                <UTooltip text="دانلود">
                  <UButton size="xs" color="neutral" variant="ghost" @click="emit('download', item)">
                    <UIcon name="i-lucide-download" />
                  </UButton>
                </UTooltip>
                <UTooltip text="مشاهده جزئیات">
                  <UButton size="xs" color="neutral" variant="ghost" @click="emit('view', item)">
                    <UIcon name="i-lucide-eye" />
                  </UButton>
                </UTooltip>
                <UTooltip :text="item.approvalStatus === 'Approved' ? 'رد' : 'تایید'">
                  <UButton
                    size="xs"
                    :color="item.approvalStatus === 'Approved' ? 'error' : 'success'"
                    variant="ghost"
                    @click="emit('approve', item)"
                  >
                    <UIcon :name="item.approvalStatus === 'Approved' ? 'i-lucide-x-circle' : 'i-lucide-check-circle'" />
                  </UButton>
                </UTooltip>
                <UTooltip text="حذف">
                  <UButton size="xs" color="error" variant="ghost" @click="emit('delete', item)">
                    <UIcon name="i-lucide-trash" />
                  </UButton>
                </UTooltip>
              </div>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">
              هیچ فایلی یافت نشد
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
