<script setup lang="ts">
import FilmFilters from '@/components/FilmFilters.vue'
import FilmResultCard from '@/components/FilmResultCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExternalLink } from '@/composables/useExternalLink'
import { useFavorites } from '@/composables/useFavorites'
import { useFilmFilters } from '@/composables/useFilmFilters'

const { films, years, directors, genres } = useCatalog()
const { query, year, director, genre, filtered, reset } = useFilmFilters(films)
const { isSaved, toggle } = useFavorites()
const { openExternal } = useExternalLink()
</script>

<template>
  <section class="mx-auto flex max-w-6xl flex-col gap-6">
    <div>
      <h1 class="font-display text-4xl">Каталог</h1>
      <p class="mt-2 max-w-2xl text-muted">
        Поиск по названию, год, режиссёр и жанр. На карточке — постер, название, год, рейтинг IMDb и
        ссылка на фильм.
      </p>
    </div>
    <FilmFilters
      v-model:query="query"
      v-model:year="year"
      v-model:director="director"
      v-model:genre="genre"
      :years="years"
      :directors="directors"
      :genres="genres"
      @reset="reset"
    />
    <p class="text-sm text-muted">Найдено фильмов: {{ filtered.length }}</p>
    <p v-if="filtered.length === 0" class="card px-4 py-8 text-center text-muted">
      По этим условиям фильмов нет.
    </p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <FilmResultCard
        v-for="film in filtered"
        :key="film.id"
        :film="film"
        :saved="isSaved(film.id)"
        @toggle="toggle"
        @open-link="openExternal"
      />
    </div>
  </section>
</template>
