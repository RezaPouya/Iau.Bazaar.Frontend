<script setup lang="ts">
const searchQuery = ref('')
const router = useRouter()
const debouncedSearch = useDebounceFn(() => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { q: searchQuery.value.trim() } })
  }
}, 500)

watch(searchQuery, debouncedSearch)
</script>

<template>
  <UInput
    v-model="searchQuery"
    icon="i-lucide-search"
    placeholder="جستجوی محصولات..."
    size="lg"
    class="w-full max-w-2xl"
    :ui="{ icon: { leading: 'text-gray-400' } }"
  />
</template>
