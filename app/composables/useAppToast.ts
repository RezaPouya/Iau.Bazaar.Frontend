// app/composables/useAppToast.ts
export const useAppToast = () => {
  const toast = useToast()

  const success = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  const error = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }

  const warning = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-lucide-triangle-alert'
    })
  }

  const info = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  return { success, error, warning, info }
}
