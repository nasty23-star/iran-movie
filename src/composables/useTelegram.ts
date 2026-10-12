import { computed, onMounted, shallowRef } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'
import type { TelegramUser } from '@/types/telegram'

export interface UseTelegram {
  account: ShallowRef<TelegramUser | null>
  displayName: ComputedRef<string>
  username: ComputedRef<string>
}

const account = shallowRef<TelegramUser | null>(null)
let bound = false

function bindTelegram() {
  const webApp = window.Telegram?.WebApp
  if (!webApp) return
  if (!bound) {
    webApp.ready()
    webApp.expand()
    bound = true
  }
  account.value = webApp.initDataUnsafe.user ?? null
}

export function useTelegram(): UseTelegram {
  bindTelegram()
  onMounted(bindTelegram)

  const displayName = computed(() => {
    const user = account.value
    if (!user) return 'Гость'
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    return fullName || user.username || 'Гость'
  })

  const username = computed(() => account.value?.username ?? '')

  return { account, displayName, username }
}
