<!-- app/components/admin/product-files/ProductLegalDocumentsTable.vue -->
<script setup lang="ts">
import type { ProductLegalDocument } from '~/types/product-file'

const props = defineProps<{
  data: ProductLegalDocument[]
  loading: boolean
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
}>()

const emit = defineEmits<{
  (e: 'sort', key: string): void
  (e: 'view', doc: ProductLegalDocument): void
  (e: 'download', doc: ProductLegalDocument): void
  (e: 'approve', doc: ProductLegalDocument): void
  (e: 'delete', doc: ProductLegalDocument): void
}>()

const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'عنوان', sortable: true },
  { key: 'documentTypeTitle', label: 'نوع سند', sortable: true },
  { key: 'documentNumber', label: 'شماره سند', sortable: true },
  { key: 'expiryDatePersian', label: 'تاریخ انقضا', sortable: true },
  { key: 'approvalStatus', label: 'وضعیت', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

const setSort = (key: string) => emit('sort', key)

const getSortIcon = (key: string) => {
  if (props.sortKey !== key) return 'i-lucide-arrow-up-down'
  if (props.sortDirection === 'asc') return 'i-lucide-arrow-up'
  if (props.sortDirection === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
      return { color: 'success', label: 'تایید شده' }
    case 'Rejected':
      return { color: 'error', label: 'رد شده' }
    default:
      return { color: 'warning', label: 'در انتظار تایید' }
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
          <tr v-for="item in data" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-3 py-1.5 text-center">{{ item.id }}</td>
            <td class="px-3 py-1.5 text-right">{{ item.title }}</td>
            <td class="px-3 py-1.5 text-center">
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ item.documentTypeTitle }}
              </UBadge>
            </td>
            <td class="px-3 py-1.5 text-center">{{ item.documentNumber || '—' }}</td>
            <td class="px-3 py-1.5 text-center">
              <span :class="{ 'text-error': item.expiryDate && new Date(item.expiryDate) < new Date() }">
                {{ item.expiryDatePersian || '—' }}
              </span>
            </td>
            <td class="px-3 py-1.5 text-center">
              <UBadge :color="getStatusBadge(item.approvalStatus).color" variant="subtle" size="sm">
                {{ getStatusBadge(item.approvalStatus).label }}
              </UBadge>
            </td>
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
                  <UButton size="xs" :color="item.approvalStatus === 'Approved' ? 'error' : 'success'" variant="ghost" @click="emit('approve', item)">
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
            <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ سندی یافت نشد</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
