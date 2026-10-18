import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { Film } from '@/types/film'

export interface UseFilmFilters {
  query: Ref<string>
  yearFrom: Ref<string>
  yearTo: Ref<string>
  director: Ref<string>
  genre: Ref<string>
  active: ComputedRef<boolean>
  filtered: ComputedRef<Film[]>
  reset: () => void
}

export function useFilmFilters(source: MaybeRefOrGetter<Film[]>): UseFilmFilters {
  const query = ref('')
  const yearFrom = ref('')
  const yearTo = ref('')
  const director = ref('')
  const genre = ref('')
  const active = computed(
    () =>
      query.value.trim().length > 0 ||
      yearBound(yearFrom.value) !== null ||
      yearBound(yearTo.value) !== null ||
      director.value.trim().length > 0 ||
      genre.value !== '',
  )

  const filtered = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase('ru')
    const directorNeedle = director.value.trim().toLocaleLowerCase('ru')
    const period = yearPeriod(yearFrom.value, yearTo.value)
    return toValue(source)
      .filter((film) => {
        const matchesQuery =
          needle.length === 0 || film.title.toLocaleLowerCase('ru').includes(needle)
        const matchesPeriod =
          (period.from === null || film.year >= period.from) &&
          (period.to === null || film.year <= period.to)
        const matchesDirector =
          directorNeedle.length === 0 ||
          film.director.toLocaleLowerCase('ru').includes(directorNeedle)
        const matchesGenre = genre.value === '' || film.genres.includes(genre.value)
        return matchesQuery && matchesPeriod && matchesDirector && matchesGenre
      })
      .toSorted(
        (left, right) => right.year - left.year || left.title.localeCompare(right.title, 'ru'),
      )
  })

  function reset() {
    query.value = ''
    yearFrom.value = ''
    yearTo.value = ''
    director.value = ''
    genre.value = ''
  }

  return { query, yearFrom, yearTo, director, genre, active, filtered, reset }
}

function yearPeriod(from: string, to: string) {
  const start = yearBound(from)
  const end = yearBound(to)
  if (start !== null && end !== null && start > end) return { from: end, to: start }
  return { from: start, to: end }
}

function yearBound(value: string) {
  if (typeof value !== 'string' || value === '') return null
  const year = Number(value)
  return Number.isInteger(year) ? year : null
}
