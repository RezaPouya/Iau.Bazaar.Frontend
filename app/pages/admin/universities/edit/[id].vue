<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'ویرایش دانشگاه'
})

const route = useRoute()
const router = useRouter()
const universityId = computed(() => parseInt(route.params.id as string))

const { $api } = useNuxtApp()
const toast = useToast()

// Form state
const form = reactive({
  title: '',
  description: '',
  provinceId: 0,
  isActive: true,
  isVisible: true
})

const provinces = ref<{ id: number; name: string }[]>([])
const loading = ref(true)
const saving = ref(false)

// Fetch university data
const fetchUniversity = async () => {
  try {
    const response = await $api.get(`panel/admin/universities/${universityId.value}`)
    const data = response.data.data || response.data
    form.title = data.title
    form.description = data.description || ''
    form.provinceId = data.provinceId
    form.isActive = data.isActive
    form.isVisible = data.isVisible
  } catch (error) {
    console.error('خطا در دریافت اطلاعات دانشگاه', error)
    toast.add({ title: 'خطا در دریافت اطلاعات', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Fetch provinces
const fetchProvinces = async () => {
  try {
    const response = await $api.get('panel/admin/drop-downs/provinces')
    provinces.value = response.data.data || response.data
  } catch (error) {
    console.error('خطا در دریافت استان‌ها', error)
  }
}

// Save changes
const saveUniversity = async () => {
  saving.value = true
  try {
    await $api.put(`panel/admin/universities/${universityId.value}`, form)
    toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    router.push('/admin/universities')
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Cancel
const cancel = () => {
  router.push('/admin/universities')
}

onMounted(async () => {
  await Promise.all([fetchUniversity(), fetchProvinces()])
})
</script>

<template>
  <ClientOnly>
    <div class="max-w-4xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">ویرایش دانشگاه</h1>
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
          <UButton color="primary" :loading="saving" @click="saveUniversity">ذخیره تغییرات</UButton>
        </div>
      </div>

      <UCard v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin mx-auto" />
      </UCard>

      <UCard v-else>
        <UForm :state="form" class="space-y-4">
          <UFormField label="نام دانشگاه" required>
            <UInput v-model="form.title" class="w-full text-right" />
          </UFormField>

          <UFormField label="استان" required>
            <USelect
              v-model="form.provinceId"
              :items="provinces.map((p) => ({ label: p.name, value: p.id }))"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>

          <UFormField label="توضیحات (HTML)">
            <FeatureRichTextEditor v-model="form.description" placeholder="توضیحات دانشگاه را وارد کنید..." />
          </UFormField>

          <div class="flex gap-4">
            <UFormField label="فعال" class="flex-1">
              <USwitch v-model="form.isActive" />
            </UFormField>
            <UFormField label="قابل نمایش" class="flex-1">
              <USwitch v-model="form.isVisible" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
            <UButton color="primary" :loading="saving" @click="saveUniversity">ذخیره</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </ClientOnly>
</template>
