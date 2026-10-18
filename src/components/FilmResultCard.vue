<script setup lang="ts">
import { computed, ref } from 'vue'
import { imdbUrl } from '@/composables/useExternalLink'
import FavoriteHeart from '@/components/FavoriteHeart.vue'
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

const open = ref(false)
const rating = computed(() => props.film.imdbRating.toFixed(1))
const meta = computed(() => `${props.film.year} · ${props.film.director}`)
const href = computed(() => imdbUrl(props.film.imdbId))
const detailsLabel = computed(() => (open.value ? 'Скрыть описание' : 'Показать описание'))

function onDetails() {
  open.value = !open.value
}

function onToggle() {
  emit('toggle', props.film.id)
}

function onOpen(event: MouseEvent) {
  emit('openLink', href.value, event)
}
</script>

<template>
  <article class="card">
    <div class="flex items-start gap-2 p-3">
      <button
        type="button"
        class="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
        :aria-expanded="open"
        @click="onDetails"
      >
        <div class="w-16 shrink-0">
          <FilmPoster :src="film.image" :title="film.title" />
        </div>
        <span class="flex min-w-0 flex-1 flex-col gap-2">
          <span class="flex items-start justify-between gap-2">
            <h2 class="font-display text-lg leading-tight">{{ film.title }}</h2>
            <span class="rating">IMDb {{ rating }}</span>
          </span>
          <span class="text-sm text-muted">{{ meta }}</span>
          <span class="sr-only">{{ detailsLabel }}</span>
        </span>
      </button>
      <FavoriteHeart :saved="saved" @toggle="onToggle" />
    </div>
    <div v-if="open" class="flex flex-col gap-3 border-t border-line px-3 py-3">
      <p class="text-sm leading-6">{{ film.description }}</p>
      <div>
        <a
          :href="href"
          class="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          @click="onOpen"
        >
          На IMDb
        </a>
      </div>
    </div>
  </article>
</template>
