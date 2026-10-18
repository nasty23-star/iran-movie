<script setup lang="ts">
import { computed } from 'vue'
import FavoriteNote from '@/components/FavoriteNote.vue'
import FilmPoster from '@/components/FilmPoster.vue'
import type { FilmCardModel } from '@/types/film'

const props = defineProps<{
  film: FilmCardModel
  note: string
}>()

const emit = defineEmits<{
  remove: [id: string]
  note: [id: string, value: string]
}>()

const rating = computed(() => props.film.imdbRating.toFixed(1))

function onRemove() {
  emit('remove', props.film.id)
}

function onNote(value: string) {
  emit('note', props.film.id, value)
}
</script>

<template>
  <li class="card flex flex-col gap-3 p-3">
    <div class="flex items-center gap-3">
      <div class="w-16 shrink-0">
        <FilmPoster :src="film.image" :title="film.title" />
      </div>
      <div class="min-w-0 flex-1">
        <h2 class="truncate font-display text-xl">{{ film.title }}</h2>
        <p class="text-sm text-muted">{{ film.year }} · IMDb {{ rating }}</p>
      </div>
      <button type="button" class="btn btn-danger" @click="onRemove">удалить</button>
    </div>
    <FavoriteNote :note="note" @update="onNote" />
  </li>
</template>
