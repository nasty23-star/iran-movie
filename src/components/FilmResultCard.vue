<script setup lang="ts">
import { computed } from 'vue'
import { imdbUrl } from '@/composables/useExternalLink'
import FilmPoster from '@/components/FilmPoster.vue'
import type { FilmCardModel } from '@/types/film'

const props = defineProps<{
  film: FilmCardModel
  saved: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  openLink: [url: string, event: MouseEvent]
}>()

const rating = computed(() => props.film.imdbRating.toFixed(1))
const meta = computed(() => {
  const genres = props.film.genres
  if (!genres || genres.length === 0) return String(props.film.year)
  return `${props.film.year} · ${genres.join(', ')}`
})
const href = computed(() => imdbUrl(props.film.imdbId))
const savedLabel = computed(() => (props.saved ? 'В избранном' : 'В избранное'))

function onToggle() {
  emit('toggle', props.film.id)
}

function onOpen(event: MouseEvent) {
  emit('openLink', href.value, event)
}
</script>

<template>
  <article class="card flex flex-col">
    <FilmPoster :src="film.image" :title="film.title" />
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-3">
        <h2 class="font-display text-xl leading-tight">{{ film.title }}</h2>
        <p class="rating">IMDb {{ rating }}</p>
      </div>
      <p class="text-sm text-muted">{{ meta }}</p>
      <div class="mt-auto flex flex-wrap items-center gap-2">
        <a
          :href="href"
          class="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          @click="onOpen"
        >
          На IMDb
        </a>
        <button type="button" class="btn btn-secondary" @click="onToggle">{{ savedLabel }}</button>
      </div>
    </div>
  </article>
</template>
