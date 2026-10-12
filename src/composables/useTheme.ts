import { ref } from 'vue'
import type { Ref } from 'vue'

export type ThemeName = 'light' | 'dark'

export interface UseTheme {
  theme: Ref<ThemeName>
  setTheme: (value: ThemeName) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'iran-cinema-theme'
const theme = ref<ThemeName>(readTheme())

function readTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    return 'light'
  }
  if (typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(value: ThemeName) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', value === 'dark' ? '#07090c' : '#e7f2fc')
}

applyTheme(theme.value)

export function useTheme(): UseTheme {
  function setTheme(value: ThemeName) {
    theme.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Хранилище может быть недоступно. Тема всё равно применяется на этот запуск.
    }
    applyTheme(value)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
