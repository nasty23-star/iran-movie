<script setup lang="ts">
import { computed } from 'vue'
import FilmPoster from '@/components/FilmPoster.vue'
import type { FilmCardModel } from '@/types/film'

const props = defineProps<{
  film: FilmCardModel
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const rating = computed(() => props.film.imdbRating.toFixed(1))

function onRemove() {
  emit('remove', props.film.id)
}
</script>

<template>
  <li class="card flex items-center gap-3 p-3">
    <div class="w-16 shrink-0">
      <FilmPoster :src="film.image" :title="film.title" />
    </div>
    <div class="min-w-0 flex-1">
      <h2 class="truncate font-display text-xl">{{ film.title }}</h2>
      <p class="text-sm text-muted">{{ film.year }} · IMDb {{ rating }}</p>
    </div>
    <button type="button" class="btn btn-danger" @click="onRemove">удалив</button>
  </li>
</template>
