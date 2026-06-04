<script setup lang="ts">
import { debounce } from 'lodash-es'

const props = defineProps<{
  modelValue: any
  apiUrl: string
  labelKey?: string
  valueKey?: string
  placeholder?: string
  clearable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'select', item: any): void
}>()

const { $api } = useNuxtApp()
const search = ref('')
const items = ref<any[]>([])
const loading = ref(false)
const open = ref(false)

const valueKey = computed(() => props.valueKey || 'id')
const labelKey = computed(() => props.labelKey || 'title')

// Search function
const searchItems = async (keyword: string) => {
  if (!keyword.trim()) {
    items.value = []
    return
  }
  loading.value = true
  try {
    const response = await $api.get(props.apiUrl, {
      params: { keyword: keyword.trim(), pageSize: 10 }
    })
    items.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Search error:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = debounce((keyword: string) => {
  searchItems(keyword)
}, 500)

watch(search, (newVal) => {
  if (newVal) {
    debouncedSearch(newVal)
  } else {
    items.value = []
  }
})

const handleSelect = (item: any) => {
  const val = item[valueKey.value]
  emit('update:modelValue', val)
  emit('select', item)
  open.value = false
  search.value = item[labelKey.value] // Show selected label in input
}

const clearSelection = () => {
  emit('update:modelValue', null)
  search.value = ''
  items.value = []
}
</script>

<template>
  <div class="relative">
    <UInput
      :model-value="search"
      :placeholder="placeholder || 'جستجو...'"
      class="w-full text-right"
      @update:model-value="search = $event"
      @focus="open = true"
    >
      <template v-if="clearable && modelValue" #trailing>
        <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-x"
          size="xs"
          @click="clearSelection"
        />
      </template>
    </UInput>

    <div
      v-if="open && (items.length > 0 || loading)"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div v-if="loading" class="px-3 py-2 text-center text-gray-500">
        <UIcon name="i-lucide-loader-circle" class="animate-spin mx-auto" />
      </div>
      <div
        v-for="item in items"
        :key="item[valueKey]"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-right"
        @click="handleSelect(item)"
      >
        {{ item[labelKey] }}
      </div>
    </div>
  </div>
</template>
