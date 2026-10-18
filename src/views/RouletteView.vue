<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackHome from '@/components/BackHome.vue'
import FilmCard from '@/components/FilmCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExclusions } from '@/composables/useExclusions'
import { useFavorites } from '@/composables/useFavorites'
import {
  filmFilterSliceActive,
  filmFilterStateFromQuery,
  useFilmFilters,
} from '@/composables/useFilmFilters'
import { useNativeChrome } from '@/composables/useTelegramChrome'
import { useRoulette } from '@/composables/useRoulette'

const route = useRoute()
const { films, findById } = useCatalog()
const { isSaved, toggle } = useFavorites()
const { nativeChrome } = useNativeChrome()
const { watchedIds, blockedIds, isWatched, isBlocked, toggleWatched, toggleBlocked } =
  useExclusions()
const { query, yearFrom, yearTo, director, genre, hideWatched, filtered } = useFilmFilters(films)
const { current, notice, hint, spin } = useRoulette()

const sliceText = computed(() => {
  const parts: string[] = []
  const title = query.value.trim()
  if (title.length > 0) parts.push(`«${title}»`)
  if (genre.value.length > 0) parts.push(genre.value)
  const name = director.value.trim()
  if (name.length > 0) parts.push(name)
  if (yearFrom.value.length > 0 || yearTo.value.length > 0) {
    parts.push(`${yearFrom.value || '…'}–${yearTo.value || '…'}`)
  }
  if (parts.length === 0) return ''
  return `Случайный фильм из выборки: ${parts.join(', ')}.`
})

const watchedFilms = computed(() =>
  watchedIds.value.flatMap((id) => {
    const film = findById(id)
    return film ? [film] : []
  }),
)
const blockedFilms = computed(() =>
  blockedIds.value.flatMap((id) => {
    const film = findById(id)
    return film ? [film] : []
  }),
)
const watchedLabel = computed(() =>
  current.value && isWatched(current.value.id) ? 'Убрать из просмотренного' : 'Просмотрено',
)
const blockedLabel = computed(() =>
  current.value && isBlocked(current.value.id) ? 'Убрать из чёрного списка' : 'В чёрный список',
)

function applyRoute() {
  const state = filmFilterStateFromQuery(route.query)
  query.value = state.query
  yearFrom.value = state.yearFrom
  yearTo.value = state.yearTo
  director.value = state.director
  genre.value = state.genre
  hideWatched.value = false
}

function spinFromRoute() {
  if (route.name !== 'roulette') return
  applyRoute()
  if (filmFilterSliceActive(route.query) || !current.value) spin(filtered.value)
}

function onSpin() {
  spin(filtered.value)
}

function onWatched() {
  if (!current.value) return
  toggleWatched(current.value.id)
}

function onBlocked() {
  if (!current.value) return
  toggleBlocked(current.value.id)
}

watch(() => route.fullPath, spinFromRoute, { immediate: true })
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">рулетка</h1>
      <BackHome v-if="!nativeChrome" />
    </div>
    <p class="max-w-2xl text-muted">
      Рандом выбирает один фильм. Выбор случайный, но шанс выше у того, что ближе к вашему вкусу.
      Просмотренное и чёрный список не участвуют, подряд один и тот же фильм не выпадает.
    </p>
    <p v-if="sliceText" class="text-sm text-muted">{{ sliceText }}</p>
    <div>
      <button type="button" class="btn btn-primary" @click="onSpin">Жмать</button>
    </div>
    <p v-if="notice" role="status" class="text-sm font-semibold text-accent">{{ notice }}</p>
    <template v-if="current">
      <p class="text-sm text-muted">{{ hint }}</p>
      <FilmCard :film="current" :saved="isSaved(current.id)" @toggle="toggle" />
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-secondary" @click="onWatched">
          {{ watchedLabel }}
        </button>
        <button type="button" class="btn btn-danger" @click="onBlocked">{{ blockedLabel }}</button>
      </div>
    </template>
    <section v-if="watchedFilms.length > 0" class="flex flex-col gap-3">
      <h2 class="font-display text-2xl">Просмотренное</h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="film in watchedFilms"
          :key="film.id"
          class="flex items-center justify-between gap-3"
        >
          <span>{{ film.title }}</span>
          <button type="button" class="btn btn-secondary" @click="toggleWatched(film.id)">
            убрать
          </button>
        </li>
      </ul>
    </section>
    <section v-if="blockedFilms.length > 0" class="flex flex-col gap-3">
      <h2 class="font-display text-2xl">Чёрный список</h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="film in blockedFilms"
          :key="film.id"
          class="flex items-center justify-between gap-3"
        >
          <span>{{ film.title }}</span>
          <button type="button" class="btn btn-secondary" @click="toggleBlocked(film.id)">
            убрать
          </button>
        </li>
      </ul>
    </section>
  </section>
</template>
