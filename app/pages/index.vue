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
          <p>
            <button @click="lg.logout()" class="btn-danger">خروج</button>
          </p>
        </div>
      </UCard>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLogout } from '~/composables/useLogout'

const lg = useLogout()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const auth = useAuthStore()
</script>
