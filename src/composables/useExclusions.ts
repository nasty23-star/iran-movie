import { computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { catalogFilmIds } from '@/composables/useCatalog'
import {
  bootIdCloudList,
  commitIdCloudList,
  createIdCloudList,
  pruneIdCloudList,
} from '@/composables/idCloud'

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
const watched = createIdCloudList(WATCHED_KEY)
const blocked = createIdCloudList(BLOCKED_KEY)

watch(
  catalogFilmIds,
  (known) => {
    pruneIdCloudList(watched, known)
    pruneIdCloudList(blocked, known)
  },
  { immediate: true },
)

bootIdCloudList(watched, () => catalogFilmIds.value)
bootIdCloudList(blocked, () => catalogFilmIds.value)

function toggleId(list: typeof watched, id: string) {
  const next = list.ids.value.includes(id)
    ? list.ids.value.filter((item) => item !== id)
    : [...list.ids.value, id]
  commitIdCloudList(list, next, true)
}

export function useExclusions(): UseExclusions {
  const watchedIds = computed(() => watched.ids.value)
  const blockedIds = computed(() => blocked.ids.value)

  function isWatched(id: string) {
    return watched.ids.value.includes(id)
  }

  function isBlocked(id: string) {
    return blocked.ids.value.includes(id)
  }

  function toggleWatched(id: string) {
    toggleId(watched, id)
  }

  function toggleBlocked(id: string) {
    toggleId(blocked, id)
  }

  return { watchedIds, blockedIds, isWatched, isBlocked, toggleWatched, toggleBlocked }
}
