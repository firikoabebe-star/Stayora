import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      
      setTheme: (theme: Theme) => {
        set({ theme })
        updateResolvedTheme(theme, set)
      },
      
      toggleTheme: () => {
        const { resolvedTheme } = get()
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        updateResolvedTheme(newTheme, set)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrate: (state) => {
        if (state) {
          updateResolvedTheme(state.theme, (updates) => {
            Object.assign(state, updates)
          })
        }
      }
    }
  )
)

function updateResolvedTheme(theme: Theme, set: (updates: Partial<ThemeState>) => void) {
  let resolvedTheme: 'light' | 'dark' = 'light'
  
  if (theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    resolvedTheme = theme
  }
  
  set({ resolvedTheme })
  
  // Update document class
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#111827' : '#ffffff')
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') {
      updateResolvedTheme('system', (updates) => {
        useThemeStore.setState(updates)
      })
    }
  })
}

// Theme configuration
export const themeConfig = {
  light: {
    background: 'bg-white',
    backgroundSecondary: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-300',
    card: 'bg-white border-gray-200',
    cardHover: 'hover:shadow-lg',
    button: 'bg-rose-500 hover:bg-rose-600 text-white',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    input: 'bg-white border-gray-300 focus:border-rose-500',
    overlay: 'bg-black/50',
  },
  dark: {
    background: 'bg-gray-900',
    backgroundSecondary: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    border: 'border-gray-700',
    borderHover: 'hover:border-gray-600',
    card: 'bg-gray-800 border-gray-700',
    cardHover: 'hover:shadow-2xl',
    button: 'bg-rose-500 hover:bg-rose-600 text-white',
    buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    input: 'bg-gray-800 border-gray-600 focus:border-rose-500 text-white',
    overlay: 'bg-black/70',
  }
}

export const useThemeClasses = () => {
  const { resolvedTheme } = useThemeStore()
  return themeConfig[resolvedTheme]
}