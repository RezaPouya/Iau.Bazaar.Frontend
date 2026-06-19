// app/middleware/growth-center.ts
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

  // نقش‌های مجاز برای پنل مرکز رشد
  const allowedRoles = ['GrowthCenterUser', 'Admin', 'Operator']

  if (!role || !allowedRoles.includes(role)) {
    toast.add({
      title: 'دسترسی غیرمجاز',
      description: 'شما دسترسی به پنل مرکز رشد ندارید.',
      color: 'error'
    })
    return navigateTo('/')
  }

  // بررسی وجود مرکز رشد برای کاربر
  // در آینده می‌توانیم بررسی کنیم که کاربر به یک مرکز رشد متصل است یا خیر
})
