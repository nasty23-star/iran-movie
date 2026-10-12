import { computed, ref, shallowRef } from 'vue'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExclusions } from '@/composables/useExclusions'
import { useFavorites } from '@/composables/useFavorites'
import type { Film } from '@/types/film'

export interface UseRoulette {
  current: ShallowRef<Film | null>
  notice: Ref<string>
  hint: ComputedRef<string>
  spin: () => void
}

interface Taste {
  directors: Map<string, number>
  genres: Map<string, number>
}

const current = shallowRef<Film | null>(null)
const lastId = ref<string | null>(null)
const notice = ref('')

const emptyTaste: Taste = { directors: new Map(), genres: new Map() }

export function useRoulette(): UseRoulette {
  const { films } = useCatalog()
  const { savedIds } = useFavorites()
  const { watchedIds, blockedIds } = useExclusions()

  const taste = computed(() => buildTaste(films.value, savedIds.value))

  const hint = computed(() => {
    const film = current.value
    if (!film) return ''
    if (taste.value.directors.size === 0 && taste.value.genres.size === 0) {
      return 'Избранного нет, шансы были равные.'
    }
    if (filmWeight(film, taste.value) > 1) return 'Шанс был выше: фильм ближе к избранному.'
    return 'Шанс был ниже: с избранным мало общего.'
  })

  function spin() {
    const excluded = new Set([...watchedIds.value, ...blockedIds.value])
    let pool = films.value.filter((film) => !excluded.has(film.id))
    if (pool.length === 0) {
      notice.value = 'Просмотренное и чёрный список закрыли весь каталог.'
      return
    }
    if (lastId.value && pool.some((film) => film.id !== lastId.value)) {
      pool = pool.filter((film) => film.id !== lastId.value)
    } else if (pool.length === 1 && pool[0]?.id === lastId.value) {
      notice.value = 'Подряд тот же фильм не предлагаем, а других сейчас нет.'
      return
    }

    const picked = pickWeighted(pool, taste.value, Math.random)
    if (!picked) {
      notice.value = 'Сейчас нечего предложить.'
      return
    }
    lastId.value = picked.id
    current.value = picked
    notice.value = ''
  }

  return { current, notice, hint, spin }
}

function buildTaste(catalog: Film[], savedIds: string[]): Taste {
  const byId = new Map(catalog.map((film) => [film.id, film]))
  const taste: Taste = { directors: new Map(), genres: new Map() }
  for (const id of savedIds) {
    const film = byId.get(id)
    if (!film) continue
    taste.directors.set(film.director, (taste.directors.get(film.director) ?? 0) + 1)
    for (const genre of film.genres) {
      taste.genres.set(genre, (taste.genres.get(genre) ?? 0) + 1)
    }
  }
  return taste.directors.size === 0 && taste.genres.size === 0 ? emptyTaste : taste
}

function filmWeight(film: Film, taste: Taste) {
  let score = 1
  score += (taste.directors.get(film.director) ?? 0) * 3
  for (const genre of film.genres) score += taste.genres.get(genre) ?? 0
  return score
}

function pickWeighted(pool: Film[], taste: Taste, random: () => number): Film | null {
  if (pool.length === 0) return null
  const weights = pool.map((film) => filmWeight(film, taste))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let cursor = random() * total
  for (let index = 0; index < pool.length; index += 1) {
    cursor -= weights[index] ?? 0
    const film = pool[index]
    if (cursor < 0 && film) return film
  }
  return pool[pool.length - 1] ?? null
}
