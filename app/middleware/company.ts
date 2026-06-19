// app/middleware/company.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  const toast = useToast()

  // بررسی احراز هویت
  if (!auth.isAuthenticated) {
    return navigateTo('/account/login')
  }

  // بررسی نقش کاربر
  const role = auth.user?.role

  // نقش‌های مجاز برای پنل شرکت
  const allowedRoles = ['CompanyUser', 'Admin', 'Operator']

  if (!role || !allowedRoles.includes(role)) {
    toast.add({
      title: 'دسترسی غیرمجاز',
      description: 'شما دسترسی به پنل شرکت ندارید.',
      color: 'error'
    })
    return navigateTo('/')
  }

  // بررسی وجود شرکت برای کاربر
  // در آینده می‌توانیم بررسی کنیم که کاربر به یک شرکت متصل است یا خیر
})
