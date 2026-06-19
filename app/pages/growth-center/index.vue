<!-- app/pages/university/index.vue -->
<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">داشبورد مرکز رشد</h1>
    <UCard>
      <p>خوش آمدید، <strong>{{ auth.user?.fullName }}</strong></p>
      <p class="text-dimmed text-sm mt-2">از اینجا می‌توانید مراکز رشد، شرکت‌ها و محصولات زیر مجموعه خود را مدیریت کنید.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'university',
  middleware: 'auth',
  title: 'داشبورد مرکز رشد'
})

const auth = useAuthStore()
</script>
