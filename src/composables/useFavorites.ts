import { computed, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { catalogFilmIds } from '@/composables/useCatalog'
import type { FilmCardModel } from '@/types/film'

export interface UseFavorites {
  savedIds: ComputedRef<string[]>
  isSaved: (id: string) => boolean
  toggle: (id: string) => void
  remove: (id: string) => void
  shareFavorites: (films: FilmCardModel[]) => boolean
}

const STORAGE_KEY = 'iran-cinema-favorites'
const ids = ref<string[]>(readIds())

watch(
  catalogFilmIds,
  (known) => {
    const next = ids.value.filter((id) => known.has(id))
    if (next.length === ids.value.length) return
    ids.value = next
    persist()
  },
  { immediate: true },
)

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value))
  } catch {
    // Список остаётся в памяти, если хранилище недоступно.
  }
}

function shareText(films: FilmCardModel[]): string {
  const lines = films.map(
    (film) =>
      `${film.title} (${film.year}), IMDb ${film.imdbRating.toFixed(1)} — https://www.imdb.com/title/${film.imdbId}/`,
  )
  return ['Иранское кино. Избранное', ...lines].join('\n')
}

function openShare(url: string): boolean {
  const webApp = window.Telegram?.WebApp
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url)
    return true
  }
  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  return popup !== null
}

export function useFavorites(): UseFavorites {
  const savedIds = computed(() => ids.value)

  function isSaved(id: string) {
    return ids.value.includes(id)
  }

  function add(id: string) {
    if (isSaved(id)) return
    ids.value = [...ids.value, id]
    persist()
  }

  function remove(id: string) {
    ids.value = ids.value.filter((item) => item !== id)
    persist()
  }

  function toggle(id: string) {
    if (isSaved(id)) remove(id)
    else add(id)
  }

  function shareFavorites(films: FilmCardModel[]): boolean {
    if (films.length === 0) return false
    const params = new URLSearchParams({
      url: 'https://www.imdb.com/',
      text: shareText(films),
    })
    return openShare(`https://t.me/share/url?${params.toString()}`)
  }

  return { savedIds, isSaved, toggle, remove, shareFavorites }
}
