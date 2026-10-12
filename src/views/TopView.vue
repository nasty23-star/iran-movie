<script setup lang="ts">
import BackHome from '@/components/BackHome.vue'
import FilmCard from '@/components/FilmCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useFavorites } from '@/composables/useFavorites'

const { recommendations } = useCatalog()
const { isSaved, toggle } = useFavorites()
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">мой топ фильмов</h1>
      <BackHome />
    </div>
    <p class="text-muted">
      Мои рекомендации: фильмы, с которых я начинаю разговор об иранском кино.
    </p>
    <div class="flex flex-col gap-4">
      <FilmCard
        v-for="film in recommendations"
        :key="film.id"
        :film="film"
        :saved="isSaved(film.id)"
        @toggle="toggle"
      />
    </div>
  </section>
</template>
