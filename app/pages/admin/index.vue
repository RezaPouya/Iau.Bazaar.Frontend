<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'داشبورد مدیریت'
})
</script>

<template>
  <p>صفحه داشبورد</p>
</template>
