export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramBackButton {
  isVisible: boolean
  show: () => TelegramBackButton
  hide: () => TelegramBackButton
  onClick: (callback: () => void) => TelegramBackButton
  offClick: (callback: () => void) => TelegramBackButton
}

export interface TelegramMainButtonParams {
  text?: string
  color?: string
  text_color?: string
  is_active?: boolean
  is_visible?: boolean
}

export interface TelegramMainButton {
  isVisible: boolean
  setParams: (params: TelegramMainButtonParams) => TelegramMainButton
  show: () => TelegramMainButton
  hide: () => TelegramMainButton
  onClick: (callback: () => void) => TelegramMainButton
  offClick: (callback: () => void) => TelegramMainButton
}

export interface TelegramSafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData: string
  platform: string
  initDataUnsafe: {
    user?: TelegramUser
  }
  safeAreaInset?: TelegramSafeAreaInset
  contentSafeAreaInset?: TelegramSafeAreaInset
  onEvent?: (eventType: string, callback: () => void) => void
  offEvent?: (eventType: string, callback: () => void) => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  setBottomBarColor?: (color: string) => void
  openTelegramLink?: (url: string) => void
  openLink?: (url: string) => void
  BackButton?: TelegramBackButton
  MainButton?: TelegramMainButton
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
