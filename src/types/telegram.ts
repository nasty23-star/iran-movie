export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initDataUnsafe: {
    user?: TelegramUser
  }
  openTelegramLink?: (url: string) => void
  openLink?: (url: string) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
