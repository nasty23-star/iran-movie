import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { LocationQuery } from 'vue-router'
import type { Film } from '@/types/film'

export interface UseFilmFilters {
  query: Ref<string>
  yearFrom: Ref<string>
  yearTo: Ref<string>
  director: Ref<string>
  genre: Ref<string>
  hideWatched: Ref<boolean>
  active: ComputedRef<boolean>
  filtered: ComputedRef<Film[]>
  reset: () => void
}

export interface FilmFilterState {
  query: string
  yearFrom: string
  yearTo: string
  director: string
  genre: string
  hideWatched: boolean
}

const FILTER_KEYS = ['q', 'from', 'to', 'director', 'genre', 'hide'] as const

export function useFilmFilters(
  source: MaybeRefOrGetter<Film[]>,
  watchedIds: MaybeRefOrGetter<readonly string[]> = () => [],
): UseFilmFilters {
  const query = ref('')
  const yearFrom = ref('')
  const yearTo = ref('')
  const director = ref('')
  const genre = ref('')
  const hideWatched = ref(false)
  const active = computed(
    () =>
      query.value.trim().length > 0 ||
      yearBound(yearFrom.value) !== null ||
      yearBound(yearTo.value) !== null ||
      director.value.trim().length > 0 ||
      genre.value !== '' ||
      hideWatched.value,
  )

  const filtered = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase('ru')
    const directorNeedle = director.value.trim().toLocaleLowerCase('ru')
    const period = yearPeriod(yearFrom.value, yearTo.value)
    const watched = new Set(toValue(watchedIds))
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
        const matchesWatched = !hideWatched.value || !watched.has(film.id)
        return matchesQuery && matchesPeriod && matchesDirector && matchesGenre && matchesWatched
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
    hideWatched.value = false
  }

  return { query, yearFrom, yearTo, director, genre, hideWatched, active, filtered, reset }
}

export function filmFilterStateFromQuery(query: LocationQuery): FilmFilterState {
  return {
    query: queryValue(query, 'q'),
    yearFrom: queryValue(query, 'from'),
    yearTo: queryValue(query, 'to'),
    director: queryValue(query, 'director'),
    genre: queryValue(query, 'genre'),
    hideWatched: queryValue(query, 'hide') === '1',
  }
}

export function filmFilterQuery(state: FilmFilterState): LocationQuery {
  const query: LocationQuery = {}
  if (state.query.length > 0) query.q = state.query
  if (state.yearFrom.length > 0) query.from = state.yearFrom
  if (state.yearTo.length > 0) query.to = state.yearTo
  if (state.director.length > 0) query.director = state.director
  if (state.genre.length > 0) query.genre = state.genre
  if (state.hideWatched) query.hide = '1'
  return query
}

export function sameFilmFilterQuery(left: LocationQuery, right: LocationQuery): boolean {
  return FILTER_KEYS.every((key) => queryValue(left, key) === queryValue(right, key))
}

export function filmFilterSliceActive(query: LocationQuery): boolean {
  const state = filmFilterStateFromQuery(query)
  return (
    state.query.length > 0 ||
    state.yearFrom.length > 0 ||
    state.yearTo.length > 0 ||
    state.director.length > 0 ||
    state.genre.length > 0
  )
}

function queryValue(query: LocationQuery, key: string): string {
  const value = query[key]
  return typeof value === 'string' ? value : ''
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
