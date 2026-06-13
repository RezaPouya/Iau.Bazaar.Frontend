export const useTheme = () => {
  const isBrowser = typeof window !== 'undefined'

  const toggleTheme = () => {
    if (!isBrowser) return

    try {
      const html = document.documentElement
      html.classList.toggle('dark')
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light')
    } catch (error) {
      console.error('Failed to toggle theme:', error)
    }
  }

  const loadTheme = () => {
    if (!isBrowser) return

    try {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
    }
  }

  return {
    toggleTheme,
    loadTheme
  }
}
