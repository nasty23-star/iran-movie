import { onMounted, onUnmounted, shallowRef, watch } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import type { ThemeName } from '@/composables/useTheme'
import type { TelegramWebApp } from '@/types/telegram'

export type AppStep = 'entry' | 'intro' | 'app'

export interface UseTelegramChromeOptions {
  step: Ref<AppStep>
  enter: () => void
  skip: () => void
  backToEntry: () => void
}

export interface UseNativeChrome {
  nativeChrome: ShallowRef<boolean>
}

const nativeChrome = shallowRef(false)

const MAIN_COLORS: Record<ThemeName, { color: string; text: string }> = {
  light: { color: '#143662', text: '#fbfcfd' },
  dark: { color: '#78b0e6', text: '#0b1a30' },
}

let clicksBound = false

function webApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

function isTelegramMiniApp(app: TelegramWebApp): boolean {
  if (!app.BackButton || !app.MainButton) return false
  if (app.initData) return true
  return app.platform !== 'unknown'
}

export function useNativeChrome(): UseNativeChrome {
  return { nativeChrome }
}

export function useTelegramChrome(options: UseTelegramChromeOptions): void {
  const route = useRoute()
  const router = useRouter()
  const { theme } = useTheme()

  function goBack() {
    if (hasHistoryBack()) {
      router.back()
      return
    }
    router.push({ name: 'home' })
  }

  function goHome() {
    router.push({ name: 'home' })
  }

  function onBackClick() {
    if (options.step.value === 'intro') {
      options.backToEntry()
      return
    }
    if (options.step.value === 'app' && route.name !== 'home') goBack()
  }

  function onMainClick() {
    if (options.step.value === 'entry') {
      options.enter()
      return
    }
    if (options.step.value === 'intro') {
      options.skip()
      return
    }
    if (options.step.value === 'app' && route.name !== 'home') goHome()
  }

  function showMain(text: string) {
    const app = webApp()
    if (!app?.MainButton) return
    const colors = MAIN_COLORS[theme.value]
    app.MainButton.setParams({
      text,
      color: colors.color,
      text_color: colors.text,
      is_active: true,
      is_visible: true,
    })
    app.MainButton.show()
  }

  function sync() {
    const app = webApp()
    const inside = app ? isTelegramMiniApp(app) : false
    nativeChrome.value = inside
    if (!inside || !app?.BackButton || !app.MainButton) return

    if (!clicksBound) {
      app.BackButton.onClick(onBackClick)
      app.MainButton.onClick(onMainClick)
      clicksBound = true
    }

    const step = options.step.value
    const atHome = step === 'app' && route.name === 'home'
    const showBack = step === 'intro' || (step === 'app' && !atHome)
    if (showBack) app.BackButton.show()
    else app.BackButton.hide()

    if (step === 'entry') {
      showMain('Войти')
      return
    }
    if (step === 'intro') {
      showMain('Пропустить')
      return
    }
    if (atHome) {
      app.MainButton.hide()
      return
    }
    showMain('На главную')
  }

  sync()
  watch([options.step, () => route.name, theme], sync)
  onMounted(sync)
  onUnmounted(() => {
    const app = webApp()
    app?.BackButton?.offClick(onBackClick)
    app?.MainButton?.offClick(onMainClick)
    app?.BackButton?.hide()
    app?.MainButton?.hide()
    clicksBound = false
    nativeChrome.value = false
  })
}

function hasHistoryBack(): boolean {
  const state: unknown = window.history.state
  if (!state || typeof state !== 'object' || !('back' in state)) return false
  return typeof state.back === 'string'
}
