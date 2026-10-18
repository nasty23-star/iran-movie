<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery } from 'vue-router'
import FilmFilters from '@/components/FilmFilters.vue'
import FilmResultCard from '@/components/FilmResultCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExclusions } from '@/composables/useExclusions'
import { useExternalLink } from '@/composables/useExternalLink'
import { useFavorites } from '@/composables/useFavorites'
import {
  filmFilterQuery,
  filmFilterStateFromQuery,
  sameFilmFilterQuery,
  useFilmFilters,
} from '@/composables/useFilmFilters'
import type { FilmFilterState } from '@/composables/useFilmFilters'

const route = useRoute()
const router = useRouter()
const { films, years, genres } = useCatalog()
const { isSaved, toggle } = useFavorites()
const { watchedIds, isWatched, isBlocked, toggleWatched, toggleBlocked } = useExclusions()
const { openExternal } = useExternalLink()
const { query, yearFrom, yearTo, director, genre, hideWatched, filtered, reset } = useFilmFilters(
  films,
  watchedIds,
)

const watchedCount = computed(() => films.value.filter((film) => isWatched(film.id)).length)

function filterState(): FilmFilterState {
  return {
    query: query.value,
    yearFrom: yearFrom.value,
    yearTo: yearTo.value,
    director: director.value,
    genre: genre.value,
    hideWatched: hideWatched.value,
  }
}

function assignText(target: { value: string }, value: string) {
  if (target.value !== value) target.value = value
}

function applyQuery(value: LocationQuery) {
  const state = filmFilterStateFromQuery(value)
  assignText(query, state.query)
  assignText(yearFrom, state.yearFrom)
  assignText(yearTo, state.yearTo)
  assignText(director, state.director)
  assignText(genre, state.genre)
  if (hideWatched.value !== state.hideWatched) hideWatched.value = state.hideWatched
}

function onWatched(id: string) {
  toggleWatched(id)
}

function onBlocked(id: string) {
  toggleBlocked(id)
}

applyQuery(route.query)

watch(
  () => [query.value, yearFrom.value, yearTo.value, director.value, genre.value, hideWatched.value],
  () => {
    const next = filmFilterQuery(filterState())
    if (route.name !== 'home' || sameFilmFilterQuery(route.query, next)) return
    void router.replace({ name: 'home', query: next })
  },
)

watch(
  () => route.fullPath,
  () => {
    if (route.name !== 'home') return
    applyQuery(route.query)
  },
)
</script>

<template>
  <section class="mx-auto flex max-w-6xl flex-col gap-6">
    <div>
      <h1 class="font-display text-4xl">Каталог</h1>
      <p class="mt-2 max-w-2xl text-muted">
        Поиск по названию, период, режиссёр и жанр. Название открывает карточку фильма.
      </p>
    </div>
    <FilmFilters
      v-model:query="query"
      v-model:year-from="yearFrom"
      v-model:year-to="yearTo"
      v-model:director="director"
      v-model:genre="genre"
      v-model:hide-watched="hideWatched"
      :years="years"
      :genres="genres"
      @reset="reset"
    />
    <p class="text-sm text-muted">
      Фильмов: {{ filtered.length }} · Смотрели {{ watchedCount }} из {{ films.length }}
    </p>
    <p v-if="filtered.length === 0" class="card px-4 py-8 text-center text-muted">
      По этим условиям фильмов нет.
    </p>
    <div v-else class="grid gap-3 lg:grid-cols-2">
      <FilmResultCard
        v-for="film in filtered"
        :key="film.id"
        :film="film"
        :saved="isSaved(film.id)"
        :watched="isWatched(film.id)"
        :blocked="isBlocked(film.id)"
        @toggle="toggle"
        @open-link="openExternal"
        @toggle-watched="onWatched"
        @toggle-blocked="onBlocked"
      />
    </div>
  </section>
</template>
