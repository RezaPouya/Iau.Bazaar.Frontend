<script setup lang="ts">
import type { ContactUsMessageDto, UpdateContactUsMessageDto } from '~/types/contact-us-message'
import { useAdminContactUsMessageService } from '~/services/admin/contact-us-message.service'

const props = defineProps<{
  open: boolean
  message: ContactUsMessageDto | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'message-updated', message: ContactUsMessageDto): void
  (e: 'message-deleted', id: number): void
}>()

const toast = useToast()
const messageService = useAdminContactUsMessageService()

const adminNote = ref('')
const saving = ref(false)
const deleting = ref(false)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.message && !props.message.isSeen) {
      try {
        const updated = await messageService.markAsSeen(props.message.id)
        emit('message-updated', updated)
      } catch (error) {
        console.error('Error marking as seen:', error)
      }
    }
    if (!isOpen) {
      adminNote.value = ''
    }
  }
)

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage?.adminNote) {
      adminNote.value = newMessage.adminNote
    } else {
      adminNote.value = ''
    }
  },
  { immediate: true }
)

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveAnswer = async () => {
  if (!props.message) return
  saving.value = true
  try {
    const updated = await messageService.answerMessage(props.message.id, adminNote.value)
    toast.add({ title: 'پاسخ با موفقیت ثبت شد', color: 'success' })
    emit('message-updated', updated)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ثبت پاسخ', color: 'error' })
  } finally {
    saving.value = false
  }
}

const toggleSeen = async () => {
  if (!props.message) return
  try {
    const updated = await messageService.toggleSeen(props.message.id, !props.message.isSeen)
    toast.add({
      title: updated.isSeen ? 'پیام به عنوان خوانده شده علامت‌گذاری شد' : 'پیام به عنوان خوانده نشده علامت‌گذاری شد',
      color: 'success'
    })
    emit('message-updated', updated)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

const toggleAnswered = async () => {
  if (!props.message) return
  try {
    const updated = await messageService.toggleAnswered(props.message.id, !props.message.isAnswered, adminNote.value)
    toast.add({
      title: updated.isAnswered ? 'پیام به عنوان پاسخ داده شده علامت‌گذاری شد' : 'وضعیت پاسخ به پیام برداشته شد',
      color: 'success'
    })
    emit('message-updated', updated)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

const deleteMessage = async () => {
  if (!props.message) return
  deleting.value = true
  try {
    await messageService.deleteMessage(props.message.id)
    toast.add({ title: 'پیام با موفقیت حذف شد', color: 'success' })
    emit('message-deleted', props.message.id)
    emit('update:open', false)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  emit('update:open', false)
}

const confirmDelete = () => {
  toast.add({
    title: 'تأیید حذف',
    description: 'آیا از حذف این پیام اطمینان دارید؟',
    color: 'error',
    actions: [
      { label: 'بله', onClick: deleteMessage },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}
</script>

<template>
  <UModal :open="open" title="مشاهده پیام" class="max-w-4xl" @update:open="closeModal">
    <template #body>
      <div v-if="message" class="space-y-4">
        <!-- Header -->
        <div class="flex flex-wrap justify-between items-start gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-2">
            <UBadge :color="message.isSeen ? 'info' : 'warning'" variant="subtle" size="sm" class="cursor-pointer" @click="toggleSeen">
              <UIcon :name="message.isSeen ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="ml-1 size-3" />
              {{ message.isSeen ? 'خوانده شده' : 'خوانده نشده' }}
            </UBadge>
            <UBadge :color="message.isAnswered ? 'success' : 'neutral'" variant="subtle" size="sm" class="cursor-pointer" @click="toggleAnswered">
              <UIcon :name="message.isAnswered ? 'i-lucide-reply' : 'i-lucide-reply-all'" class="ml-1 size-3" />
              {{ message.isAnswered ? 'پاسخ داده شده' : 'پاسخ داده نشده' }}
            </UBadge>
          </div>
          <div class="flex gap-1">
            <UButton size="sm" color="error" variant="ghost" :loading="deleting" @click="confirmDelete">
              <UIcon name="i-lucide-trash" class="size-4" />
            </UButton>
          </div>
        </div>

        <!-- Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div><span class="text-dimmed">نام فرستنده:</span> <span class="mr-2 font-medium">{{ message.fullName }}</span></div>
          <div><span class="text-dimmed">ایمیل:</span> <span class="mr-2 font-medium">{{ message.email }}</span></div>
          <div v-if="message.phoneNumber"><span class="text-dimmed">شماره تماس:</span> <span class="mr-2 font-medium" dir="ltr">{{ message.phoneNumber }}</span></div>
          <div><span class="text-dimmed">تاریخ ارسال:</span> <span class="mr-2 font-medium">{{ formatDate(message.createdAt) }}</span></div>
          <div v-if="message.answeredAt"><span class="text-dimmed">تاریخ پاسخ:</span> <span class="mr-2 font-medium">{{ formatDate(message.answeredAt) }}</span></div>
        </div>

        <!-- Subject -->
        <div>
          <h3 class="text-base font-semibold mb-2">موضوع:</h3>
          <p class="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{{ message.subject }}</p>
        </div>

        <!-- Body -->
        <div>
          <h3 class="text-base font-semibold mb-2">متن پیام:</h3>
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap">{{ message.text }}</div>
        </div>

        <!-- Answer -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="text-base font-semibold mb-3">پاسخ به پیام</h3>
          <div v-if="message.adminNote" class="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-reply" class="size-4 text-primary-600" />
              <span class="text-sm font-medium">پاسخ ثبت شده:</span>
              <span v-if="message.answeredAt" class="text-xs text-dimmed">{{ formatDate(message.answeredAt) }}</span>
            </div>
            <p class="text-sm whitespace-pre-wrap">{{ message.adminNote }}</p>
          </div>
          <div class="space-y-3">
            <UTextarea v-model="adminNote" placeholder="پاسخ خود را بنویسید..." rows="4" class="w-full" />
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
              <UButton color="primary" :loading="saving" :disabled="!adminNote.trim()" @click="saveAnswer">
                <UIcon name="i-lucide-send" class="ml-1 size-4" />
                ثبت پاسخ
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
