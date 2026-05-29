<template>
  <UApp>
    <UContainer>
      <UCard>
        <template #header>
          <h1 class="text-xl font-bold">داشبورد مدیریت</h1>
        </template>

        <div class="space-y-2">
          <p>
            خوش آمدید:
            <strong>
              {{ auth.user?.fullName }}
            </strong>
          </p>

          <p>
            نقش:
            <UBadge>
              {{ auth.user?.role }}
            </UBadge>
          </p>
        </div>
      </UCard>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const auth = useAuthStore()
</script>
