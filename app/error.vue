<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'صفحه مورد نظر یافت نشد.',
  description: 'صفحه مورد نظر یافت نشد. لطفا آدرس وارد شده را بررسی کنید.'
})

useHead({
  htmlAttrs: {
    lang: 'fa-IR',
    dir: 'rtl'
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
