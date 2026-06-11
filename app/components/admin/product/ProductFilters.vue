<!-- app/components/admin/product/ProductFilters.vue -->
<script setup lang="ts">
interface Company {
  id: number
  title: string
}

const props = defineProps<{
  companies: Company[]
}>()

const filters = defineModel('filters', {
  type: Object,
  default: () => ({
    title: '',
    sku: '',
    companyId: null as number | null,
    approvalStatus: null as string | null,
    state: null as string | null
  })
})

const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'clear'): void
}>()

const applyFilters = () => emit('apply')
const clearFilters = () => emit('clear')
</script>

<template>
  <UCard class="mb-3 p-3">
    <div class="flex flex-wrap gap-2 items-end">
      <UFormField label="نام محصول" class="flex-1 min-w-[150px]">
        <UInput v-model="filters.title" placeholder="جستجو..." class="w-full text-right" />
      </UFormField>

      <UFormField label="SKU" class="w-32">
        <UInput v-model="filters.sku" placeholder="کد محصول..." class="w-full text-left" />
      </UFormField>

      <UFormField label="شرکت" class="w-48">
        <USelect
          v-model="filters.companyId"
          :items="[{ label: 'همه شرکت‌ها', value: null }, ...companies.map((c) => ({ label: c.title, value: c.id }))]"
          class="w-full"
          :popper="{ placement: 'bottom-end' }"
        />
      </UFormField>

      <UFormField label="وضعیت تایید" class="w-32">
        <USelect
          v-model="filters.approvalStatus"
          :items="[
            { label: 'همه', value: null },
            { label: 'در انتظار تایید', value: '0' },
            { label: 'تایید شده', value: '1' },
            { label: 'رد شده', value: '2' }
          ]"
          class="w-full"
          :popper="{ placement: 'bottom-end' }"
        />
      </UFormField>

      <UFormField label="وضعیت" class="w-28">
        <USelect
          v-model="filters.state"
          :items="[
            { label: 'همه', value: null },
            { label: 'پیش نویس', value: '0' },
            { label: 'منتشر شده', value: '1' },
            { label: 'غیر فعال', value: '2' }
          ]"
          class="w-full"
          :popper="{ placement: 'bottom-end' }"
        />
      </UFormField>

      <div class="flex gap-1">
        <UButton size="sm" @click="applyFilters">اعمال</UButton>
        <UButton size="sm" color="neutral" variant="ghost" @click="clearFilters">پاک کردن</UButton>
      </div>
    </div>
  </UCard>
</template>
