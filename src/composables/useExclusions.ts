import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { catalogFilmIds } from '@/composables/useCatalog'

export interface UseExclusions {
  watchedIds: ComputedRef<string[]>
  blockedIds: ComputedRef<string[]>
  isWatched: (id: string) => boolean
  isBlocked: (id: string) => boolean
  toggleWatched: (id: string) => void
  toggleBlocked: (id: string) => void
}

const WATCHED_KEY = 'iran-cinema-watched'
const BLOCKED_KEY = 'iran-cinema-blacklist'
const watched = ref<string[]>(readIds(WATCHED_KEY))
const blocked = ref<string[]>(readIds(BLOCKED_KEY))

watch(
  catalogFilmIds,
  (known) => {
    prune(watched, WATCHED_KEY, known)
    prune(blocked, BLOCKED_KEY, known)
  },
  { immediate: true },
)

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const unique: string[] = []
    for (const item of parsed) {
      if (typeof item === 'string' && item.length > 0 && !unique.includes(item)) unique.push(item)
    }
    return unique
  } catch {
    return []
  }
}

function persist(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // Список остаётся в памяти, если хранилище недоступно.
  }
}

function prune(ids: Ref<string[]>, key: string, known: ReadonlySet<string>) {
  const next = ids.value.filter((id) => known.has(id))
  if (next.length === ids.value.length) return
  ids.value = next
  persist(key, next)
}

function toggle(ids: Ref<string[]>, key: string, id: string) {
  const next = ids.value.includes(id) ? ids.value.filter((item) => item !== id) : [...ids.value, id]
  ids.value = next
  persist(key, next)
}

export function useExclusions(): UseExclusions {
  const watchedIds = computed(() => watched.value)
  const blockedIds = computed(() => blocked.value)

  function isWatched(id: string) {
    return watched.value.includes(id)
  }

  function isBlocked(id: string) {
    return blocked.value.includes(id)
  }

  function toggleWatched(id: string) {
    toggle(watched, WATCHED_KEY, id)
  }

  function toggleBlocked(id: string) {
    toggle(blocked, BLOCKED_KEY, id)
  }

  return { watchedIds, blockedIds, isWatched, isBlocked, toggleWatched, toggleBlocked }
}
