import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { Film } from '@/types/film'

export interface UseFilmFilters {
  query: Ref<string>
  year: Ref<string>
  director: Ref<string>
  genre: Ref<string>
  active: ComputedRef<boolean>
  filtered: ComputedRef<Film[]>
  reset: () => void
}

export function useFilmFilters(source: MaybeRefOrGetter<Film[]>): UseFilmFilters {
  const query = ref('')
  const year = ref('')
  const director = ref('')
  const genre = ref('')
  const active = computed(
    () =>
      query.value.trim().length > 0 ||
      year.value !== '' ||
      director.value !== '' ||
      genre.value !== '',
  )

  const filtered = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase('ru')
    return toValue(source)
      .filter((film) => {
        const matchesQuery =
          needle.length === 0 || film.title.toLocaleLowerCase('ru').includes(needle)
        const matchesYear = year.value === '' || film.year === Number(year.value)
        const matchesDirector = director.value === '' || film.director === director.value
        const matchesGenre = genre.value === '' || film.genres.includes(genre.value)
        return matchesQuery && matchesYear && matchesDirector && matchesGenre
      })
      .toSorted(
        (left, right) => right.year - left.year || left.title.localeCompare(right.title, 'ru'),
      )
  })

  function reset() {
    query.value = ''
    year.value = ''
    director.value = ''
    genre.value = ''
  }

  return { query, year, director, genre, active, filtered, reset }
}
