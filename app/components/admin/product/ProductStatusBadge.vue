<!-- app/components/admin/product/ProductStatusBadge.vue -->
<script setup lang="ts">
const props = defineProps<{
  type: 'approval' | 'state' | 'stock'
  value: number | string
  inventoryCount?: number
}>()

const getApprovalBadge = () => {
  const status = props.value as number
  switch (status) {
    case 0:
      return { color: 'warning', label: 'در انتظار تایید' }
    case 1:
      return { color: 'success', label: 'تایید شده' }
    case 2:
      return { color: 'error', label: 'رد شده' }
    default:
      return { color: 'neutral', label: 'نامشخص' }
  }
}

const getStateBadge = () => {
  const status = props.value as number
  switch (status) {
    case 0:
      return { color: 'neutral', label: 'پیش نویس' }
    case 1:
      return { color: 'success', label: 'منتشر شده' }
    case 2:
      return { color: 'error', label: 'غیر فعال' }
    default:
      return { color: 'neutral', label: 'نامشخص' }
  }
}

const getStockBadge = () => {
  const count = props.inventoryCount || 0
  if (count <= 0) return { color: 'error', label: 'ناموجود' }
  if (count < 10) return { color: 'warning', label: 'در حال اتمام' }
  return { color: 'success', label: 'موجود' }
}

const badge = computed(() => {
  switch (props.type) {
    case 'approval':
      return getApprovalBadge()
    case 'state':
      return getStateBadge()
    case 'stock':
      return getStockBadge()
    default:
      return { color: 'neutral', label: 'نامشخص' }
  }
})
</script>

<template>
  <UBadge :color="badge.color" variant="subtle" size="sm">
    <slot name="prefix" />
    {{ badge.label }}
    <slot name="suffix" />
  </UBadge>
</template>
