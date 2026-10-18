<script setup lang="ts">
import { computed, ref } from 'vue'
import { imdbUrl } from '@/composables/useExternalLink'
import FavoriteHeart from '@/components/FavoriteHeart.vue'
import FilmPoster from '@/components/FilmPoster.vue'
import type { FilmCardModel } from '@/types/film'

const props = defineProps<{
  film: FilmCardModel
  saved: boolean
  watched: boolean
  blocked: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  openLink: [url: string, event: MouseEvent]
  toggleWatched: [id: string]
  toggleBlocked: [id: string]
}>()

const open = ref(false)
const rating = computed(() => props.film.imdbRating.toFixed(1))
const meta = computed(() => `${props.film.year} · ${props.film.director}`)
const href = computed(() => imdbUrl(props.film.imdbId))
const detailsLabel = computed(() => (open.value ? 'Скрыть описание' : 'Показать описание'))
const watchedLabel = computed(() => (props.watched ? 'Убрать из просмотренного' : 'Просмотрено'))
const blockedLabel = computed(() =>
  props.blocked ? 'Убрать из чёрного списка' : 'В чёрный список',
)
const mark = computed(() => {
  const parts: string[] = []
  if (props.watched) parts.push('Смотрели')
  if (props.blocked) parts.push('В чёрном списке')
  return parts.join(' · ')
})

function onDetails() {
  open.value = !open.value
}

function onToggle() {
  emit('toggle', props.film.id)
}

function onOpen(event: MouseEvent) {
  emit('openLink', href.value, event)
}

function onWatched() {
  emit('toggleWatched', props.film.id)
}

function onBlocked() {
  emit('toggleBlocked', props.film.id)
}
</script>

<template>
  <article class="card">
    <div class="flex items-start gap-2 p-3">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <div class="w-16 shrink-0">
          <FilmPoster :src="film.image" :title="film.title" />
        </div>
        <span class="flex min-w-0 flex-1 flex-col gap-2">
          <span class="flex items-start justify-between gap-2">
            <RouterLink
              :to="{ name: 'film', params: { id: film.id } }"
              class="font-display text-lg leading-tight text-ink no-underline hover:underline"
            >
              {{ film.title }}
            </RouterLink>
            <span class="rating">IMDb {{ rating }}</span>
          </span>
          <span class="text-sm text-muted">{{ meta }}</span>
          <span v-if="mark" class="text-sm text-muted">{{ mark }}</span>
          <button
            type="button"
            class="self-start text-sm font-semibold text-accent"
            :aria-expanded="open"
            @click="onDetails"
          >
            {{ detailsLabel }}
          </button>
        </span>
      </div>
      <FavoriteHeart :saved="saved" @toggle="onToggle" />
    </div>
    <div v-if="open" class="flex flex-col gap-3 border-t border-line px-3 py-3">
      <p class="text-sm leading-6">{{ film.description }}</p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-secondary" @click="onWatched">
          {{ watchedLabel }}
        </button>
        <button type="button" class="btn btn-danger" @click="onBlocked">{{ blockedLabel }}</button>
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
