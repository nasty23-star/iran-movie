<script setup lang="ts">
import BackHome from '@/components/BackHome.vue'
import FilmCard from '@/components/FilmCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useFavorites } from '@/composables/useFavorites'
import { useNativeChrome } from '@/composables/useTelegramChrome'

const { oscarFilms } = useCatalog()
const { isSaved, toggle } = useFavorites()
const { nativeChrome } = useNativeChrome()
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">номинации на Оскар</h1>
      <BackHome v-if="!nativeChrome" />
    </div>
    <p class="text-muted">
      Фильмы иранских режиссёров, которые номинировали на «Оскар», включая победителей.
    </p>
    <div class="flex flex-col gap-4">
      <FilmCard
        v-for="film in oscarFilms"
        :key="film.id"
        :film="film"
        :saved="isSaved(film.id)"
        @toggle="toggle"
      />
    </div>
  </section>
</template>
