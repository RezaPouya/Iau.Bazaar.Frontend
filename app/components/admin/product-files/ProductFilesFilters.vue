<!-- app/components/admin/product-files/ProductFilesFilters.vue -->
<script setup lang="ts">
const filters = defineModel('filters', {
  type: Object,
  default: () => ({
    title: '',
    fileName: '',
    approvalStatus: null as string | null
  })
})

const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'clear'): void
}>()

const statusOptions = [
  { label: 'همه', value: null },
  { label: 'در انتظار تایید', value: 'Pending' },
  { label: 'تایید شده', value: 'Approved' },
  { label: 'رد شده', value: 'Rejected' }
]

const applyFilters = () => emit('apply')
const clearFilters = () => emit('clear')
</script>

<template>
  <UCard class="mb-3 p-3">
    <div class="flex flex-wrap gap-2 items-end">
      <UFormField label="عنوان" class="flex-1 min-w-[150px]">
        <UInput v-model="filters.title" placeholder="جستجو در عنوان..." class="w-full text-right" />
      </UFormField>

      <UFormField label="نام فایل" class="w-48">
        <UInput v-model="filters.fileName" placeholder="جستجو در نام فایل..." class="w-full text-right" />
      </UFormField>

      <UFormField label="وضعیت تایید" class="w-32">
        <USelect v-model="filters.approvalStatus" :items="statusOptions" class="w-full" :popper="{ placement: 'bottom-end' }" />
      </UFormField>

      <div class="flex gap-1">
        <UButton size="sm" @click="applyFilters">اعمال</UButton>
        <UButton size="sm" color="neutral" variant="ghost" @click="clearFilters">پاک کردن</UButton>
      </div>
    </div>
  </UCard>
</template>
