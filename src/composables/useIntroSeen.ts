import { ref } from 'vue'
import type { Ref } from 'vue'

export interface UseIntroSeen {
  seen: Ref<boolean>
  markSeen: () => void
}

const STORAGE_KEY = 'iran-cinema-intro-seen'
const seen = ref(readSeen())

function readSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useIntroSeen(): UseIntroSeen {
  function markSeen() {
    seen.value = true
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Хранилище может быть недоступно. Справка снова откроется при следующем запуске.
    }
  }

  return { seen, markSeen }
}
