<script setup lang="ts">
import { computed, onMounted } from 'vue'
import BackHome from '@/components/BackHome.vue'
import FilmCard from '@/components/FilmCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExclusions } from '@/composables/useExclusions'
import { useFavorites } from '@/composables/useFavorites'
import { useNativeChrome } from '@/composables/useTelegramChrome'
import { useRoulette } from '@/composables/useRoulette'

const { findById } = useCatalog()
const { isSaved, toggle } = useFavorites()
const { nativeChrome } = useNativeChrome()
const { watchedIds, blockedIds, isWatched, isBlocked, toggleWatched, toggleBlocked } =
  useExclusions()
const { current, notice, hint, spin } = useRoulette()

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

function onSpin() {
  spin()
}

function onWatched() {
  if (!current.value) return
  toggleWatched(current.value.id)
}

function onBlocked() {
  if (!current.value) return
  toggleBlocked(current.value.id)
}

onMounted(() => {
  if (!current.value) spin()
})
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
