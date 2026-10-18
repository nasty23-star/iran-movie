import { onMounted, onUnmounted, shallowRef, watch } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import type { ThemeName } from '@/composables/useTheme'
import type { TelegramSafeAreaInset, TelegramWebApp } from '@/types/telegram'

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

const CHROME_COLORS: Record<ThemeName, { header: string; background: string }> = {
  light: { header: '#e7f2fc', background: '#f5f7f9' },
  dark: { header: '#07090c', background: '#21262e' },
}

const SAFE_VARS = [
  '--app-safe-top',
  '--app-safe-right',
  '--app-safe-bottom',
  '--app-safe-left',
] as const

let clicksBound = false
let insetsBound = false

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
    if (options.step.value === 'intro') options.skip()
  }

  function onInsetsChanged() {
    applySafeArea()
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
    applyPhoneNav(inside ? app : null)
    if (!inside || !app?.BackButton || !app.MainButton) return

    if (!clicksBound) {
      app.BackButton.onClick(onBackClick)
      app.MainButton.onClick(onMainClick)
      clicksBound = true
    }

    paintChrome(app, theme.value)
    applySafeArea()
    if (!insetsBound && app.onEvent) {
      app.onEvent('safeAreaChanged', onInsetsChanged)
      app.onEvent('contentSafeAreaChanged', onInsetsChanged)
      insetsBound = true
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
    app.MainButton.hide()
  }

  sync()
  watch([options.step, () => route.name, theme], sync)
  onMounted(sync)
  onUnmounted(() => {
    const app = webApp()
    app?.BackButton?.offClick(onBackClick)
    app?.MainButton?.offClick(onMainClick)
    if (insetsBound) {
      app?.offEvent?.('safeAreaChanged', onInsetsChanged)
      app?.offEvent?.('contentSafeAreaChanged', onInsetsChanged)
      insetsBound = false
    }
    app?.BackButton?.hide()
    app?.MainButton?.hide()
    clicksBound = false
    nativeChrome.value = false
    clearSafeArea()
    applyPhoneNav(null)
  })
}

function paintChrome(app: TelegramWebApp, themeName: ThemeName) {
  const colors = CHROME_COLORS[themeName]
  app.setHeaderColor?.(colors.header)
  app.setBackgroundColor?.(colors.background)
  app.setBottomBarColor?.(colors.background)
}

function applySafeArea() {
  const app = webApp()
  if (!app || !isTelegramMiniApp(app)) {
    clearSafeArea()
    return
  }
  const root = document.documentElement
  root.style.setProperty('--app-safe-top', `${insetSum(app, 'top')}px`)
  root.style.setProperty('--app-safe-right', `${insetSum(app, 'right')}px`)
  root.style.setProperty('--app-safe-bottom', `${insetSum(app, 'bottom')}px`)
  root.style.setProperty('--app-safe-left', `${insetSum(app, 'left')}px`)
}

function clearSafeArea() {
  const root = document.documentElement
  for (const name of SAFE_VARS) root.style.removeProperty(name)
}

function applyPhoneNav(app: TelegramWebApp | null) {
  const root = document.documentElement
  if (app && isPhonePlatform(app.platform)) root.dataset.tgMobile = ''
  else delete root.dataset.tgMobile
}

function isPhonePlatform(platform: string): boolean {
  return platform === 'ios' || platform === 'android' || platform === 'android_x'
}

function insetSum(app: TelegramWebApp, side: keyof TelegramSafeAreaInset): number {
  return readInset(app.safeAreaInset, side) + readInset(app.contentSafeAreaInset, side)
}

function readInset(
  inset: TelegramSafeAreaInset | undefined,
  side: keyof TelegramSafeAreaInset,
): number {
  const value = inset?.[side]
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function hasHistoryBack(): boolean {
  const state: unknown = window.history.state
  if (!state || typeof state !== 'object' || !('back' in state)) return false
  return typeof state.back === 'string'
}
