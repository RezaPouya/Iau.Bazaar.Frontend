<!-- app/components/admin/product/ProductTable.vue -->
<script setup lang="ts">
import type { Product } from '~/types/product'
import ProductStatusBadge from './ProductStatusBadge.vue'

const props = defineProps<{
  data: Product[]
  loading: boolean
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
}>()

const emit = defineEmits<{
  (e: 'sort', key: string): void
  (e: 'view', product: Product): void
  (e: 'edit', product: Product): void
  (e: 'approve', product: Product): void
  (e: 'delete', product: Product): void
}>()

const columns = [
  { key: 'id', label: 'شناسه', sortable: true },
  { key: 'title', label: 'نام محصول', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'companyName', label: 'شرکت', sortable: true },
  { key: 'finalPrice', label: 'قیمت نهایی', sortable: true },
  { key: 'inventoryCount', label: 'موجودی', sortable: true },
  { key: 'approvalStatus', label: 'وضعیت تایید', sortable: true },
  { key: 'state', label: 'وضعیت', sortable: true },
  { key: 'createdAtPersian', label: 'تاریخ ایجاد', sortable: true },
  { key: 'actions', label: 'عملیات', sortable: false }
]

const setSort = (key: string) => emit('sort', key)

const getSortIcon = (key: string) => {
  if (props.sortKey !== key) return 'i-lucide-arrow-up-down'
  if (props.sortDirection === 'asc') return 'i-lucide-arrow-up'
  if (props.sortDirection === 'desc') return 'i-lucide-arrow-down'
  return 'i-lucide-arrow-up-down'
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
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
            <td class="px-3 py-1.5 text-right">
              <div>
                <div class="font-medium">{{ item.title }}</div>
                <div class="text-xs text-dimmed">{{ item.slug }}</div>
              </div>
            </td>
            <td class="px-3 py-1.5 text-left text-sm">{{ item.sku }}</td>
            <td class="px-3 py-1.5 text-center">{{ item.companyName }}</td>
            <td class="px-3 py-1.5 text-left">
              <div class="font-medium text-primary-600">{{ formatPrice(item.finalPrice) }}</div>
              <div v-if="item.discountPercent" class="text-xs text-dimmed line-through">
                {{ formatPrice(item.price) }}
              </div>
            </td>
            <td class="px-3 py-1.5 text-center">
              <ProductStatusBadge type="stock" :inventory-count="item.inventoryCount">
                <template #suffix>
                  <span class="mr-1">({{ item.inventoryCount }})</span>
                </template>
              </ProductStatusBadge>
            </td>
            <td class="px-3 py-1.5 text-center">
              <ProductStatusBadge type="approval" :value="item.approvalStatus" />
            </td>
            <td class="px-3 py-1.5 text-center">
              <ProductStatusBadge type="state" :value="item.state" />
            </td>
            <td class="px-3 py-1.5 text-center">{{ item.createdAtPersian }}</td>
            <td class="px-3 py-1.5 text-center">
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'مشاهده جزئیات',
                      icon: 'i-lucide-eye',
                      onSelect: () => emit('view', item)
                    },
                    {
                      label: 'ویرایش محصول',
                      icon: 'i-lucide-edit',
                      onSelect: () => emit('edit', item)
                    },
                    {
                      label: item.approvalStatus === 1 ? 'رد محصول' : 'تایید محصول',
                      icon: item.approvalStatus === 1 ? 'i-lucide-x-circle' : 'i-lucide-check-circle',
                      onSelect: () => emit('approve', item)
                    },
                    {
                      label: 'حذف محصول',
                      icon: 'i-lucide-trash',
                      color: 'error',
                      onSelect: () => emit('delete', item)
                    }
                  ]
                ]"
                :content="{ align: 'end' }"
              >
                <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-more-vertical" />
              </UDropdownMenu>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="px-3 py-4 text-center text-gray-500">هیچ محصولی یافت نشد</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
