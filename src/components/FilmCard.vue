<script setup lang="ts">
import { computed } from 'vue'
import FavoriteHeart from '@/components/FavoriteHeart.vue'
import FilmPoster from '@/components/FilmPoster.vue'
import type { FilmCardModel } from '@/types/film'

const props = defineProps<{
  film: FilmCardModel
  saved: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

const rating = computed(() => props.film.imdbRating.toFixed(1))

function onToggle() {
  emit('toggle', props.film.id)
}
</script>

<template>
  <article class="card grid md:grid-cols-[11rem_1fr]">
    <FilmPoster :src="film.image" :title="film.title" />
    <div class="flex flex-col gap-3 p-4 md:p-5">
      <div class="flex items-start justify-between gap-3">
        <h2 class="font-display text-2xl leading-tight">{{ film.title }}</h2>
        <div class="flex shrink-0 items-center gap-2">
          <p class="rating">IMDb {{ rating }}</p>
          <FavoriteHeart :saved="saved" @toggle="onToggle" />
        </div>
      </div>
      <p class="text-sm text-muted">{{ film.year }} · {{ film.director }}</p>
      <p v-if="film.oscarNote" class="text-sm font-semibold text-accent">{{ film.oscarNote }}</p>
      <p class="text-sm leading-6">{{ film.description }}</p>
      <p v-if="film.note" class="rounded-xl bg-surface-2 px-3 py-2 text-sm leading-6 text-muted">
        {{ film.note }}
      </p>
    </div>
  </article>
</template>
